// Resumen de la herramienta de ejes temáticos (/admin/ejes): cuántos la usan y qué ejes piden que no cubrimos.
// Los datos vienen de la tabla ejes_consultas (lib/ejes-consultas.sql), que llena /api/ejes.
import 'server-only'
import { createAdminClient } from '@/lib/supabase'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'
import type { Resultado } from './metricas'

const DIA_MS = 86_400_000
const MAX_FILAS = 5000

export type EjeSinCobertura = { eje: string; veces: number; convocatorias: string[] }
export type ResumenEjes = {
  consultas: number
  conFaltantes: number
  ejesPegados: number
  ejesSinCobertura: number
  porConvocatoria: { nombre: string; consultas: number }[]
  faltantes: EjeSinCobertura[]
  truncado: boolean
}

const nombreDe = (slug: string | null) => (slug ? (CONVOCATORIAS.find((c) => c.slug === slug)?.nombre ?? slug) : 'Página general')

// Para agrupar el mismo eje escrito de formas distintas: sin tildes, numeración, viñetas ni puntuación final
const clave = (eje: string) =>
  eje
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^\s*(?:[-•*·]|\d+(?:\.\d+)*[.)-]?|[a-z][.)])\s+/, '')
    .replace(/[.;:,]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()

export async function resumenEjes(dias: number): Promise<Resultado<ResumenEjes>> {
  const desde = new Date(Date.now() - dias * DIA_MS).toISOString()
  const { data, error } = await createAdminClient()
    .from('ejes_consultas')
    .select('convocatoria, total_ejes, sin_cobertura')
    .gte('created_at', desde)
    .order('created_at', { ascending: false })
    .limit(MAX_FILAS)
  if (error) {
    const falta = /ejes_consultas/.test(error.message) && /exist|schema cache/i.test(error.message)
    return { ok: false, error: falta ? 'Falta crear la tabla: ejecuta lib/ejes-consultas.sql en el SQL Editor de Supabase.' : `No se pudieron leer las consultas: ${error.message}` }
  }

  const filas = data as { convocatoria: string | null; total_ejes: number; sin_cobertura: string[] }[]
  const porConvocatoria = new Map<string, number>()
  const grupos = new Map<string, { eje: string; veces: number; convocatorias: Set<string> }>()
  for (const f of filas) {
    const nombre = nombreDe(f.convocatoria)
    porConvocatoria.set(nombre, (porConvocatoria.get(nombre) ?? 0) + 1)
    for (const eje of f.sin_cobertura) {
      const k = clave(eje)
      if (!k) continue
      const g = grupos.get(k) ?? { eje, veces: 0, convocatorias: new Set<string>() }
      g.veces++
      g.convocatorias.add(nombre)
      grupos.set(k, g)
    }
  }

  return {
    ok: true,
    datos: {
      consultas: filas.length,
      conFaltantes: filas.filter((f) => f.sin_cobertura.length > 0).length,
      ejesPegados: filas.reduce((s, f) => s + f.total_ejes, 0),
      ejesSinCobertura: filas.reduce((s, f) => s + f.sin_cobertura.length, 0),
      porConvocatoria: [...porConvocatoria].map(([nombre, consultas]) => ({ nombre, consultas })).sort((a, b) => b.consultas - a.consultas),
      faltantes: [...grupos.values()]
        .sort((a, b) => b.veces - a.veces || a.eje.localeCompare(b.eje))
        .slice(0, 100)
        .map((g) => ({ eje: g.eje, veces: g.veces, convocatorias: [...g.convocatorias] })),
      truncado: filas.length === MAX_FILAS,
    },
  }
}
