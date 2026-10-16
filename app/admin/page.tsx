import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { esAdmin } from '@/lib/admin/acceso'
import { registrosClerk, resumenPorDia, ultimosDias } from '@/lib/admin/metricas'
import { MAX_DIAS, panelMercadoPago, REVALIDAR_S } from '@/lib/admin/panelMercadoPago'
import PanelSuscriptores from '@/components/admin/PanelSuscriptores'

// Solo para los correos de ADMIN_EMAILS; para los demás la página no existe
export const metadata = { title: 'Administración', robots: { index: false, follow: false } }

// Al renovar la caché se consultan los pagos del periodo y de los 180 días anteriores en Mercado Pago: pueden ser varias páginas
export const maxDuration = 60

const RANGOS = [7, 30, MAX_DIAS]
const DIA_MS = 86_400_000

async function cargarPanel(dias: number) {
  const ahora = Date.now()
  const lista = ultimosDias(dias, ahora)
  // Un día de margen: el filtro final es por día en hora de Colombia
  const desde = ahora - (dias + 1) * DIA_MS
  // Mercado Pago sale de la caché compartida (la misma para todos los periodos), no de una consulta por visita
  const [registros, mp] = await Promise.all([registrosClerk(desde), panelMercadoPago()])

  const errores: string[] = []
  if (!registros.ok) errores.push(`No se pudieron leer los registros de Clerk: ${registros.error}`)
  if (!mp.ok) errores.push(mp.error)
  if (mp.ok && mp.datos.truncado) errores.push('Mercado Pago tenía más pagos que el tope de la consulta: faltan los más antiguos, así que la clasificación de nuevos y recurrentes puede ser imprecisa.')

  // Los nuevos del periodo, uno por uno, para poder revisar la cifra; las compras de prueba solo se cuentan aparte
  const enPeriodo = new Set(lista)
  const delPeriodo = mp.ok ? mp.datos.pagos.filter((p) => enPeriodo.has(p.dia)) : []

  return {
    filas: resumenPorDia(lista, registros.ok ? registros.datos.fechas : null, mp.ok ? mp.datos.pagos : null),
    nuevos: mp.ok ? delPeriodo.filter((p) => p.tipo === 'nuevo').sort((a, b) => b.hora.localeCompare(a.hora)) : null,
    pruebas: delPeriodo.filter((p) => p.tipo === 'prueba').length,
    totalUsuarios: registros.ok ? registros.datos.total : null,
    activas: mp.ok ? mp.datos.activas : null,
    recientes: mp.ok ? mp.datos.recientes : null,
    errores,
    generado: new Date(ahora).toISOString(),
    generadoMercadoPago: mp.ok ? mp.datos.generado : null,
    sinSuscripcion: mp.ok ? mp.datos.sinSuscripcion : 0,
    minutosCache: REVALIDAR_S / 60,
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
