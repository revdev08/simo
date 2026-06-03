'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Page = 'home' | 'guia' | 'simulacro' | 'other'

interface MobileMenuProps {
  current?: Page
}

export default function MobileMenu({ current = 'other' }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { openSignIn, openSignUp, signOut } = useClerk()
  const { isSignedIn, user } = useUser()

  // Necesario para createPortal (SSR no tiene document)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Bloquea scroll del body cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Cierra con ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  const handleSignIn = () => {
    close()
    openSignIn({ forceRedirectUrl: '/dashboard' })
  }
  const handleSignUp = () => {
    close()
    openSignUp({ forceRedirectUrl: '/dashboard' })
  }
  const handleSignOut = () => {
    close()
    signOut()
  }

  const navItems: { href: string; label: string; icon: React.ReactNode; key: Page | 'planes'; badge?: string }[] = [
    { href: '/', label: 'Inicio', icon: <Home className="w-5 h-5" />, key: 'home' },
    { href: '/#planes', label: 'Planes', icon: <CreditCard className="w-5 h-5" />, key: 'planes' },
    { href: '/simulacro-gratis', label: 'Simulacro', icon: <Zap className="w-5 h-5" />, key: 'simulacro', badge: 'Free' },
    { href: '/guia', label: 'Guía CNSC', icon: <BookOpen className="w-5 h-5" />, key: 'guia' },
  ]

  return (
    <>
      {/* Botón hamburguesa — solo visible en mobile */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Portal: renderizamos backdrop + panel directamente en <body>,
          fuera del header. Si quedaran dentro del header (que tiene
          backdrop-blur), el filtro crea un nuevo containing block y
          atrapa los elementos `position: fixed`. */}
      {mounted && open && createPortal(
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={close}
            className="fixed inset-0 z-[9990] md:hidden bg-slate-950/80 cursor-default animate-in fade-in duration-200"
          />

          <aside
            className="fixed top-0 right-0 bottom-0 z-[9999] md:hidden w-[88%] max-w-sm bg-white dark:bg-slate-950 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 ease-out"
          >
          <div className="flex flex-col min-h-full">
            {/* Header del panel */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <Link href="/" onClick={close} className="flex items-center gap-2.5">
                <img src="/logo.png" alt="SIMO TEST" className="w-9 h-9 object-contain" />
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200">
                  SIMO TEST
                </span>
              </Link>
              <button
                onClick={close}
                aria-label="Cerrar menú"
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Saludo si está autenticado */}
            {isSignedIn && user?.primaryEmailAddress?.emailAddress && (
              <div className="px-5 pt-5 bg-white dark:bg-slate-950">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user.primaryEmailAddress.emailAddress[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      Tu cuenta
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {user.primaryEmailAddress.emailAddress}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navegación */}
            <nav className="flex-1 px-5 py-6 space-y-2 bg-white dark:bg-slate-950">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 px-2">
                Navegación
              </div>

              {navItems.map((item) => {
                const isActive = item.key === current && current !== 'other'

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-bold text-[15px]">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isActive
                          ? 'text-blue-500 translate-x-0.5'
                          : 'text-slate-300 dark:text-slate-700 group-hover:translate-x-1 group-hover:text-blue-500'
                      }`}
                    />
                  </Link>
                )
              })}

              {/* Si está signed-in, link al dashboard */}
              {isSignedIn && (
                <Link
                  href="/dashboard"
                  onClick={close}
                  className="group flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-bold text-[15px]">Mi panel</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:translate-x-1 group-hover:text-blue-500 transition-transform" />
                </Link>
              )}
            </nav>

            {/* Footer del panel: CTA o sign-out */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2.5">
              {!isSignedIn ? (
                <>
                  <button
                    onClick={handleSignUp}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer btn-shimmer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Registrarse Gratis
                  </button>
                  <button
                    onClick={handleSignIn}
                    className="w-full text-center px-5 py-3 rounded-full text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-white dark:hover:bg-slate-950 transition-colors cursor-pointer"
                  >
                    Ya tengo cuenta · Iniciar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full text-rose-700 dark:text-rose-300 font-semibold text-sm bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              )}

              <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                © {new Date().getFullYear()} SIMO TEST
              </p>
            </div>
          </div>
          </aside>
        </>,
        document.body,
      )}
    </>
  )
}
