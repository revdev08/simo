import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const url = new URL(req.url)
    const preapprovalId = url.searchParams.get('preapproval_id')

    if (!preapprovalId) {
      return new NextResponse('Missing preapproval_id', { status: 400 })
    }

    const meliAccessToken = process.env.MELI_ACCESS_TOKEN
    if (!meliAccessToken) {
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    // Verify the preapproval directly with Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
    const preApproval = new PreApproval(client)

    const preapprovalData = await preApproval.get({ id: preapprovalId })

    console.log(`[Checkout Verify] Preapproval data:`, {
      id: preapprovalData.id,
      status: preapprovalData.status,
      external_reference: preapprovalData.external_reference,
    })

    if (!preapprovalData) {
      return NextResponse.json({ error: 'Preapproval not found' }, { status: 404 })
    }

    // Verify this preapproval belongs to the current user
    if (preapprovalData.external_reference !== userId) {
      console.warn(`[Checkout Verify] User mismatch: ${userId} vs ${preapprovalData.external_reference}`)
      return NextResponse.json({ error: 'Preapproval does not belong to this user' }, { status: 403 })
    }

    const mpStatus = preapprovalData.status
    let localStatus = 'pending'
    if (mpStatus === 'authorized') localStatus = 'active'
    if (mpStatus === 'cancelled') localStatus = 'canceled'

    // Upsert subscription in Supabase
    const supabase = createAdminClient()

    // Check for existing subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get a default plan
    const { data: plans } = await supabase.from('plans').select('id').limit(1)
    const planId = plans?.[0]?.id

    if (existingSub) {
      const { error } = await supabase.from('subscriptions')
        .update({
          status: localStatus,
          mp_preapproval_id: preapprovalId,
          plan_id: existingSub.plan_id || planId
        })
        .eq('id', existingSub.id)

      if (error) {
        console.error('[Checkout Verify] Error updating subscription:', error)
        return NextResponse.json({ error: 'Error updating subscription' }, { status: 500 })
      }
    } else {
      const { error } = await supabase.from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: localStatus,
          mp_preapproval_id: preapprovalId
        })

      if (error) {
        console.error('[Checkout Verify] Error inserting subscription:', error)
        return NextResponse.json({ error: 'Error inserting subscription' }, { status: 500 })
      }
    }

    console.log(`[Checkout Verify] Subscription saved for user ${userId}, status=${localStatus}`)

    return NextResponse.json({
      success: true,
      status: localStatus,
      preapproval_id: preapprovalId
    })
  } catch (error: any) {
    console.error('[Checkout Verify] Error:', error)
    return NextResponse.json({
      error: 'Error verifying subscription',
      details: error.message
    }, { status: 500 })
  }
}
