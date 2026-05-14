// import { auth, currentUser } from '@clerk/nextjs/server'
// import { NextResponse } from 'next/server'
// import { MercadoPagoConfig, PreApproval } from 'mercadopago'

// export async function GET(req: Request) {
//   try {
//     const { userId } = await auth()
//     const user = await currentUser()

//     if (!userId || !user) {
//       return NextResponse.redirect(new URL('/', req.url))
//     }

//     const email = user.emailAddresses[0]?.emailAddress

//     if (!email) {
//       console.error('User email is missing')
//       return new NextResponse('User email is required for checkout', { status: 400 })
//     }

//     const meliAccessToken = process.env.MELI_ACCESS_TOKEN

//     if (!meliAccessToken) {
//       console.error('MELI_ACCESS_TOKEN is missing')
//       return new NextResponse('Internal Server Error', { status: 500 })
//     }

//     // Initialize MercadoPago
//     const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
//     const preApproval = new PreApproval(client)

//     const url = new URL(req.url)
//     const planId = url.searchParams.get('planId') || '5c7639be39b5491e9e78c0d58f59d82b'

//     // Base URL for returning back
//     const backUrl = `${url.protocol}//${url.host}/dashboard`

//     console.log(`[Checkout] Attempting to create subscription for ${email} with plan ${planId}`)

//     // Obtenemos createAdminClient para guardar en Supabase antes del pago
//     const { createAdminClient } = await import('@/lib/supabase')

//     try {
//       console.log(`[Checkout] Creating pending subscription for external tracking...`)

//       const supabaseAdmin = createAdminClient()

//       // Usar upsert o update en la tabla de subscriptions base a user_id
//       const { data: existingSub } = await supabaseAdmin.from('subscriptions').select('id').eq('user_id', userId).single()

//       if (existingSub) {
//         await supabaseAdmin.from('subscriptions')
//           .update({
//             status: 'pending',
//             plan_id: planId
//           })
//           .eq('id', existingSub.id)
//       } else {
//         await supabaseAdmin.from('subscriptions')
//           .insert({
//             user_id: userId,
//             status: 'pending',
//             plan_id: planId
//           })
//       }

//       // const directUrl = `https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=${planId}&external_reference=${userId}`
//       // return NextResponse.redirect(directUrl)

//       // ✅ Correcto para suscripciones con plan
//       const appUrl = process.env.NEXT_PUBLIC_APP_URL
//       const externalRef = userId // ya lo tienes
//       const backUrl = `${appUrl}/dashboard` // ← ahora es requerida

//       const directUrl = new URL(`https://www.mercadopago.com.co/subscriptions/checkout`)
//       directUrl.searchParams.set('preapproval_plan_id', planId)
//       directUrl.searchParams.set('external_reference', externalRef)
//       directUrl.searchParams.set('back_url', backUrl)
//       directUrl.searchParams.set('notification_url', 'https://www.simotest.com/api/webhooks/mercadopago')

//       return NextResponse.redirect(directUrl.toString())

//     } catch (mpError: any) {
//       console.error('[Checkout] MercadoPago API Error:', mpError)
//       throw mpError
//     }
//   } catch (error: any) {
//     console.error('[Checkout] General Error:', error)
//     return new NextResponse(JSON.stringify({
//       error: 'Error en el proceso de suscripción',
//       details: error.message,
//       mp_error: error.cause || error
//     }), { status: 500 })
//   }
// }


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
      console.error('[Checkout] User email is missing')
      return new NextResponse('User email is required for checkout', { status: 400 })
    }

    const meliAccessToken = process.env.MELI_ACCESS_TOKEN

    if (!meliAccessToken) {
      console.error('[Checkout] MELI_ACCESS_TOKEN is missing')
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    const url = new URL(req.url)
    const planId = url.searchParams.get('planId') || '5c7639be39b5491e9e78c0d58f59d82b'

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const backUrl = `${appUrl}/dashboard`
    const notificationUrl = 'https://www.simotest.com/api/webhooks/mercadopago'

    console.log(`[Checkout] Creating subscription for ${email} with plan ${planId}`)

    // ─── 1. Guardar suscripción pendiente en Supabase ───────────────────────
    const { createAdminClient } = await import('@/lib/supabase')
    const supabaseAdmin = createAdminClient()

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingSub) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'pending', plan_id: planId })
        .eq('id', existingSub.id)
    } else {
      await supabaseAdmin
        .from('subscriptions')
        .insert({ user_id: userId, status: 'pending', plan_id: planId })
    }

    // ─── 2. Crear preapproval en MercadoPago con notification_url ──────────
    // ✅ La notification_url DEBE ir en el body del POST, no en la URL de redirect
    const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
    const preApproval = new PreApproval(client)

    const preapprovalResponse = await preApproval.create({
      body: {
        preapproval_plan_id: planId,
        payer_email: email,
        external_reference: userId,   // ID de tu usuario en Supabase/Clerk
        back_url: backUrl,
        notification_url: notificationUrl,
      } as any,
    })

    console.log('[Checkout] Preapproval created:', {
      id: preapprovalResponse.id,
      status: preapprovalResponse.status,
      notification_url: (preapprovalResponse as any).notification_url,
    })

    // ─── 3. Guardar el mp_preapproval_id en Supabase ───────────────────────
    // Esto permite al webhook encontrar la suscripción correcta luego
    if (preapprovalResponse.id) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ mp_preapproval_id: preapprovalResponse.id })
        .eq('user_id', userId)
    }

    // ─── 4. Redirigir al usuario al checkout de MercadoPago ────────────────
    const initPoint = preapprovalResponse.init_point

    if (!initPoint) {
      console.error('[Checkout] No init_point returned from MercadoPago', preapprovalResponse)
      throw new Error('No init_point returned from MercadoPago')
    }

    return NextResponse.redirect(initPoint)

  } catch (error: any) {
    console.error('[Checkout] Error:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Error en el proceso de suscripción',
        details: error.message,
        mp_error: error.cause || error,
      }),
      { status: 500 }
    )
  }
}