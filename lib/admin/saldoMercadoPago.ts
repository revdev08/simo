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
  consultado: string // cuándo se consultó Mercado Pago (ISO)
}

type Reporte = {
  id: number
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
  return !!r.file_name && !PENDIENTES.has(estado) && !/error|fail|delet/.test(estado)
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

async function leerSaldo(): Promise<SaldoMercadoPago> {
  const token = process.env.MELI_ACCESS_TOKEN
  if (!token) throw new Error('Falta MELI_ACCESS_TOKEN.')
  const ahora = Date.now()
  const config = await configuracion(token)

  const respuesta = (await (await pedir(token, '/list')).json()) as Reporte[] | { results?: Reporte[] }
  const reportes = Array.isArray(respuesta) ? respuesta : (respuesta.results ?? [])
  const terminados = reportes.filter((r) => listo(r) && r.end_date).sort((a, b) => Date.parse(b.end_date!) - Date.parse(a.end_date!))
  const ultimo = terminados[0] ?? null
  // Se decide por la fecha de cierre y no por el nombre del estado, que Mercado Pago no documenta del todo: si
  // cualquier reporte (terminado o en camino) cierra hace menos de HORAS_REPORTE horas, no se pide otro.
  // Uno que falló bloquea solo FALLIDO_MS, para reintentar sin pedir uno en cada renovación de la caché.
  // Si no trae fecha de cierre, cuenta la hora en que se pidió.
  const cierraHace = (r: Reporte) => ahora - Date.parse(r.end_date ?? r.generation_date ?? r.date_created ?? r.last_modified ?? '')
  const fallido = (r: Reporte) => /error|fail|reject|cancel/.test((r.status ?? '').toLowerCase())
  const hayReciente = reportes.some((r) => cierraHace(r) < (fallido(r) ? FALLIDO_MS : HORAS_REPORTE * HORA_MS))
  const enCamino = reportes.some((r) => !listo(r) && !fallido(r) && cierraHace(r) < HORAS_REPORTE * HORA_MS)

  let actualizando = enCamino
  let aviso: string | null = null
  if (!hayReciente) {
    try {
      // Cierra unos minutos antes de ahora para que Mercado Pago no lo tome como una fecha futura
      const cuerpo = { begin_date: fechaMP(ahora - DIAS_REPORTE * DIA_MS), end_date: fechaMP(ahora - 5 * 60_000) }
      const res = await pedir(token, '', { method: 'POST', body: JSON.stringify(cuerpo) })
      // 203: Mercado Pago no pudo crearlo y pide volver a intentarlo
      if (res.status === 203) aviso = 'Mercado Pago no pudo preparar un reporte más reciente; se vuelve a pedir en unos minutos.'
      else actualizando = true
    } catch (e) {
      if (!ultimo) throw e
      aviso = `No se pudo pedir un reporte más reciente: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  const vacio = { saldo: null, corte: null, desde: null, liberado: null, retirado: null, descuadre: null }
  if (!ultimo) return { ...vacio, actualizando, aviso, consultado: new Date(ahora).toISOString() }

  let archivo = ultimo.file_name
  if (!archivo) {
    const busqueda = (await (await pedir(token, `/search?id=${ultimo.id}`)).json()) as { results?: Reporte[] }
    archivo = busqueda.results?.[0]?.file_name
  }
  if (!archivo) throw new Error('Mercado Pago no dio el nombre del archivo del último reporte.')
  const csv = await (await pedir(token, `/${encodeURIComponent(archivo)}`)).text()

  return {
    ...calcular(csv, config),
    corte: ultimo.end_date ?? null,
    desde: ultimo.begin_date ?? null,
    actualizando,
    aviso,
    consultado: new Date(ahora).toISOString(),
  }
}

// Una sola consulta a la vez y, si falla, un minuto sin reintentar: varias recargas no multiplican las peticiones
const leerSaldoEnCache = unstable_cache(unaConsulta(leerSaldo), ['admin-mercadopago-saldo-v1'], {
  revalidate: REVALIDAR_SALDO_S,
  tags: ['admin-mercadopago'],
})

export async function saldoMercadoPago(): Promise<Resultado<SaldoMercadoPago>> {
  try {
    return { ok: true, datos: await leerSaldoEnCache() }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
