import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin/acceso'
import { clasificarPagos, datosSuscriptores, pagosDeSuscripciones, registrosClerk, resumenPorDia, suscripcionesMP, ultimosDias } from '@/lib/admin/metricas'
import PanelSuscriptores from '@/components/admin/PanelSuscriptores'

// Solo para los correos de ADMIN_EMAILS; para los demás la página no existe
export const metadata = { title: 'Administración', robots: { index: false, follow: false } }

// Se consultan los pagos del periodo y de los 180 días anteriores en Mercado Pago: pueden ser varias páginas
export const maxDuration = 60

const RANGOS = [7, 30, 90]
const DIA_MS = 86_400_000
// Historia previa al periodo para saber si una persona ya había pagado antes (entonces no es nueva)
const HISTORIA_DIAS = 180

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
  // Ni el estado de la suscripción ni el resumen de Mercado Pago prueban que hubo pago: se cuentan los pagos
  // aprobados, por la fecha de aprobación, y se separan los nuevos de los recurrentes.
  const candidatas = (subs ?? []).filter((s) => s.estado === 'authorized' || s.cobros > 0).sort((a, b) => b.creada.localeCompare(a.creada))
  const ultimas = candidatas.slice(0, 15)
  const masAntigua = Math.min(desde, ...ultimas.map((s) => Date.parse(s.creada)))
  const diasPagos = Math.ceil((ahora - masAntigua) / DIA_MS) + 1 + HISTORIA_DIAS
  const pagos = subs ? await pagosDeSuscripciones(subs, diasPagos) : null
  if (pagos && !pagos.ok) {
    errores.push(`No se pudieron consultar los pagos en Mercado Pago (${pagos.error}): los suscriptores nuevos no se cuentan hasta poder verificarlos.`)
  }
  const cobros = pagos?.ok ? pagos.datos : {}
  // Un día de margen en el borde de la consulta
  const aprobados = subs && pagos?.ok ? clasificarPagos(subs, cobros, ahora - (diasPagos - 1) * DIA_MS) : null
  const datos = await datosSuscriptores(ultimas, cobros)

  return {
    filas: resumenPorDia(lista, registros.ok ? registros.datos.fechas : null, aprobados, subs ?? []),
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
