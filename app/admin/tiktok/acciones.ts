'use server'

import { auth } from '@clerk/nextjs/server'
import { refresh } from 'next/cache'
import { esAdmin } from '@/lib/admin/acceso'
import { borrarPublicacion, guardarPublicacion, resolverEnlace } from '@/lib/admin/tiktok'

export type EstadoRegistro = { ok: boolean; mensaje: string; enlace: string; vez: number } | null

const fechaHora = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/Bogota' })

// Las acciones se pueden llamar con un POST directo: cada una comprueba el acceso
async function usuarioDelEquipo() {
  const { userId } = await auth()
  return userId && (await esAdmin()) ? userId : null
}

export async function registrarPublicacion(_anterior: EstadoRegistro, formData: FormData): Promise<EstadoRegistro> {
  const enlace = String(formData.get('enlace') ?? '').trim()
  const vez = Date.now()
  const fallo = (mensaje: string) => ({ ok: false, mensaje, enlace, vez })

  const userId = await usuarioDelEquipo()
  if (!userId) return fallo('No tienes acceso a esta sección.')
  if (!enlace) return fallo('Pega el enlace del video.')

  const video = await resolverEnlace(enlace)
  if ('error' in video) return fallo(video.error)
  const publicado = video.publicadoEn.getTime()
  if (!(publicado > Date.UTC(2016, 0, 1)) || publicado > vez + 10 * 60_000) return fallo('Ese enlace no parece de un video real de TikTok.')

  const guardado = await guardarPublicacion(userId, video)
  if (!guardado.ok) return fallo(guardado.error)

  refresh()
  return { ok: true, mensaje: `Listo: video de @${video.autor} publicado el ${fechaHora.format(video.publicadoEn)}.`, enlace: '', vez }
}

export async function quitarPublicacion(formData: FormData) {
  const userId = await usuarioDelEquipo()
  const id = Number(formData.get('id'))
  if (!userId || !Number.isInteger(id)) return
  await borrarPublicacion(userId, id)
  refresh()
}
