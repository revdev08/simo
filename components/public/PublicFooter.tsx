// Pie de las páginas públicas (mismo diseño que la guía). Los enlaces ayudan a que los buscadores encuentren las páginas clave.
import Image from 'next/image'
import Link from 'next/link'

const ENLACES = [
  { href: '/concurso-docente', label: 'Concurso docente 2026' },
  { href: '/mi-convocatoria/dian-2676', label: 'Concurso DIAN 2676' },
  { href: '/mi-convocatoria', label: 'Convocatorias CNSC' },
  { href: '/simulacro-gratis', label: 'Simulacro CNSC gratis' },
  { href: '/guia', label: 'Guía para preparar tu concurso' },
  { href: '/politica-datos', label: 'Política de datos' },
]

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_90%,#1e293b_0%,transparent_100%)] opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-400 text-sm">
        <nav aria-label="Enlaces del sitio" className="mb-8">
          <ul className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="hover:text-white transition-colors">
                  {e.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-white text-base">SIMO TEST</span>
          </div>
          <p className="text-center md:text-right">
            © {new Date().getFullYear()} SIMO TEST. Preparación autónoma e independiente: no somos la CNSC ni representamos a ninguna entidad.
          </p>
        </div>
      </div>
    </footer>
  )
}
