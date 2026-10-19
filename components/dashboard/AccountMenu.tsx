'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { CreditCard, LogOut } from 'lucide-react'

export type SubscriptionStatus = 'active' | 'pending'

// Botón con la inicial del usuario que abre su cuenta: suscripción y cerrar sesión
export default function AccountMenu({ email, name, subscription }: { email: string; name?: string | null; subscription: SubscriptionStatus }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { signOut } = useClerk()
  const initial = (name || email || '?').trim().charAt(0).toUpperCase()
  const pending = subscription === 'pending'

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tu cuenta"
        className="relative w-10 h-10 rounded-full bg-brand-700 text-white font-bold text-sm flex items-center justify-center hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 transition-colors"
      >
        {initial}
        <span
          aria-hidden
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 ${pending ? 'bg-amber-500' : 'bg-emerald-500'}`}
        />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 p-2 z-50 animate-enter">
          <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800">
            {name && <p className="font-semibold text-slate-900 dark:text-white truncate">{name}</p>}
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{email}</p>
            <p className={`mt-2 inline-flex items-center gap-1.5 text-xs font-semibold ${pending ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              <span className={`w-2 h-2 rounded-full ${pending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {pending ? 'Pago en proceso' : 'Suscripción activa'}
            </p>
          </div>
          <Link
            role="menuitem"
            href="/dashboard/report#suscripcion"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <CreditCard className="w-4 h-4 text-slate-400" aria-hidden /> Administrar suscripción
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => signOut({ redirectUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="w-4 h-4 text-slate-400" aria-hidden /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
