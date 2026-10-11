'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChartColumn, LayoutDashboard } from 'lucide-react'

const LINKS = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/report', label: 'Mi progreso', icon: ChartColumn },
]

// Navegación principal del panel
export default function NavLinks() {
  const pathname = usePathname()
  return (
    <nav aria-label="Secciones del panel" className="flex items-center gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              active
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/70'
            }`}
          >
            <Icon className="hidden sm:block w-4 h-4" aria-hidden />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
