import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'

const MAX_EJES = 60
const MAX_SIN_COBERTURA = 40
const MAX_LARGO = 200
// Tope global contra abuso: la página es pública y no guardamos nada que identifique a quien la usa
const MAX_POR_HORA = 500

// Registra una consulta de la herramienta de ejes temáticos (ver lib/ejes-consultas.sql). Responde 204 aunque no
// se guarde: el aspirante no tiene que enterarse de nada.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const total = Number(body?.total)
    if (!Number.isInteger(total) || total < 1 || total > MAX_EJES || !Array.isArray(body?.sinCobertura)) {
      return new NextResponse(null, { status: 400 })
    }
    const convocatoria = CONVOCATORIAS.some((c) => c.slug === body.convocatoria) ? (body.convocatoria as string) : null
    const sinCobertura = [
      ...new Set(
        (body.sinCobertura as unknown[])
          .filter((e): e is string => typeof e === 'string')
          .map((e) => e.replace(/\s+/g, ' ').trim().slice(0, MAX_LARGO))
          .filter(Boolean),
      ),
    ].slice(0, Math.min(MAX_SIN_COBERTURA, total))

    const admin = createAdminClient()
    const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await admin.from('ejes_consultas').select('id', { count: 'exact', head: true }).gte('created_at', desde)
    if ((count ?? 0) >= MAX_POR_HORA) return new NextResponse(null, { status: 204 })

    const { error } = await admin.from('ejes_consultas').insert({ convocatoria, total_ejes: total, sin_cobertura: sinCobertura })
    if (error) console.error('Error guardando la consulta de ejes:', error.message)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Ejes POST error:', error)
    return new NextResponse(null, { status: 204 })
  }
}
