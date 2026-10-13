'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, CircleCheck, CircleX, FlaskConical, Keyboard, Lightbulb, RotateCcw, Scale } from 'lucide-react'
import { NIVELES, isJuicioSituacional, type Question } from '@/lib/question-types'
import QuestionText from './QuestionText'
import ReportQuestion from './ReportQuestion'
import { clock, saveProgress, sendAttempt } from './attempts'
import {
  AJUSTE_LABEL,
  Badge,
  DIFICULTAD_TONE,
  OptionCard,
  ProgressBar,
  ScoreRing,
  isTypingTarget,
  optionFromKey,
  scrollIntoViewSoft,
  type OptionState,
} from './ui'

type Status = 'correct' | 'incorrect'

const nivelLabel = (id: string) => NIVELES.find((n) => n.id === id)?.label ?? id

// Práctica con retroalimentación inmediata: un módulo o el repaso de errores
export default function StudySession({
  moduleName,
  questions,
  onSaveProgress,
  onBack,
  onRetry,
}: {
  moduleName: string
  questions: Question[]
  onSaveProgress: (id: Question['id'], status: Status) => void
  onBack: () => void
  // Abre una sesión nueva solo con las preguntas falladas en esta
  onRetry?: (wrong: Question[]) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  // Respuesta dada en cada pregunta de la sesión: al volver con "Anterior" se ve la misma respuesta, sin poder cambiarla
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isFinished, setIsFinished] = useState(false)
  // Puntaje de ajuste (0 a 3) de cada pregunta comportamental respondida en esta sesión
  const [sessionAjuste, setSessionAjuste] = useState<Record<string, number>>({})
  // Momento en que se mostró la pregunta actual, para medir cuánto tarda el usuario en responder
  const shownAtRef = useRef(0)
  const feedbackRef = useRef<HTMLElement>(null)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    shownAtRef.current = clock()
  }, [currentIndex])

  // Lo respondido que aún no se ha guardado en la base de datos
  const pendingSyncRef = useRef<Record<string, Status>>({})
  const syncProgress = () => {
    saveProgress(pendingSyncRef.current)
    pendingSyncRef.current = {}
  }

  // Si se sale de la sesión por otro camino (navegación, cerrar la pestaña), también se guarda lo respondido
  useEffect(() => {
    const flush = () => {
      saveProgress(pendingSyncRef.current)
      pendingSyncRef.current = {}
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [])

  const question = questions[currentIndex]
  const selectedOption = answers[currentIndex] ?? null
  const answered = selectedOption !== null
  const isLast = currentIndex === questions.length - 1

  const statusOf = (i: number): Status | null => {
    const a = answers[i]
    if (!a) return null
    return a === questions[i].respuestaCorrecta ? 'correct' : 'incorrect'
  }
  const statuses = questions.map((_, i) => statusOf(i))
  const correctCount = statuses.filter((s) => s === 'correct').length
  const wrongCount = statuses.filter((s) => s === 'incorrect').length

  const handleSelect = (optionId: string) => {
    if (answered || !question) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionId }))
    const status: Status = optionId === question.respuestaCorrecta ? 'correct' : 'incorrect'
    sendAttempt(question.id, optionId, clock() - shownAtRef.current, 'modulo')
    onSaveProgress(question.id, status)
    pendingSyncRef.current[String(question.id)] = status
    if (isJuicioSituacional(question)) {
      const puntaje = question.opciones.find((o) => o.id === optionId)?.puntaje ?? 0
      setSessionAjuste((prev) => ({ ...prev, [String(question.id)]: puntaje }))
    }
    // En el celular la explicación queda debajo de las opciones: si no se ve, se lleva su comienzo a la vista
    requestAnimationFrame(() => {
      const el = feedbackRef.current
      if (el && el.getBoundingClientRect().top > window.innerHeight - 160) scrollIntoViewSoft(el, 'start')
    })
  }

  const goTo = (i: number) => {
    setCurrentIndex(i)
    requestAnimationFrame(() => scrollIntoViewSoft(topRef.current, 'start'))
  }
  const handleNext = () => {
    if (!isLast) goTo(currentIndex + 1)
  }
  const handlePrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1)
  }
  const handleFinish = () => {
    setIsFinished(true)
    syncProgress()
    requestAnimationFrame(() => scrollIntoViewSoft(topRef.current, 'start'))
  }
  // Al salir del módulo también se guarda lo respondido, aunque no se haya terminado
  const handleBack = () => {
    syncProgress()
    onBack()
  }

  // Atajos: A–D o 1–4 para responder; Enter o → para seguir; ← para volver
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isFinished || !question || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return
      const target = e.target as HTMLElement | null
      if (!answered) {
        const id = optionFromKey(e.key, question.opciones.map((o) => o.id))
        if (id) {
          e.preventDefault()
          handleSelect(id)
        }
        return
      }
      // Enter sobre un botón ya lo activa el navegador
      if (e.key === 'Enter' && target?.tagName === 'BUTTON') return
      if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault()
        if (isLast) handleFinish()
        else handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ---------- Resultado de la sesión ----------
  if (isFinished) {
    const answeredCount = correctCount + wrongCount
    const score = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0
    const ajustes = Object.values(sessionAjuste)
    const ajustePromedio = ajustes.length ? Math.round((ajustes.reduce((a, b) => a + b, 0) / (ajustes.length * 3)) * 100) : null
    const wrong = questions.filter((_, i) => statuses[i] === 'incorrect')

    return (
      <div ref={topRef} className="max-w-2xl mx-auto animate-enter scroll-mt-24">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 text-center">
          <ScoreRing value={score} label="Aciertos de la sesión" />
          <h2 className="mt-5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sesión terminada</h2>
          <p className="mt-1 text-slate-600 dark:text-slate-400">{moduleName}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-4">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{correctCount}</p>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80">correctas</p>
            </div>
            <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 p-4">
              <p className="text-2xl font-bold text-red-700 dark:text-red-300 tabular-nums">{wrongCount}</p>
              <p className="text-sm text-red-800/80 dark:text-red-300/80">por repasar</p>
            </div>
          </div>

          {ajustePromedio !== null && (
            <p className="mt-5 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              En las {ajustes.length} situaciones comportamentales tu ajuste promedio fue de <strong className="text-slate-900 dark:text-white">{ajustePromedio}%</strong>. Ahí
              &quot;correcta&quot; significa elegir la mejor opción.
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {wrong.length > 0 && onRetry && (
              <button
                type="button"
                onClick={() => onRetry(wrong)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-3"
              >
                <RotateCcw className="w-4 h-4" aria-hidden /> Repasar las {wrong.length} que fallé
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!question) return null

  // En juicio situacional no hay "incorrecta": cada opción tiene un ajuste de 0 a 3
  const sjt = isJuicioSituacional(question)
  const chosenPuntaje = sjt && selectedOption ? question.opciones.find((o) => o.id === selectedOption)?.puntaje ?? null : null
  const isCorrect = selectedOption === question.respuestaCorrecta
  const progressValue = ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100

  const optionState = (optId: string, puntaje?: number): OptionState => {
    if (!answered) return 'idle'
    if (optId === question.respuestaCorrecta) return 'correct'
    if (optId === selectedOption) return sjt && (puntaje ?? 0) > 0 ? 'partial' : 'wrong'
    return sjt ? 'idle' : 'dimmed'
  }

  const feedbackTone = isCorrect
    ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/10'
    : sjt && (chosenPuntaje ?? 0) > 0
      ? 'border-amber-200 bg-amber-50/70 dark:border-amber-500/30 dark:bg-amber-500/10'
      : 'border-red-200 bg-red-50/70 dark:border-red-500/30 dark:bg-red-500/10'

  return (
    <div ref={topRef} className="max-w-3xl mx-auto pb-28 sm:pb-0 animate-enter scroll-mt-24">
      {/* Encabezado de la sesión */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Salir de la sesión"
          title="Salir (tu avance queda guardado)"
          className="shrink-0 w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{moduleName}</p>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">
              {currentIndex + 1} <span className="font-normal">de</span> {questions.length}
            </p>
          </div>
          <ProgressBar value={progressValue} className="mt-2 h-2" label="Avance de la sesión" />
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0 text-sm font-semibold tabular-nums" aria-label={`${correctCount} correctas y ${wrongCount} incorrectas`}>
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <CircleCheck className="w-4 h-4" aria-hidden /> {correctCount}
          </span>
          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
            <CircleX className="w-4 h-4" aria-hidden /> {wrongCount}
          </span>
        </div>
      </div>

      <article className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge>{question.tema}</Badge>
          <Badge tone={DIFICULTAD_TONE[question.dificultad] ?? 'neutral'}>Dificultad {question.dificultad.toLowerCase()}</Badge>
          {question.fundamentos && (
            <Badge title="Pregunta de concepto básico: sirve para repasar definiciones. No entra al simulacro tipo examen.">
              <Lightbulb className="w-3.5 h-3.5" aria-hidden /> Concepto básico
            </Badge>
          )}
          {question.estado === 'beta' && (
            <Badge tone="sky" title="Pregunta nueva: ya pasó la revisión automática y a ciegas, y la estamos validando con las respuestas de los usuarios.">
              <FlaskConical className="w-3.5 h-3.5" aria-hidden /> Nueva · en validación
            </Badge>
          )}
          {sjt && question.nivel && !question.nivel.includes('todos') && <Badge tone="violet">Nivel {question.nivel.map(nivelLabel).join(', ')}</Badge>}
        </div>

        <QuestionText text={question.pregunta} />

        <div className="space-y-3" role="group" aria-label="Opciones de respuesta">
          {question.opciones.map((opt) => {
            const state = optionState(opt.id, opt.puntaje)
            const showExplanation = answered && opt.explicacion && (sjt || state === 'correct' || state === 'wrong' || state === 'partial')
            return (
              <OptionCard key={opt.id} letter={opt.id} text={opt.texto} state={state} onClick={() => handleSelect(opt.id)} disabled={answered}>
                {answered && sjt && typeof opt.puntaje === 'number' && (
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                    {AJUSTE_LABEL[opt.puntaje]} · {opt.puntaje}/3
                  </span>
                )}
                {showExplanation && <span className="block text-sm leading-relaxed text-slate-600 dark:text-slate-400">{opt.explicacion}</span>}
              </OptionCard>
            )
          })}
        </div>

        {answered && (
          <section ref={feedbackRef} aria-live="polite" className={`rounded-2xl border p-5 sm:p-6 space-y-4 scroll-mt-24 animate-enter ${feedbackTone}`}>
            <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              {isCorrect ? (
                <CircleCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              ) : (
                <CircleX className={`w-5 h-5 ${sjt && (chosenPuntaje ?? 0) > 0 ? 'text-amber-600' : 'text-red-600 dark:text-red-400'}`} aria-hidden />
              )}
              {sjt && chosenPuntaje !== null
                ? `${AJUSTE_LABEL[chosenPuntaje]} (${chosenPuntaje}/3)${isCorrect ? '' : ` · la mejor opción es la ${question.respuestaCorrecta}`}`
                : isCorrect
                  ? '¡Correcta!'
                  : `Incorrecta · la respuesta es la ${question.respuestaCorrecta}`}
            </p>
            <p className="text-[15px] sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">{question.explicacionIA}</p>
            {sjt && question.competencia && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200">Competencia:</strong> {question.competencia}
                {question.subtema ? (
                  <>
                    {' '}
                    · <strong className="text-slate-800 dark:text-slate-200">Conducta evaluada:</strong> {question.subtema}
                  </>
                ) : null}
              </p>
            )}
            {question.norma && (
              <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Scale className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                <span>
                  {question.norma}
                  {question.articulos?.length ? `, ${question.articulos.join('; ')}` : ''}
                </span>
              </p>
            )}
            {!sjt && question.opciones.some((o) => o.explicacion) && (
              <details className="group rounded-xl bg-white/70 dark:bg-slate-900/50 px-4 py-3 text-sm">
                <summary className="cursor-pointer font-semibold text-brand-700 dark:text-brand-300">Por qué cada opción es correcta o incorrecta</summary>
                <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                  {question.opciones.map((o) => (
                    <li key={o.id} className="leading-relaxed">
                      <strong>{o.id}.</strong> {o.explicacion}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="pt-3 border-t border-slate-900/10 dark:border-white/10">
              <ReportQuestion key={String(question.id)} questionId={question.id} />
            </div>
          </section>
        )}
      </article>

      {/* Acciones: fijas abajo en el celular para no tener que bajar a buscarlas */}
      <div className="fixed sm:static inset-x-0 bottom-0 z-30 border-t border-slate-200 dark:border-slate-800 sm:border-0 bg-white/95 dark:bg-slate-950/95 sm:bg-transparent sm:dark:bg-transparent backdrop-blur sm:backdrop-blur-none px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-0 sm:mt-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden /> Anterior
          </button>
          <p className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <Keyboard className="w-3.5 h-3.5" aria-hidden /> {answered ? 'Enter para seguir' : 'Teclas A–D para responder'}
          </p>
          <button
            type="button"
            onClick={isLast ? handleFinish : handleNext}
            disabled={!answered}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed ${
              isLast ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-700 hover:bg-brand-800'
            }`}
          >
            {isLast ? 'Ver resultado' : 'Siguiente'} <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
