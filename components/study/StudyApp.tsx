'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { BookOpen, CheckCircle, Play, ArrowLeft, ChevronRight, Sparkles, Award, BarChart3 } from 'lucide-react'
import Link from 'next/link'
// Types
export interface Option {
  id: string
  texto: string
}

export interface Question {
  id: number
  modulo: string
  tema: string
  dificultad: string
  pregunta: string
  opciones: Option[]
  respuestaCorrecta: string
  explicacionIA: string
}

interface ProgressData {
  [questionId: number]: 'correct' | 'incorrect'
}

export default function StudyApp({ questions }: { questions: Question[] }) {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeModuleQuestions, setActiveModuleQuestions] = useState<Question[]>([])
  const [randomExamMode, setRandomExamMode] = useState<{ active: boolean, limit: number } | null>(null)
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([])
  const [progress, setProgress] = useState<ProgressData>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load progress from DB on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/progress')
        if (res.ok) {
          const { data } = await res.json()
          if (data && Object.keys(data).length > 0) {
            setProgress(data)
            localStorage.setItem('simo_study_progress', JSON.stringify(data))
          } else {
            // Fallback to local storage if DB is empty
            const saved = localStorage.getItem('simo_study_progress')
            if (saved) {
              setProgress(JSON.parse(saved))
            }
          }
        }
      } catch (e) {
        console.error('Error fetching progress:', e)
      } finally {
        setIsLoaded(true)
      }
    }
    fetchProgress()
  }, [])

  // Save progress locally (syncing to DB happens at the end of session)
  const handleSaveProgress = (questionId: number, status: 'correct' | 'incorrect') => {
    const newProgress = { ...progress, [questionId]: status }
    setProgress(newProgress)
    localStorage.setItem('simo_study_progress', JSON.stringify(newProgress))
  }

  // Compute modules and stats
  const modulesStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number; incorrect: number }> = {}
    
    questions.forEach(q => {
      if (!stats[q.modulo]) {
        stats[q.modulo] = { total: 0, correct: 0, incorrect: 0 }
      }
      stats[q.modulo].total += 1
      
      const status = progress[q.id]
      if (status === 'correct') stats[q.modulo].correct += 1
      if (status === 'incorrect') stats[q.modulo].incorrect += 1
    })

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      progress: Math.round(((data.correct + data.incorrect) / data.total) * 100) || 0
    }))
  }, [questions, progress])

  // Total user progress metrics
  const totalStats = useMemo(() => {
    const total = questions.length
    let correct = 0
    let incorrect = 0
    Object.keys(progress).forEach(k => {
      const status = progress[Number(k)]
      if (status === 'correct') correct++
      if (status === 'incorrect') incorrect++
    })
    const completed = correct + incorrect
    const percent = Math.round((completed / total) * 100) || 0
    return { total, correct, incorrect, completed, percent }
  }, [questions, progress])

  if (!isLoaded) return <div className="p-8 text-center text-slate-500 animate-pulse font-semibold">Cargando tu progreso...</div>

  const startRandomExam = (limit: number) => {
    // Select random questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    setRandomQuestions(shuffled.slice(0, limit))
    setRandomExamMode({ active: true, limit })
  }

  if (randomExamMode?.active) {
    return (
      <StudySession 
        moduleName={`Simulacro Global Aleatorio (${randomExamMode.limit} Preguntas)`} 
        questions={randomQuestions} 
        progress={progress}
        onSaveProgress={handleSaveProgress}
        onBack={() => setRandomExamMode(null)} 
      />
    )
  }

  const startModule = (modName: string) => {
    const modQs = questions.filter(q => q.modulo === modName)
    const shuffled = [...modQs].sort(() => 0.5 - Math.random())
    setActiveModuleQuestions(shuffled)
    setActiveModule(modName)
  }

  if (activeModule) {
    return (
      <StudySession 
        moduleName={activeModule} 
        questions={activeModuleQuestions} 
        progress={progress}
        onSaveProgress={handleSaveProgress}
        onBack={() => setActiveModule(null)} 
      />
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* General Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Progreso Total</span>
            <div className="text-3xl font-black">{totalStats.percent}%</div>
            <p className="text-xs text-blue-100">{totalStats.completed} respondidas sobre el total</p>
          </div>
          <Award className="w-10 h-10 text-blue-100/50" />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Respuestas Correctas</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalStats.correct}</div>
            <p className="text-xs text-slate-500">¡Sigue así!</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <Link href="/dashboard/report" className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-500 transition-colors">Reporte Detallado</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Ver Estadísticas</div>
            <p className="text-xs text-slate-500">Analiza tus puntos débiles</p>
          </div>
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/40 group-hover:bg-indigo-600 group-hover:text-white transition-colors rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Global Random Exam Banner */}
      <div className="bg-slate-950 dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden border border-slate-800/80">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full blur-[80px] opacity-30 pointer-events-none" />
        
        <div className="space-y-3 relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Nuevo Modo
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">Simulacro Global Aleatorio</h3>
          <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
            Pon a prueba tus conocimientos mezclando todas las áreas temáticas. Elige la cantidad de preguntas y prepárate para el desafío real.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto relative z-10 shrink-0">
          <button 
            onClick={() => startRandomExam(10)} 
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 px-5 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20"
          >
            <Play className="w-4 h-4 fill-white" /> 10 Preguntas
          </button>
          <button 
            onClick={() => startRandomExam(20)} 
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 px-5 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20"
          >
            <Play className="w-4 h-4 fill-white" /> 20 Preguntas
          </button>
          <button 
            onClick={() => startRandomExam(30)} 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/25 btn-shimmer"
          >
            <Play className="w-4 h-4 fill-white" /> 30 Preguntas
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3.5 mb-6">
        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Módulos de Examen Específicos</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Selecciona una de las áreas temáticas oficiales para practicar por separado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modulesStats.map(mod => (
          <div 
            key={mod.name}
            onClick={() => startModule(mod.name)}
            className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600">
                <Play className="w-4 h-4 ml-0.5 fill-indigo-600" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-12">
                {mod.name}
              </h3>
              
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                  <BookOpen className="w-4.5 h-4.5 text-slate-400"/> {mod.total} Preguntas
                </span>
                {mod.correct > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    <CheckCircle className="w-4 h-4"/> {mod.correct} correctas
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 mt-6">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-600 dark:text-indigo-400">Porcentaje completado</span>
                <span className="text-slate-600 dark:text-slate-300">{mod.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${mod.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Sub-component for the actual study session
function StudySession({ 
  moduleName, 
  questions, 
  progress, 
  onSaveProgress,
  onBack 
}: { 
  moduleName: string, 
  questions: Question[], 
  progress: ProgressData,
  onSaveProgress: (id: number, status: 'correct'|'incorrect') => void,
  onBack: () => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [sessionProgress, setSessionProgress] = useState<Record<number, 'correct'|'incorrect'>>({})
  
  const question = questions[currentIndex]

  // Track if we already synced to DB to avoid multiple requests
  const [hasSynced, setHasSynced] = useState(false)

  const handleFinish = () => {
    setIsFinished(true)
    if (!hasSynced && Object.keys(sessionProgress).length > 0) {
      setHasSynced(true)
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: sessionProgress })
      }).catch(err => console.error('Error saving progress to DB:', err))
    }
  }

  if (!question && !isFinished) return null;

  if (isFinished) {
    const correctCount = Object.values(sessionProgress).filter(v => v === 'correct').length
    const totalAnswered = Object.keys(sessionProgress).length
    const score = Math.round((correctCount / questions.length) * 100) || 0

    return (
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a módulos
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-800/80 overflow-hidden p-8 sm:p-12 text-center space-y-8">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">¡Simulacro Finalizado!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Has completado <strong>{moduleName}</strong>. Aquí tienes tu desempeño en esta sesión.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto py-6 sm:py-8">
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
              <div className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 sm:mb-2 truncate">Puntaje</div>
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">{score}%</div>
            </div>
            <div className="p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col justify-center">
              <div className="text-emerald-600 dark:text-emerald-500 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 sm:mb-2 truncate">Correctas</div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">{correctCount}</div>
            </div>
            <div className="p-4 sm:p-6 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/50 col-span-2 md:col-span-1 flex flex-col justify-center">
              <div className="text-red-600 dark:text-red-500 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1 sm:mb-2 truncate">Incorrectas</div>
              <div className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-400">{totalAnswered - correctCount}</div>
            </div>
          </div>

          <button 
            onClick={onBack}
            className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-8 py-4 rounded-xl font-extrabold shadow-xl hover:-translate-y-1 transition-all inline-flex items-center gap-2"
          >
            Volver al Inicio <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  const handleSelect = (optionId: string) => {
    if (selectedOption) return

    setSelectedOption(optionId)
    setShowExplanation(true)
    
    const isCorrect = optionId === question.respuestaCorrecta
    onSaveProgress(question.id, isCorrect ? 'correct' : 'incorrect')
    setSessionProgress(prev => ({ ...prev, [question.id]: isCorrect ? 'correct' : 'incorrect' }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowExplanation(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setSelectedOption(null)
      setShowExplanation(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a módulos
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200/60 dark:border-slate-800/80 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
              {question.tema}
            </span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
              question.dificultad === 'Alta' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
              question.dificultad === 'Baja' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
              'bg-amber-500/10 text-amber-600 border-amber-500/20'
            }`}>
              Dificultad {question.dificultad}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-slate-400 dark:text-slate-500">
            Pregunta {currentIndex + 1} de {questions.length}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6 sm:p-10 space-y-8">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {question.pregunta}
          </h3>

          <div className="space-y-4">
            {question.opciones.map(opt => {
              const isSelected = selectedOption === opt.id
              const isCorrectAnswer = opt.id === question.respuestaCorrecta
              const isWrongSelection = isSelected && !isCorrectAnswer
              const showAsCorrect = showExplanation && isCorrectAnswer

              let baseClass = "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 "
              
              if (!showExplanation) {
                baseClass += "border-slate-200/80 dark:border-slate-850 hover:border-indigo-500/50 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 cursor-pointer"
              } else if (showAsCorrect) {
                baseClass += "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-semibold"
              } else if (isWrongSelection) {
                baseClass += "border-red-500 bg-red-500/10 text-red-950 dark:text-red-100 font-semibold"
              } else {
                baseClass += "border-slate-100 dark:border-slate-900/60 bg-slate-50/50 dark:bg-slate-900/10 opacity-40"
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={baseClass}
                  disabled={showExplanation}
                >
                  <div className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all ${
                    showAsCorrect ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20' :
                    isWrongSelection ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-500/20' :
                    'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}>
                    {opt.id}
                  </div>
                  <span className="text-slate-800 dark:text-slate-200 text-sm sm:text-base pt-0.5 leading-snug">{opt.texto}</span>
                </button>
              )
            })}
          </div>

          {/* Explanation Area */}
          {showExplanation && (
            <div className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-sm">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>EXPLICACIÓN IA EXPERTA</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {question.explicacionIA}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200/50 dark:hover:bg-slate-900 rounded-xl transition-colors"
          >
            Anterior
          </button>
          
          {currentIndex < questions.length - 1 ? (
            <button 
              onClick={handleNext}
              disabled={!showExplanation}
              className="flex items-center gap-2 px-7 py-3 bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-sm font-extrabold rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              disabled={!showExplanation}
              className="flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-extrabold rounded-xl hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Finalizar <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
