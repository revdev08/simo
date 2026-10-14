// Métricas del panel de administración: registros (Clerk) y suscripciones (Mercado Pago).
// Mercado Pago es la fuente de las suscripciones porque guarda la fecha real en que se creó cada una;
// la tabla subscriptions de Supabase guarda la fecha en que se pulsó el botón de pago.
// Los días se agrupan en hora de Colombia.
import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase'

const DIA_MS = 86_400_000
const formatoDia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })

// "AAAA-MM-DD" del día en Colombia
export function diaColombia(fecha: Date | string | number): string {
  return formatoDia.format(new Date(fecha))
}

// Los últimos `n` días, del más antiguo a hoy (Colombia no tiene horario de verano)
export function ultimosDias(n: number, ahora: number): string[] {
  return Array.from({ length: n }, (_, i) => diaColombia(ahora - (n - 1 - i) * DIA_MS))
}

export type Resultado<T> = { ok: true; datos: T } | { ok: false; error: string }

// El SDK de Mercado Pago lanza el cuerpo de la respuesta (un objeto con message y status), no un Error
function mensaje(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object' && 'message' in e) {
    const { message, status } = e as { message?: unknown; status?: unknown }
    return status ? `${String(message)} (${String(status)})` : String(message)
  }
  return String(e)
}

// Fechas de registro desde `desde` y el total de usuarios
export async function registrosClerk(desde: number): Promise<Resultado<{ fechas: number[]; total: number }>> {
  try {
    const clerk = await clerkClient()
    const fechas: number[] = []
    for (let offset = 0; offset < 50_000; offset += 500) {
      const { data } = await clerk.users.getUserList({ createdAtAfter: desde, orderBy: '-created_at', limit: 500, offset })
      fechas.push(...data.map((u) => u.createdAt))
      if (data.length < 500) break
    }
    const total = await clerk.users.getCount()
    return { ok: true, datos: { fechas, total } }
  } catch (e) {
    return { ok: false, error: mensaje(e) }
  }
}

export type Suscripcion = {
  id: string
  creada: string // ISO
  estado: string // authorized, paused, cancelled, pending
  cobros: number // según el resumen de Mercado Pago, que puede contar intentos rechazados
  monto: number | null
  userId: string | null
  pagadorId: number | null // cuenta de Mercado Pago que se suscribió
}

type PaymentSearchResult = NonNullable<Awaited<ReturnType<Payment['search']>>['results']>[number]

const configMP = () => {
  const token = process.env.MELI_ACCESS_TOKEN
  return token ? new MercadoPagoConfig({ accessToken: token }) : null
}

// Peticiones en paralelo por lotes para no pasar el límite de Mercado Pago
async function enLotes<T, R>(items: T[], fn: (item: T) => Promise<R>, tamano = 3): Promise<R[]> {
  const salida: R[] = []
  for (let i = 0; i < items.length; i += tamano) salida.push(...(await Promise.all(items.slice(i, i + tamano).map(fn))))
  return salida
}

// Mercado Pago responde 429 al pasar el límite de peticiones (el SDK solo reintenta los 5xx): se espera y se reintenta una vez
async function conReintento<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    const { status, message } = (e && typeof e === 'object' ? e : {}) as { status?: unknown; message?: unknown }
    if (Number(status) !== 429 && !/too many|rate limit/i.test(String(message ?? ''))) throw e
    await new Promise((r) => setTimeout(r, 2000))
    return fn()
  }
}

// Todas las suscripciones de la cuenta de Mercado Pago
export async function suscripcionesMP(): Promise<Resultado<Suscripcion[]>> {
  const config = configMP()
  if (!config) return { ok: false, error: 'Falta MELI_ACCESS_TOKEN en las variables de entorno.' }
  try {
    const api = new PreApproval(config)
    const LIMITE = 50
    const pagina = (offset: number) => conReintento(() => api.search({ options: { limit: LIMITE, offset } }))
    const primera = await pagina(0)
    const total = Math.min(primera.paging?.total ?? 0, 10_000)
    const offsets = Array.from({ length: Math.max(0, Math.ceil(total / LIMITE) - 1) }, (_, i) => (i + 1) * LIMITE)
    const paginas = [primera, ...(await enLotes(offsets, pagina))]

    const lista: Suscripcion[] = []
    for (const r of paginas.flatMap((p) => p.results ?? [])) {
      // El tipo del SDK dice number, pero la API devuelve la fecha como texto ISO
      const creada = r.date_created ? new Date(r.date_created as unknown as string) : null
      if (!r.id || !creada || Number.isNaN(creada.getTime())) continue
      lista.push({
        id: String(r.id),
        creada: creada.toISOString(),
        estado: r.status ?? 'desconocido',
        cobros: r.summarized?.charged_quantity ?? 0,
        monto: r.auto_recurring?.transaction_amount ?? null,
        userId: r.external_reference ? String(r.external_reference) : null,
        pagadorId: r.payer_id ?? null,
      })
    }
    return { ok: true, datos: lista }
  } catch (e) {
    return { ok: false, error: mensaje(e) }
  }
}

export type Cobro = {
  estado: string // approved, rejected, refunded…
  detalle: string
  pagoId: string
  fecha: string // creación del pago
  aprobadoEn: string | null
  pagadorId: string | null // cuenta de Mercado Pago que pagó
  correo: string | null // del pagador en Mercado Pago
  aproximado: boolean // asociado por pagador y hora, porque el pago no traía el id de la suscripción
}

// Lo que el SDK no tipa del resultado de la búsqueda de pagos
type PagoBuscado = PaymentSearchResult & {
  point_of_interaction?: { transaction_data?: { subscription_id?: string } }
  payer?: { id?: string | number; email?: string }
}

// Pagos de los últimos `dias` días, asociados a su suscripción por el id que trae el pago. Si no lo trae, al de
// la misma cuenta de Mercado Pago creado más cerca de la hora del pago (el primer cobro se hace al suscribirse).
// Cada suscripción de la lista queda con sus pagos (vacío si no tiene ninguno en el periodo).
export async function pagosDeSuscripciones(subs: Suscripcion[], dias: number): Promise<Resultado<Record<string, Cobro[]>>> {
  const config = configMP()
  if (!config) return { ok: false, error: 'Falta MELI_ACCESS_TOKEN en las variables de entorno.' }
  try {
    const api = new Payment(config)
    const LIMITE = 100
    const pagina = (offset: number) =>
      // En orden ascendente los pagos que llegan durante la consulta quedan al final y no corren las páginas
      conReintento(() =>
        api.search({ options: { sort: 'date_created', criteria: 'asc', range: 'date_created', begin_date: `NOW-${dias}DAYS`, end_date: 'NOW', limit: LIMITE, offset } }),
      )
    const primera = await pagina(0)
    const total = Math.min(primera.paging?.total ?? 0, 5000)
    const offsets = Array.from({ length: Math.max(0, Math.ceil(total / LIMITE) - 1) }, (_, i) => (i + 1) * LIMITE)
    const pagos = [primera, ...(await enLotes(offsets, pagina))].flatMap((p) => (p.results ?? []) as PagoBuscado[])

    const porId = new Map(subs.map((s) => [s.id, s]))
    const resultado: Record<string, Cobro[]> = Object.fromEntries(subs.map((s) => [s.id, []]))
    const vistos = new Set<string>()
    for (const p of pagos) {
      if (!p.id || vistos.has(String(p.id))) continue
      vistos.add(String(p.id))
      const idSuscripcion = p.point_of_interaction?.transaction_data?.subscription_id ?? p.metadata?.preapproval_id
      let sub = idSuscripcion ? porId.get(String(idSuscripcion)) : undefined
      let aproximado = false
      if (!idSuscripcion && p.operation_type === 'recurring_payment' && p.payer?.id) {
        const hora = Date.parse(p.date_created ?? '')
        const delPagador = subs.filter((s) => {
          const desfase = hora - Date.parse(s.creada)
          return String(s.pagadorId) === String(p.payer?.id) && desfase >= -5 * 60_000 && desfase <= 2 * 3_600_000
        })
        sub = delPagador.sort((a, b) => Math.abs(hora - Date.parse(a.creada)) - Math.abs(hora - Date.parse(b.creada)))[0]
        aproximado = !!sub
      }
      if (!sub) continue
      resultado[sub.id].push({
        estado: p.status ?? 'desconocido',
        detalle: p.status_detail ?? '',
        pagoId: String(p.id),
        fecha: p.date_created ?? '',
        aprobadoEn: p.date_approved ?? null,
        pagadorId: p.payer?.id ? String(p.payer.id) : null,
        correo: p.payer?.email || null,
        aproximado,
      })
    }
    for (const lista of Object.values(resultado)) lista.sort((a, b) => b.fecha.localeCompare(a.fecha))
    return { ok: true, datos: resultado }
  } catch (e) {
    return { ok: false, error: mensaje(e) }
  }
}

export type PagoAprobado = { subId: string; dia: string; tipo: 'nuevo' | 'recurrente' }

// Cada pago aprobado, del más antiguo al más reciente, con el día (Colombia) en que se aprobó:
// - nuevo: el primer pago de una persona (por su cuenta de Mercado Pago) que no había pagado antes;
// - recurrente: renovaciones mensuales y personas que ya habían pagado y vuelven a suscribirse.
// Los intentos rechazados no aparecen. `desde` es el inicio de los pagos consultados: las suscripciones creadas
// antes ya habían pagado, así que sus pagos y los de esas personas son recurrentes.
export function clasificarPagos(subs: Suscripcion[], cobros: Record<string, Cobro[]>, desde: number): PagoAprobado[] {
  const porId = new Map(subs.map((s) => [s.id, s]))
  const persona = (sub: Suscripcion, c: Cobro) => c.pagadorId ?? (sub.pagadorId ? String(sub.pagadorId) : `suscripcion:${sub.id}`)
  const aprobados = Object.entries(cobros)
    .flatMap(([subId, lista]) => lista.filter((c) => c.estado === 'approved').map((c) => ({ sub: porId.get(subId)!, c, hora: Date.parse(c.aprobadoEn ?? c.fecha) })))
    .filter((x) => x.sub && !Number.isNaN(x.hora))
    .sort((a, b) => a.hora - b.hora)

  const yaPagaron = new Set(aprobados.filter((x) => Date.parse(x.sub.creada) < desde).map((x) => persona(x.sub, x.c)))
  const conPago = new Set<string>()
  return aprobados.map(({ sub, c, hora }) => {
    const quien = persona(sub, c)
    const nuevo = !conPago.has(sub.id) && Date.parse(sub.creada) >= desde && !yaPagaron.has(quien)
    conPago.add(sub.id)
    yaPagaron.add(quien)
    return { subId: sub.id, dia: diaColombia(hora), tipo: nuevo ? 'nuevo' : 'recurrente' }
  })
}

// Correo de cada usuario de Clerk
async function correosClerk(ids: string[]): Promise<Record<string, string>> {
  const validos = [...new Set(ids.filter((id) => id.startsWith('user_')))].slice(0, 100)
  if (!validos.length) return {}
  try {
    const clerk = await clerkClient()
    const { data } = await clerk.users.getUserList({ userId: validos, limit: 100 })
    return Object.fromEntries(data.map((u) => [u.id, u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? '']))
  } catch {
    return {}
  }
}

export type DatosSuscriptor = {
  correo: string | null
  correoDeMercadoPago: boolean // el correo con el que pagó, no el de su cuenta en SIMO
  enlazada: boolean // la suscripción está asociada a un usuario de SIMO
  pagador: string | null // letra compartida por las suscripciones de una misma cuenta de Mercado Pago
}

// Quién es cada suscriptor. Primero su cuenta en SIMO: el checkout por plan no conserva el external_reference,
// así que el dueño sale de la tabla subscriptions (mp_preapproval_id → user_id). Si no está enlazada,
// el correo del pagador en Mercado Pago, sacado de sus pagos o de la suscripción.
export async function datosSuscriptores(subs: Suscripcion[], cobros: Record<string, Cobro[]>): Promise<Record<string, DatosSuscriptor>> {
  const duenos = new Map<string, string>()
  for (const s of subs) if (s.userId?.startsWith('user_')) duenos.set(s.id, s.userId)

  const sinDueno = subs.filter((s) => !duenos.has(s.id)).map((s) => s.id)
  if (sinDueno.length) {
    try {
      const { data } = await createAdminClient().from('subscriptions').select('user_id, mp_preapproval_id').in('mp_preapproval_id', sinDueno)
      for (const r of data ?? []) if (r.user_id && r.mp_preapproval_id) duenos.set(r.mp_preapproval_id, r.user_id)
    } catch {
      // sin Supabase se sigue con el correo de Mercado Pago
    }
  }
  const correosSimo = await correosClerk([...duenos.values()])

  // Las cuentas de Mercado Pago con más de una suscripción en la lista llevan una letra
  const veces = new Map<number, number>()
  for (const s of subs) if (s.pagadorId) veces.set(s.pagadorId, (veces.get(s.pagadorId) ?? 0) + 1)
  const letras = new Map<number, string>()
  for (const s of subs) if (s.pagadorId && (veces.get(s.pagadorId) ?? 0) > 1 && !letras.has(s.pagadorId)) letras.set(s.pagadorId, String.fromCharCode(65 + letras.size))

  const resultado: Record<string, DatosSuscriptor> = {}
  for (const s of subs) {
    const dueno = duenos.get(s.id)
    resultado[s.id] = {
      correo: (dueno && correosSimo[dueno]) || null,
      correoDeMercadoPago: false,
      enlazada: !!dueno,
      pagador: s.pagadorId ? (letras.get(s.pagadorId) ?? null) : null,
    }
  }

  for (const s of subs) {
    const correo = cobros[s.id]?.find((c) => c.correo)?.correo
    if (!resultado[s.id].correo && correo) resultado[s.id] = { ...resultado[s.id], correo, correoDeMercadoPago: true }
  }
  const config = configMP()
  const faltan = subs.filter((s) => !resultado[s.id].correo)
  if (config && faltan.length) {
    const suscripciones = new PreApproval(config)
    await enLotes(faltan, async (s) => {
      const correo = (await conReintento(() => suscripciones.get({ id: s.id })).catch(() => null))?.payer_email
      if (correo) resultado[s.id] = { ...resultado[s.id], correo, correoDeMercadoPago: true }
    })
  }
  return resultado
}

// Pago aprobado ya resumido para el panel; activa: su suscripción tenía el cobro autorizado al consultar Mercado Pago
export type PagoDelPanel = { dia: string; tipo: PagoAprobado['tipo']; activa: boolean }

export type SuscripcionReciente = DatosSuscriptor & {
  fecha: string
  estado: string
  cobros: Cobro[] | null // pagos reales; null si no se pudieron consultar
  cobrosResumen: number
  monto: number | null
}

export type FilaDia = { dia: string; registros: number | null; nuevas: number | null; siguenActivas: number | null; recurrentes: number | null }

// Una fila por día; null cuando la fuente no respondió
export function resumenPorDia(dias: string[], registros: number[] | null, pagos: PagoDelPanel[] | null): FilaDia[] {
  const contar = (fechas: (string | number)[]) => {
    const c = new Map<string, number>()
    for (const f of fechas) c.set(diaColombia(f), (c.get(diaColombia(f)) ?? 0) + 1)
    return c
  }
  const porRegistro = registros ? contar(registros) : null
  const nuevos = pagos?.filter((p) => p.tipo === 'nuevo') ?? null
  const contarDias = (lista: PagoDelPanel[] | null) => {
    if (!lista) return null
    const c = new Map<string, number>()
    for (const p of lista) c.set(p.dia, (c.get(p.dia) ?? 0) + 1)
    return c
  }
  const porNuevo = contarDias(nuevos)
  const porActivo = contarDias(nuevos?.filter((p) => p.activa) ?? null)
  const porRecurrente = contarDias(pagos?.filter((p) => p.tipo === 'recurrente') ?? null)
  return dias.map((dia) => ({
    dia,
    registros: porRegistro ? (porRegistro.get(dia) ?? 0) : null,
    nuevas: porNuevo ? (porNuevo.get(dia) ?? 0) : null,
    siguenActivas: porActivo ? (porActivo.get(dia) ?? 0) : null,
    recurrentes: porRecurrente ? (porRecurrente.get(dia) ?? 0) : null,
  }))
}
