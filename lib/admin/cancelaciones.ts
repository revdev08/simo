// Motivos de cancelación desde «Mi progreso» (/admin/cancelaciones). Los datos vienen de la tabla
// suscripcion_cancelaciones (lib/suscripcion-cancelaciones.sql).
import 'server-only'
import { createAdminClient } from '@/lib/supabase'
import { MOTIVOS_CANCELACION } from '@/lib/cancelacion'
import type { Resultado } from './metricas'

const DIA_MS = 86_400_000

export type Cancelacion = { fecha: string; plan: string | null; motivo: string; comentario: string | null; accesoHasta: string | null }
export type ResumenCancelaciones = { total: number; porMotivo: { motivo: string; veces: number }[]; recientes: Cancelacion[] }

const textoMotivo = (id: string | null) => MOTIVOS_CANCELACION.find((m) => m.id === id)?.texto ?? 'Sin motivo'

export async function resumenCancelaciones(dias: number): Promise<Resultado<ResumenCancelaciones>> {
  const { data, error } = await createAdminClient()
    .from('suscripcion_cancelaciones')
    .select('created_at, plan, motivo, comentario, acceso_hasta')
    .gte('created_at', new Date(Date.now() - dias * DIA_MS).toISOString())
    .order('created_at', { ascending: false })
    .limit(2000)
  if (error) {
    const falta = /suscripcion_cancelaciones/.test(error.message) && /exist|schema cache/i.test(error.message)
    return { ok: false, error: falta ? 'Falta crear la tabla: ejecuta lib/suscripcion-cancelaciones.sql en el SQL Editor de Supabase.' : `No se pudieron leer las cancelaciones: ${error.message}` }
  }
  const filas = data as { created_at: string; plan: string | null; motivo: string | null; comentario: string | null; acceso_hasta: string | null }[]
  const conteo = new Map<string, number>()
  for (const f of filas) conteo.set(textoMotivo(f.motivo), (conteo.get(textoMotivo(f.motivo)) ?? 0) + 1)
  return {
    ok: true,
    datos: {
      total: filas.length,
      porMotivo: [...conteo].map(([motivo, veces]) => ({ motivo, veces })).sort((a, b) => b.veces - a.veces),
      recientes: filas.slice(0, 50).map((f) => ({ fecha: f.created_at, plan: f.plan, motivo: textoMotivo(f.motivo), comentario: f.comentario, accesoHasta: f.acceso_hasta })),
    },
  }
}
