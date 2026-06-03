'use client'

import { CheckCircle2, Mail, ArrowLeft, Loader2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

type Status = 'loading' | 'success' | 'error' | 'manual'

function UnsubscribeContent() {
  const params = useSearchParams()
  const emailParam = params.get('email')
  const [status, setStatus] = useState<Status>(emailParam ? 'loading' : 'manual')
  const [manualEmail, setManualEmail] = useState('')

  useEffect(() => {
    if (!emailParam) return

    fetch(`/api/unsubscribe?email=${encodeURIComponent(emailParam)}`)
      .then((r) => r.json())
      .then((data) => setStatus(data.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [emailParam])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualEmail) return
    setStatus('loading')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: manualEmail }),
      })
      const data = await res.json()
      setStatus(data.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const displayEmail = emailParam ?? manualEmail

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-16">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-md w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin" />
              <p className="text-slate-600 dark:text-slate-300">Procesando tu solicitud…</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Listo, te desuscribiste
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                No volverás a recibir correos de la secuencia de bienvenida en{' '}
                <strong className="text-slate-700 dark:text-slate-200">{displayEmail}</strong>.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Si te suscribiste por error o cambiaste de opinión, vuelve a registrarte en simotest.com.
              </p>
              <Link
                href="/"
                className="inline-block mt-2 text-sm font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Volver al inicio →
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <XCircle className="w-9 h-9 text-rose-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                No pudimos procesar tu solicitud
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Algo salió mal de nuestro lado. Por favor inténtalo de nuevo en unos minutos, o escríbenos a{' '}
                <a href="mailto:hola@simotest.com" className="font-semibold text-blue-600 dark:text-blue-400">
                  hola@simotest.com
                </a>
                .
              </p>
              <button
                onClick={() => setStatus('manual')}
                className="text-sm font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 cursor-pointer"
              >
                Intentar manualmente →
              </button>
            </div>
          )}

          {status === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-blue-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Cancelar suscripción
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ingresa el correo del que ya no quieres recibir mensajes.
                </p>
              </div>

              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />

              <button
                type="submit"
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:opacity-95 transition-opacity cursor-pointer"
              >
                Desuscribirme
              </button>

              <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                Tu acción es inmediata. No requiere confirmación por correo.
              </p>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-slate-400 dark:text-slate-500">
          SIMO TEST · Conforme a la Ley 1581 de 2012 (Habeas Data Colombia)
        </p>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  )
}
