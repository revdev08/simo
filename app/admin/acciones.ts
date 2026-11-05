'use server'

import { auth } from '@clerk/nextjs/server'
import { refresh, updateTag } from 'next/cache'
import { esAdmin } from '@/lib/admin/acceso'
import { panelMercadoPago } from '@/lib/admin/panelMercadoPago'
import { pedirSaldoNuevo, TAG_SALDO, type PedidoSaldo } from '@/lib/admin/saldoMercadoPago'

export type MensajeSaldo = { texto: string; espera: boolean } | null

const MENSAJES: Record<PedidoSaldo, NonNullable<MensajeSaldo>> = {
  pedido: { texto: 'Mercado Pago está preparando el reporte; tarda unos minutos.', espera: true },
  'en-camino': { texto: 'Ya hay un reporte en camino; el saldo cambia cuando esté listo.', espera: true },
  reciente: { texto: 'El saldo ya es de hace menos de 10 minutos.', espera: false },
  reintentar: { texto: 'Mercado Pago no pudo preparar el reporte; intenta de nuevo en unos minutos.', espera: false },
}

// Botón «Actualizar saldo»: pide a Mercado Pago un reporte que cierre ahora (si no hay uno en camino o de hace menos
// de 10 minutos) y vuelve a leer el saldo. Se puede llamar con un POST directo: comprueba el acceso.
export async function actualizarSaldo(): Promise<MensajeSaldo> {
  const { userId } = await auth()
  if (!userId || !(await esAdmin())) return null
  const r = await pedirSaldoNuevo()
  updateTag(TAG_SALDO)
  refresh()
  return r.ok ? MENSAJES[r.datos] : { texto: `No se pudo pedir el reporte: ${r.error}`, espera: false }
}

// Mientras Mercado Pago prepara el reporte, la tarjeta vuelve a leer el saldo cada minuto (no pide reportes nuevos)
export async function revisarSaldo() {
  const { userId } = await auth()
  if (!userId || !(await esAdmin())) return
  updateTag(TAG_SALDO)
  refresh()
}

// Fuerza una consulta nueva a Mercado Pago (los datos del panel salen de una caché que se renueva cada pocos minutos).
// Para no pasar su límite de peticiones, no repite si los datos tienen menos de un minuto.
// Se puede llamar con un POST directo: comprueba el acceso.
export async function actualizarMercadoPago() {
  const { userId } = await auth()
  if (!userId || !(await esAdmin())) return
  const actual = await panelMercadoPago()
  if (actual.ok && Date.now() - Date.parse(actual.datos.generado) < 60_000) return
  updateTag('admin-mercadopago')
  refresh()
}
