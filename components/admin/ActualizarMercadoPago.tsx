'use client'

import { useFormStatus } from 'react-dom'
import { RefreshCw } from 'lucide-react'
import { actualizarMercadoPago } from '@/app/admin/acciones'

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      title="Consulta de nuevo a Mercado Pago sin esperar la renovación automática (como mucho una vez por minuto)"
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <RefreshCw className={`h-4 w-4 ${pending ? 'animate-spin' : ''}`} aria-hidden />
      {pending ? 'Actualizando…' : 'Actualizar ahora'}
    </button>
  )
}

// Botón para traer los datos de Mercado Pago al momento
export default function ActualizarMercadoPago() {
  return (
    <form action={actualizarMercadoPago}>
      <Boton />
    </form>
  )
}
