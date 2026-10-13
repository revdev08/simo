import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin/acceso'
import { datosSuscriptores, pagosDeSuscripciones, pago, registrosClerk, resumenPorDia, suscripcionesMP, ultimosDias } from '@/lib/admin/metricas'
import PanelSuscriptores from '@/components/admin/PanelSuscriptores'

// Solo para los correos de ADMIN_EMAILS; para los demás la página no existe
export const metadata = { title: 'Administración', robots: { index: false, follow: false } }

// Se consultan todos los pagos del periodo en Mercado Pago: con 90 días pueden ser varias páginas
export const maxDuration = 60

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
  // Activas o que dicen tener cobros. Ni el estado ni el resumen de Mercado Pago prueban que hubo pago, así que se
  // buscan los pagos reales del periodo (y de las últimas 15) y solo cuentan las suscripciones con uno aprobado.
  const candidatas = (subs ?? []).filter((s) => s.estado === 'authorized' || s.cobros > 0).sort((a, b) => b.creada.localeCompare(a.creada))
  const ultimas = candidatas.slice(0, 15)
  const masAntigua = Math.min(desde, ...ultimas.map((s) => Date.parse(s.creada)))
  const pagos = subs ? await pagosDeSuscripciones(subs, Math.ceil((ahora - masAntigua) / DIA_MS) + 1) : null
  if (pagos && !pagos.ok) {
    errores.push(`No se pudieron consultar los pagos en Mercado Pago (${pagos.error}): las suscripciones nuevas no se cuentan hasta poder verificarlas.`)
  }
  const cobros = pagos?.ok ? pagos.datos : {}
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
