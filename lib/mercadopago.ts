import 'server-only'

const MP_API_URL = 'https://api.mercadopago.com'

export const MP_PLANS = {
  semanal: { name: 'SIMO Test Premium semanal', amount: 19_900, frequency: 7, frequencyType: 'days' },
  mensual: { name: 'SIMO Test Premium mensual', amount: 39_900, frequency: 1, frequencyType: 'months' },
} as const

export type MpPlanKey = keyof typeof MP_PLANS

const LEGACY_PLAN_IDS: Record<string, MpPlanKey> = {
  '3fa86370a007428f93d188e30e426653': 'semanal',
  'e9150a4759e7405b9290f1ace43b1fe6': 'mensual',
  '5c7639be39b5491e9e78c0d58f59d82b': 'mensual',
}

export type MpPreapproval = {
  id: string
  init_point?: string
  status: string
  external_reference?: string
  payer_email?: string
  next_payment_date?: string
  reason?: string
  auto_recurring?: {
    frequency?: number
    frequency_type?: string
    transaction_amount?: number
    currency_id?: string
  }
}

export type MpPayment = {
  id: number | string
  status?: string
  external_reference?: string
  transaction_amount?: number
  payer?: { email?: string }
}

type MpErrorPayload = { message?: string; error?: string }

export function getMpToken() {
  return process.env.MELI_ACCESS_TOKEN?.trim()
}

export function isMpPlanKey(value: string): value is MpPlanKey {
  return Object.prototype.hasOwnProperty.call(MP_PLANS, value)
}

export function resolveMpPlan(value: string | null): MpPlanKey | null {
  if (!value) return null
  if (isMpPlanKey(value)) return value
  return LEGACY_PLAN_IDS[value] ?? null
}

export function createExternalReference(userId: string, plan: MpPlanKey) {
  return `simo:${userId}:${plan}`
}

export function parseExternalReference(reference?: string) {
  if (!reference) return null
  if (reference.startsWith('user_')) return { userId: reference, plan: null as MpPlanKey | null }

  const [namespace, userId, rawPlan] = reference.split(':')
  if (namespace !== 'simo' || !userId || !isMpPlanKey(rawPlan)) return null
  return { userId, plan: rawPlan }
}

async function mpRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getMpToken()
  if (!token) throw new Error('mp_not_configured')

  const response = await fetch(`${MP_API_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  })
  const payload = (await response.json().catch(() => null)) as MpErrorPayload | null
  if (!response.ok) {
    throw new Error(`mercadopago_${response.status}: ${payload?.message ?? payload?.error ?? response.statusText}`)
  }
  return payload as T
}

export async function createMpSubscription({
  planKey, userId, email, appUrl,
}: {
  planKey: MpPlanKey
  userId: string
  email: string
  appUrl: string
}) {
  const plan = MP_PLANS[planKey]
  const subscription = await mpRequest<MpPreapproval>('/preapproval', {
    method: 'POST',
    body: JSON.stringify({
      reason: plan.name,
      external_reference: createExternalReference(userId, planKey),
      payer_email: email,
      auto_recurring: {
        frequency: plan.frequency,
        frequency_type: plan.frequencyType,
        transaction_amount: plan.amount,
        currency_id: 'COP',
      },
      back_url: `${appUrl}/dashboard?checkout=pending`,
      status: 'pending',
    }),
  })
  if (!subscription.id || !subscription.init_point) throw new Error('mercadopago_incomplete_preapproval')
  return subscription
}

export function getMpSubscription(id: string) {
  return mpRequest<MpPreapproval>(`/preapproval/${encodeURIComponent(id)}`)
}

export function getMpPayment(id: string) {
  return mpRequest<MpPayment>(`/v1/payments/${encodeURIComponent(id)}`)
}

export function cancelMpSubscription(id: string) {
  return mpRequest<MpPreapproval>(`/preapproval/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'canceled' }),
  })
}

export function mpStatusToLocal(status?: string) {
  if (status === 'authorized') return 'active'
  if (status === 'cancelled' || status === 'canceled') return 'canceled'
  if (status === 'paused') return 'paused'
  return 'pending'
}

export function validateMpSubscription(subscription: MpPreapproval, planKey: MpPlanKey) {
  const expected = MP_PLANS[planKey]
  const recurring = subscription.auto_recurring
  return recurring?.transaction_amount === expected.amount &&
    recurring.currency_id === 'COP' &&
    recurring.frequency === expected.frequency &&
    recurring.frequency_type === expected.frequencyType
}
