'use client'

// Encabezado de las páginas públicas (mismo diseño que la guía y el simulacro gratis)
import { useClerk, useUser } from '@clerk/nextjs'
import { LayoutDashboard, LogOut } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import MobileMenu from '@/components/MobileMenu'

type Actual = 'convocatorias' | 'other'

// Sin "Inicio": el logo ya lleva a la portada
const LINKS: { href: string; label: string; key?: Actual }[] = [
  { href: '/#planes', label: 'Planes' },
  { href: '/simulacro-gratis', label: 'Simulacro' },
  { href: '/mi-convocatoria', label: 'Mi convocatoria', key: 'convocatorias' },
  { href: '/guia', label: 'Guía' },
]

export default function PublicHeader({ current = 'other' }: { current?: Actual }) {
  const { openSignUp, signOut } = useClerk()
  const { isSignedIn, user } = useUser()

  return (
    <header className="sticky top-0 z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Image src="/logo.png" alt="SIMO TEST" width={40} height={40} priority className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200">
              SIMO TEST
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-300">
            {LINKS.map((l) =>
              l.key && l.key === current ? (
                <Link key={l.href} href={l.href} aria-current="page" className="text-blue-600 dark:text-blue-400 font-bold">
                  {l.label}
                </Link>
              ) : (
                <Link key={l.href} href={l.href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {l.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-5">
            <ThemeToggle />
            {!isSignedIn ? (
              <>
                <button
                  onClick={() => openSignUp({ forceRedirectUrl: '/dashboard' })}
                  className="hidden sm:inline-flex text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer btn-shimmer whitespace-nowrap"
                >
                  Registrarse Gratis
                </button>
                <MobileMenu current={current} />
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden lg:inline-block bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-4 h-4 hidden sm:block" /> Panel
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden sm:inline-flex text-slate-400 hover:text-red-500 p-2 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 items-center"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <MobileMenu current={current} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
