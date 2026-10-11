'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Flag, Award, Scale } from 'lucide-react'
import { isJuicioSituacional, type Question } from '@/lib/question-types'
import { clock, saveProgress, sendAttempt } from './attempts'
import QuestionText from './QuestionText'

const STORAGE_KEY = 'simo_simulacro_en_curso'
const AVISO_TIEMPO_MS = 5 * 60 * 1000
const AJUSTE_LABEL = ['No alineada', 'Ajuste bajo', 'Ajuste medio', 'Ajuste alto']

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

export default function SimulacroSession({
  questions,
  initialState,
  onExit,
  onSaveProgress,
}: {
  questions: Question[]
  initialState: SimulacroState
  onExit: () => void
  onSaveProgress: (progress: Record<string, 'correct' | 'incorrect'>) => void
}) {
  const [state, setState] = useState<SimulacroState>(initialState)
  const [now, setNow] = useState(initialState.startedAt)
  const [finishedAt, setFinishedAt] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  // Momento del último cambio de pregunta, para sumar el tiempo que se pasa en cada una
  const lastSwitchRef = useRef(0)
  const finishRef = useRef<() => void>(() => {})

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
  }

  const answer = (optionId: string) => setState((s) => ({ ...s, answers: { ...s.answers, [s.current]: optionId } }))
  const toggleFlag = () => setState((s) => ({ ...s, flags: { ...s.flags, [s.current]: !s.flags[s.current] } }))

  const answeredCount = Object.keys(state.answers).length
  const flaggedCount = Object.values(state.flags).filter(Boolean).length

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
      byModule: Object.entries(byModule).sort((a, b) => b[1].total - a[1].total),
      unanswered: questions.length - Object.keys(state.answers).length,
    }
  }, [finished, questions, state.answers])

  // ---------- Resultados ----------
  if (finished && results) {
    const visibles = questions
      .map((q, i) => ({ q, i, selected: state.answers[i] }))
      .filter(({ q, selected }) =>
        filtro === 'todas' ? true : filtro === 'sin_responder' ? !selected : !!selected && selected !== q.respuestaCorrecta
      )

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <button onClick={onExit} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Resultado del simulacro</h2>
            <p className="text-slate-500 dark:text-slate-400">
              {questions.length} preguntas · tiempo usado {formatDuration((finishedAt ?? deadline) - state.startedAt)} de {formatDuration(state.durationMs)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {results.knowledgePct !== null && (
              <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Conocimientos</div>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{results.knowledgePct} / 100</div>
                <div className="text-sm text-slate-500">{results.knowledgeCorrect} de {results.knowledgeTotal} correctas</div>
              </div>
            )}
            {results.sjtPct !== null && (
              <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Comportamentales</div>
                <div className="text-3xl font-black text-violet-600 dark:text-violet-400 tabular-nums">{results.sjtPct}%</div>
                <div className="text-sm text-slate-500">ajuste promedio en {results.sjtTotal} situaciones</div>
              </div>
            )}
            <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Sin responder</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">{results.unanswered}</div>
              <div className="text-sm text-slate-500">cuentan como no acertadas</div>
            </div>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Como referencia, en muchas convocatorias el puntaje mínimo de la prueba eliminatoria está entre 60 y 70 sobre 100. Revisa el acuerdo de tu convocatoria.
          </p>

          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white">Resultado por módulo</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-2">Módulo</th>
                    <th className="text-right px-4 py-2">Aciertos</th>
                    <th className="text-right px-4 py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {results.byModule.map(([mod, r]) => (
                    <tr key={mod} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-2 text-slate-800 dark:text-slate-200">{mod}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{r.correct} / {r.total}</td>
                      <td className={`px-4 py-2 text-right tabular-nums font-bold ${r.correct / r.total >= 0.7 ? 'text-emerald-600' : r.correct / r.total >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                        {Math.round((r.correct / r.total) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">En comportamentales, &quot;acierto&quot; es elegir la mejor opción.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Revisa tus respuestas</h3>
            <div className="flex gap-2" role="tablist">
              {([['todas', 'Todas'], ['incorrectas', 'Incorrectas'], ['sin_responder', 'Sin responder']] as const).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={filtro === id}
                  onClick={() => setFiltro(id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${filtro === id ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {visibles.length === 0 && <p className="text-slate-500">No hay preguntas en este filtro.</p>}
          <ol className="space-y-4">
            {visibles.map(({ q, i, selected }) => (
              <ReviewItem key={String(q.id)} q={q} index={i} selected={selected} />
            ))}
          </ol>
        </div>
      </div>
    )
  }

  if (!question) return null

  // ---------- Examen en curso ----------
  const selected = state.answers[state.current]
  const lowTime = remaining <= AVISO_TIEMPO_MS

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onExit} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Salir y continuar después
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tabular-nums">{answeredCount}/{questions.length} respondidas</span>
          <span
            role="timer"
            aria-live="off"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black tabular-nums border ${lowTime ? 'bg-red-500/10 text-red-600 border-red-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}
          >
            <Clock className="w-4 h-4" /> {formatDuration(remaining)}
          </span>
        </div>
      </div>

      {/* Mapa de preguntas */}
      <div className="flex flex-wrap gap-1.5" aria-label="Ir a la pregunta">
        {questions.map((q, i) => {
          const isCurrent = i === state.current
          const isAnswered = !!state.answers[i]
          const isFlagged = !!state.flags[i]
          return (
            <button
              key={String(q.id)}
              onClick={() => goTo(i)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Pregunta ${i + 1}${isAnswered ? ', respondida' : ''}${isFlagged ? ', marcada para revisar' : ''}`}
              className={`w-9 h-9 rounded-lg text-xs font-bold tabular-nums border-2 transition-colors ${
                isAnswered ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              } ${isFlagged ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-slate-950' : ''} ${isCurrent ? 'outline outline-2 outline-offset-2 outline-slate-900 dark:outline-white' : ''}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-800/80 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            {question.modulo}
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-400 dark:text-slate-500">
            Pregunta {state.current + 1} de {questions.length}
          </span>
        </div>

        <div className="p-6 sm:p-10 space-y-6">
          <QuestionText text={question.pregunta} />
          <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
            {question.opciones.map((opt) => {
              const isSelected = selected === opt.id
              return (
                <button
                  key={opt.id}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => answer(opt.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-colors flex items-start gap-4 ${
                    isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-black ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                    {opt.id}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-snug pt-0.5">{opt.texto}</span>
                </button>
              )
            })}
          </div>
          <button
            onClick={toggleFlag}
            aria-pressed={!!state.flags[state.current]}
            className={`inline-flex items-center gap-1.5 text-sm font-bold ${state.flags[state.current] ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'}`}
          >
            <Flag className="w-4 h-4" /> {state.flags[state.current] ? 'Marcada para revisar' : 'Marcar para revisar'}
          </button>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => goTo(state.current - 1)}
            disabled={state.current === 0}
            className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-900"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <button onClick={() => setConfirmOpen(true)} className="px-4 py-2.5 text-sm font-bold text-red-600 rounded-xl hover:bg-red-500/10">
            Terminar simulacro
          </button>
          <button
            onClick={() => (state.current < questions.length - 1 ? goTo(state.current + 1) : setConfirmOpen(true))}
            className="inline-flex items-center gap-1 px-5 py-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-sm font-extrabold rounded-xl hover:opacity-90"
          >
            {state.current < questions.length - 1 ? <>Siguiente <ChevronRight className="w-4 h-4" /></> : 'Revisar y terminar'}
          </button>
        </div>
      </div>

      {confirmOpen && (
        <div role="dialog" aria-label="Confirmar fin del simulacro" className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 space-y-3">
          <p className="font-bold text-slate-900 dark:text-white">¿Terminar el simulacro?</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tienes {questions.length - answeredCount} sin responder{flaggedCount ? ` y ${flaggedCount} marcadas para revisar` : ''}. Al terminar verás tu resultado y no podrás cambiar respuestas.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700">
              Seguir respondiendo
            </button>
            <button onClick={finish} className="px-4 py-2 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-500">
              Terminar y ver resultado
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewItem({ q, index, selected }: { q: Question; index: number; selected: string | undefined }) {
  const sjt = isJuicioSituacional(q)
  const correct = selected === q.respuestaCorrecta
  const estado = !selected ? 'Sin responder' : correct ? (sjt ? 'Mejor opción' : 'Correcta') : sjt ? 'Ajuste parcial o bajo' : 'Incorrecta'
  return (
    <li className="rounded-2xl border border-slate-200/60 dark:border-slate-800">
      <details>
        <summary className="cursor-pointer list-none p-4 flex items-start gap-3">
          <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold ${!selected ? 'bg-slate-500/10 text-slate-600' : correct ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>
            {index + 1} · {estado}
          </span>
          <span className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">{q.pregunta}</span>
        </summary>
        <div className="px-4 pb-4 space-y-3">
          <QuestionText text={q.pregunta} className="text-sm" />
          <ul className="space-y-2">
            {q.opciones.map((o) => {
              const isKey = o.id === q.respuestaCorrecta
              const isMine = o.id === selected
              return (
                <li
                  key={o.id}
                  className={`p-3 rounded-xl border text-sm ${isKey ? 'border-emerald-500 bg-emerald-500/10' : isMine ? 'border-red-500 bg-red-500/10' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {o.id}. {o.texto}
                    {isMine && <span className="ml-2 text-xs font-bold text-slate-500">(tu respuesta)</span>}
                    {sjt && typeof o.puntaje === 'number' && (
                      <span className="ml-2 text-xs font-bold text-slate-500">{AJUSTE_LABEL[o.puntaje]} · {o.puntaje}/3</span>
                    )}
                  </div>
                  {o.explicacion && <p className="mt-1 text-slate-600 dark:text-slate-400">{o.explicacion}</p>}
                </li>
              )
            })}
          </ul>
          <p className="text-sm text-slate-700 dark:text-slate-300">{q.explicacionIA}</p>
          {q.norma && (
            <p className="flex items-start gap-2 text-xs text-slate-500">
              <Scale className="w-4 h-4 shrink-0" /> Fundamento: {q.norma}{q.articulos?.length ? `, ${q.articulos.join('; ')}` : ''}
            </p>
          )}
        </div>
      </details>
    </li>
  )
}
