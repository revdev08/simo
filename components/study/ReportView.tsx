'use client'

import React, { useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarClock, ChartColumn, Flame, RotateCcw, Timer, TriangleAlert } from 'lucide-react'
import { MODULE_SECTIONS, sectionOf, type ReportQuestion, type SectionId } from '@/lib/question-types'
import { moduleIcon, SECTION_STYLE } from './module-meta'
import { ProgressBar } from './ui'
import { buscarSeleccion, CONVOCATORIA_STORAGE_KEY, minimoEliminatoria } from './simulacro-convocatoria'
import { hoyISO, preguntasEstaSemana, rachaActual, separarProgreso, type ResumenSimulacro } from './meta-progreso'
import {
  avanceDelPlan,
  diasParaPrueba,
  ESTADO_LABEL,
  estimacionConfiable,
  MIN_RESPUESTAS_MODULO,
  type AvancePlan,
  type EstadoModulo,
  type ModuloAvance,
} from './plan-progreso'

interface ReportViewProps {
  questions: ReportQuestion[]
  progress: Record<string, unknown>
}

// Por debajo de este número de respuestas un porcentaje dice poco
const MIN_RESPUESTAS = 3

const barTone = (pct: number) => (pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500')
const pctText = (pct: number) =>
  pct >= 70 ? 'text-emerald-700 dark:text-emerald-400' : pct >= 50 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'

const ESTADO_TONO: Record<EstadoModulo, string> = {
  sin_empezar: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  en_curso: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  reforzar: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  dominado: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

interface Tally {
  correct: number
  incorrect: number
  answered: number
  total: number
}

const emptyTally = (): Tally => ({ correct: 0, incorrect: 0, answered: 0, total: 0 })
const accuracy = (t: Tally) => (t.answered ? Math.round((t.correct / t.answered) * 100) : 0)

// Preferencias del navegador (convocatoria y nivel) leídas sin desajustar el render del servidor
const suscribir = (cb: () => void) => {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}
function useLocal(clave: string): string | null {
  return useSyncExternalStore(
    suscribir,
    () => {
      try {
        return localStorage.getItem(clave)
      } catch {
        return null
      }
    },
    () => null,
  )
}

const practicar = (modulo: string) => `/dashboard?modulo=${encodeURIComponent(modulo)}`
const repasarErrores = (modulo?: string) => `/dashboard?practicar=errores${modulo ? `&modulo=${encodeURIComponent(modulo)}` : ''}`

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

function Tarjeta({ id, titulo, icono, children, className = '' }: { id: string; titulo: React.ReactNode; icono?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={`min-w-0 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 ${className}`}>
      <h2 id={id} className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        {icono}
        {titulo}
      </h2>
      {children}
    </section>
  )
}

// Acierto ponderado frente al mínimo de la eliminatoria, en una barra con la marca del mínimo
function Medidor({ valor, minimo }: { valor: number; minimo: number | null }) {
  return (
    <div className="relative mt-3">
      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${minimo && valor < minimo ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${valor}%` }} />
      </div>
      {minimo ? (
        <div className="absolute -top-1 h-5 w-0.5 bg-slate-900 dark:bg-white" style={{ left: `${minimo}%` }} aria-hidden>
          <span className="absolute top-6 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-slate-600 dark:text-slate-300">Mínimo {minimo}</span>
        </div>
      ) : null}
    </div>
  )
}

function PlanPreparacion({
  nombre,
  perfil,
  fechaPrueba,
  dias,
  minimo,
  avance,
}: {
  nombre: string
  perfil: string
  fechaPrueba?: string
  dias: number | null
  minimo: number | null
  avance: AvancePlan
}) {
  const confiable = estimacionConfiable(avance)
  const conteo = (e: EstadoModulo) => avance.modulos.filter((m) => m.estado === e).length
  const faltan = confiable && minimo ? minimo - (avance.estimacion ?? 0) : null
  // Lo que más suma: peso × lo que falta por dominar, con una acción concreta
  const falta = (m: ModuloAvance) => 1 - (m.visto / 100) * ((m.acierto ?? 50) / 100)
  const acciones = avance.modulos
    .filter((m) => m.estado !== 'dominado')
    .sort((a, b) => b.peso * falta(b) - a.peso * falta(a))
    .slice(0, 3)

  return (
    <section aria-labelledby="preparacion-title" className="rounded-3xl border border-brand-200/70 dark:border-brand-500/25 bg-gradient-to-br from-brand-50 via-white to-white dark:from-brand-500/10 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">Tu preparación</p>
      <h2 id="preparacion-title" className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {nombre}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">{perfil}</p>
      {dias !== null && fechaPrueba && (
        <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <CalendarClock className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden />
          <strong className="text-slate-900 dark:text-white">{dias === 0 ? 'La prueba es hoy' : `Faltan ${dias} ${dias === 1 ? 'día' : 'días'}`}</strong>
        </p>
      )}

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 p-5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Acierto en tu plan</p>
          {confiable ? (
            <>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{avance.estimacion}%</p>
              <Medidor valor={avance.estimacion ?? 0} minimo={minimo} />
              <p className="mt-8 text-sm text-slate-600 dark:text-slate-300">
                {faltan !== null
                  ? faltan > 0
                    ? `Te faltan unos ${faltan} puntos para el mínimo de la eliminatoria. Enfócate en los temas de abajo.`
                    : 'Vas por encima del mínimo de la eliminatoria. Sostenlo con simulacros completos.'
                  : 'Ponderado por lo que pesa cada tema en tu empleo.'}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Es una referencia con tus respuestas de práctica, no el puntaje oficial (la prueba real usa otra escala).
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Aún no hay datos suficientes. Responde al menos {MIN_RESPUESTAS_MODULO} preguntas en los temas que más pesan y aquí verás cómo vas frente al mínimo
              {minimo ? ` de ${minimo} puntos` : ''}.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 p-5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Plan practicado</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{avance.cobertura}%</p>
          <ProgressBar value={avance.cobertura} className="mt-3 h-3" label="Parte del plan practicada" />
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {(['dominado', 'en_curso', 'reforzar', 'sin_empezar'] as const).map((e) => (
              <li key={e} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${ESTADO_TONO[e]}`}>{ESTADO_LABEL[e]}</span>
                <span className="font-bold tabular-nums text-slate-800 dark:text-slate-200">{conteo(e)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {acciones.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">Qué te conviene hacer ahora</h3>
          <ol className="mt-3 space-y-2">
            {acciones.map((m, i) => (
              <li key={m.modulo} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3">
                <span className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-brand-700 text-white text-sm font-bold items-center justify-center">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white leading-snug">{m.modulo}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pesa {Math.round(m.peso * 100)}% ·{' '}
                    {m.estado === 'reforzar'
                      ? `aciertas el ${m.acierto}%: repasa tus ${m.falladas} errores`
                      : m.estado === 'sin_empezar'
                        ? 'aún no lo empiezas'
                        : `llevas ${m.visto}% visto${m.acierto !== null ? ` y aciertas el ${m.acierto}%` : ''}`}
                  </p>
                </div>
                <div className="flex gap-3 text-sm font-semibold">
                  {m.falladas > 0 && (
                    <Link href={repasarErrores(m.modulo)} className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Errores
                    </Link>
                  )}
                  <Link href={practicar(m.modulo)} className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 dark:text-brand-300">
                    Practicar <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}

function PlanTabla({ avance }: { avance: AvancePlan }) {
  return (
    <Tarjeta id="plan-tabla-title" titulo="Tu plan, tema por tema">
      <p className="text-sm text-slate-500 dark:text-slate-400">Del que más pesa al que menos. El acierto aparece desde {MIN_RESPUESTAS_MODULO} respuestas.</p>
      <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
        {avance.modulos.map((m) => {
          const Icon = moduleIcon(m.modulo)
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
                  <span className="shrink-0 text-xs font-bold tabular-nums text-brand-700 dark:text-brand-300">{Math.round(m.peso * 100)}%</span>
                </div>
                <ProgressBar value={m.visto} className="mt-2 h-2" label={`Visto en ${m.modulo}`} />
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className={`font-semibold px-1.5 py-0.5 rounded ${ESTADO_TONO[m.estado]}`}>{ESTADO_LABEL[m.estado]}</span>
                  <span>
                    {m.vistas} de {m.total} vistas
                  </span>
                  {m.acierto !== null && <span className={`font-semibold ${pctText(m.acierto)}`}>{m.acierto}% de aciertos</span>}
                </div>
              </div>
              <Link href={practicar(m.modulo)} className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300" aria-label={`Practicar ${m.modulo}`}>
                Practicar
              </Link>
            </li>
          )
        })}
      </ul>
    </Tarjeta>
  )
}

function Simulacros({ lista, convocatoria, minimo }: { lista: ResumenSimulacro[]; convocatoria: string | null; minimo: number | null }) {
  const puntaje = (s: ResumenSimulacro) => s.conocimientos ?? s.comportamentales ?? 0
  const ultimos = lista.slice(-10)
  const delPlan = convocatoria ? lista.filter((s) => s.convocatoria === convocatoria) : []
  const serie = delPlan.length >= 2 ? delPlan : lista
  const cambio = serie.length >= 2 ? puntaje(serie[serie.length - 1]) - puntaje(serie[0]) : null

  return (
    <Tarjeta id="simulacros-title" titulo="Tus simulacros" icono={<Timer className="w-5 h-5 text-brand-600 dark:text-brand-400" aria-hidden />}>
      {lista.length === 0 ? (
        <>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Aún no has terminado un simulacro. Hazlo con cronómetro, como en la prueba real, y aquí verás tu evolución.
          </p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2.5">
            Hacer un simulacro <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </>
      ) : (
        <>
          {cambio !== null && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {cambio > 0
                ? `Subiste ${cambio} puntos desde tu primer simulacro${delPlan.length >= 2 ? ' de esta convocatoria' : ''}.`
                : cambio < 0
                  ? `Bajaste ${-cambio} puntos frente a tu primer simulacro${delPlan.length >= 2 ? ' de esta convocatoria' : ''}. Revisa los módulos con más errores.`
                  : 'Tu puntaje se mantiene igual que en tu primer simulacro.'}
            </p>
          )}
          {/* Barras de los últimos simulacros, con la línea del mínimo si hay convocatoria */}
          <div className="relative mt-5 h-36 flex items-end gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-slate-700" role="img" aria-label="Puntaje de tus últimos simulacros">
            {minimo ? (
              <div className="absolute inset-x-0 border-t border-dashed border-slate-400 dark:border-slate-500" style={{ bottom: `${minimo}%` }} aria-hidden>
                <span className="absolute left-0 -top-4 rounded bg-white dark:bg-slate-900 pr-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">Mínimo {minimo}</span>
              </div>
            ) : null}
            {ultimos.map((s) => (
              <div key={s.fecha} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center" title={`${s.titulo ?? 'Simulacro general'}: ${puntaje(s)}/100`}>
                <span className="text-[11px] font-semibold tabular-nums text-slate-600 dark:text-slate-300">{puntaje(s)}</span>
                <div className={`w-full max-w-10 rounded-t-md ${barTone(puntaje(s))}`} style={{ height: `${Math.max(4, puntaje(s))}%` }} />
              </div>
            ))}
          </div>
          <ul className="mt-5 space-y-2 text-sm">
            {[...lista].reverse().slice(0, 5).map((s) => (
              <li key={s.fecha} className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium text-slate-800 dark:text-slate-200 truncate">{s.titulo ?? 'Simulacro general'}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {new Date(s.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {s.respondidas} de {s.n} respondidas
                  </span>
                </span>
                <span className={`shrink-0 font-bold tabular-nums ${pctText(puntaje(s))}`}>{puntaje(s)}/100</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Tarjeta>
  )
}

function Constancia({ actividad }: { actividad: Record<string, number> }) {
  // Últimas 4 semanas, de lunes a domingo
  const hoy = new Date()
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7) - 21)
  const dias = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(d.getDate() + i)
    return d
  })
  const iso = hoyISO(hoy)
  const racha = rachaActual(actividad, hoy)
  const semana = preguntasEstaSemana(actividad, hoy)
  const activos = dias.filter((d) => (actividad[hoyISO(d)] ?? 0) > 0).length
  const tono = (n: number) =>
    n === 0 ? 'bg-slate-100 dark:bg-slate-800' : n < 10 ? 'bg-brand-200 dark:bg-brand-500/30' : n < 30 ? 'bg-brand-400 dark:bg-brand-500/60' : 'bg-brand-700 dark:bg-brand-400'

  return (
    <Tarjeta id="constancia-title" titulo="Tu constancia" icono={<Flame className="w-5 h-5 text-amber-500" aria-hidden />}>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{racha}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">días seguidos</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{semana}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">preguntas esta semana</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{activos}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">días con práctica (4 semanas)</p>
        </div>
      </div>
      <div className="mt-5 mx-auto max-w-xs grid grid-cols-7 gap-1.5" role="img" aria-label="Preguntas respondidas por día en las últimas cuatro semanas">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <span key={i} className="text-center text-[11px] font-medium text-slate-400">
            {d}
          </span>
        ))}
        {dias.map((d) => {
          const k = hoyISO(d)
          const n = actividad[k] ?? 0
          const futuro = k > iso
          return (
            <span
              key={k}
              title={futuro ? '' : `${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}: ${n} preguntas`}
              className={`aspect-square rounded-md ${futuro ? 'bg-transparent border border-dashed border-slate-200 dark:border-slate-800' : tono(n)} ${k === iso ? 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
            />
          )
        })}
      </div>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Practicar un poco todos los días rinde más que una jornada larga a la semana.</p>
    </Tarjeta>
  )
}

export default function ReportView({ questions, progress }: ReportViewProps) {
  const { respuestas, meta } = useMemo(() => separarProgreso(progress), [progress])
  // La convocatoria y el nivel se guardan en la cuenta; si aún no, se usan los de este navegador
  const convLocal = useLocal(CONVOCATORIA_STORAGE_KEY)
  const nivelLocal = useLocal('simo_nivel')
  const seleccion = buscarSeleccion(meta.perfil?.convocatoria ?? convLocal)
  const nivel = meta.perfil?.nivel ?? nivelLocal

  const stats = useMemo(() => {
    // Los ids pueden ser números (banco original) o texto (formato v2), así que se comparan como texto
    const byId = new Map(questions.map((q) => [String(q.id), q]))
    const total = emptyTally()
    const bySection = Object.fromEntries(MODULE_SECTIONS.map((s) => [s.id, emptyTally()])) as Record<SectionId, Tally>
    const byModule: Record<string, Tally> = {}
    const byTheme: Record<string, Tally & { modulo: string }> = {}

    // Totales de lo que hoy se puede practicar (las preguntas de otros niveles no cuentan)
    for (const q of questions) {
      if (!q.activa) continue
      if (q.nivel && !(nivel && q.nivel.includes(nivel))) continue
      total.total++
      bySection[sectionOf(q.modulo)].total++
      ;(byModule[q.modulo] ??= emptyTally()).total++
    }

    for (const [id, status] of Object.entries(respuestas)) {
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

    const conteos = Object.entries(byModule).map(([name, t]) => ({ name, total: t.total, correct: t.correct, incorrect: t.incorrect }))
    return { total, bySection, modules, weakThemes, conteos }
  }, [questions, respuestas, nivel])

  const avance = seleccion ? avanceDelPlan(seleccion.perfil, stats.conteos) : null
  const minimo = seleccion ? (minimoEliminatoria(seleccion.convocatoria) ?? null) : null
  const enPlan = new Set(avance?.modulos.map((m) => m.modulo))
  const { total } = stats

  if (total.answered === 0 && !seleccion && !meta.simulacros.length) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center">
          <ChartColumn className="w-7 h-7" aria-hidden />
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Todavía no hay datos</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Elige tu concurso en el panel y responde preguntas o haz un simulacro. Aquí verás cómo vas frente al mínimo de tu prueba y qué te conviene reforzar.
        </p>
        <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-3">
          Ir a estudiar <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    )
  }

  const globalPct = accuracy(total)
  const seenPct = total.total ? Math.min(100, Math.round((total.answered / total.total) * 100)) : 0
  // Con plan, los temas débiles de su convocatoria van primero
  const weakThemes = [...stats.weakThemes].sort((a, b) => Number(enPlan.has(b.modulo)) - Number(enPlan.has(a.modulo))).slice(0, 6)
  const otrosModulos = avance ? stats.modules.filter((m) => !enPlan.has(m.modulo)) : stats.modules

  return (
    <div className="space-y-8">
      {seleccion && avance ? (
        <PlanPreparacion
          nombre={seleccion.convocatoria.nombre}
          perfil={seleccion.perfil.label}
          fechaPrueba={seleccion.convocatoria.fechaPrueba}
          dias={diasParaPrueba(seleccion.convocatoria)}
          minimo={minimo}
          avance={avance}
        />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-dashed border-brand-300 dark:border-brand-500/40 bg-brand-50/50 dark:bg-brand-500/5 px-4 py-3.5">
          <p className="flex-1 text-sm text-slate-700 dark:text-slate-300">
            Elige tu concurso en el panel y aquí verás cuánto te falta para el mínimo de la prueba eliminatoria y qué temas te dan más puntos.
          </p>
          <Link href="/dashboard" className="shrink-0 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2">
            Elegir concurso
          </Link>
        </div>
      )}

      {/* Resumen general */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Aciertos" value={total.answered ? `${globalPct}%` : '—'} hint={`${total.correct} de ${total.answered} respuestas`}>
          <ProgressBar value={globalPct} barClass={barTone(globalPct)} className="mt-3" label="Porcentaje de aciertos" />
        </Kpi>
        <Kpi label="Avance" value={`${seenPct}%`} hint={`${total.answered} de ${total.total} preguntas vistas`}>
          <ProgressBar value={seenPct} className="mt-3" label="Preguntas vistas" />
        </Kpi>
        <Kpi label="Simulacros" value={meta.simulacros.length} hint={meta.simulacros.length === 1 ? 'terminado' : 'terminados'} />
        <Kpi label="Por repasar" value={total.incorrect} hint="preguntas falladas">
          {total.incorrect > 0 && (
            <Link
              href={repasarErrores()}
              className="mt-2 self-start inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Repasar
            </Link>
          )}
        </Kpi>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Simulacros lista={meta.simulacros} convocatoria={seleccion?.clave ?? null} minimo={minimo} />
        <Constancia actividad={meta.actividad} />
      </div>

      {avance && <PlanTabla avance={avance} />}

      {/* Por tipo de competencia: solo sin plan (con plan, la tabla del plan lo reemplaza) */}
      {!avance && (
        <Tarjeta id="secciones-title" titulo="Por tipo de competencia">
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
        </Tarjeta>
      )}

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Módulos */}
        {otrosModulos.length > 0 && (
          <Tarjeta id="modulos-title" titulo={avance ? 'Otros módulos que has practicado' : 'Por módulo'} className="lg:col-span-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Del más débil al más fuerte. Con menos de {MIN_RESPUESTAS} respuestas el porcentaje aún no es confiable.
            </p>
            <ul className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
              {otrosModulos.map((m) => {
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
                      href={practicar(m.modulo)}
                      className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
                      aria-label={`Practicar ${m.modulo}`}
                    >
                      Practicar
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Tarjeta>
        )}

        {/* Temas para reforzar */}
        <Tarjeta
          id="temas-title"
          titulo="Temas para reforzar"
          icono={<TriangleAlert className="w-5 h-5 text-amber-500" aria-hidden />}
          className={otrosModulos.length > 0 ? 'lg:col-span-2' : 'lg:col-span-5'}
        >
          {weakThemes.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {weakThemes.map((t) => (
                <li key={`${t.modulo}-${t.tema}`} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-snug">{t.tema}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {t.modulo}
                        {enPlan.has(t.modulo) ? ' · en tu plan' : ''}
                      </p>
                    </div>
                    <span className={`shrink-0 text-sm font-bold tabular-nums ${pctText(t.pct)}`}>{t.pct}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {t.incorrect} de {t.answered} falladas
                    </span>
                    <Link href={repasarErrores(t.modulo)} className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">
                      Repasar errores
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
        </Tarjeta>
      </div>
    </div>
  )
}
