// Dinero disponible en la cuenta de Mercado Pago, para /admin. Mercado Pago no da el saldo con una consulta directa:
// sale del reporte de «Dinero liberado» (release report), que se pide, Mercado Pago genera en unos minutos y luego
// se descarga. Su fila «total» es el dinero disponible al cierre del reporte.
// - Se usa el reporte terminado más reciente y se pide otro si cierra hace más de HORAS_REPORTE horas.
// - Si la cuenta no tiene configuración de reportes, se crea una sin generación automática; si ya tiene, no se toca.
// - Un resultado con error no se guarda en la caché: se vuelve a intentar en la siguiente visita.
import 'server-only'
import { unstable_cache } from 'next/cache'
import type { Resultado } from './metricas'
import { unaConsulta } from './unaConsulta'

const API = 'https://api.mercadopago.com/v1/account/release_report'
const HORA_MS = 3_600_000
const DIA_MS = 86_400_000
const HORAS_REPORTE = 3
const FALLIDO_MS = 30 * 60_000
// Con el botón: no se pide otro si ya hay uno que cierra (o se pidió) hace menos de esto
const RECIENTE_MS = 10 * 60_000
const DIAS_REPORTE = 30
// Cada renovación son 3 o 4 peticiones (configuración, lista, archivo); el reporte nuevo se pide cada 3 horas
export const REVALIDAR_SALDO_S = 300

// Columnas de la configuración que se crea si la cuenta no tiene ninguna
const COLUMNAS = ['DATE', 'SOURCE_ID', 'EXTERNAL_REFERENCE', 'RECORD_TYPE', 'DESCRIPTION', 'NET_CREDIT_AMOUNT', 'NET_DEBIT_AMOUNT', 'GROSS_AMOUNT', 'MP_FEE_AMOUNT', 'TAXES_AMOUNT', 'PAYMENT_METHOD']
const PENDIENTES = new Set(['pending', 'processing', 'in_progress', 'waiting'])

export type SaldoMercadoPago = {
  saldo: number | null // null: Mercado Pago aún no termina el primer reporte
  corte: string | null // hasta cuándo cuenta el reporte (ISO)
  desde: string | null // desde cuándo cuentan liberado y retirado (ISO)
  liberado: number | null // dinero que pasó a disponible en el periodo del reporte
  retirado: number | null // retiros del periodo
  descuadre: number | null // diferencia entre la fila «total» y la suma de los movimientos, si no cuadran
  actualizando: boolean // ya se pidió a Mercado Pago un reporte más reciente
  aviso: string | null // no se pudo pedir uno más reciente
  diagnostico: string | null // en qué va el último reporte pedido, cuando aún no hay saldo
  consultado: string // cuándo se consultó Mercado Pago (ISO)
}

type Reporte = {
  id: number // id de la tarea de generación
  report_id?: number | null // id del reporte (el que usa la búsqueda de archivos)
  file_name?: string
  status?: string
  begin_date?: string
  end_date?: string
  date_created?: string
  generation_date?: string
  last_modified?: string
}
type Config = { columns?: { key: string }[] }

class ErrorMP extends Error {
  constructor(
    readonly status: number,
    mensaje: string,
  ) {
    super(mensaje)
  }
}

async function pedir(token: string, ruta: string, init: RequestInit = {}, reintento = true): Promise<Response> {
  const res = await fetch(`${API}${ruta}`, {
    ...init,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
  })
  // Mercado Pago responde 429 al pasar el límite de peticiones: se espera y se reintenta una vez
  if (res.status === 429 && reintento) {
    await new Promise((r) => setTimeout(r, 1500))
    return pedir(token, ruta, init, false)
  }
  if (!res.ok) {
    const cuerpo = await res.text().catch(() => '')
    let detalle = cuerpo.slice(0, 200)
    try {
      const j = JSON.parse(cuerpo) as { message?: string; error?: string }
      detalle = j.message ?? j.error ?? detalle
    } catch {}
    throw new ErrorMP(res.status, `${detalle || res.statusText} (${res.status})`)
  }
  return res
}

// La configuración de la cuenta; si no hay, se crea una para generar reportes a pedido (sin generación automática)
async function configuracion(token: string): Promise<Config> {
  try {
    return (await (await pedir(token, '/config')).json()) as Config
  } catch (e) {
    if (!(e instanceof ErrorMP) || (e.status !== 404 && !(e.status === 400 && /not.?found|no existe|config/i.test(e.message)))) throw e
  }
  // Mercado Pago rechaza la configuración (400) si faltan execute_after_withdrawal y los demás indicadores, aunque
  // su documentación los marque como opcionales. Sin report_translation los encabezados quedan con su nombre clave.
  const nueva = {
    columns: COLUMNAS.map((key) => ({ key })),
    file_name_prefix: 'simo-dinero-liberado',
    frequency: { hour: 0, value: 1, type: 'monthly' },
    display_timezone: 'GMT-05',
    separator: ',',
    include_withdrawal_at_end: true,
    check_available_balance: false,
    compensate_detail: false,
    execute_after_withdrawal: false,
    scheduled: false,
  }
  try {
    await pedir(token, '/config', { method: 'POST', body: JSON.stringify(nueva) })
  } catch (e) {
    // 409: alguien la creó entre tanto
    if (e instanceof ErrorMP && e.status === 409) return (await (await pedir(token, '/config')).json()) as Config
    throw e
  }
  return nueva
}

const fechaMP = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z')
const listo = (r: Reporte) => {
  const estado = (r.status ?? '').toLowerCase()
  if (estado === 'processed' || estado === 'enabled') return true
  if (PENDIENTES.has(estado) || /error|fail|delet|reject|cancel/.test(estado)) return false
  return !!r.file_name || r.report_id != null
}

// «estado processed, pedido hace 12 min, tarea 99336983670, reporte 17012160»: para entender una captura del panel
function describir(r: Reporte, ahora: number): string {
  const pedido = Date.parse(r.generation_date ?? r.date_created ?? r.last_modified ?? '')
  const partes = [`estado ${r.status ?? 'sin estado'}`]
  if (Number.isFinite(pedido)) partes.push(`pedido hace ${Math.max(0, Math.round((ahora - pedido) / 60_000))} min`)
  partes.push(`tarea ${r.id}`)
  if (r.report_id != null) partes.push(`reporte ${r.report_id}`)
  return partes.join(', ')
}

// Nombre del archivo para descargarlo. La lista de reportes no siempre lo trae; la búsqueda sí, pero se filtra por el
// id del reporte (report_id), que no es el id de la tarea. Si no lo encuentra así, busca por las fechas del reporte.
async function nombreArchivo(token: string, r: Reporte): Promise<string | undefined> {
  if (r.file_name) return r.file_name
  const filtros = [
    r.report_id != null ? `id=${r.report_id}` : null,
    r.begin_date && r.end_date ? `begin_date=${encodeURIComponent(r.begin_date)}&end_date=${encodeURIComponent(r.end_date)}` : null,
    `id=${r.id}`,
  ].filter((f): f is string => f !== null)
  for (const filtro of filtros) {
    const busqueda = (await pedir(token, `/search?${filtro}`)
      .then((res) => res.json())
      .catch(() => null)) as { results?: (Reporte & { date_created?: string })[] } | null
    const conArchivo = (busqueda?.results ?? []).filter((x) => x.file_name).sort((a, b) => (b.date_created ?? '').localeCompare(a.date_created ?? ''))
    if (conArchivo[0]?.file_name) return conArchivo[0].file_name
  }
  return undefined
}

// Filas de un CSV con comillas; el separador es el que más aparece en la primera línea
function filasCSV(texto: string): string[][] {
  const t = texto.replace(/^﻿/, '')
  const primera = t.split('\n', 1)[0]
  const sep = (primera.match(/;/g)?.length ?? 0) > (primera.match(/,/g)?.length ?? 0) ? ';' : ','
  const filas: string[][] = []
  let fila: string[] = []
  let celda = ''
  let comillas = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (comillas) {
      if (c === '"' && t[i + 1] === '"') {
        celda += '"'
        i++
      } else if (c === '"') comillas = false
      else celda += c
    } else if (c === '"') comillas = true
    else if (c === sep) {
      fila.push(celda)
      celda = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      fila.push(celda)
      if (fila.some((v) => v.trim())) filas.push(fila)
      fila = []
      celda = ''
    } else celda += c
  }
  fila.push(celda)
  if (fila.some((v) => v.trim())) filas.push(fila)
  return filas
}

// «1234.5», «-1234.5» o «1.234,50»
function monto(v: string | undefined): number {
  const s = (v ?? '').trim().replace(/[^\d.,-]/g, '')
  if (!s) return 0
  const normal = /,\d{1,2}$/.test(s) ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  const n = Number(normal)
  return Number.isFinite(n) ? n : 0
}

const clave = (s: string) => s.trim().toUpperCase().replace(/[\s-]+/g, '_')

function calcular(csv: string, config: Config) {
  const [cabecera, ...filas] = filasCSV(csv)
  if (!cabecera) throw new Error('El reporte de Mercado Pago llegó vacío.')
  const h = cabecera.map(clave)
  // Si los encabezados vienen traducidos, las columnas siguen el orden de la configuración
  const orden = (config.columns ?? []).map((c) => clave(c.key))
  const col = (k: string) => (h.includes(k) ? h.indexOf(k) : orden.length === h.length ? orden.indexOf(k) : -1)
  const tipo = col('RECORD_TYPE')
  const credito = col('NET_CREDIT_AMOUNT')
  const debito = col('NET_DEBIT_AMOUNT')
  const descripcion = col('DESCRIPTION')
  if (tipo < 0 || credito < 0 || debito < 0) {
    throw new Error('El reporte de Dinero liberado no trae las columnas RECORD_TYPE, NET_CREDIT_AMOUNT y NET_DEBIT_AMOUNT: agrégalas en la configuración de reportes de Mercado Pago.')
  }

  let total: number | null = null
  let suma = 0
  let liberado = 0
  let retirado = 0
  for (const f of filas) {
    const t = (f[tipo] ?? '').trim().toLowerCase()
    const cr = monto(f[credito])
    const db = monto(f[debito])
    if (t === 'total') {
      total = cr - db
      continue
    }
    // Saldo antes y después de cada retiro: no es un movimiento
    if (t === 'available_balance') continue
    suma += cr - db
    if (t === 'initial_available_balance') continue
    const d = descripcion >= 0 ? (f[descripcion] ?? '').toLowerCase() : ''
    if (/withdrawal|payout/.test(d)) retirado += db - cr
    else liberado += cr
  }
  const saldo = total ?? suma
  return { saldo, liberado, retirado, descuadre: total !== null && Math.abs(total - suma) >= 1 ? total - suma : null }
}

// Se decide por la fecha de cierre y no por el nombre del estado, que Mercado Pago no documenta del todo.
// Si no trae fecha de cierre, cuenta la hora en que se pidió.
const cierraHace = (r: Reporte, ahora: number) => ahora - Date.parse(r.end_date ?? r.generation_date ?? r.date_created ?? r.last_modified ?? '')
const fallido = (r: Reporte) => /error|fail|reject|cancel/.test((r.status ?? '').toLowerCase())
const enCamino = (r: Reporte, ahora: number) => !listo(r) && !fallido(r) && cierraHace(r, ahora) < HORAS_REPORTE * HORA_MS

async function listarReportes(token: string): Promise<Reporte[]> {
  const respuesta = (await (await pedir(token, '/list')).json()) as Reporte[] | { results?: Reporte[] }
  return Array.isArray(respuesta) ? respuesta : (respuesta.results ?? [])
}

// Cuándo se pidió el último reporte en esta instancia: la lista de Mercado Pago puede tardar en mostrarlo, y sin esto
// la renovación de la caché que sigue al botón pediría otro igual
let pedidoEn = 0

// true si Mercado Pago lo aceptó; false si respondió 203 (no pudo crearlo y pide volver a intentarlo)
async function crearReporte(token: string, ahora: number): Promise<boolean> {
  // Cierra unos minutos antes de ahora para que Mercado Pago no lo tome como una fecha futura
  const cuerpo = { begin_date: fechaMP(ahora - DIAS_REPORTE * DIA_MS), end_date: fechaMP(ahora - 5 * 60_000) }
  const res = await pedir(token, '', { method: 'POST', body: JSON.stringify(cuerpo) })
  if (res.status === 203) return false
  pedidoEn = ahora
  return true
}

async function leerSaldo(): Promise<SaldoMercadoPago> {
  const token = process.env.MELI_ACCESS_TOKEN
  if (!token) throw new Error('Falta MELI_ACCESS_TOKEN.')
  const ahora = Date.now()
  const config = await configuracion(token)

  const reportes = await listarReportes(token)
  const terminados = reportes.filter((r) => listo(r) && r.end_date).sort((a, b) => Date.parse(b.end_date!) - Date.parse(a.end_date!))
  const ultimo = terminados[0] ?? null
  // Si cualquier reporte (terminado o en camino) cierra hace menos de HORAS_REPORTE horas, no se pide otro.
  // Uno que falló bloquea solo FALLIDO_MS, para reintentar sin pedir uno en cada renovación de la caché.
  const pedidoHacePoco = ahora - pedidoEn < RECIENTE_MS
  const hayReciente = pedidoHacePoco || reportes.some((r) => cierraHace(r, ahora) < (fallido(r) ? FALLIDO_MS : HORAS_REPORTE * HORA_MS))

  let actualizando = pedidoHacePoco || reportes.some((r) => enCamino(r, ahora))
  let aviso: string | null = null
  if (!hayReciente) {
    try {
      if (await crearReporte(token, ahora)) actualizando = true
      else aviso = 'Mercado Pago no pudo preparar un reporte más reciente; se vuelve a pedir en unos minutos.'
    } catch (e) {
      if (!ultimo) throw e
      aviso = `No se pudo pedir un reporte más reciente: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  const vacio = { saldo: null, corte: null, desde: null, liberado: null, retirado: null, descuadre: null }
  if (!ultimo) {
    // El más reciente por la hora en que se pidió, para saber en qué va si tarda
    const masReciente = [...reportes].sort((a, b) => cierraHace(a, ahora) - cierraHace(b, ahora))[0]
    return { ...vacio, actualizando, aviso, diagnostico: masReciente ? describir(masReciente, ahora) : null, consultado: new Date(ahora).toISOString() }
  }

  const archivo = await nombreArchivo(token, ultimo)
  if (!archivo) throw new Error(`Mercado Pago no dio el nombre del archivo del último reporte (${describir(ultimo, ahora)}).`)
  const csv = await (await pedir(token, `/${encodeURIComponent(archivo)}`)).text()

  return {
    ...calcular(csv, config),
    corte: ultimo.end_date ?? null,
    desde: ultimo.begin_date ?? null,
    actualizando,
    aviso,
    diagnostico: null,
    consultado: new Date(ahora).toISOString(),
  }
}

// Una sola consulta a la vez y, si falla, un minuto sin reintentar: varias recargas no multiplican las peticiones
// La renuevan el botón «Actualizar ahora» del panel (admin-mercadopago) y el de la tarjeta del saldo (TAG_SALDO)
export const TAG_SALDO = 'admin-mercadopago-saldo'
const leerSaldoEnCache = unstable_cache(unaConsulta(leerSaldo), ['admin-mercadopago-saldo-v1'], {
  revalidate: REVALIDAR_SALDO_S,
  tags: ['admin-mercadopago', TAG_SALDO],
})

export async function saldoMercadoPago(): Promise<Resultado<SaldoMercadoPago>> {
  try {
    return { ok: true, datos: await leerSaldoEnCache() }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export type PedidoSaldo = 'pedido' | 'en-camino' | 'reciente' | 'reintentar'

// Botón «Actualizar saldo»: pide un reporte que cierre ahora, salvo que ya haya uno en camino o uno que cierre hace
// menos de RECIENTE_MS (así tocar el botón varias veces no pide varios). Después hay que renovar la caché del saldo.
export async function pedirSaldoNuevo(): Promise<Resultado<PedidoSaldo>> {
  try {
    const token = process.env.MELI_ACCESS_TOKEN
    if (!token) throw new Error('Falta MELI_ACCESS_TOKEN.')
    const ahora = Date.now()
    if (ahora - pedidoEn < RECIENTE_MS) return { ok: true, datos: 'en-camino' }
    await configuracion(token)
    const reportes = await listarReportes(token)
    if (reportes.some((r) => enCamino(r, ahora) && cierraHace(r, ahora) < RECIENTE_MS)) return { ok: true, datos: 'en-camino' }
    if (reportes.some((r) => listo(r) && cierraHace(r, ahora) < RECIENTE_MS)) return { ok: true, datos: 'reciente' }
    return { ok: true, datos: (await crearReporte(token, ahora)) ? 'pedido' : 'reintentar' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
