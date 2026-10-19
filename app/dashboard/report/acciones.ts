'use server'

import { auth } from '@clerk/nextjs/server'
import { refresh } from 'next/cache'
import { esMotivoCancelacion, MAX_COMENTARIO_CANCELACION } from '@/lib/cancelacion'
import { cancelarRenovacion, registrarMotivo } from '@/lib/suscripcion'

export type ResultadoCancelacion = { ok: true; accesoHasta: string | null } | { ok: false; error: string } | null

// Cancela la renovación de la suscripción del usuario que la pide (nunca la de otro: el id sale de su sesión)
export async function cancelarSuscripcion(_previo: ResultadoCancelacion, formData: FormData): Promise<ResultadoCancelacion> {
  const { userId } = await auth()
  if (!userId) return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión para cancelar.' }

  const motivo = formData.get('motivo')
  const comentario = String(formData.get('comentario') ?? '').trim().slice(0, MAX_COMENTARIO_CANCELACION)
  const resultado = await cancelarRenovacion(userId)
  if (!resultado.ok) return resultado

  await registrarMotivo(userId, esMotivoCancelacion(motivo) ? motivo : null, comentario, resultado.accesoHasta)
  refresh()
  return resultado
}
