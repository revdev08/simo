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

    const planId = '81dff62e91ff411e8f50bea893d37176'

    // Base URL for returning back
    const url = new URL(req.url)
    const backUrl = `${url.protocol}//${url.host}/dashboard`

    console.log(`[Checkout] Attempting to create subscription for ${email} with plan ${planId}`)

    // Genera un email aleatorio para cada intento de prueba
    const randomEmail = `test_customer_${Math.random().toString(36).substring(7)}@example.com`;

    try {
      const response = await preApproval.create({
        body: {
          preapproval_plan_id: planId,
          // payer_email: email,
          payer_email: 'TESTUSER5843247568653894551@testuser.com',
          external_reference: userId,
          back_url: backUrl
        }
      })

      if (response.init_point) {
        console.log('[Checkout] Subscription created successfully, redirecting to init_point')
        return NextResponse.redirect(response.init_point)
      } else {
        throw new Error('No init_point in MercadoPago response')
      }
    } catch (mpError: any) {
      console.error('[Checkout] MercadoPago API Error:', mpError)

      const errorMessage = mpError.message || (mpError.cause && mpError.cause.message) || ''

      // Si la API nos obliga a enviar tarjeta (card_token_id), 
      // usamos el "link directo" del plan que ya tiene su propio init_point.
      if (errorMessage.toLowerCase().includes('card_token_id')) {
        console.log('[Checkout] Falling back to direct plan URL for external_reference tracking')
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
