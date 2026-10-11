import Link from 'next/link'
import { ArrowRight, Building2, ClipboardList, Users } from 'lucide-react'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import EjesTool from '@/components/convocatorias/EjesTool'
import { getModuleCounts } from '@/lib/questions'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Mi convocatoria: plan de estudio para tu concurso CNSC',
  description:
    'Elige tu convocatoria (DIAN, docentes, hospitales ESE, Bogotá, CAR, Nación, territoriales y Procuraduría) o pega los ejes temáticos de tu empleo y recibe un plan de estudio semana a semana.',
  path: '/mi-convocatoria',
})

const formato = new Intl.NumberFormat('es-CO')

export default function MiConvocatoriaPage() {
  const disponibles = getModuleCounts()
  // Preguntas que hay para cada convocatoria: la suma de los módulos de todos sus perfiles, sin repetir
  const preguntasDe = (slug: string) => {
    const c = CONVOCATORIAS.find((x) => x.slug === slug)
    const modulos = new Set(c?.perfiles.flatMap((p) => p.modulos.map((m) => m.modulo)))
    return [...modulos].reduce((s, m) => s + (disponibles[m] ?? 0), 0)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <PublicHeader current="convocatorias" />

      <main className="flex-grow">
        <section className="relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[420px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:pt-20 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              <ClipboardList className="w-3.5 h-3.5" aria-hidden /> Mi convocatoria
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Estudia solo lo que te van a evaluar
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Elige tu proceso de selección o pega los ejes temáticos de tu empleo. Te decimos qué módulos estudiar, en qué orden y cuántas preguntas tienes para practicar cada uno.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14" aria-labelledby="procesos">
          <h2 id="procesos" className="text-2xl font-bold text-slate-900 dark:text-white">Convocatorias grandes</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Con plan de estudio armado según las pruebas de cada proceso.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONVOCATORIAS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/mi-convocatoria/${c.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5" aria-hidden /> {c.entidad}
                  </span>
                  <span className="mt-2 text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {c.nombre}
                  </span>
                  <span className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{c.resumen}</span>
                  <span className="mt-4 flex flex-wrap gap-2 text-xs">
                    {c.vacantes && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Users className="w-3 h-3" aria-hidden /> {c.vacantesAprox ? '+' : ''}
                        {formato.format(c.vacantes)} vacantes
                      </span>
                    )}
                    <span className="rounded-lg bg-blue-50 dark:bg-blue-950/50 px-2 py-1 font-semibold text-blue-700 dark:text-blue-300">
                      {formato.format(preguntasDe(c.slug))} preguntas
                    </span>
                  </span>
                  <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                    Ver plan <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40" aria-labelledby="ejes-titulo">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 id="ejes-titulo" className="text-2xl font-bold text-slate-900 dark:text-white">¿Tu convocatoria no está en la lista?</h2>
            <p className="mt-1 mb-6 text-slate-600 dark:text-slate-400">
              Pega los ejes temáticos de tu empleo y armamos el plan con los módulos que coinciden.
            </p>
            <EjesTool disponibles={disponibles} />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
