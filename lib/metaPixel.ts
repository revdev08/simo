export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

// Precios de referencia por plan (en COP), usados solo para reportar `value` a Meta.
export const PLAN_PRICES: Record<string, number> = {
  '3fa86370a007428f93d188e30e426653': 19900, // Plan Semanal
  'e9150a4759e7405b9290f1ace43b1fe6': 39900, // Plan Mensual
}

type FbqParams = Record<string, string | number | (string | number)[] | undefined>

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function fbTrack(event: string, params?: FbqParams) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', event, params)
}

export function fbTrackOnce(key: string, event: string, params?: FbqParams) {
  if (typeof window === 'undefined' || !window.fbq) return
  const storageKey = `fbq_${event}_${key}`
  if (window.localStorage.getItem(storageKey)) return
  window.fbq('track', event, params, { eventID: storageKey })
  window.localStorage.setItem(storageKey, '1')
}
