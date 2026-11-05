'use client'

import { useActionState, useEffect, useTransition } from 'react'
import { RefreshCw } from 'lucide-react'
import { actualizarSaldo, revisarSaldo } from '@/app/admin/acciones'

const CADA_MS = 60_000
const MAX_REVISIONES = 10

// Botón «Actualizar saldo». Mientras Mercado Pago prepara el reporte (esperando), vuelve a leer el saldo cada minuto,
// como mucho MAX_REVISIONES veces, para que no haya que tocarlo de nuevo.
export default function ActualizarSaldo({ esperando }: { esperando: boolean }) {
  const [mensaje, accion, pidiendo] = useActionState(actualizarSaldo, null)
  const [revisando, iniciar] = useTransition()

  useEffect(() => {
    if (!esperando) return
    let veces = 0
    const id = setInterval(() => {
      veces++
      if (veces > MAX_REVISIONES) return clearInterval(id)
      iniciar(() => revisarSaldo())
    }, CADA_MS)
    return () => clearInterval(id)
  }, [esperando])

  // El aviso de «está preparando» sobra cuando el reporte ya llegó
  const aviso = mensaje && (!mensaje.espera || esperando) ? mensaje.texto : esperando ? 'Se revisa solo cada minuto mientras llega.' : null

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <form action={accion}>
        <button
          type="submit"
          disabled={pidiendo}
          title="Pide a Mercado Pago un reporte que cierre ahora (tarda unos minutos en estar listo)"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 ${pidiendo || revisando ? 'animate-spin' : ''}`} aria-hidden />
          {pidiendo ? 'Pidiendo…' : 'Actualizar saldo'}
        </button>
      </form>
      {aviso && (
        <p role="status" className="max-w-xs text-xs text-slate-500 sm:text-right dark:text-slate-400">
          {aviso}
        </p>
      )}
    </div>
  )
}
