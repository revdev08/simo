'use server'

import { auth } from '@clerk/nextjs/server'
import { refresh, updateTag } from 'next/cache'
import { esAdmin } from '@/lib/admin/acceso'
import { panelMercadoPago } from '@/lib/admin/panelMercadoPago'

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
