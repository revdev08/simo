import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin/acceso'
import { cobrosDeSuscripciones, datosSuscriptores, pago, registrosClerk, resumenPorDia, suscripcionesMP, ultimosDias } from '@/lib/admin/metricas'
import PanelSuscriptores from '@/components/admin/PanelSuscriptores'

// Solo para los correos de ADMIN_EMAILS; para los demás la página no existe
export const metadata = { title: 'Administración', robots: { index: false, follow: false } }

const RANGOS = [7, 30, 90]
const DIA_MS = 86_400_000

async function cargarPanel(dias: number) {
  const ahora = Date.now()
  const lista = ultimosDias(dias, ahora)
  // Un día de margen: el filtro final es por día en hora de Colombia
  const desde = ahora - (dias + 1) * DIA_MS
  const [registros, suscripciones] = await Promise.all([registrosClerk(desde), suscripcionesMP()])

  const errores: string[] = []
  if (!registros.ok) errores.push(`No se pudieron leer los registros de Clerk: ${registros.error}`)
  if (!suscripciones.ok) errores.push(`No se pudieron leer las suscripciones de Mercado Pago: ${suscripciones.error}`)

  const subs = suscripciones.ok ? suscripciones.datos : null
  // Activas o que dicen tener cobros. El resumen de Mercado Pago puede contar intentos rechazados, así que
  // para las no activas del periodo y para las últimas 15 se consultan los pagos reales.
  const candidatas = (subs ?? []).filter((s) => s.estado === 'authorized' || s.cobros > 0).sort((a, b) => b.creada.localeCompare(a.creada))
  const ultimas = candidatas.slice(0, 15)
  const dudosas = candidatas.filter((s) => s.estado !== 'authorized' && Date.parse(s.creada) >= desde)
  const cobros = await cobrosDeSuscripciones([...ultimas, ...dudosas].map((s) => s.id))
  const datos = await datosSuscriptores(ultimas, cobros)

  return {
    filas: resumenPorDia(lista, registros.ok ? registros.datos.fechas : null, subs ? subs.filter((s) => pago(s, cobros)) : null),
    totalUsuarios: registros.ok ? registros.datos.total : null,
    activas: subs ? subs.filter((s) => s.estado === 'authorized').length : null,
    recientes: subs
      ? ultimas.map((s) => ({
          fecha: s.creada,
          ...datos[s.id],
          estado: s.estado,
          cobros: cobros[s.id] ?? null,
          cobrosResumen: s.cobros,
          monto: s.monto,
        }))
      : null,
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
