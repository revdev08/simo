// Datos de Mercado Pago del panel de administración, en una caché compartida.
// Leerlos cuesta decenas de peticiones (todas las suscripciones y meses de pagos, por páginas), así que se consultan
// como mucho una vez cada REVALIDAR_S segundos, para todos los periodos del panel (7, 30 y 90 días) y todos los
// administradores. Si al renovarlos Mercado Pago falla (por ejemplo, un 429 por pasar el límite de peticiones),
// se siguen mostrando los últimos datos buenos: un resultado con error nunca se guarda.
import 'server-only'
import { unstable_cache } from 'next/cache'
import {
  clasificarPagos,
  datosSuscriptores,
  diaColombia,
  pagosDeSuscripciones,
  suscripcionesMP,
  type PagoDelPanel,
  type Resultado,
  type SuscripcionReciente,
} from './metricas'

const DIA_MS = 86_400_000
// Periodo más largo del panel: con sus datos se sirven también los más cortos
export const MAX_DIAS = 90
// Historia previa al periodo para saber si una persona ya había pagado antes (entonces no es nueva)
const HISTORIA_DIAS = 180
export const REVALIDAR_S = 600

export type PanelMercadoPago = {
  pagos: PagoDelPanel[] // pagos aprobados de los últimos MAX_DIAS días
  activas: number
  recientes: SuscripcionReciente[]
  generado: string // cuándo se consultó Mercado Pago (ISO)
}

async function leerMercadoPago(): Promise<PanelMercadoPago> {
  const ahora = Date.now()
  const suscripciones = await suscripcionesMP()
  if (!suscripciones.ok) throw new Error(`No se pudieron leer las suscripciones de Mercado Pago: ${suscripciones.error}`)
  const subs = suscripciones.datos

  // Ni el estado de la suscripción ni el resumen de Mercado Pago prueban que hubo pago: se cuentan los pagos
  // aprobados, por la fecha de aprobación, y se separan los nuevos de los recurrentes.
  const candidatas = subs.filter((s) => s.estado === 'authorized' || s.cobros > 0).sort((a, b) => b.creada.localeCompare(a.creada))
  const ultimas = candidatas.slice(0, 15)
  // Un día de margen: el filtro final es por día en hora de Colombia
  const desde = ahora - (MAX_DIAS + 1) * DIA_MS
  const masAntigua = Math.min(desde, ...ultimas.map((s) => Date.parse(s.creada)))
  const diasPagos = Math.ceil((ahora - masAntigua) / DIA_MS) + 1 + HISTORIA_DIAS
  const pagos = await pagosDeSuscripciones(subs, diasPagos)
  if (!pagos.ok) {
    throw new Error(`No se pudieron consultar los pagos en Mercado Pago (${pagos.error}): los suscriptores nuevos no se cuentan hasta poder verificarlos.`)
  }
  const cobros = pagos.datos

  const activas = new Set(subs.filter((s) => s.estado === 'authorized').map((s) => s.id))
  const primerDia = diaColombia(desde)
  // Un día de margen en el borde de la consulta
  const aprobados = clasificarPagos(subs, cobros, ahora - (diasPagos - 1) * DIA_MS)
    .filter((p) => p.dia >= primerDia)
    .map((p) => ({ dia: p.dia, tipo: p.tipo, activa: activas.has(p.subId) }))
  const datos = await datosSuscriptores(ultimas, cobros)

  return {
    pagos: aprobados,
    activas: activas.size,
    recientes: ultimas.map((s) => ({
      fecha: s.creada,
      ...datos[s.id],
      estado: s.estado,
      cobros: cobros[s.id] ?? null,
      cobrosResumen: s.cobros,
      monto: s.monto,
    })),
    generado: new Date(ahora).toISOString(),
  }
}

const leerMercadoPagoEnCache = unstable_cache(leerMercadoPago, ['admin-mercadopago-v1'], {
  revalidate: REVALIDAR_S,
  tags: ['admin-mercadopago'],
})

export async function panelMercadoPago(): Promise<Resultado<PanelMercadoPago>> {
  try {
    return { ok: true, datos: await leerMercadoPagoEnCache() }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
