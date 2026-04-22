import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const { userId, getToken } = await auth()

    if (!userId) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    const token = await getToken()
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Get user profile to have the email (optional but good for MP)
    const supabase = createSupabaseClient(token)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

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

    const response = await preApproval.create({
      body: {
        preapproval_plan_id: '9d8a97629def4590b967e1b9042c581c',
        payer_email: profile?.email || '',
        external_reference: userId,
        back_url: backUrl,
      }
    });

    if (response.init_point) {
      return NextResponse.redirect(response.init_point)
    } else {
      console.error('Failed to get init_point from MercadoPago', response)
      return new NextResponse('Error generating checkout link', { status: 500 })
    }
  } catch (error) {
    console.error('Error generating checkout:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
