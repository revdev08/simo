// Motivos de cancelación desde «Mi progreso» (/admin/cancelaciones). Los datos vienen de la tabla
// suscripcion_cancelaciones (lib/suscripcion-cancelaciones.sql).
import 'server-only'
import { createAdminClient } from '@/lib/supabase'
import { MOTIVOS_CANCELACION } from '@/lib/cancelacion'
import type { Resultado } from './metricas'

const DIA_MS = 86_400_000

export type Cancelacion = { fecha: string; correo: string | null; plan: string | null; motivo: string; comentario: string | null; accesoHasta: string | null }
export type ResumenCancelaciones = { total: number; porMotivo: { motivo: string; veces: number }[]; recientes: Cancelacion[] }

const textoMotivo = (id: string | null) => MOTIVOS_CANCELACION.find((m) => m.id === id)?.texto ?? 'Sin motivo'

// Correo de cada usuario: el de su perfil y, si no lo tiene, el de su suscripción (el del checkout o el de Mercado Pago)
async function correosDe(userIds: string[]): Promise<Map<string, string>> {
  const correos = new Map<string, string>()
  if (!userIds.length) return correos
  const supabase = createAdminClient()
  const { data: perfiles } = await supabase.from('profiles').select('id, email').in('id', userIds)
  for (const p of perfiles ?? []) if (p.email) correos.set(p.id, p.email)
  const faltan = userIds.filter((id) => !correos.has(id))
  if (faltan.length) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('user_id, checkout_email, mp_payer_email')
      .in('user_id', faltan)
      .order('created_at', { ascending: false })
    for (const s of subs ?? []) {
      const correo = s.checkout_email ?? s.mp_payer_email
      if (correo && !correos.has(s.user_id)) correos.set(s.user_id, correo)
    }
  }
  return correos
}

export async function resumenCancelaciones(dias: number): Promise<Resultado<ResumenCancelaciones>> {
  const { data, error } = await createAdminClient()
    .from('suscripcion_cancelaciones')
    .select('created_at, user_id, plan, motivo, comentario, acceso_hasta')
    .gte('created_at', new Date(Date.now() - dias * DIA_MS).toISOString())
    .order('created_at', { ascending: false })
    .limit(2000)
  if (error) {
    const falta = /suscripcion_cancelaciones/.test(error.message) && /exist|schema cache/i.test(error.message)
    return { ok: false, error: falta ? 'Falta crear la tabla: ejecuta lib/suscripcion-cancelaciones.sql en el SQL Editor de Supabase.' : `No se pudieron leer las cancelaciones: ${error.message}` }
  }
  const filas = data as { created_at: string; user_id: string; plan: string | null; motivo: string | null; comentario: string | null; acceso_hasta: string | null }[]
  const correos = await correosDe([...new Set(filas.slice(0, 50).map((f) => f.user_id))])
  const conteo = new Map<string, number>()
  for (const f of filas) conteo.set(textoMotivo(f.motivo), (conteo.get(textoMotivo(f.motivo)) ?? 0) + 1)
  return {
    ok: true,
    datos: {
      total: filas.length,
      porMotivo: [...conteo].map(([motivo, veces]) => ({ motivo, veces })).sort((a, b) => b.veces - a.veces),
      recientes: filas.slice(0, 50).map((f) => ({ fecha: f.created_at, correo: correos.get(f.user_id) ?? null, plan: f.plan, motivo: textoMotivo(f.motivo), comentario: f.comentario, accesoHasta: f.acceso_hasta })),
    },
  }
}
