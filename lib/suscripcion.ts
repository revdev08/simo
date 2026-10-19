// Suscripción del aspirante en «Mi progreso»: qué plan tiene, hasta cuándo tiene acceso y cancelar la renovación.
// Cancelar solo detiene los cobros futuros en Mercado Pago: el acceso sigue hasta el final del periodo pagado
// (lib/premium.ts ya lo respeta para las suscripciones canceladas).
import 'server-only'
import { createAdminClient } from '@/lib/supabase'
import { getMpSubscription, getMpToken, MP_PLANS, resolveMpPlan } from '@/lib/mercadopago'
import { syncMercadoPagoSubscription } from '@/lib/syncMercadoPagoSubscription'
import type { MotivoCancelacion } from '@/lib/cancelacion'

export type EstadoSuscripcion = 'activa' | 'cancelada' | 'pendiente'
export type Suscripcion = {
  estado: EstadoSuscripcion
  plan: string | null
  valor: number | null
  cadaCuanto: string | null
  accesoHasta: string | null // fecha ISO: fin del periodo pagado (próximo cobro si está activa)
}

const CADA_CUANTO: Record<string, string> = {
  mensual: 'cada mes',
  semestral: 'cada 6 meses',
  semanal: 'cada semana',
  anual: 'cada año',
  desarrollador: 'cada mes',
}

type Fila = { id: string; status: string; plan_id: string | null; current_period_end: string | null; mp_preapproval_id: string | null }

async function ultimaFila(userId: string): Promise<Fila | null> {
  const { data } = await createAdminClient()
    .from('subscriptions')
    .select('id, status, plan_id, current_period_end, mp_preapproval_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as Fila | null) ?? null
}

export async function suscripcionDe(userId: string): Promise<Suscripcion | null> {
  const fila = await ultimaFila(userId)
  if (!fila) return null
  const plan = resolveMpPlan(fila.plan_id)
  const estado: EstadoSuscripcion =
    fila.status === 'active' || fila.status === 'trialing' ? 'activa' : fila.status === 'canceled' || fila.status === 'paused' ? 'cancelada' : 'pendiente'
  return {
    estado,
    plan: plan ? MP_PLANS[plan].name.replace('SIMO Test ', '') : null,
    valor: plan ? MP_PLANS[plan].amount : null,
    cadaCuanto: plan ? CADA_CUANTO[plan] : null,
    accesoHasta: fila.current_period_end,
  }
}

// Mercado Pago escribe el estado de las suscripciones como «cancelled»
const CANCELADA_MP = 'cancelled'

export async function cancelarRenovacion(userId: string): Promise<{ ok: true; accesoHasta: string | null } | { ok: false; error: string }> {
  const fila = await ultimaFila(userId)
  if (!fila || fila.status !== 'active' || !fila.mp_preapproval_id) {
    return { ok: false, error: 'No encontramos una suscripción activa para cancelar. Si crees que es un error, escríbenos a revolutiondev08@gmail.com.' }
  }
  const token = getMpToken()
  if (!token) return { ok: false, error: 'No pudimos conectar con Mercado Pago. Intenta de nuevo en unos minutos.' }

  const id = fila.mp_preapproval_id
  const respuesta = await fetch(`https://api.mercadopago.com/preapproval/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: CANCELADA_MP }),
    cache: 'no-store',
  }).catch(() => null)

  // Si la respuesta falla, se confirma leyendo la suscripción: puede que ya estuviera cancelada
  if (!respuesta?.ok) {
    const actual = await getMpSubscription(id).catch(() => null)
    if (actual?.status !== CANCELADA_MP && actual?.status !== 'canceled') {
      console.error('[Suscripción] Mercado Pago no canceló la suscripción', { userId, id, status: respuesta?.status, mpStatus: actual?.status })
      return { ok: false, error: 'Mercado Pago no confirmó la cancelación. Intenta de nuevo en unos minutos o escríbenos a revolutiondev08@gmail.com.' }
    }
  }

  // Se actualiza la fila local con lo que dice Mercado Pago; si eso falla, se marca cancelada sin tocar la fecha
  const sincronizada = await syncMercadoPagoSubscription(id).catch((e: unknown) => {
    console.error('[Suscripción] No se pudo sincronizar tras cancelar', e)
    return null
  })
  if (!sincronizada) {
    await createAdminClient().from('subscriptions').update({ status: 'canceled', updated_at: new Date().toISOString() }).eq('id', fila.id)
  }
  return { ok: true, accesoHasta: sincronizada?.current_period_end ?? fila.current_period_end }
}

// Guarda por qué canceló, para entender qué mejorar (ver lib/suscripcion-cancelaciones.sql). No bloquea la cancelación.
export async function registrarMotivo(userId: string, motivo: MotivoCancelacion | null, comentario: string, accesoHasta: string | null) {
  const fila = await ultimaFila(userId)
  const { error } = await createAdminClient()
    .from('suscripcion_cancelaciones')
    .insert({ user_id: userId, plan: fila?.plan_id ?? null, motivo, comentario: comentario || null, acceso_hasta: accesoHasta })
  if (error) console.error('[Suscripción] No se pudo guardar el motivo de cancelación', error.message)
}
