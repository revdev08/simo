'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, ChartColumn, RotateCcw, TriangleAlert } from 'lucide-react'
import { MODULE_SECTIONS, sectionOf, type ReportQuestion, type SectionId } from '@/lib/question-types'
import { moduleIcon, SECTION_STYLE } from './module-meta'
import { ProgressBar } from './ui'

interface ReportViewProps {
  questions: ReportQuestion[]
  progress: Record<string, 'correct' | 'incorrect'>
}

// Por debajo de este número de respuestas un porcentaje dice poco
const MIN_RESPUESTAS = 3

const barTone = (pct: number) => (pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500')
const pctText = (pct: number) =>
  pct >= 70 ? 'text-emerald-700 dark:text-emerald-400' : pct >= 50 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'

interface Tally {
  correct: number
  incorrect: number
  answered: number
  total: number
}

const emptyTally = (): Tally => ({ correct: 0, incorrect: 0, answered: 0, total: 0 })
const accuracy = (t: Tally) => (t.answered ? Math.round((t.correct / t.answered) * 100) : 0)

function Kpi({ label, value, hint, children }: { label: string; value: string | number; hint: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</span>
      {children}
    </div>
  )
}

export default function ReportView({ questions, progress }: ReportViewProps) {
  const stats = useMemo(() => {
    // Los ids pueden ser números (banco original) o texto (formato v2), así que se comparan como texto
    const byId = new Map(questions.map((q) => [String(q.id), q]))
    const total = emptyTally()
    const bySection = Object.fromEntries(MODULE_SECTIONS.map((s) => [s.id, emptyTally()])) as Record<SectionId, Tally>
    const byModule: Record<string, Tally> = {}
    const byTheme: Record<string, Tally & { modulo: string }> = {}

    // Totales de lo que hoy se puede practicar
    for (const q of questions) {
      if (!q.activa) continue
      total.total++
      bySection[sectionOf(q.modulo)].total++
      ;(byModule[q.modulo] ??= emptyTally()).total++
    }

    for (const [id, status] of Object.entries(progress)) {
      const q = byId.get(id)
      if (!q) continue
      const ok = status === 'correct'
      const tallies = [
        total,
        bySection[sectionOf(q.modulo)],
        (byModule[q.modulo] ??= emptyTally()),
        (byTheme[`${q.modulo}::${q.tema}`] ??= { ...emptyTally(), modulo: q.modulo }),
      ]
      for (const t of tallies) {
        t.answered++
        if (ok) t.correct++
        else t.incorrect++
      }
    }

    const modules = Object.entries(byModule)
      .filter(([, t]) => t.answered > 0)
      .map(([modulo, t]) => ({ modulo, ...t, pct: accuracy(t), seen: t.total ? Math.min(100, Math.round((t.answered / t.total) * 100)) : 100 }))
      // Primero los que tienen datos suficientes, del más débil al más fuerte
      .sort((a, b) => Number(b.answered >= MIN_RESPUESTAS) - Number(a.answered >= MIN_RESPUESTAS) || a.pct - b.pct || b.answered - a.answered)

    const weakThemes = Object.entries(byTheme)
      .map(([key, t]) => ({ tema: key.split('::')[1], ...t, pct: accuracy(t) }))
      .filter((t) => t.answered >= MIN_RESPUESTAS && t.incorrect > 0 && t.pct < 70)
      .sort((a, b) => a.pct - b.pct || b.answered - a.answered)
      .slice(0, 6)

    return { total, bySection, modules, weakThemes }
  }, [questions, progress])

  const { total } = stats

  if (total.answered === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center">
          <ChartColumn className="w-7 h-7" aria-hidden />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Todavía no hay datos</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Responde preguntas en un módulo o haz un simulacro. Aquí verás en qué vas bien y qué te conviene reforzar.
        </p>
        <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-3">
          Ir a estudiar <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    )
  }

  const globalPct = accuracy(total)
  const seenPct = total.total ? Math.min(100, Math.round((total.answered / total.total) * 100)) : 0

  return (
    <div className="space-y-8">
      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Aciertos" value={`${globalPct}%`} hint={`${total.correct} de ${total.answered} respuestas`}>
          <ProgressBar value={globalPct} barClass={barTone(globalPct)} className="mt-3" label="Porcentaje de aciertos" />
        </Kpi>
        <Kpi label="Avance" value={`${seenPct}%`} hint={`${total.answered} de ${total.total} preguntas vistas`}>
          <ProgressBar value={seenPct} className="mt-3" label="Preguntas vistas" />
        </Kpi>
        <Kpi label="Correctas" value={total.correct} hint="según tu última respuesta" />
        <Kpi label="Por repasar" value={total.incorrect} hint="preguntas falladas">
          {total.incorrect > 0 && (
            <Link
              href="/dashboard?practicar=errores"
              className="mt-2 self-start inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Repasar
            </Link>
          )}
        </Kpi>
      </div>

      {/* Por tipo de competencia */}
      <section aria-labelledby="secciones-title" className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8">
        <h2 id="secciones-title" className="text-lg font-bold text-slate-900 dark:text-white">
          Por tipo de competencia
        </h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {MODULE_SECTIONS.map((s) => {
            const t = stats.bySection[s.id]
            if (!t.total) return null
            const pct = accuracy(t)
            const enough = t.answered >= MIN_RESPUESTAS
            return (
              <div key={s.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{s.titulo}</span>
                  {enough ? (
                    <span className={`text-sm font-bold tabular-nums ${pctText(pct)}`}>{pct}%</span>
                  ) : (
                    <span className="text-xs text-slate-400">{t.answered ? 'pocas respuestas' : 'sin empezar'}</span>
                  )}
                </div>
                <ProgressBar value={enough ? pct : 0} barClass={barTone(pct)} className="mt-2 h-2" label={`Aciertos en ${s.titulo}`} />
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  {t.answered} de {t.total} preguntas vistas
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Módulos */}
        <section aria-labelledby="modulos-title" className="min-w-0 lg:col-span-3 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8">
          <h2 id="modulos-title" className="text-lg font-bold text-slate-900 dark:text-white">
            Por módulo
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Del más débil al más fuerte. Con menos de {MIN_RESPUESTAS} respuestas el porcentaje aún no es confiable.
          </p>
          <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {stats.modules.map((m) => {
              const Icon = moduleIcon(m.modulo)
              const enough = m.answered >= MIN_RESPUESTAS
              return (
                <li key={m.modulo} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3 sm:gap-4">
                  <span className={`hidden sm:flex shrink-0 w-10 h-10 rounded-xl items-center justify-center ${SECTION_STYLE[sectionOf(m.modulo)].tile}`}>
                    <Icon className="w-5 h-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 dark:text-slate-200" title={m.modulo}>
                        {m.modulo}
                      </span>
                      {enough ? (
                        <span className={`shrink-0 text-sm font-bold tabular-nums ${pctText(m.pct)}`}>{m.pct}%</span>
                      ) : (
                        <span className="shrink-0 text-xs text-slate-400">pocas respuestas</span>
                      )}
                    </div>
                    <ProgressBar value={enough ? m.pct : 0} barClass={barTone(m.pct)} className="mt-2 h-2" label={`Aciertos en ${m.modulo}`} />
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {m.correct} correctas · {m.incorrect} falladas · {m.seen}% visto
                    </p>
                  </div>
                  <Link
                    href={`/dashboard?modulo=${encodeURIComponent(m.modulo)}`}
                    className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
                    aria-label={`Practicar ${m.modulo}`}
                  >
                    Practicar
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        {/* Temas para reforzar */}
        <section aria-labelledby="temas-title" className="min-w-0 lg:col-span-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8">
          <h2 id="temas-title" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <TriangleAlert className="w-5 h-5 text-amber-500" aria-hidden /> Temas para reforzar
          </h2>
          {stats.weakThemes.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {stats.weakThemes.map((t) => (
                <li key={`${t.modulo}-${t.tema}`} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-snug">{t.tema}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{t.modulo}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-bold tabular-nums ${pctText(t.pct)}`}>{t.pct}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {t.incorrect} de {t.answered} falladas
                    </span>
                    <Link href={`/dashboard?modulo=${encodeURIComponent(t.modulo)}`} className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">
                      Practicar módulo
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Aún no hay un tema con al menos {MIN_RESPUESTAS} respuestas y menos del 70% de aciertos. Sigue practicando para descubrir dónde reforzar.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
