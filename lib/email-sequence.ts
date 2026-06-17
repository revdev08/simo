import {
  sendWelcomeEmail,
  sendTopicsEmail,
  sendSocialProofEmail,
  sendPriceObjectionEmail,
  sendProductDemoEmail,
  sendDiscountEmail,
} from '@/lib/resend'

/**
 * Drip-sequence definition.
 *
 * Cada step se dispara cuando (NOW - signup_at) >= dayOffset días Y el
 * last_step_sent del usuario equals (step - 1).
 */
export type SendResult =
  | { data?: { id?: string }; error?: undefined; skipped?: boolean }
  | { error: unknown; skipped?: boolean }
  | { skipped: true; error?: unknown }

export interface SequenceStep {
  step: number
  dayOffset: number
  label: string
  send: (params: { to: string; firstName?: string }) => Promise<SendResult>
}

export const SEQUENCE: SequenceStep[] = [
  { step: 1, dayOffset: 0,  label: 'welcome',           send: sendWelcomeEmail },
  { step: 2, dayOffset: 2,  label: 'topics',            send: sendTopicsEmail },
  { step: 3, dayOffset: 5,  label: 'social-proof',      send: sendSocialProofEmail },
  { step: 4, dayOffset: 8,  label: 'price-objection',   send: sendPriceObjectionEmail },
  { step: 5, dayOffset: 11, label: 'product-demo',      send: sendProductDemoEmail },
  { step: 6, dayOffset: 14, label: 'final-push',          send: sendDiscountEmail },
]

export const TOTAL_STEPS = SEQUENCE.length

export function findNextStep(currentStep: number): SequenceStep | null {
  return SEQUENCE.find((s) => s.step === currentStep + 1) ?? null
}
