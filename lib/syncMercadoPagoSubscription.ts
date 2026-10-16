import 'server-only'
import { createAdminClient } from './supabase'
import { getMpSubscription, isMpPlanKey, mpStatusToLocal, parseExternalReference, resolveMpPlan, validateMpSubscription, type MpPlanKey } from './mercadopago'

function inferPlan(subscription: Awaited<ReturnType<typeof getMpSubscription>>): MpPlanKey | null {
  for (const plan of ['mensual', 'semestral', 'desarrollador', 'semanal', 'anual'] as const) {
    if (validateMpSubscription(subscription, plan)) return plan
  }
  return null
}

export async function syncMercadoPagoSubscription(mpPreapprovalId: string) {
  const mpSubscription = await getMpSubscription(mpPreapprovalId)
  const supabase = createAdminClient()
  const { data: existing, error: existingError } = await supabase.from('subscriptions').select('*')
    .eq('mp_preapproval_id', mpPreapprovalId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (existingError) throw existingError

  const reference = parseExternalReference(mpSubscription.external_reference)
  const userId = reference?.userId ?? existing?.user_id ?? null
  const plan = reference?.plan ?? resolveMpPlan(existing?.plan_id ?? null) ?? inferPlan(mpSubscription)
  if (!userId) throw new Error(`mp_external_reference_missing:${mpPreapprovalId}`)
  if (!plan || !isMpPlanKey(plan)) throw new Error(`mp_plan_unresolved:${mpPreapprovalId}`)
  if (!validateMpSubscription(mpSubscription, plan)) throw new Error(`mp_plan_mismatch:${mpPreapprovalId}`)

  const { data: profile, error: profileError } = await supabase.from('profiles').select('id, email')
    .eq('id', userId).maybeSingle()
  if (profileError) throw profileError
  if (!profile) throw new Error(`mp_user_not_found:${userId}`)

  if (existing?.user_id && existing.user_id !== userId) {
    console.warn('[MercadoPago Sync] Asociación corregida con external_reference', {
      mpPreapprovalId, previousUserId: existing.user_id, userId,
    })
  }

  const currentPeriodEnd = mpSubscription.next_payment_date ?? existing?.current_period_end ?? null
  const payload = {
    user_id: userId,
    plan_id: plan,
    status: mpStatusToLocal(mpSubscription.status),
    mp_preapproval_id: mpSubscription.id,
    current_period_end: currentPeriodEnd,
    checkout_email: existing?.checkout_email ?? profile.email,
    mp_payer_email: mpSubscription.payer_email?.toLowerCase() ?? existing?.mp_payer_email ?? null,
    updated_at: new Date().toISOString(),
  }
  const result = existing
    ? await supabase.from('subscriptions').update(payload).eq('id', existing.id)
    : await supabase.from('subscriptions').insert(payload)
  if (result.error) throw result.error

  console.log('[MercadoPago Sync] Suscripción sincronizada', {
    userId, plan, status: payload.status, mpPreapprovalId, payerEmail: payload.mp_payer_email,
  })
  return { ...payload, mpStatus: mpSubscription.status }
}
