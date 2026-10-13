// Métricas del panel de administración: registros (Clerk) y suscripciones (Mercado Pago).
// Mercado Pago es la fuente de las suscripciones porque guarda la fecha real en que se creó cada una;
// la tabla subscriptions de Supabase guarda la fecha en que se pulsó el botón de pago.
// Los días se agrupan en hora de Colombia.
import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import { Invoice, MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'
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

const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e))

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

const configMP = () => {
  const token = process.env.MELI_ACCESS_TOKEN
  return token ? new MercadoPagoConfig({ accessToken: token }) : null
}

// Peticiones en paralelo por lotes para no pasar el límite de Mercado Pago
async function enLotes<T, R>(items: T[], fn: (item: T) => Promise<R>, tamano = 5): Promise<R[]> {
  const salida: R[] = []
  for (let i = 0; i < items.length; i += tamano) salida.push(...(await Promise.all(items.slice(i, i + tamano).map(fn))))
  return salida
}

// Todas las suscripciones de la cuenta de Mercado Pago
export async function suscripcionesMP(): Promise<Resultado<Suscripcion[]>> {
  const config = configMP()
  if (!config) return { ok: false, error: 'Falta MELI_ACCESS_TOKEN en las variables de entorno.' }
  try {
    const api = new PreApproval(config)
    const LIMITE = 50
    const pagina = (offset: number) => api.search({ options: { limit: LIMITE, offset } })
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

export type Cobro = { estado: string; detalle: string; pagoId: string | null; fecha: string }

// Intentos de cobro de cada suscripción (authorized_payments) con el resultado del pago: aprobado, rechazado, devuelto…
// Si la consulta de una suscripción falla, no aparece en el resultado.
export async function cobrosDeSuscripciones(ids: string[]): Promise<Record<string, Cobro[]>> {
  const config = configMP()
  if (!config || !ids.length) return {}
  const api = new Invoice(config)
  const resultado: Record<string, Cobro[]> = {}
  await enLotes([...new Set(ids)], async (id) => {
    try {
      const r = await api.search({ options: { preapproval_id: id, limit: 50 } })
      resultado[id] = (r.results ?? [])
        .filter((f) => f.payment?.id) // las cuotas programadas aún no tienen pago
        .map((f) => ({
          estado: f.payment?.status ?? 'desconocido',
          detalle: f.payment?.status_detail ?? '',
          pagoId: f.payment?.id ? String(f.payment.id) : null,
          fecha: f.last_modified ?? f.date_created ?? '',
        }))
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
    } catch {
      // sin datos de cobros para esta suscripción
    }
  }, 8)
  return resultado
}

// Suscriptor: al menos un pago aprobado, aunque después cancelara. No basta el estado «autorizada» ni el
// resumen de Mercado Pago (charged_quantity), que cuenta intentos rechazados. Sin sus pagos consultados, no cuenta.
export function pago(s: Suscripcion, cobros: Record<string, Cobro[]>) {
  return !!cobros[s.id]?.some((c) => c.estado === 'approved')
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
// el correo del pagador en Mercado Pago, sacado del último pago o de la suscripción.
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

  const config = configMP()
  const faltan = subs.filter((s) => !resultado[s.id].correo)
  if (config && faltan.length) {
    const pagos = new Payment(config)
    const suscripciones = new PreApproval(config)
    await enLotes(faltan, async (s) => {
      const pagoId = cobros[s.id]?.find((c) => c.pagoId)?.pagoId
      const correo =
        (pagoId ? (await pagos.get({ id: pagoId }).catch(() => null))?.payer?.email : null) ||
        (await suscripciones.get({ id: s.id }).catch(() => null))?.payer_email
      if (correo) resultado[s.id] = { ...resultado[s.id], correo, correoDeMercadoPago: true }
    })
  }
  return resultado
}

export type FilaDia = { dia: string; registros: number | null; nuevas: number | null; siguenActivas: number | null }

// Una fila por día; null cuando la fuente no respondió. `pagadas` ya viene filtrada con pago().
export function resumenPorDia(dias: string[], registros: number[] | null, pagadas: Suscripcion[] | null): FilaDia[] {
  const contar = (fechas: (string | number)[]) => {
    const c = new Map<string, number>()
    for (const f of fechas) c.set(diaColombia(f), (c.get(diaColombia(f)) ?? 0) + 1)
    return c
  }
  const porRegistro = registros ? contar(registros) : null
  const porNueva = pagadas ? contar(pagadas.map((s) => s.creada)) : null
  const porActiva = pagadas ? contar(pagadas.filter((s) => s.estado === 'authorized').map((s) => s.creada)) : null
  return dias.map((dia) => ({
    dia,
    registros: porRegistro ? (porRegistro.get(dia) ?? 0) : null,
    nuevas: porNueva ? (porNueva.get(dia) ?? 0) : null,
    siguenActivas: porActiva ? (porActiva.get(dia) ?? 0) : null,
  }))
}
