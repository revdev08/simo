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

        console.log(`[MercadoPago Webhook] Preapproval parsed: userId=${userId}, status=${mpStatus}`)

        if (userId) {
           const supabase = createAdminClient()
           
           // Determine logical status
           let localStatus = 'pending'
           if (mpStatus === 'authorized') localStatus = 'active'
           if (mpStatus === 'cancelled') localStatus = 'canceled'

           // Find existing subscription
           const { data: existingSub } = await supabase
             .from('subscriptions')
             .select('*')
             .eq('user_id', userId)
             .order('created_at', { ascending: false })
             .limit(1)
             .single()

           // Fetch a default plan (you can improve this later to map specific prices)
           const { data: plans } = await supabase.from('plans').select('id').limit(1)
           const planId = plans?.[0]?.id

           if (existingSub) {
             const { error } = await supabase.from('subscriptions')
               .update({
                 status: localStatus,
                 mp_preapproval_id: mpPreapprovalId,
                 plan_id: existingSub.plan_id || planId
               })
               .eq('id', existingSub.id)
               
             if (error) console.error('[MercadoPago Webhook] Error updating subscription:', error)
             else console.log(`[MercadoPago Webhook] Successfully updated subscription for user ${userId}`)
           } else {
             const { error } = await supabase.from('subscriptions')
               .insert({
                 user_id: userId,
                 plan_id: planId,
                 status: localStatus,
                 mp_preapproval_id: mpPreapprovalId
               })
               
             if (error) console.error('[MercadoPago Webhook] Error inserting subscription:', error)
             else console.log(`[MercadoPago Webhook] Successfully inserted subscription for user ${userId}`)
           }
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
