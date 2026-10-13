'use client'

import { useActionState } from 'react'
import { registrarPublicacion, type EstadoRegistro } from '@/app/admin/tiktok/acciones'

// Registro del enlace de un video. Si falla, el enlace queda escrito para corregirlo.
export default function FormularioPublicacion() {
  const [estado, accion, enviando] = useActionState<EstadoRegistro, FormData>(registrarPublicacion, null)

  return (
    <form action={accion} className="space-y-2">
      <label htmlFor="enlace" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Enlace del video
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          key={estado?.vez ?? 0}
          id="enlace"
          name="enlace"
          type="url"
          required
          defaultValue={estado?.enlace ?? ''}
          placeholder="https://www.tiktok.com/@usuario/video/…"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {enviando ? 'Registrando…' : 'Registrar'}
        </button>
      </div>
      {estado && (
        <p role="status" className={`text-sm ${estado.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
          {estado.mensaje}
        </p>
      )}
    </form>
  )
}
