import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, ChevronRight, ExternalLink, Scale, ShieldCheck, Users } from 'lucide-react'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import ConvocatoriaPlan from '@/components/convocatorias/ConvocatoriaPlan'
import { getModuleCounts } from '@/lib/questions'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return CONVOCATORIAS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const c = CONVOCATORIAS.find((x) => x.slug === slug)
  if (!c) return {}
  return {
    title: c.titulo,
    description: c.resumen,
    alternates: { canonical: `https://www.simotest.com/mi-convocatoria/${c.slug}` },
  }
}

const formato = new Intl.NumberFormat('es-CO')
const fecha = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso))

export default async function ConvocatoriaPage({ params }: Props) {
  const { slug } = await params
  const c = CONVOCATORIAS.find((x) => x.slug === slug)
  if (!c) notFound()
  const disponibles = getModuleCounts()

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <PublicHeader current="convocatorias" />

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <nav aria-label="Ruta" className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/mi-convocatoria" className="hover:text-blue-600 dark:hover:text-blue-400">
              Mi convocatoria
            </Link>
            <ChevronRight className="w-4 h-4" aria-hidden />
            <span className="text-slate-700 dark:text-slate-300 truncate">{c.nombre}</span>
          </nav>

          <header className="mt-6">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{c.entidad}</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{c.nombre}</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-3xl">{c.resumen}</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              {c.vacantes && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" aria-hidden /> Vacantes
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                    {c.vacantesAprox ? 'Más de ' : ''}
                    {formato.format(c.vacantes)}
                  </dd>
                  {c.vacantesNota && <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.vacantesNota}</dd>}
                </div>
              )}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">Niveles</dt>
                <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{c.niveles}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">En qué va</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{c.estado}</dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">Revisado el {fecha(c.revisado)}</dd>
              </div>
            </dl>
          </header>

          {c.pruebas && c.pruebas.length > 0 && (
            <section className="mt-12" aria-labelledby="pruebas">
              <h2 id="pruebas" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Cómo te evalúan
              </h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Prueba</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Peso</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Carácter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {c.pruebas.map((p) => (
                      <tr key={p.nombre}>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.nombre}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{p.peso}%</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          {p.caracter}
                          {p.minimo ? ` (mínimo ${p.minimo})` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {c.pruebasNota && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{c.pruebasNota}</p>}
            </section>
          )}

          <section className="mt-12" aria-label="Plan de estudio">
            <ConvocatoriaPlan slug={c.slug} nombre={c.nombre} perfiles={c.perfiles} disponibles={disponibles} />
          </section>

          <section className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 p-5">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden /> Qué cubrimos
              </h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{c.cobertura}</p>
            </div>
            {c.faltantes && (
              <div className="rounded-3xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-5">
                <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden /> Qué no cubrimos todavía
                </h2>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{c.faltantes}</p>
              </div>
            )}
          </section>

          <section className="mt-12" aria-labelledby="fuentes">
            <h2 id="fuentes" className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Fuentes oficiales
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.fuentes.map((f) => (
                <li key={f.url}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {f.label} <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Los datos del proceso pueden cambiar: confirma siempre las fechas y los requisitos{' '}
              {c.fueraCnsc ? 'en el sitio de la entidad.' : 'en SIMO y en el sitio de la CNSC.'}
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
