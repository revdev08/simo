// lib/verify-preapproval.ts
// Server-side function to verify a Mercado Pago preapproval and save/update the subscription in Supabase.
// This runs as a fallback when the webhook hasn't fired yet (e.g., returning from checkout).

import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { createAdminClient } from './supabase'

export async function verifyPreapproval(preapprovalId: string, userId: string): Promise<boolean> {
  try {
    const meliAccessToken = process.env.MELI_ACCESS_TOKEN
    if (!meliAccessToken) {
      console.error('[VerifyPreapproval] No MELI_ACCESS_TOKEN')
      return false
    }

    const client = new MercadoPagoConfig({ accessToken: meliAccessToken })
    const preApproval = new PreApproval(client)

    const preapprovalData = await preApproval.get({ id: preapprovalId })

    console.log(`[VerifyPreapproval] MP response:`, {
      id: preapprovalData.id,
      status: preapprovalData.status,
      external_reference: preapprovalData.external_reference,
    })

    if (!preapprovalData) {
      console.error('[VerifyPreapproval] Preapproval not found in MP')
      return false
    }

    // Verify this preapproval belongs to the current user
    if (preapprovalData.external_reference !== userId) {
      console.warn(`[VerifyPreapproval] User mismatch: expected=${userId}, got=${preapprovalData.external_reference}`)
      return false
    }

    const mpStatus = preapprovalData.status
    let localStatus = 'pending'
    if (mpStatus === 'authorized') localStatus = 'active'
    if (mpStatus === 'cancelled') localStatus = 'canceled'

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
        console.error('[VerifyPreapproval] Error updating subscription:', error)
        return false
      }
      console.log(`[VerifyPreapproval] Updated subscription for user ${userId}, status=${localStatus}`)
    } else {
      const { error } = await supabase.from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: localStatus,
          mp_preapproval_id: preapprovalId
        })

      if (error) {
        console.error('[VerifyPreapproval] Error inserting subscription:', error)
        return false
      }
      console.log(`[VerifyPreapproval] Inserted subscription for user ${userId}, status=${localStatus}`)
    }

    return localStatus === 'active'
  } catch (error) {
    console.error('[VerifyPreapproval] Error:', error)
    return false
  }
}
