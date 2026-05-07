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

//       const directUrl = `https://www.mercadopago.com.co/subscriptions/checkout?preapproval_plan_id=${planId}&external_reference=${userId}`
//       return NextResponse.redirect(directUrl)

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
      console.log('[Checkout] User not authenticated')
      return NextResponse.redirect(new URL('/', req.url))
    }

    const email = user.emailAddresses[0]?.emailAddress
    if (!email) {
      console.log('[Checkout] User email is missing')
      return new NextResponse('User email is required', { status: 400 })
    }

    const meliAccessToken = process.env.MELI_ACCESS_TOKEN
    if (!meliAccessToken) {
      console.log('[Checkout] MELI_ACCESS_TOKEN is missing')
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    const url = new URL(req.url)
    const planId = url.searchParams.get('planId') || 'fa83e5277e8948fcaac00e3a56198db2'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL // ej: https://tu-dominio.com
    console.log('[Checkout] Plan ID:', planId)
    console.log('[Checkout] App URL:', appUrl)
    console.log('[Checkout] User ID:', userId)
    console.log('[Checkout] User Email:', email)

    // 1. Crear preapproval via API para obtener init_point y preapproval_id
    const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
    const preApprovalClient = new PreApproval(client)

    const result = await preApprovalClient.create({
      body: {
        preapproval_plan_id: planId,
        payer_email: email,
        external_reference: userId,
        back_url: `${appUrl}/dashboard`,
      }
    })

    console.log('[Checkout] Preapproval created:', result)

    if (!result.init_point) {
      throw new Error('No init_point returned from MercadoPago')
    }

    // 2. Guardar en BD con el preapproval_id real
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
        .update({
          status: 'pending',
          plan_id: planId,
          mp_preapproval_id: result.id, // ✅ guardamos el ID real
        })
        .eq('id', existingSub.id)
    } else {
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          status: 'pending',
          plan_id: planId,
          mp_preapproval_id: result.id, // ✅ guardamos el ID real
        })
    }

    // 3. Redirigir al checkout de MP con back_url incluido
    return NextResponse.redirect(result.init_point)

  } catch (error: any) {
    console.error('[Checkout] Error:', error)
    return new NextResponse(JSON.stringify({
      error: 'Error en el proceso de suscripción',
      details: error.message,
    }), { status: 500 })
  }
}