import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      console.error('User email is missing')
      return new NextResponse('User email is required for checkout', { status: 400 })
    }

    const meliAccessToken = process.env.MELI_ACCESS_TOKEN

    if (!meliAccessToken) {
      console.error('MELI_ACCESS_TOKEN is missing')
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    // Initialize MercadoPago
    const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
    const preApproval = new PreApproval(client)

    const planId = '5c7639be39b5491e9e78c0d58f59d82b'

    // Base URL for returning back
    const url = new URL(req.url)
    const backUrl = `${url.protocol}//${url.host}/dashboard`

    console.log(`[Checkout] Attempting to create subscription for ${email} with plan ${planId}`)

    // Obtenemos createAdminClient para guardar en Supabase antes del pago
    const { createAdminClient } = await import('@/lib/supabase')
    
    try {
      console.log(`[Checkout] Creating preapproval for external tracking...`)
      const response = await preApproval.create({
        body: {
          preapproval_plan_id: planId,
          back_url: backUrl,
          external_reference: userId // Lo enviamos por si acaso
        }
      })

      if (!response.id || !response.init_point) {
        throw new Error('MercadoPago no devolvió un init_point ni un ID')
      }

      // Guardamos la intención de compra para enlazar user_id con mp_preapproval_id
      const supabaseAdmin = createAdminClient()
      
      const { data: plans } = await supabaseAdmin.from('plans').select('id').limit(1)
      const dbPlanId = plans?.[0]?.id

      // Usar upsert o update en la tabla de subscriptions base a user_id
      const { data: existingSub } = await supabaseAdmin.from('subscriptions').select('id').eq('user_id', userId).single()
      
      if (existingSub) {
        await supabaseAdmin.from('subscriptions')
          .update({ mp_preapproval_id: response.id, status: 'pending', plan_id: dbPlanId })
          .eq('id', existingSub.id)
      } else {
        await supabaseAdmin.from('subscriptions')
          .insert({ user_id: userId, mp_preapproval_id: response.id, status: 'pending', plan_id: dbPlanId })
      }

      return NextResponse.redirect(response.init_point)
    } catch (mpError: any) {
      console.error('[Checkout] MercadoPago API Error:', mpError)

      const errorMessage = mpError.message || (mpError.cause && mpError.cause.message) || ''
      if (errorMessage.toLowerCase().includes('card_token_id')) {
        console.log('[Checkout] Falling back to direct plan URL for checkout (card_token_id logic)')
        const directUrl = `https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=${planId}&external_reference=${userId}`
        return NextResponse.redirect(directUrl)
      }

      throw mpError
    }
  } catch (error: any) {
    console.error('[Checkout] General Error:', error)
    return new NextResponse(JSON.stringify({
      error: 'Error en el proceso de suscripción',
      details: error.message,
      mp_error: error.cause || error
    }), { status: 500 })
  }
}
