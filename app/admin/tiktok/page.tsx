import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin/acceso'
import { ultimosDias } from '@/lib/admin/metricas'
import { INICIO_CONTROL, META_DIARIA, listarPublicaciones, miembrosEquipo, resumenEquipo, type Periodo } from '@/lib/admin/tiktok'
import PanelTiktok from '@/components/admin/tiktok/PanelTiktok'

export const metadata = { title: 'TikTok · Administración', robots: { index: false, follow: false } }

const PERIODOS: Periodo[] = [7, 30, 90, 'todo']

async function cargar(periodo: Periodo) {
  const ahora = Date.now()
  const [miembros, publicaciones] = await Promise.all([miembrosEquipo().catch(() => null), listarPublicaciones()])
  const errores: string[] = []
  if (!miembros) errores.push('No se pudo leer el equipo en Clerk.')
  if (!publicaciones.ok) errores.push(publicaciones.error)
  const lista = publicaciones.ok ? publicaciones.datos : []
  const equipo = miembros ?? []
  const { hoy, resumen } = resumenEquipo(equipo, lista, periodo, ahora)
  const nombres = new Map(equipo.map((m) => [m.id, m.nombre]))
  return {
    hoy,
    resumen,
    cuadricula: ultimosDias(14, ahora),
    recientes: lista.slice(0, 40).map((p) => ({ ...p, nombre: nombres.get(p.userId) ?? 'Otra persona' })),
    errores,
  }
}

export default async function TiktokPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/')
  if (!(await esAdmin())) notFound()

  const { periodo: pedido } = await searchParams
  const periodo = PERIODOS.find((p) => String(p) === pedido) ?? 7
  const datos = await cargar(periodo)

  return <PanelTiktok periodo={periodo} meta={META_DIARIA} inicio={INICIO_CONTROL} miUsuario={userId} {...datos} />
}
