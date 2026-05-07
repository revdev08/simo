import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase'

export async function GET(req: Request) {
  return new NextResponse('OK', { status: 200 })
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    const topicParam = url.searchParams.get('topic') || url.searchParams.get('type')
    const idParam = url.searchParams.get('data.id') || url.searchParams.get('id')

    let body = {} as any
    try {
      body = await req.json()
    } catch (e) {
      // Body might be empty
    }

    const action = body.action || ''
    const type = body.type || topicParam
    const dataId = body.data?.id || idParam || body.id

    console.log('[MercadoPago Webhook] Received', { type, dataId, action })

    if ((type === 'subscription_preapproval' || type === 'preapproval') && dataId) {
      const meliAccessToken = process.env.MELI_ACCESS_TOKEN
      if (!meliAccessToken) throw new Error('No MELI_ACCESS_TOKEN available')

      const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
      const preApproval = new PreApproval(client)

      let preapprovalData: any
      try {
        preapprovalData = await preApproval.get({ id: dataId })
      } catch (e: any) {
        console.warn(`[MercadoPago Webhook] preapproval not found id=${dataId}:`, e.message)
        return new NextResponse('OK', { status: 200 })
      }

      if (preapprovalData) {
        const mpStatus = preapprovalData.status
        const userId = preapprovalData.external_reference
        const mpPreapprovalId = preapprovalData.id
        const nextPaymentDate = preapprovalData.next_payment_date || null

        console.log(`[MercadoPago Webhook] Preapproval parsed: userId=${userId}, status=${mpStatus}`)

        if (!userId) {
          console.log(`[MercadoPago Webhook] external_reference missing. Searching by mp_preapproval_id=${mpPreapprovalId}...`)
        }

        const supabase = createAdminClient()

        let { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('mp_preapproval_id', mpPreapprovalId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!existingSub && userId) {
          const { data: subByUser } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          existingSub = subByUser
        }

        const finalUserId = existingSub?.user_id || userId

        if (finalUserId) {
          let localStatus = 'pending'
          if (mpStatus === 'authorized') localStatus = 'active'
          if (mpStatus === 'cancelled') localStatus = 'canceled'
          if (mpStatus === 'paused') localStatus = 'paused'

          const mpPlanId = preapprovalData.preapproval_plan_id || preapprovalData.reason || 'unknown'

          const subscriptionPayload = {
            user_id: finalUserId,
            plan_id: mpPlanId,
            status: localStatus,
            mp_preapproval_id: mpPreapprovalId,
            current_period_end: nextPaymentDate,
          }

          if (existingSub) {
            const { error } = await supabase
              .from('subscriptions')
              .update(subscriptionPayload)
              .eq('id', existingSub.id)

            if (error) console.error('[MercadoPago Webhook] Error updating subscription:', error)
            else console.log(`[MercadoPago Webhook] ✅ Updated subscription for user ${finalUserId}`)
          } else {
            const { error } = await supabase
              .from('subscriptions')
              .insert(subscriptionPayload)

            if (error) console.error('[MercadoPago Webhook] Error inserting subscription:', error)
            else console.log(`[MercadoPago Webhook] ✅ Inserted subscription for user ${finalUserId}`)
          }
        } else {
          console.error('[MercadoPago Webhook] Could not resolve user_id for preapproval', mpPreapprovalId)
        }
      }

    } else if (type === 'payment' && dataId) {
      const meliAccessToken = process.env.MELI_ACCESS_TOKEN
      if (!meliAccessToken) throw new Error('No MELI_ACCESS_TOKEN available')

      const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
      const { Payment } = await import('mercadopago')
      const paymentApi = new Payment(client)

      let paymentData: any
      try {
        paymentData = await paymentApi.get({ id: dataId })
      } catch (e: any) {
        console.warn(`[MercadoPago Webhook] payment not found id=${dataId}:`, e.message)
        return new NextResponse('OK', { status: 200 })
      }

      if (paymentData) {
        console.log(`[MercadoPago Webhook] Payment parsed: id=${dataId}, status=${paymentData.status}`)

        let userId = paymentData.external_reference
        const supabase = createAdminClient()

        if (!userId && paymentData.payer?.email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', paymentData.payer.email)
            .single()

          if (profile) userId = profile.id
        }

        const { error } = await supabase.from('orders').insert({
          user_id: userId || null,
          payment_id: dataId.toString(),
          status: paymentData.status,
          amount: paymentData.transaction_amount,
        })

        if (error) console.error('[MercadoPago Webhook] Error inserting order:', error)
        else console.log(`[MercadoPago Webhook] ✅ Order inserted for user ${userId || 'unknown'}`)
      }
    }

    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    console.error('[MercadoPago Webhook] Fatal error:', error)
    return new NextResponse('OK', { status: 200 })
  }
}