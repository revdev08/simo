import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpenCheck, ChevronRight, ExternalLink, FileText, ListChecks, Scale, Users } from 'lucide-react'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import QuestionText from '@/components/study/QuestionText'
import JsonLd from '@/components/seo/JsonLd'
import { getModuleCounts, getModuleTopics, getPublicExamples } from '@/lib/questions'
import { AREAS_DOCENTES, REFERENTES_COMUNES, SLUG_CONVOCATORIA_DOCENTE, mayuscula } from '@/lib/concurso-docente'
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from '@/lib/seo'
import { COMPONENTES_PRUEBA } from '../componentes'

type Props = { params: Promise<{ area: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return AREAS_DOCENTES.map((a) => ({ area: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params
  const a = AREAS_DOCENTES.find((x) => x.slug === area)
  if (!a) return {}
  return pageMetadata({ title: a.seoTitle, description: a.seoDescription, path: `/concurso-docente/${a.slug}`, imagenPropia: true })
}

const formato = new Intl.NumberFormat('es-CO')

export default async function AreaDocentePage({ params }: Props) {
  const { area } = await params
  const a = AREAS_DOCENTES.find((x) => x.slug === area)
  if (!a) notFound()

  const counts = getModuleCounts()
  const preguntas = counts[a.modulo] ?? 0
  const temario = getModuleTopics(a.modulo)
  const [ejemplo] = getPublicExamples(a.modulo, 1)
  const esDirectivo = a.perfilId === 'directivo'
  const minimo = esDirectivo ? 70 : 60
  const otras = AREAS_DOCENTES.filter((x) => x.slug !== a.slug)

  const faqs = [
    {
      q: `¿Cuántas vacantes hay para ${a.cargo} en el concurso 2026?`,
      a: `Los proyectos de acuerdo de la CNSC suman ${formato.format(a.vacantes)} vacantes${a.vacantesDetalle ? ` (${a.vacantesDetalle.replace(/\.$/, '')})` : ''}. La cifra puede cambiar en los acuerdos en firme.`,
    },
    {
      q: `¿Qué evalúa la prueba para ${a.cargo}?`,
      a: `La prueba eliminatoria tiene cuatro componentes: lectura crítica, razonamiento cuantitativo, competencias blandas y el saber disciplinar y pedagógico del cargo. En ${a.nombre} este último incluye: ${a.disciplinar.map((d) => d.replace(/\.$/, '')).join('; ')}. Necesitas ${minimo} puntos sobre 100 para pasar.`,
    },
    {
      q: `¿Qué documentos debo estudiar para ${a.nombre}?`,
      a: `Los referentes del MEN del área (${a.referentes.map((r) => r.label).join('; ')}) y la normativa común a todos los cargos docentes: Ley 115 de 1994, Decreto Ley 1278 de 2002, Ley 1620 de 2013 y Resolución 3842 de 2022.`,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Concurso docente', path: '/concurso-docente' },
            { name: a.titulo, path: `/concurso-docente/${a.slug}` },
          ]),
          faqJsonLd(faqs),
        ]}
      />
      <PublicHeader current="docentes" />

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4" aria-hidden />
            <Link href="/concurso-docente" className="hover:text-blue-600 dark:hover:text-blue-400">
              Concurso docente
            </Link>
            <ChevronRight className="w-4 h-4" aria-hidden />
            <span className="text-slate-700 dark:text-slate-300">{mayuscula(a.nombre)}</span>
          </nav>

          <header className="mt-6">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">CNSC · Concurso docente 2026</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{a.titulo}</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-3xl">{a.intro}</p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5" aria-hidden /> Vacantes
                </dt>
                <dd className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{formato.format(a.vacantes)}</dd>
                {a.vacantesDetalle && <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">{a.vacantesDetalle}</dd>}
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">Puntaje mínimo</dt>
                <dd className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{minimo} / 100</dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">En la prueba eliminatoria, que pesa el 55 %.</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">Para practicar</dt>
                <dd className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{preguntas} preguntas</dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">Del área, con explicación de cada opción.</dd>
              </div>
            </dl>
          </header>

          <section className="mt-12" aria-labelledby="evalua">
            <h2 id="evalua" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Qué evalúa la prueba para {a.cargo}
            </h2>
            <ol className="mt-4 space-y-3">
              {COMPONENTES_PRUEBA.map((comp, i) => (
                <li key={comp.nombre} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {i + 1}. {comp.nombre}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{comp.detalle}</p>
                  {i === 3 && (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                      {a.disciplinar.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {temario.length > 0 && (
            <section className="mt-12" aria-labelledby="temario">
              <h2 id="temario" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Temario con preguntas de práctica
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Los temas del área que más aparecen en nuestro banco. Cada pregunta trae la explicación de por qué cada opción es correcta o no.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {temario.map((t) => (
                  <li
                    key={t.tema}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm"
                  >
                    <span className="text-slate-800 dark:text-slate-200">{t.tema}</span>
                    <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{t.preguntas}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {ejemplo && (
            <section className="mt-12" aria-labelledby="ejemplo">
              <h2 id="ejemplo" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Así son las preguntas
              </h2>
              <div className="mt-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
                <QuestionText text={ejemplo.pregunta} />
                <ul className="mt-4 space-y-2">
                  {ejemplo.opciones.map((o) => (
                    <li key={o} className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {o}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  La respuesta y la explicación de cada opción están en tu panel, junto con el resto de preguntas del área.
                </p>
              </div>
            </section>
          )}

          <section className="mt-12" aria-labelledby="documentos">
            <h2 id="documentos" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <BookOpenCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Documentos oficiales para estudiar
            </h2>
            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{mayuscula(a.nombre)}</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {a.referentes.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
                    {r.label} <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-sm font-bold text-slate-900 dark:text-white">Comunes a todos los cargos docentes</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {REFERENTES_COMUNES.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
                    {r.label} <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 rounded-3xl bg-blue-600 p-6 sm:p-8 text-white">
            <h2 className="text-xl sm:text-2xl font-extrabold">Estudia con un plan para {a.cargo}</h2>
            <p className="mt-2 text-blue-100 max-w-2xl">
              Tu panel te arma el plan semana a semana con los pesos de la prueba, te muestra cuánto llevas de cada tema y te da un simulacro
              con las preguntas repartidas como en el examen.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/dashboard?convocatoria=${SLUG_CONVOCATORIA_DOCENTE}&perfil=${a.perfilId}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                Empezar a practicar <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href={`/mi-convocatoria/${SLUG_CONVOCATORIA_DOCENTE}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
              >
                Ver el plan de estudio
              </Link>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="faq">
            <h2 id="faq" className="text-xl font-bold text-slate-900 dark:text-white">
              Preguntas frecuentes
            </h2>
            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {faqs.map((f) => (
                <details key={f.q} className="group p-4">
                  <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-3">
                    {f.q}
                    <ChevronRight className="w-4 h-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" aria-hidden />
                  </summary>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <nav className="mt-12" aria-labelledby="otras">
            <h2 id="otras" className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Otras áreas del concurso docente
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {otras.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/concurso-docente/${o.slug}`}
                    className="inline-block rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {mayuscula(o.nombre)}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              SIMO Test es una plataforma de preparación independiente: no somos la CNSC ni el Ministerio de Educación. Datos revisados el 11
              de octubre de 2026; confirma siempre en SIMO y en el sitio de la CNSC.
            </p>
          </nav>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
