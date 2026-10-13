// Métricas del panel de administración: registros (Clerk) y suscripciones (Mercado Pago).
// Mercado Pago es la fuente de las suscripciones porque guarda la fecha real en que se creó cada una;
// la tabla subscriptions de Supabase guarda la fecha en que se pulsó el botón de pago.
// Los días se agrupan en hora de Colombia.
import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
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
  cobros: number
  monto: number | null
  userId: string | null
}

// Cuenta como suscriptor quien autorizó el cobro o pagó al menos una vez (aunque después cancelara)
export const pago = (s: Suscripcion) => s.estado === 'authorized' || s.cobros > 0

// Todas las suscripciones de la cuenta de Mercado Pago
export async function suscripcionesMP(): Promise<Resultado<Suscripcion[]>> {
  const token = process.env.MELI_ACCESS_TOKEN
  if (!token) return { ok: false, error: 'Falta MELI_ACCESS_TOKEN en las variables de entorno.' }
  try {
    const api = new PreApproval(new MercadoPagoConfig({ accessToken: token }))
    const LIMITE = 50
    const pagina = (offset: number) => api.search({ options: { limit: LIMITE, offset } })
    const primera = await pagina(0)
    const paginas = [primera]
    const total = Math.min(primera.paging?.total ?? 0, 10_000)
    const offsets = Array.from({ length: Math.max(0, Math.ceil(total / LIMITE) - 1) }, (_, i) => (i + 1) * LIMITE)
    // De a 5 páginas en paralelo para no pasar el límite de peticiones
    for (let i = 0; i < offsets.length; i += 5) paginas.push(...(await Promise.all(offsets.slice(i, i + 5).map(pagina))))

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
      })
    }
    return { ok: true, datos: lista }
  } catch (e) {
    return { ok: false, error: mensaje(e) }
  }
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

export type CorreoSuscriptor = { correo: string; deMercadoPago: boolean }

// Correo de cada suscripción (por id de Mercado Pago). Primero el de su cuenta en SIMO: el checkout por plan
// no conserva el external_reference, así que el dueño sale de la tabla subscriptions (mp_preapproval_id → user_id).
// Si no se encuentra, el correo con el que pagó en Mercado Pago, que puede ser otro.
export async function correosDeSuscripciones(subs: Suscripcion[]): Promise<Record<string, CorreoSuscriptor>> {
  const duenos = new Map<string, string>()
  for (const s of subs) if (s.userId?.startsWith('user_')) duenos.set(s.id, s.userId)

  const sinDueno = subs.filter((s) => !duenos.has(s.id)).map((s) => s.id)
  if (sinDueno.length) {
    try {
      const { data } = await createAdminClient().from('subscriptions').select('user_id, mp_preapproval_id').in('mp_preapproval_id', sinDueno)
      for (const r of data ?? []) if (r.user_id && r.mp_preapproval_id) duenos.set(r.mp_preapproval_id, r.user_id)
    } catch {
      // Sin Supabase se sigue con el correo de Mercado Pago
    }
  }

  const resultado: Record<string, CorreoSuscriptor> = {}
  const correos = await correosClerk([...duenos.values()])
  for (const [subId, userId] of duenos) if (correos[userId]) resultado[subId] = { correo: correos[userId], deMercadoPago: false }

  const token = process.env.MELI_ACCESS_TOKEN
  const faltan = subs.filter((s) => !resultado[s.id])
  if (token && faltan.length) {
    const api = new PreApproval(new MercadoPagoConfig({ accessToken: token }))
    const detalles = await Promise.all(faltan.map((s) => api.get({ id: s.id }).catch(() => null)))
    detalles.forEach((d, i) => {
      if (d?.payer_email) resultado[faltan[i].id] = { correo: d.payer_email, deMercadoPago: true }
    })
  }
  return resultado
}

export type FilaDia ={ dia: string; registros: number | null; nuevas: number | null; siguenActivas: number | null }

// Una fila por día; null cuando la fuente no respondió
export function resumenPorDia(dias: string[], registros: number[] | null, suscripciones: Suscripcion[] | null): FilaDia[] {
  const contar = (fechas: (string | number)[]) => {
    const c = new Map<string, number>()
    for (const f of fechas) c.set(diaColombia(f), (c.get(diaColombia(f)) ?? 0) + 1)
    return c
  }
  const porRegistro = registros ? contar(registros) : null
  const pagadas = suscripciones?.filter(pago) ?? null
  const porNueva = pagadas ? contar(pagadas.map((s) => s.creada)) : null
  const porActiva = pagadas ? contar(pagadas.filter((s) => s.estado === 'authorized').map((s) => s.creada)) : null
  return dias.map((dia) => ({
    dia,
    registros: porRegistro ? (porRegistro.get(dia) ?? 0) : null,
    nuevas: porNueva ? (porNueva.get(dia) ?? 0) : null,
    siguenActivas: porActiva ? (porActiva.get(dia) ?? 0) : null,
  }))
}
