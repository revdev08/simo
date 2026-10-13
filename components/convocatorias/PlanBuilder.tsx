'use client'

// Plan de estudio semanal: el aspirante elige cuántas semanas y horas tiene, y el plan reparte los módulos.
import { ArrowRight, CalendarDays, Clock, Flag, LayoutDashboard, Printer, Repeat, Target } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { armarPlan, type ModuloPlan } from '@/lib/convocatorias/plan'

export const HORAS_PLAN = [3, 5, 8, 10, 15, 20]

const practicarHref = (modulo: string) => `/dashboard?modulo=${encodeURIComponent(modulo)}`

export default function PlanBuilder({
  modulos,
  disponibles,
  semanasIniciales = 8,
  panelHref,
}: {
  modulos: ModuloPlan[]
  disponibles: Record<string, number>
  semanasIniciales?: number
  // Enlace al panel con este mismo plan (semanas y horas), cuando el plan es de una convocatoria
  panelHref?: (semanas: number, horas: number) => string
}) {
  const [semanas, setSemanas] = useState(semanasIniciales)
  const [horas, setHoras] = useState(8)
  const plan = useMemo(() => armarPlan(modulos, semanas, horas, disponibles), [modulos, semanas, horas, disponibles])

  if (!modulos.length) return null

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 print:hidden">
        <label className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden />
            Semanas hasta la prueba: <span className="text-blue-600 dark:text-blue-400">{semanas}</span>
          </span>
          <input
            type="range"
            min={1}
            max={16}
            value={semanas}
            onChange={(e) => setSemanas(Number(e.target.value))}
            className="mt-3 w-full accent-blue-600"
            aria-label="Semanas hasta la prueba"
          />
          <span className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>1</span>
            <span>16</span>
          </span>
        </label>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <span id="horas-label" className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden />
            Horas de estudio por semana
          </span>
          <div role="radiogroup" aria-labelledby="horas-label" className="mt-3 flex flex-wrap gap-2">
            {HORAS_PLAN.map((h) => (
              <button
                key={h}
                type="button"
                role="radio"
                aria-checked={horas === h}
                onClick={() => setHoras(h)}
                className={`min-w-12 rounded-xl border px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${
                  horas === h
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                }`}
              >
                {h} h
              </button>
            ))}
          </div>
        </div>
      </div>

      {panelHref && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-4 print:hidden">
          <LayoutDashboard className="hidden sm:block w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
          <p className="flex-1 text-sm text-slate-700 dark:text-slate-300">
            En tu panel este plan te dice qué toca cada semana, cuánto llevas de cada tema y cómo vas frente al mínimo de la prueba.
          </p>
          <Link
            href={panelHref(semanas, horas)}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
          >
            Llevar este plan a mi panel <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      )}

      <ol className="grid gap-4 md:grid-cols-2">
        {plan.map((s) => (
          <li
            key={s.numero}
            className={`rounded-2xl border p-5 break-inside-avoid ${
              s.tipo === 'repaso'
                ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-bold text-slate-900 dark:text-white">
                {s.hasta ? `Semanas ${s.numero} a ${s.hasta}` : `Semana ${s.numero}`}
              </h4>
              {s.simulacro && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                  <Flag className="w-3 h-3" aria-hidden />
                  {s.simulacro === 'final' ? 'Simulacros' : 'Simulacro de control'}
                </span>
              )}
            </div>
            {s.tipo === 'repaso' ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2">
                  <Target className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
                  {s.simulacro === 'final'
                    ? 'Dos simulacros completos con tiempo, en días distintos.'
                    : 'Ya habrás practicado todas las preguntas de tus módulos: haz un simulacro por semana.'}
                </li>
                <li className="flex gap-2">
                  <Repeat className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
                  Repasa solo lo que fallaste y vuelve a leer las explicaciones de esas normas.
                </li>
              </ul>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {s.items.map((it) => (
                  <li key={it.modulo} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0">
                      <Link
                        href={practicarHref(it.modulo)}
                        className="font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {it.modulo}
                      </Link>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {it.preguntas > 0 ? `≈ ${it.preguntas} preguntas nuevas` : 'Repasa las que fallaste'}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {it.horas} h
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {s.simulacro === 'control' && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Al terminar la semana, haz un simulacro corto para ver qué módulos necesitan más tiempo.
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Printer className="w-4 h-4" aria-hidden /> Imprimir o guardar en PDF
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Los nombres de los módulos abren la práctica en tu panel.
        </p>
      </div>
    </div>
  )
}
