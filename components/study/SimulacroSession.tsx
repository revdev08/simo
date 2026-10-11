'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, Clock, Flag, LayoutGrid, RotateCcw, Scale, X } from 'lucide-react'
import { isJuicioSituacional, type Question } from '@/lib/question-types'
import { clock, saveProgress, sendAttempt } from './attempts'
import QuestionText from './QuestionText'
import { AJUSTE_LABEL, Badge, OptionCard, ProgressBar, ScoreRing, isTypingTarget, optionFromKey, scrollIntoViewSoft } from './ui'

const STORAGE_KEY = 'simo_simulacro_en_curso'
const AVISO_TIEMPO_MS = 5 * 60 * 1000

// Estado que se guarda en el navegador para poder retomar el simulacro si se cierra la pestaña
export interface SimulacroState {
  ids: string[]
  answers: Record<number, string>
  flags: Record<number, boolean>
  timeSpent: Record<number, number>
  current: number
  startedAt: number
  durationMs: number
}

export function loadSimulacroState(): SimulacroState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (!Array.isArray(s.ids) || !s.ids.length || typeof s.startedAt !== 'number' || typeof s.durationMs !== 'number') return null
    return s as SimulacroState
  } catch {
    return null
  }
}

export function clearSimulacroState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

function persistSimulacroState(s: SimulacroState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {}
}

const pad = (n: number) => String(n).padStart(2, '0')
export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

type Filtro = 'todas' | 'incorrectas' | 'sin_responder'

const barTone = (pct: number) => (pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500')

// Mapa de preguntas: respondidas, marcadas y la actual
function QuestionMap({
  total,
  current,
  answers,
  flags,
  onGo,
}: {
  total: number
  current: number
  answers: Record<number, string>
  flags: Record<number, boolean>
  onGo: (i: number) => void
}) {
  return (
    <div>
      <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-1.5" aria-label="Ir a la pregunta">
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === current
          const isAnswered = !!answers[i]
          const isFlagged = !!flags[i]
          return (
            <button
              key={i}
              type="button"
              onClick={() => onGo(i)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Pregunta ${i + 1}${isAnswered ? ', respondida' : ''}${isFlagged ? ', marcada para revisar' : ''}`}
              className={`relative h-9 rounded-lg text-xs font-semibold tabular-nums border transition-colors ${
                isAnswered
                  ? 'bg-brand-600 border-brand-600 text-white dark:bg-brand-500 dark:border-brand-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-400'
              } ${isCurrent ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-slate-950' : ''}`}
            >
              {i + 1}
              {isFlagged && <span aria-hidden className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-slate-950" />}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-600" aria-hidden /> Respondida
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" aria-hidden /> Para revisar
        </span>
      </div>
    </div>
  )
}

// Ventana de confirmación antes de terminar
function ConfirmDialog({ pending, flagged, onCancel, onConfirm }: { pending: number; flagged: number; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/50" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-enter"
      >
        <h2 id="confirm-title" className="text-lg font-bold text-slate-900 dark:text-white">
          ¿Terminar el simulacro?
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {pending > 0 ? (
            <>
              {pending === 1 ? 'Te queda' : 'Te quedan'} <strong className="text-slate-900 dark:text-white">{pending} sin responder</strong>
              {flagged ? <> y {flagged} {flagged === 1 ? 'marcada' : 'marcadas'} para revisar</> : null}. Al terminar verás tu resultado y ya no podrás cambiar respuestas.
            </>
          ) : (
            <>Respondiste todas{flagged ? <>, y tienes {flagged} {flagged === 1 ? 'marcada' : 'marcadas'} para revisar</> : null}. Al terminar verás tu resultado y ya no podrás cambiar respuestas.</>
          )}
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Seguir respondiendo
          </button>
          <button type="button" onClick={onConfirm} className="px-5 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 font-semibold text-white">
            Terminar y ver resultado
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SimulacroSession({
  questions,
  initialState,
  onExit,
  onSaveProgress,
  onRetryWrong,
  onPracticeModule,
}: {
  questions: Question[]
  initialState: SimulacroState
  onExit: () => void
  onSaveProgress: (progress: Record<string, 'correct' | 'incorrect'>) => void
  // Abre el repaso con las preguntas que se fallaron en el simulacro
  onRetryWrong?: (wrong: Question[]) => void
  // Abre la práctica de un módulo desde el resultado
  onPracticeModule?: (modulo: string) => void
}) {
  const [state, setState] = useState<SimulacroState>(initialState)
  const [now, setNow] = useState(initialState.startedAt)
  const [finishedAt, setFinishedAt] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  // Momento del último cambio de pregunta, para sumar el tiempo que se pasa en cada una
  const lastSwitchRef = useRef(0)
  const finishRef = useRef<() => void>(() => {})
  const topRef = useRef<HTMLDivElement>(null)

  const deadline = state.startedAt + state.durationMs
  const remaining = deadline - now
  const finished = finishedAt !== null
  const question = questions[state.current]

  const finish = () => {
    if (finishedAt !== null) return
    const t = clock()
    const spent = { ...state.timeSpent, [state.current]: (state.timeSpent[state.current] ?? 0) + (t - lastSwitchRef.current) }
    const progress: Record<string, 'correct' | 'incorrect'> = {}
    questions.forEach((q, i) => {
      const selected = state.answers[i]
      if (!selected) return
      progress[String(q.id)] = selected === q.respuestaCorrecta ? 'correct' : 'incorrect'
      sendAttempt(q.id, selected, spent[i] ?? 0, 'simulacro')
    })
    onSaveProgress(progress)
    saveProgress(progress)
    clearSimulacroState()
    setState((s) => ({ ...s, timeSpent: spent }))
    setFinishedAt(Math.min(t, deadline))
    setConfirmOpen(false)
    setMapOpen(false)
    requestAnimationFrame(() => scrollIntoViewSoft(topRef.current, 'start'))
  }

  // El cronómetro siempre llama a la versión más reciente de finish
  useEffect(() => {
    finishRef.current = finish
  })

  // Cronómetro: actualiza la hora cada segundo y termina solo cuando se acaba el tiempo
  useEffect(() => {
    lastSwitchRef.current = clock()
    const tick = () => {
      const t = clock()
      setNow(t)
      if (t >= initialState.startedAt + initialState.durationMs) finishRef.current()
    }
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [initialState.startedAt, initialState.durationMs])

  useEffect(() => {
    if (!finished) persistSimulacroState(state)
  }, [state, finished])

  const goTo = (index: number) => {
    if (index < 0 || index >= questions.length || index === state.current) return
    const t = clock()
    const elapsed = t - lastSwitchRef.current
    lastSwitchRef.current = t
    setState((s) => ({
      ...s,
      current: index,
      timeSpent: { ...s.timeSpent, [s.current]: (s.timeSpent[s.current] ?? 0) + elapsed },
    }))
    setMapOpen(false)
    requestAnimationFrame(() => scrollIntoViewSoft(topRef.current, 'start'))
  }

  const answer = (optionId: string) => setState((s) => ({ ...s, answers: { ...s.answers, [s.current]: optionId } }))
  const toggleFlag = () => setState((s) => ({ ...s, flags: { ...s.flags, [s.current]: !s.flags[s.current] } }))

  const answeredCount = Object.keys(state.answers).length
  const flaggedCount = Object.values(state.flags).filter(Boolean).length
  const isLast = state.current === questions.length - 1

  // Atajos: A–D o 1–4 para responder (se puede cambiar), ← y → para moverse
  useEffect(() => {
    if (finished) return
    const onKey = (e: KeyboardEvent) => {
      if (confirmOpen || mapOpen || !question || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      const id = optionFromKey(e.key, question.opciones.map((o) => o.id))
      if (id) {
        e.preventDefault()
        answer(id)
      } else if (e.key === 'ArrowRight') {
        if (isLast) setConfirmOpen(true)
        else goTo(state.current + 1)
      } else if (e.key === 'ArrowLeft') {
        goTo(state.current - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const results = useMemo(() => {
    if (!finished) return null
    let knowledgeTotal = 0
    let knowledgeCorrect = 0
    let sjtTotal = 0
    let sjtPoints = 0
    const byModule: Record<string, { total: number; correct: number }> = {}
    questions.forEach((q, i) => {
      const selected = state.answers[i]
      const m = (byModule[q.modulo] ??= { total: 0, correct: 0 })
      m.total++
      if (selected === q.respuestaCorrecta) m.correct++
      if (isJuicioSituacional(q)) {
        sjtTotal++
        sjtPoints += q.opciones.find((o) => o.id === selected)?.puntaje ?? 0
      } else {
        knowledgeTotal++
        if (selected === q.respuestaCorrecta) knowledgeCorrect++
      }
    })
    return {
      knowledgeTotal,
      knowledgeCorrect,
      knowledgePct: knowledgeTotal ? Math.round((knowledgeCorrect / knowledgeTotal) * 100) : null,
      sjtTotal,
      sjtPct: sjtTotal ? Math.round((sjtPoints / (sjtTotal * 3)) * 100) : null,
      // Del módulo más débil al más fuerte, para saber qué practicar primero
      byModule: Object.entries(byModule)
        .map(([modulo, r]) => ({ modulo, ...r, pct: Math.round((r.correct / r.total) * 100) }))
        .sort((a, b) => a.pct - b.pct || b.total - a.total),
      unanswered: questions.length - Object.keys(state.answers).length,
      wrong: questions.filter((q, i) => state.answers[i] !== q.respuestaCorrecta),
    }
  }, [finished, questions, state.answers])

  // ---------- Resultados ----------
  if (finished && results) {
    const visibles = questions
      .map((q, i) => ({ q, i, selected: state.answers[i] }))
      .filter(({ q, selected }) => (filtro === 'todas' ? true : filtro === 'sin_responder' ? !selected : !!selected && selected !== q.respuestaCorrecta))
    const mainPct = results.knowledgePct ?? results.sjtPct ?? 0

    return (
      <div ref={topRef} className="max-w-4xl mx-auto space-y-6 animate-enter scroll-mt-24">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Volver al inicio
        </button>

        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <ScoreRing value={mainPct} size={140} label={results.knowledgePct !== null ? 'Conocimientos' : 'Comportamentales'} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resultado del simulacro</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                {questions.length} preguntas · usaste {formatDuration((finishedAt ?? deadline) - state.startedAt)} de {formatDuration(state.durationMs)}
              </p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Como referencia, en muchas convocatorias el puntaje mínimo de la prueba eliminatoria está entre 60 y 70 sobre 100. Revisa el acuerdo de tu convocatoria.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {results.knowledgePct !== null && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Conocimientos</p>
                <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{results.knowledgePct} / 100</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {results.knowledgeCorrect} de {results.knowledgeTotal} correctas
                </p>
              </div>
            )}
            {results.sjtPct !== null && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Comportamentales</p>
                <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{results.sjtPct}%</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">ajuste promedio en {results.sjtTotal} situaciones</p>
              </div>
            )}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Sin responder</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{results.unanswered}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">cuentan como no acertadas</p>
            </div>
          </div>

          {results.wrong.length > 0 && onRetryWrong && (
            <button
              type="button"
              onClick={() => onRetryWrong(results.wrong)}
              className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-3"
            >
              <RotateCcw className="w-4 h-4" aria-hidden /> Repasar las {results.wrong.length} que no acerté
            </button>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resultado por módulo</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Del más débil al más fuerte. En comportamentales, acertar es elegir la mejor opción.</p>
          <ul className="mt-5 space-y-4">
            {results.byModule.map((m) => (
              <li key={m.modulo} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200" title={m.modulo}>
                      {m.modulo}
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400">
                      {m.correct}/{m.total} · <strong className="text-slate-900 dark:text-white">{m.pct}%</strong>
                    </span>
                  </div>
                  <ProgressBar value={m.pct} barClass={barTone(m.pct)} className="mt-2 h-2" label={`Aciertos en ${m.modulo}`} />
                </div>
                {onPracticeModule && m.pct < 70 && (
                  <button
                    type="button"
                    onClick={() => onPracticeModule(m.modulo)}
                    className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
                  >
                    Practicar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revisa tus respuestas</h3>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1" role="tablist" aria-label="Filtrar respuestas">
              {(
                [
                  ['todas', 'Todas'],
                  ['incorrectas', 'Incorrectas'],
                  ['sin_responder', 'Sin responder'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filtro === id}
                  onClick={() => setFiltro(id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ${
                    filtro === id ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {visibles.length === 0 && <p className="text-slate-500">No hay preguntas en este filtro.</p>}
          <ol className="space-y-3">
            {visibles.map(({ q, i, selected }) => (
              <ReviewItem key={String(q.id)} q={q} index={i} selected={selected} />
            ))}
          </ol>
        </section>
      </div>
    )
  }

  if (!question) return null

  // ---------- Examen en curso ----------
  const selected = state.answers[state.current]
  const lowTime = remaining <= AVISO_TIEMPO_MS
  const flagged = !!state.flags[state.current]

  const timer = (
    <span
      role="timer"
      aria-live="off"
      aria-label={`Tiempo restante ${formatDuration(remaining)}`}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold tabular-nums border ${
        lowTime ? 'bg-red-600 border-red-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
      }`}
    >
      <Clock className="w-4 h-4" aria-hidden /> {formatDuration(remaining)}
    </span>
  )

  return (
    <div ref={topRef} className="max-w-5xl mx-auto pb-28 lg:pb-0 scroll-mt-24">
      {/* Barra del examen: queda fija bajo el encabezado del panel */}
      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            aria-label="Salir y continuar después"
            title="Salir y continuar después (el tiempo sigue corriendo)"
            className="shrink-0 w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                Pregunta {state.current + 1} <span className="font-normal text-slate-500">de {questions.length}</span>
              </span>
              <span className="hidden sm:inline tabular-nums text-slate-500 dark:text-slate-400">{answeredCount} respondidas</span>
            </div>
            <ProgressBar value={(answeredCount / questions.length) * 100} className="mt-2 h-2" label="Preguntas respondidas" />
          </div>
          {timer}
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <article className="min-w-0 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 space-y-6 animate-enter" key={state.current}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge tone="brand">{question.modulo}</Badge>
            <button
              type="button"
              onClick={toggleFlag}
              aria-pressed={flagged}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border transition-colors ${
                flagged
                  ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-500/15 dark:border-amber-500/40 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
              }`}
            >
              <Flag className="w-4 h-4" aria-hidden /> {flagged ? 'Marcada para revisar' : 'Marcar para revisar'}
            </button>
          </div>

          <QuestionText text={question.pregunta} />

          <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
            {question.opciones.map((opt) => (
              <OptionCard
                key={opt.id}
                letter={opt.id}
                text={opt.texto}
                state={selected === opt.id ? 'selected' : 'idle'}
                role="radio"
                ariaChecked={selected === opt.id}
                onClick={() => answer(opt.id)}
              />
            ))}
          </div>

          <div className="hidden lg:flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => goTo(state.current - 1)}
              disabled={state.current === 0}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden /> Anterior
            </button>
            <span className="text-xs text-slate-400">Teclas A–D para responder · ← → para moverte</span>
            <button
              type="button"
              onClick={() => (isLast ? setConfirmOpen(true) : goTo(state.current + 1))}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-sm font-semibold text-white"
            >
              {isLast ? 'Revisar y terminar' : 'Siguiente'} <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </article>

        {/* Mapa al lado en pantallas grandes */}
        <aside className="hidden lg:block sticky top-40 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Mapa de preguntas</h2>
            <span className="text-sm tabular-nums text-slate-500">
              {answeredCount}/{questions.length}
            </span>
          </div>
          <QuestionMap total={questions.length} current={state.current} answers={state.answers} flags={state.flags} onGo={goTo} />
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-red-300 hover:text-red-700 dark:hover:text-red-400"
          >
            Terminar simulacro
          </button>
        </aside>
      </div>

      {/* Celular y tableta: acciones fijas abajo */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(state.current - 1)}
            disabled={state.current === 0}
            aria-label="Pregunta anterior"
            className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-2"
          >
            <LayoutGrid className="w-4 h-4" aria-hidden /> Mapa · {answeredCount}/{questions.length}
          </button>
          <button
            type="button"
            onClick={() => (isLast ? setConfirmOpen(true) : goTo(state.current + 1))}
            className="h-12 px-5 rounded-xl bg-brand-700 hover:bg-brand-800 text-sm font-semibold text-white inline-flex items-center gap-1.5"
          >
            {isLast ? 'Terminar' : 'Siguiente'} <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Mapa como hoja desde abajo en el celular */}
      {mapOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/50 flex items-end" onClick={() => setMapOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mapa de preguntas"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-slate-900 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-5 animate-enter"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">Mapa de preguntas</h2>
              <div className="flex items-center gap-2">
                {timer}
                <button type="button" onClick={() => setMapOpen(false)} aria-label="Cerrar mapa" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>
            </div>
            <QuestionMap total={questions.length} current={state.current} answers={state.answers} flags={state.flags} onGo={goTo} />
            <button
              type="button"
              onClick={() => {
                setMapOpen(false)
                setConfirmOpen(true)
              }}
              className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Terminar simulacro
            </button>
          </div>
        </div>
      )}

      {confirmOpen && <ConfirmDialog pending={questions.length - answeredCount} flagged={flaggedCount} onCancel={() => setConfirmOpen(false)} onConfirm={finish} />}
    </div>
  )
}

function ReviewItem({ q, index, selected }: { q: Question; index: number; selected: string | undefined }) {
  const sjt = isJuicioSituacional(q)
  const correct = selected === q.respuestaCorrecta
  const estado = !selected ? 'Sin responder' : correct ? (sjt ? 'Mejor opción' : 'Correcta') : sjt ? 'Ajuste parcial o bajo' : 'Incorrecta'
  const tone = !selected ? 'neutral' : correct ? 'green' : 'red'
  return (
    <li className="rounded-2xl border border-slate-200/80 dark:border-slate-800">
      <details className="group">
        <summary className="cursor-pointer list-none p-4 flex items-start gap-3">
          <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-400 w-7">{index + 1}</span>
          <span className="min-w-0 flex-1 space-y-1.5">
            <Badge tone={tone}>{estado}</Badge>
            <span className="block text-sm text-slate-800 dark:text-slate-200 line-clamp-2">{q.pregunta}</span>
          </span>
        </summary>
        <div className="px-4 pb-5 space-y-3 sm:pl-14">
          <QuestionText text={q.pregunta} className="[&_p]:text-base [&_p]:font-medium" />
          <ul className="space-y-2">
            {q.opciones.map((o) => {
              const isKey = o.id === q.respuestaCorrecta
              const isMine = o.id === selected
              return (
                <li
                  key={o.id}
                  className={`p-3 rounded-xl border text-sm ${
                    isKey ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/10' : isMine ? 'border-red-400 bg-red-50/70 dark:bg-red-500/10' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {o.id}. {o.texto}
                    {isMine && <span className="ml-2 text-xs font-semibold text-slate-500">(tu respuesta)</span>}
                    {sjt && typeof o.puntaje === 'number' && (
                      <span className="ml-2 text-xs font-semibold text-slate-500">
                        {AJUSTE_LABEL[o.puntaje]} · {o.puntaje}/3
                      </span>
                    )}
                  </div>
                  {o.explicacion && <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">{o.explicacion}</p>}
                </li>
              )
            })}
          </ul>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{q.explicacionIA}</p>
          {q.norma && (
            <p className="flex items-start gap-2 text-xs text-slate-500">
              <Scale className="w-4 h-4 shrink-0" aria-hidden /> {q.norma}
              {q.articulos?.length ? `, ${q.articulos.join('; ')}` : ''}
            </p>
          )}
        </div>
      </details>
    </li>
  )
}
