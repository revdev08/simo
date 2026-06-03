'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import questionsData from './questions.json'

interface Question {
  id: number
  modulo: string
  tema: string
  dificultad: string
  pregunta: string
  opciones: { id: string; texto: string }[]
  respuestaCorrecta: string
  explicacionIA: string
}

const QUESTIONS = questionsData as Question[]

type AnswerMap = Record<number, string>

export default function SimulacroGratisPage() {
  const { openSignUp, signOut } = useClerk()
  const { isSignedIn, user } = useUser()

  const [started, setStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [finished, setFinished] = useState(false)

  const total = QUESTIONS.length
  const current = QUESTIONS[currentIdx]
  const selected = answers[current?.id]

  const score = useMemo(() => {
    return QUESTIONS.reduce((acc, q) => acc + (answers[q.id] === q.respuestaCorrecta ? 1 : 0), 0)
  }, [answers])

  const percent = Math.round((score / total) * 100)

  const handleSelect = (optionId: string) => {
    if (showFeedback) return
    setAnswers((prev) => ({ ...prev, [current.id]: optionId }))
  }

  const handleSubmit = () => {
    if (!selected) return
    setShowFeedback(true)
  }

  const handleNext = () => {
    setShowFeedback(false)
    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1)
    } else {
      setFinished(true)
    }
  }

  const handlePrev = () => {
    if (currentIdx === 0) return
    setShowFeedback(true)
    setCurrentIdx((i) => i - 1)
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setAnswers({})
    setShowFeedback(false)
    setFinished(false)
    setStarted(true)
  }

  const handleSignUp = () => openSignUp({ forceRedirectUrl: '/dashboard' })

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans dark:bg-slate-950 dark:text-slate-50 selection:bg-blue-500 selection:text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="SIMO TEST" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200">
                SIMO TEST
              </span>
            </Link>

            <div className="flex items-center gap-2.5 sm:gap-5">
              <ThemeToggle />
              {!isSignedIn ? (
                <button
                  onClick={handleSignUp}
                  className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg shadow-blue-600/20 transition-all hover:scale-105 cursor-pointer"
                >
                  Registrarse Gratis
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:inline-block bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>
                  <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors">
                    <LayoutDashboard className="w-4 h-4 hidden sm:block" /> Panel
                  </Link>
                  <button onClick={() => signOut()} className="text-slate-400 hover:text-red-500 p-2 transition-colors rounded-lg">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-start justify-center px-4 py-8 sm:py-14 relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-3xl">
          {/* INTRO */}
          {!started && !finished && (
            <div className="text-center space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider animate-pulse-subtle">
                <Sparkles className="w-3.5 h-3.5" /> Simulacro gratis · Sin registro
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                Mide tu nivel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">en 10 preguntas</span>
              </h1>

              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                Preguntas reales del tipo CNSC. Recibe explicación instantánea de cada respuesta. Sin pagar nada, sin tarjeta.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-4">
                {[
                  { value: '10', label: 'Preguntas' },
                  { value: '~8 min', label: 'Duración' },
                  { value: 'IA', label: 'Explicaciones' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 backdrop-blur">
                    <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                      {s.value}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setStarted(true)}
                  className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-full transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer btn-shimmer group"
                >
                  Comenzar simulacro <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="pt-6 flex flex-wrap justify-center items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sin registro</span>
                <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-blue-500" /> Explicación IA</span>
                <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-500" /> Resultado al final</span>
              </div>
            </div>
          )}

          {/* QUIZ */}
          {started && !finished && current && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Pregunta {currentIdx + 1} de {total}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${difficultyColor(current.dificultad)}`}>
                    {current.dificultad}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                    style={{ width: `${((currentIdx + (showFeedback ? 1 : 0)) / total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
                {/* Module + topic */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                    {current.modulo}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    · {current.tema}
                  </span>
                </div>

                {/* Question */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed mb-7">
                  {current.pregunta}
                </h2>

                {/* Options */}
                <div className="space-y-3">
                  {current.opciones.map((opt) => {
                    const isSelected = selected === opt.id
                    const isCorrect = opt.id === current.respuestaCorrecta
                    const reveal = showFeedback

                    let stateClasses = ''
                    if (reveal) {
                      if (isCorrect) stateClasses = 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                      else if (isSelected) stateClasses = 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                      else stateClasses = 'border-slate-200 dark:border-slate-800 opacity-50'
                    } else if (isSelected) {
                      stateClasses = 'border-blue-500 bg-blue-500/10 text-slate-900 dark:text-white'
                    } else {
                      stateClasses = 'border-slate-200 dark:border-slate-800 hover:border-blue-500/40 hover:bg-blue-500/5 cursor-pointer'
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        disabled={reveal}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${stateClasses}`}
                      >
                        <span
                          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-extrabold ${
                            reveal && isCorrect
                              ? 'bg-emerald-500 text-white'
                              : reveal && isSelected
                                ? 'bg-rose-500 text-white'
                                : isSelected
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {reveal && isCorrect ? <CheckCircle2 className="w-4 h-4" /> : reveal && isSelected ? <XCircle className="w-4 h-4" /> : opt.id}
                        </span>
                        <span className="text-sm sm:text-[15px] leading-relaxed font-medium pt-0.5">
                          {opt.texto}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* AI Explanation */}
                {showFeedback && (
                  <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 animate-in fade-in slide-in-from-top-2 duration-400">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1.5">
                          Explicación IA
                        </div>
                        <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
                          {current.explicacionIA}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </button>

                {!showFeedback ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!selected}
                    className={`px-7 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                      selected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105 cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Confirmar respuesta <Zap className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-7 py-3 rounded-full text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    {currentIdx < total - 1 ? 'Siguiente' : 'Ver resultado'} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {finished && (
            <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${resultColor(percent).bg} text-white shadow-2xl ${resultColor(percent).shadow}`}>
                  <Trophy className="w-10 h-10" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {resultColor(percent).headline}
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">
                  Acertaste <strong className="text-slate-900 dark:text-white">{score} de {total}</strong> preguntas
                </p>
              </div>

              {/* Big score */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center">
                <div className={`text-7xl sm:text-8xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br ${resultColor(percent).gradient}`}>
                  {percent}%
                </div>
                <div className="mt-4 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${resultColor(percent).bar} transition-all duration-1000 ease-out`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="mt-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                  {resultColor(percent).message}
                </p>
              </div>

              {/* CTA */}
              <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-7 sm:p-9 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[10px] font-extrabold uppercase tracking-widest mb-4">
                    <Sparkles className="w-3 h-3" /> El siguiente paso
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
                    ¿Quieres practicar con simulacros ilimitados?
                  </h2>
                  <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-6">
                    Acceso a cientos de preguntas reales tipo CNSC, explicación IA en cada error y estadísticas de tu progreso por competencia.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!isSignedIn ? (
                      <button
                        onClick={handleSignUp}
                        className="px-6 py-3.5 rounded-full bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Crear cuenta gratis <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <Link
                        href="/dashboard"
                        className="px-6 py-3.5 rounded-full bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        Ir al panel <LayoutDashboard className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href="/#planes"
                      className="px-6 py-3.5 rounded-full bg-white/15 backdrop-blur text-white font-bold text-sm hover:bg-white/25 transition-colors flex items-center justify-center gap-2"
                    >
                      Ver planes
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Repetir simulacro
                </button>
                <Link
                  href="/guia"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                >
                  <Clock className="w-4 h-4" /> Leer la guía
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-950 text-white border-t border-slate-900 py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_90%,#1e293b_0%,transparent_100%)] opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SIMO TEST" className="w-7 h-7 object-contain" />
            <span className="font-extrabold text-white">SIMO TEST</span>
          </div>
          <p>© {new Date().getFullYear()} SIMO TEST. Preparación autónoma e independiente.</p>
        </div>
      </footer>
    </div>
  )
}

function difficultyColor(d: string) {
  switch (d.toLowerCase()) {
    case 'baja':
    case 'fácil':
    case 'facil':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 'alta':
    case 'difícil':
    case 'dificil':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
    default:
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  }
}

function resultColor(p: number) {
  if (p >= 80) {
    return {
      bg: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/30',
      headline: '¡Excelente!',
      gradient: 'from-emerald-500 to-teal-500',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      message: 'Estás en el rango de puntaje que históricamente gana plazas. Con preparación continua, tu probabilidad de pasar el examen real es alta.',
    }
  }
  if (p >= 60) {
    return {
      bg: 'bg-blue-500',
      shadow: 'shadow-blue-500/30',
      headline: '¡Buen punto de partida!',
      gradient: 'from-blue-500 to-indigo-600',
      bar: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      message: 'Tu base es sólida. Con simulacros constantes y retroalimentación dirigida puedes llegar al rango ganador en pocas semanas.',
    }
  }
  if (p >= 40) {
    return {
      bg: 'bg-amber-500',
      shadow: 'shadow-amber-500/30',
      headline: 'Hay camino por recorrer',
      gradient: 'from-amber-500 to-orange-500',
      bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
      message: 'Estás identificando tus vacíos: ese es el primer paso. Una preparación enfocada en los temas que más fallaste te puede subir 30 puntos en un mes.',
    }
  }
  return {
    bg: 'bg-rose-500',
    shadow: 'shadow-rose-500/30',
    headline: 'Buena noticia: empezaste',
    gradient: 'from-rose-500 to-orange-500',
    bar: 'bg-gradient-to-r from-rose-500 to-orange-500',
    message: 'Conocer dónde estás hoy es la victoria de esta sesión. Tienes margen amplio de crecimiento — empieza por la guía y luego ataca temas uno por uno.',
  }
}
