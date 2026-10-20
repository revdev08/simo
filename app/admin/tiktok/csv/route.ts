// Descarga en CSV los datos de /admin/tiktok: ?tipo=publicaciones (cada video registrado) o ?tipo=cumplimiento
// (videos de cada persona por día frente a la meta). Solo para ADMIN_EMAILS; a los demás les responde 404.
import { auth } from '@clerk/nextjs/server'
import { esAdmin } from '@/lib/admin/acceso'
import { diaColombia, ultimosDias } from '@/lib/admin/metricas'
import { INICIO_CONTROL, META_DIARIA, listarPublicaciones, miembrosEquipo } from '@/lib/admin/tiktok'

const DIA_MS = 86_400_000

// «2026-10-20 14:05» en hora de Colombia
const horaColombia = (iso: string) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))

const celda = (v: string | number | null) => (v === null ? '' : typeof v === 'number' ? String(v) : `"${v.replace(/"/g, '""')}"`)
// Con BOM para que Excel lea bien las tildes
const csv = (filas: (string | number | null)[][]) => String.fromCharCode(0xfeff) + filas.map((f) => f.map(celda).join(',')).join('\r\n')

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId || !(await esAdmin())) return new Response('No encontrado', { status: 404 })

  const tipo = new URL(req.url).searchParams.get('tipo') === 'cumplimiento' ? 'cumplimiento' : 'publicaciones'
  const [miembros, publicaciones] = await Promise.all([miembrosEquipo().catch(() => []), listarPublicaciones()])
  if (!publicaciones.ok) return new Response(publicaciones.error, { status: 500 })
  const equipo = new Map(miembros.map((m) => [m.id, m]))
  const ahora = Date.now()
  const hoy = diaColombia(ahora)

  let filas: (string | number | null)[][]
  if (tipo === 'publicaciones') {
    filas = [
      ['Publicado (hora Colombia)', 'Día', 'Persona', 'Correo', 'Cuenta de TikTok', 'Enlace', 'Id del video', 'Registrado (hora Colombia)', 'Vistas'],
      ...publicaciones.datos.map((p) => {
        const m = equipo.get(p.userId)
        return [horaColombia(p.publicadaEn), diaColombia(p.publicadaEn), m?.nombre ?? 'Otra persona', m?.correo ?? '', p.autor ? `@${p.autor}` : '', p.url, p.videoId, horaColombia(p.registradaEn), p.vistas]
      }),
    ]
  } else {
    // Un renglón por persona y día, desde el inicio del control hasta hoy (hoy queda «en curso»)
    const dias = Math.max(0, Math.round((Date.parse(`${hoy}T12:00:00Z`) - Date.parse(`${INICIO_CONTROL}T12:00:00Z`)) / DIA_MS)) + 1
    const conteo = new Map<string, number>()
    for (const p of publicaciones.datos) {
      const k = `${p.userId}|${diaColombia(p.publicadaEn)}`
      conteo.set(k, (conteo.get(k) ?? 0) + 1)
    }
    filas = [['Día', 'Persona', 'Correo', 'Videos', 'Meta', 'Cumplió']]
    for (const dia of ultimosDias(dias, ahora).reverse()) {
      for (const m of miembros) {
        const n = conteo.get(`${m.id}|${dia}`) ?? 0
        filas.push([dia, m.nombre, m.correo, n, META_DIARIA, n >= META_DIARIA ? 'Sí' : dia === hoy ? 'En curso' : 'No'])
      }
    }
  }

  return new Response(csv(filas), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tiktok-${tipo}-${hoy}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
