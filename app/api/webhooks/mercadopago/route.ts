import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // Mercado Pago often sends data through query parameters for webhooks as well as body
    // "topic" and "id" might be in query format for notifications
    const topicParam = url.searchParams.get('topic') || url.searchParams.get('type')
    const idParam = url.searchParams.get('data.id') || url.searchParams.get('id')

    let body = {} as any
    try {
      body = await req.json()
    } catch (e) {
      // Body might be empty or url-encoded form data
    }

    const action = body.action || ''
    const type = body.type || topicParam
    const dataId = body.data?.id || idParam || body.id

    console.log("Webhook recibido", body)
    console.log(`[MercadoPago Webhook] Received type=${type}, id=${dataId}, action=${action}`)

    if ((type === 'subscription_preapproval' || type === 'preapproval') && dataId) {
      const meliAccessToken = process.env.MELI_ACCESS_TOKEN
      if (!meliAccessToken) throw new Error('No MELI_ACCESS_TOKEN available')

      const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
      const preApproval = new PreApproval(client)

      const preapprovalData = await preApproval.get({ id: dataId })

      if (preapprovalData) {
        const mpStatus = preapprovalData.status // 'authorized', 'paused', 'cancelled', 'pending'
        const userId = preapprovalData.external_reference
        const mpPreapprovalId = preapprovalData.id

        // Obtener la fecha de cobro siguiente como expiración del servicio
        const nextPaymentDate = (preapprovalData as any).next_payment_date || null

        console.log(`[MercadoPago Webhook] Preapproval parsed: userId=${userId}, status=${mpStatus}`)

        if (!userId) {
          console.log(`[MercadoPago Webhook] external_reference is undefined. Searching by mp_preapproval_id=${mpPreapprovalId}...`)
        }

        const supabase = createAdminClient()

        // Find existing subscription ignoring external_reference, ONLY by mp_preapproval_id
        let { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('mp_preapproval_id', mpPreapprovalId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Fallback: Si no lo encontró por preapproval, buscar por userId si existe
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
          // Determine logical status
          let localStatus = 'pending'
          if (mpStatus === 'authorized') localStatus = 'active'
          if (mpStatus === 'cancelled') localStatus = 'canceled'

          // Fetch a default plan (you can improve this later to map specific prices)
          const mpPlanId = (preapprovalData as any).preapproval_plan_id || preapprovalData.reason || 'unknown'

          const subscriptionPayload = {
            user_id: finalUserId,
            plan_id: mpPlanId,
            status: localStatus,
            mp_preapproval_id: mpPreapprovalId,
            current_period_end: nextPaymentDate
          }

          if (existingSub) {
            const { error } = await supabase.from('subscriptions')
              .update(subscriptionPayload)
              .eq('id', existingSub.id)

            if (error) console.error('[MercadoPago Webhook] Error updating subscription:', error)
            else console.log(`[MercadoPago Webhook] Successfully updated subscription for user ${finalUserId}`)
          } else {
            // Fallback to inserting if not found (shouldn't happen with our new preemptive insert)
            const { error } = await supabase.from('subscriptions')
              .insert(subscriptionPayload)

            if (error) console.error('[MercadoPago Webhook] Error inserting subscription:', error)
            else console.log(`[MercadoPago Webhook] Successfully inserted subscription for user ${finalUserId}`)
          }
        } else {
          console.error('[MercadoPago Webhook] Could not resolve user_id for preapproval', mpPreapprovalId)
        }
      }
    } else if (type === 'payment' && dataId) {
      // PROCESAMOS PAGOS PARA LA TABLA ORDERS
      const meliAccessToken = process.env.MELI_ACCESS_TOKEN
      if (!meliAccessToken) throw new Error('No MELI_ACCESS_TOKEN available')

      const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
      const { Payment } = await import('mercadopago')
      const paymentApi = new Payment(client)

      const paymentData = await paymentApi.get({ id: dataId })

      if (paymentData) {
        console.log(`[MercadoPago Webhook] Payment parsed: id=${dataId}, status=${paymentData.status}`)

        let userId = paymentData.external_reference
        const supabase = createAdminClient()

        // Si MercadoPago botó el external_reference, intentamos buscar el user por el email del pagaré.
        if (!userId && paymentData.payer?.email) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', paymentData.payer.email)
            .single()

          if (profile) {
            userId = profile.id
          }
        }

        // Insertamos el pago en la tabla orders (si es nulo quedará nulo, o si Supabase tira error lo escupirá)
        const orderPayload = {
          user_id: userId || null,
          payment_id: dataId.toString(),
          status: paymentData.status,
          amount: paymentData.transaction_amount
        }

        const { error } = await supabase.from('orders').insert(orderPayload)
        if (error) {
          console.error('[MercadoPago Webhook] Error inserting into orders:', error)
        } else {
          console.log(`[MercadoPago Webhook] Successfully inserted order ${dataId} for user ${userId || 'unknown'}`)
        }
      }
    }

    // We should always return 200 OK so Mercado Pago doesn't retry infinitely
    return new NextResponse('Webhook Received', { status: 200 })
  } catch (error) {
    console.error('[MercadoPago Webhook] Error processing:', error)
    return new NextResponse('Internal Webhook Error', { status: 500 })
  }
}
