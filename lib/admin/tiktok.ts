// Control de las publicaciones de TikTok del equipo (/admin/tiktok): cada persona registra el enlace de sus videos
// y el panel mide cuántos publica al día frente a la meta. Las publicaciones se guardan en la tabla tiktok_posts
// (lib/tiktok-posts.sql).
import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase'
import { correosAdmin } from './acceso'
import { diaColombia, ultimosDias, type Resultado } from './metricas'

export const META_DIARIA = 6
// El cumplimiento se mide desde este día (cuando empezó el control); los videos anteriores se pueden registrar
// pero esos días no cuentan como incumplidos.
export const INICIO_CONTROL = '2026-10-13'

const DIA_MS = 86_400_000

export type VideoTiktok = { videoId: string; url: string; autor: string; publicadoEn: Date }

// Los ids de TikTok llevan la hora de publicación en sus 32 bits altos (segundos Unix)
export function fechaDelId(videoId: string): Date {
  return new Date(Number(BigInt(videoId) >> BigInt(32)) * 1000)
}

const ENLACE_COMPLETO = /^\/@([\w.-]+)\/(video|photo)\/(\d{15,21})(\/|$)/
const esDe = (u: URL, dominio: string) => u.hostname === dominio || u.hostname.endsWith(`.${dominio}`)
// Dominios con los que TikTok comparte enlaces; los cortos redirigen al enlace completo en tiktok.com
const DOMINIOS_TIKTOK = ['tiktok.com', 'tt.site']

function leerEnlaceCompleto(u: URL): VideoTiktok | null {
  const m = esDe(u, 'tiktok.com') ? u.pathname.match(ENLACE_COMPLETO) : null
  if (!m) return null
  const [, autor, tipo, videoId] = m
  return { videoId, autor, url: `https://www.tiktok.com/@${autor}/${tipo}/${videoId}`, publicadoEn: fechaDelId(videoId) }
}

// Acepta el enlace completo (tiktok.com/@usuario/video/…) o uno corto (www.tt.site/t/…, vm.tiktok.com,
// vt.tiktok.com, tiktok.com/t/…), que TikTok redirige al completo.
export async function resolverEnlace(texto: string): Promise<VideoTiktok | { error: string }> {
  let u: URL
  try {
    u = new URL(texto.trim())
  } catch {
    return { error: 'Eso no es un enlace. Pega el enlace del video de TikTok.' }
  }
  if (!DOMINIOS_TIKTOK.some((d) => esDe(u, d))) return { error: 'El enlace debe ser de TikTok.' }
  if (u.hostname === 'tt.site') u.hostname = 'www.tt.site' // sin www el dominio no responde
  const directo = leerEnlaceCompleto(u)
  if (directo) return directo
  try {
    // Se siguen hasta 3 redirecciones, solo dentro de los dominios de TikTok
    for (let i = 0; i < 3; i++) {
      const r = await fetch(u, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) })
      const destino = r.headers.get('location')
      if (!destino) break
      u = new URL(destino, u)
      if (!DOMINIOS_TIKTOK.some((d) => esDe(u, d))) break
      const video = leerEnlaceCompleto(u)
      if (video) return video
    }
  } catch {
    // se responde abajo
  }
  return { error: 'No pudimos abrir ese enlace. En TikTok toca Compartir → Copiar enlace y pégalo aquí.' }
}

export type Miembro = { id: string; nombre: string; correo: string; foto: string | null }

// El equipo son las personas de ADMIN_EMAILS que ya tienen cuenta en SIMO, en el orden de la variable
export async function miembrosEquipo(): Promise<Miembro[]> {
  const correos = correosAdmin()
  if (!correos.length) return []
  const clerk = await clerkClient()
  const { data } = await clerk.users.getUserList({ emailAddress: correos, limit: 100 })
  const miembros = data.map((u) => {
    const correo = u.emailAddresses.find((e) => correos.includes(e.emailAddress.toLowerCase()))?.emailAddress ?? u.primaryEmailAddress?.emailAddress ?? ''
    return { id: u.id, nombre: [u.firstName, u.lastName].filter(Boolean).join(' ') || correo.split('@')[0], correo, foto: u.imageUrl || null }
  })
  return miembros.sort((a, b) => correos.indexOf(a.correo.toLowerCase()) - correos.indexOf(b.correo.toLowerCase()))
}

export type Publicacion = {
  id: number
  userId: string
  videoId: string
  url: string
  autor: string | null
  publicadaEn: string
  registradaEn: string
  vistas: number | null
}

const SIN_TABLA = 'Falta crear la tabla de publicaciones: ejecuta lib/tiktok-posts.sql en el SQL Editor de Supabase.'
const esSinTabla = (e: { code?: string } | null) => e?.code === '42P01' || e?.code === 'PGRST205'

export async function listarPublicaciones(): Promise<Resultado<Publicacion[]>> {
  const { data, error } = await createAdminClient()
    .from('tiktok_posts')
    .select('id, user_id, video_id, url, author_handle, posted_at, created_at, views')
    .order('posted_at', { ascending: false })
    .limit(10_000)
  if (error) return { ok: false, error: esSinTabla(error) ? SIN_TABLA : error.message }
  return {
    ok: true,
    datos: (data ?? []).map((p) => ({
      id: p.id,
      userId: p.user_id,
      videoId: p.video_id,
      url: p.url,
      autor: p.author_handle,
      publicadaEn: p.posted_at,
      registradaEn: p.created_at,
      vistas: p.views,
    })),
  }
}

export async function guardarPublicacion(userId: string, video: VideoTiktok): Promise<Resultado<null>> {
  const { error } = await createAdminClient().from('tiktok_posts').insert({
    user_id: userId,
    video_id: video.videoId,
    url: video.url,
    author_handle: video.autor,
    posted_at: video.publicadoEn.toISOString(),
  })
  if (!error) return { ok: true, datos: null }
  if (error.code === '23505') return { ok: false, error: 'Ese video ya está registrado.' }
  return { ok: false, error: esSinTabla(error) ? SIN_TABLA : error.message }
}

// Cada persona solo puede quitar las suyas
export async function borrarPublicacion(userId: string, id: number) {
  await createAdminClient().from('tiktok_posts').delete().eq('id', id).eq('user_id', userId)
}

export type Periodo = 7 | 30 | 90 | 'todo'

export type ResumenMiembro = {
  miembro: Miembro
  hoy: number
  publicadas: number // publicados en el periodo, hoy incluido (también los de antes del inicio del control)
  diasEvaluados: number // días completos del periodo desde el inicio del control (hoy no cuenta hasta que termine)
  diasCumplidos: number
  racha: number // días seguidos con la meta cumplida, hasta hoy
  vistas: number | null // suma del periodo; null mientras no haya métricas de TikTok
  porDia: Record<string, number>
}

// Cumplimiento de cada persona en el periodo. Un video cuenta el día (hora de Colombia) en que se publicó.
// Con «todo», el periodo empieza el día del inicio del control.
export function resumenEquipo(miembros: Miembro[], publicaciones: Publicacion[], periodo: Periodo, ahora: number, inicio = INICIO_CONTROL) {
  const hoy = diaColombia(ahora)
  const diasDesdeInicio = Math.round((Date.parse(`${hoy}T12:00:00Z`) - Date.parse(`${inicio}T12:00:00Z`)) / DIA_MS)
  const largo = periodo === 'todo' ? Math.max(diasDesdeInicio, 0) : periodo
  const delPeriodo = ultimosDias(largo + 1, ahora) // los días del periodo y hoy
  const enPeriodo = new Set(delPeriodo)
  // Días completos (sin hoy) que se evalúan: los del periodo desde el inicio del control
  const evaluados = delPeriodo.slice(0, -1).filter((d) => d >= inicio)

  const resumen: ResumenMiembro[] = miembros.map((miembro) => {
    const porDia: Record<string, number> = {}
    let vistas: number | null = null
    let publicadas = 0
    for (const p of publicaciones) {
      if (p.userId !== miembro.id) continue
      const dia = diaColombia(p.publicadaEn)
      porDia[dia] = (porDia[dia] ?? 0) + 1
      if (!enPeriodo.has(dia)) continue
      publicadas++
      if (p.vistas !== null) vistas = (vistas ?? 0) + p.vistas
    }
    const cumple = (d: string) => (porDia[d] ?? 0) >= META_DIARIA
    let racha = cumple(hoy) ? 1 : 0
    for (const d of ultimosDias(diasDesdeInicio + 1, ahora).slice(0, -1).reverse()) {
      if (!cumple(d)) break
      racha++
    }
    return {
      miembro,
      hoy: porDia[hoy] ?? 0,
      publicadas,
      diasEvaluados: evaluados.length,
      diasCumplidos: evaluados.filter(cumple).length,
      racha,
      vistas,
      porDia,
    }
  })
  return { hoy, resumen }
}
