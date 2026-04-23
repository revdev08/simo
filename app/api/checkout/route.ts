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

    // Base URL for returning back
    const url = new URL(req.url)
    const backUrl = `${url.protocol}//${url.host}/dashboard`

    console.log(`[Checkout] Creating subscription for ${email} with plan 9d8a97629def4590b967e1b9042c581c`)

    const response = await preApproval.create({
      body: {
        preapproval_plan_id: '9d8a97629def4590b967e1b9042c581c',
        payer_email: email,
        external_reference: userId,
        back_url: backUrl,
        reason: 'Suscripción SIMO Premium',
        status: 'pending'
      }
    });

    if (response.init_point) {
      return NextResponse.redirect(response.init_point)
    } else {
      console.error('Failed to get init_point from MercadoPago. Full response:', JSON.stringify(response, null, 2))
      return new NextResponse('Error generating checkout link', { status: 500 })
    }
  } catch (error: any) {
    console.error('Error generating checkout:', error)
    // If it's a Mercado Pago error, it might have a body
    if (error.cause) {
      console.error('Error cause:', error.cause)
    }
    return new NextResponse(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: error.message,
      mp_error: error.cause || error 
    }), { status: 500 })
  }
}
