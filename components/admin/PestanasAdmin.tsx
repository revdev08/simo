'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PESTANAS = [
  { href: '/admin', texto: 'Suscriptores' },
  { href: '/admin/tiktok', texto: 'TikTok' },
  { href: '/admin/ejes', texto: 'Ejes' },
  { href: '/admin/cancelaciones', texto: 'Cancelaciones' },
]

export default function PestanasAdmin() {
  const ruta = usePathname()
  return (
    <nav className="-mx-1 flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Secciones de administración">
      {PESTANAS.map((p) => {
        const activa = p.href === '/admin' ? ruta === '/admin' : ruta.startsWith(p.href)
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={activa ? 'page' : undefined}
            className={`shrink-0 whitespace-nowrap border-b-2 px-2.5 py-3 text-sm font-medium sm:px-3 ${activa ? 'border-blue-600 text-slate-900 dark:border-blue-400 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            {p.texto}
          </Link>
        )
      })}
    </nav>
  )
}
