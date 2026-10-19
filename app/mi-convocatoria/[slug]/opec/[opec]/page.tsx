import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Banknote, BookOpenCheck, ChevronRight, ExternalLink, FileText, MapPin, Users } from 'lucide-react'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import ConvocatoriaPlan from '@/components/convocatorias/ConvocatoriaPlan'
import EjesTool from '@/components/convocatorias/EjesTool'
import JsonLd from '@/components/seo/JsonLd'
import TemasOpec from '@/components/convocatorias/TemasOpec'
import { coberturaDe } from '@/lib/opec-cobertura'
import { getModuleCounts } from '@/lib/questions'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'
import { actualizadoOpecs, fichaUrl, opecDe, opecsDe, slugsConOpecs } from '@/lib/opec'
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string; opec: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return slugsConOpecs().flatMap((slug) => opecsDe(slug).map((o) => ({ slug, opec: String(o.opec) })))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, opec } = await params
  const c = CONVOCATORIAS.find((x) => x.slug === slug)
  const o = opecDe(slug, Number(opec))
  if (!c || !o) return {}
  return pageMetadata({
    title: `OPEC ${o.opec}: ${o.denominacion} ${c.nombre}, qué estudiar`,
    description: `${o.denominacion} (código ${o.codigo}, grado ${o.grado}) de ${c.nombre}: ${o.totalVacantes} vacantes. Temas de su ficha del Manual de Funciones, funciones y plan de estudio para la prueba.`,
    path: `/mi-convocatoria/${slug}/opec/${o.opec}`,
  })
}

const formato = new Intl.NumberFormat('es-CO')
const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const fecha = (iso: string) => new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso))
const tarjeta = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4'

export default async function OpecPage({ params }: Props) {
  const { slug, opec } = await params
  const c = CONVOCATORIAS.find((x) => x.slug === slug)
  const o = opecDe(slug, Number(opec))
  if (!c || !o) notFound()
  const perfil = c.perfiles.find((p) => p.id === o.perfil) ?? c.perfiles[0]
  const disponibles = getModuleCounts()
  const actualizado = actualizadoOpecs(slug)
  const ruta = `/mi-convocatoria/${slug}/opec/${o.opec}`

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Mi convocatoria', path: '/mi-convocatoria' },
          { name: c.nombre, path: `/mi-convocatoria/${slug}` },
          { name: `OPEC ${o.opec}`, path: ruta },
        ])}
      />
      <PublicHeader current="convocatorias" />

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/mi-convocatoria" className="hover:text-blue-600 dark:hover:text-blue-400">Mi convocatoria</Link>
            <ChevronRight className="w-4 h-4" aria-hidden />
            <Link href={`/mi-convocatoria/${slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">{c.nombre}</Link>
            <ChevronRight className="w-4 h-4" aria-hidden />
            <span className="text-slate-700 dark:text-slate-300">OPEC {o.opec}</span>
          </nav>

          <header className="mt-6">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{c.nombre} · OPEC {o.opec}</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{o.denominacion}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Código {o.codigo}, grado {o.grado}
              {o.nivel ? ` · nivel ${o.nivel.toLowerCase()}` : ''}
              {o.ficha ? ` · ficha ${o.ficha}` : ''}
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className={tarjeta}>
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5" aria-hidden /> Vacantes
                </dt>
                <dd className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{formato.format(o.totalVacantes)}</dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  En {o.vacantes.length} {o.vacantes.length === 1 ? 'municipio' : 'municipios'}
                </dd>
              </div>
              <div className={tarjeta}>
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">Proceso</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{o.procesos.join(' · ') || '—'}</dd>
                {o.subprocesos.length > 0 && <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">{o.subprocesos.join(' · ')}</dd>}
              </div>
              {o.asignacion && (
                <div className={tarjeta}>
                  <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Banknote className="w-3.5 h-3.5" aria-hidden /> Asignación básica
                  </dt>
                  <dd className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{pesos.format(o.asignacion)}</dd>
                  {o.vigenciaSalarial && <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">Vigencia {o.vigenciaSalarial}, según SIMO</dd>}
                </div>
              )}
            </dl>
          </header>

          {(o.competenciasFuncionales.length > 0 || o.competenciasBasicas.length > 0) && (
            <section className="mt-12" aria-labelledby="temas">
              <h2 id="temas" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <BookOpenCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Qué te evalúan, según tu ficha
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                La guía de la CNSC dice que las competencias funcionales de cada empleo son las de su ficha del Manual de Funciones.
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <TemasOpec titulo="Propias de tu empleo" items={coberturaDe(slug, o.competenciasFuncionales)} destacado />
                <TemasOpec titulo="Básicas, comunes a casi todos los empleos" items={coberturaDe(slug, o.competenciasBasicas)} />
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                «Módulo» indica un módulo del banco que trata ese tema; «Aún no» quiere decir que todavía no tenemos preguntas de ese tema.
              </p>
            </section>
          )}

          <section className="mt-12" aria-labelledby="plan-titulo">
            <h2 id="plan-titulo" className="text-xl font-bold text-slate-900 dark:text-white">Tu plan de estudio</h2>
            <p className="mt-1 mb-6 text-sm text-slate-600 dark:text-slate-400">
              Tu empleo corresponde al perfil «{perfil.label}» de {c.nombre}. Si tienes los ejes temáticos que publicó el operador, ajústalo más abajo.
            </p>
            <ConvocatoriaPlan slug={slug} nombre={c.nombre} perfiles={[perfil]} disponibles={disponibles} />
          </section>

          {(o.proposito || o.funciones.length > 0) && (
            <section className="mt-12 space-y-3" aria-labelledby="empleo-titulo">
              <h2 id="empleo-titulo" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Tu empleo
              </h2>
              {o.proposito && <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold">Propósito: </span>{o.proposito}</p>}
              {o.funciones.length > 0 && (
                <details className={`${tarjeta} p-5`}>
                  <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">Funciones esenciales ({o.funciones.length})</summary>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                    {o.funciones.map((f) => <li key={f}>{f}</li>)}
                  </ol>
                </details>
              )}
              <details className={`${tarjeta} p-5`}>
                <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">Vacantes por municipio</summary>
                <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                  {o.vacantes.map((v) => (
                    <li key={`${v.municipio}-${v.departamento}`} className="flex justify-between gap-3">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden />{v.municipio}{v.departamento && v.departamento !== v.municipio ? ` (${v.departamento})` : ''}</span>
                      <span className="tabular-nums text-slate-500 dark:text-slate-400">{v.cantidad}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          )}

          <section id="ejes" className="mt-12 scroll-mt-24" aria-labelledby="ejes-titulo">
            <h2 id="ejes-titulo" className="text-xl font-bold text-slate-900 dark:text-white">¿Ya tienes los ejes temáticos de tu prueba?</h2>
            <p className="mt-1 mb-6 text-slate-600 dark:text-slate-400">
              El operador los publica con tu número de inscripción. Pégalos aquí y ajustamos el plan con ellos.
            </p>
            <EjesTool disponibles={disponibles} convocatoria={slug} />
          </section>

          <section className="mt-12 text-xs text-slate-500 dark:text-slate-400">
            <p>
              Datos de la oferta pública de SIMO (CNSC){actualizado ? ` consultados el ${fecha(actualizado)}` : ''}.{' '}
              {o.documento && (
                <a href={fichaUrl(o.documento)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                  Ver la ficha oficial en SIMO <ExternalLink className="w-3 h-3" aria-hidden />
                </a>
              )}
            </p>
            <p className="mt-1">Confirma siempre los datos de tu empleo en SIMO.</p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
