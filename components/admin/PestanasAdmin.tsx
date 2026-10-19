'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PESTANAS = [
  { href: '/admin', texto: 'Suscriptores' },
  { href: '/admin/tiktok', texto: 'TikTok' },
  { href: '/admin/ejes', texto: 'Ejes' },
]

export default function PestanasAdmin() {
  const ruta = usePathname()
  return (
    <nav className="flex gap-1" aria-label="Secciones de administración">
      {PESTANAS.map((p) => {
        const activa = p.href === '/admin' ? ruta === '/admin' : ruta.startsWith(p.href)
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={activa ? 'page' : undefined}
            className={`border-b-2 px-3 py-3 text-sm font-medium ${activa ? 'border-blue-600 text-slate-900 dark:border-blue-400 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
          >
            {p.texto}
          </Link>
        )
      })}
    </nav>
  )
}
