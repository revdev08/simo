import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin/acceso'
import { correosClerk, pago, registrosClerk, resumenPorDia, suscripcionesMP, ultimosDias } from '@/lib/admin/metricas'
import PanelSuscriptores from '@/components/admin/PanelSuscriptores'

// Solo para los correos de ADMIN_EMAILS; para los demás la página no existe
export const metadata = { title: 'Administración', robots: { index: false, follow: false } }

const RANGOS = [7, 30, 90]
const DIA_MS = 86_400_000

async function cargarPanel(dias: number) {
  const ahora = Date.now()
  const lista = ultimosDias(dias, ahora)
  // Un día de margen: el filtro final es por día en hora de Colombia
  const [registros, suscripciones] = await Promise.all([registrosClerk(ahora - (dias + 1) * DIA_MS), suscripcionesMP()])

  const errores: string[] = []
  if (!registros.ok) errores.push(`No se pudieron leer los registros de Clerk: ${registros.error}`)
  if (!suscripciones.ok) errores.push(`No se pudieron leer las suscripciones de Mercado Pago: ${suscripciones.error}`)

  const subs = suscripciones.ok ? suscripciones.datos : null
  const ultimas = subs?.filter(pago).sort((a, b) => b.creada.localeCompare(a.creada)).slice(0, 15) ?? null
  const correos = ultimas ? await correosClerk(ultimas.flatMap((s) => (s.userId ? [s.userId] : []))) : {}

  return {
    filas: resumenPorDia(lista, registros.ok ? registros.datos.fechas : null, subs),
    totalUsuarios: registros.ok ? registros.datos.total : null,
    activas: subs ? subs.filter((s) => s.estado === 'authorized').length : null,
    recientes: ultimas?.map((s) => ({ fecha: s.creada, correo: (s.userId && correos[s.userId]) || null, estado: s.estado, cobros: s.cobros, monto: s.monto })) ?? null,
    errores,
    generado: new Date(ahora).toISOString(),
  }
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/')
  if (!(await esAdmin())) notFound()

  const { dias: pedido } = await searchParams
  const dias = RANGOS.includes(Number(pedido)) ? Number(pedido) : 30
  const datos = await cargarPanel(dias)

  return <PanelSuscriptores dias={dias} rangos={RANGOS} {...datos} />
}
