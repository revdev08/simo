import Link from 'next/link'
import { ArrowRight, BookOpenCheck, ChevronRight, ExternalLink, GraduationCap, Scale, Users } from 'lucide-react'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import JsonLd from '@/components/seo/JsonLd'
import { getModuleCounts } from '@/lib/questions'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'
import { AREAS_DOCENTES, FAQ_DOCENTE, REFERENTES_COMUNES, SLUG_CONVOCATORIA_DOCENTE, VACANTES_POR_AREA, mayuscula } from '@/lib/concurso-docente'
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from '@/lib/seo'
import { COMPONENTES_PRUEBA, MODULOS_COMUNES } from './componentes'

export const metadata = pageMetadata({
  title: 'Concurso docente 2026: vacantes, prueba y cómo prepararte',
  description:
    'Concurso docente 2026 de la CNSC: más de 28.000 vacantes por área, qué evalúa la prueba, puntaje mínimo, pesos, temario por cargo y simulacro con preguntas de práctica.',
  path: '/concurso-docente',
  imagenPropia: true,
})

const formato = new Intl.NumberFormat('es-CO')

export default function ConcursoDocentePage() {
  const c = CONVOCATORIAS.find((x) => x.slug === SLUG_CONVOCATORIA_DOCENTE)!
  const counts = getModuleCounts()
  const comunes = MODULOS_COMUNES.filter((m) => (counts[m.modulo] ?? 0) > 0)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Concurso docente', path: '/concurso-docente' },
          ]),
          faqJsonLd(FAQ_DOCENTE),
        ]}
      />
      <PublicHeader current="docentes" />

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <nav aria-label="Ruta" className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4" aria-hidden />
            <span className="text-slate-700 dark:text-slate-300">Concurso docente</span>
          </nav>

          <header className="mt-6">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">CNSC · Docentes y directivos docentes</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Concurso docente 2026: vacantes, prueba y cómo prepararte
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-3xl">
              Es el concurso con más vacantes del país. Aquí tienes lo que se sabe del proceso, cómo es la prueba escrita y qué estudiar según
              el cargo al que te vas a presentar, con preguntas de práctica para cada área.
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Users className="w-3.5 h-3.5" aria-hidden /> Vacantes
                </dt>
                <dd className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">Más de 28.000</dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">28.001 en los 90 proyectos de acuerdo de la CNSC.</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">Puntaje mínimo</dt>
                <dd className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">60 / 70</dd>
                <dd className="mt-1 text-xs text-slate-500 dark:text-slate-400">Docentes / directivos, en la prueba eliminatoria.</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <dt className="text-xs font-semibold text-slate-500 dark:text-slate-400">En qué va</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{c.estado}</dd>
              </div>
            </dl>
          </header>

          <section className="mt-12" aria-labelledby="prueba">
            <h2 id="prueba" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Cómo es la prueba
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              La prueba de aptitudes y competencias básicas pesa el 55 % y es eliminatoria. Se presenta en una sola sesión, junto con la
              psicotécnica, y tiene cuatro componentes:
            </p>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {COMPONENTES_PRUEBA.map((comp, i) => (
                <li key={comp.nombre} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {i + 1}. {comp.nombre}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{comp.detalle}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-sm">
                <caption className="sr-only">Pruebas del concurso docente y su peso</caption>
                <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Prueba</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Peso</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Carácter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {c.pruebas?.map((p) => (
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

          <section className="mt-12" aria-labelledby="areas">
            <h2 id="areas" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Qué estudiar según tu cargo
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              La parte disciplinar cambia según el área a la que te inscribas. Elige la tuya para ver el temario, los documentos del MEN y un
              ejemplo de pregunta.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AREAS_DOCENTES.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/concurso-docente/${a.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {mayuscula(a.nombre)}
                    </span>
                    <span className="mt-1 text-sm text-slate-600 dark:text-slate-400">{formato.format(a.vacantes)} vacantes</span>
                    {(counts[a.modulo] ?? 0) > 0 && (
                      <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{counts[a.modulo]} preguntas del área para practicar</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="vacantes">
            <h2 id="vacantes" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Vacantes por área
            </h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-sm">
                <caption className="sr-only">Vacantes del concurso docente 2026 por cargo o área</caption>
                <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Cargo o área</th>
                    <th scope="col" className="px-4 py-3 font-semibold text-right">Vacantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {VACANTES_POR_AREA.map((v) => (
                    <tr key={v.area}>
                      <td className="px-4 py-2.5 text-slate-900 dark:text-white">
                        {v.slug ? (
                          <Link href={`/concurso-docente/${v.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {v.area}
                          </Link>
                        ) : (
                          v.area
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 dark:text-slate-300">{formato.format(v.vacantes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Suma de los proyectos de acuerdo publicados el 19 de agosto de 2026. Pueden cambiar en los acuerdos en firme.
            </p>
          </section>

          <section className="mt-12" aria-labelledby="comun">
            <h2 id="comun" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <BookOpenCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Lo que estudian todos los cargos
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {comunes.map((m) => (
                <li key={m.modulo} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <p className="font-bold text-slate-900 dark:text-white">{m.titulo}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{m.detalle}</p>
                  <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400">{counts[m.modulo]} preguntas para practicar</p>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-bold text-slate-900 dark:text-white">Normas que conviene leer</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              {REFERENTES_COMUNES.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
                    {r.label} <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 rounded-3xl bg-blue-600 p-6 sm:p-8 text-white">
            <h2 className="text-xl sm:text-2xl font-extrabold">Prepárate con un plan y un simulacro de tu cargo</h2>
            <p className="mt-2 text-blue-100 max-w-2xl">
              Elige tu cargo y te armamos un plan semana a semana con los pesos de la prueba. El simulacro reparte las preguntas igual, con
              cronómetro y resultado por componente.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/mi-convocatoria/${SLUG_CONVOCATORIA_DOCENTE}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                Ver mi plan de estudio <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/simulacro-gratis"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
              >
                Hacer un simulacro gratis
              </Link>
            </div>
          </section>

          <section className="mt-12" aria-labelledby="faq">
            <h2 id="faq" className="text-xl font-bold text-slate-900 dark:text-white">
              Preguntas frecuentes sobre el concurso docente
            </h2>
            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {FAQ_DOCENTE.map((f) => (
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

          <section className="mt-12" aria-labelledby="fuentes">
            <h2 id="fuentes" className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Fuentes oficiales
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.fuentes.map((f) => (
                <li key={f.url}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline">
                    {f.label} <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              SIMO Test es una plataforma de preparación independiente: no somos la CNSC ni el Ministerio de Educación. Confirma siempre las
              fechas y los requisitos en SIMO y en el sitio de la CNSC.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
