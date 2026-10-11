'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { CheckCircle, ArrowLeft, ChevronRight, Sparkles, Award, FlaskConical, Scale, Users, Lightbulb } from 'lucide-react'
import { AREAS_FUNCIONALES, NIVELES, isJuicioSituacional, sectionOf, type AreaId, type NivelId, type Question, type SectionId } from '@/lib/question-types'
import ReportQuestion from './ReportQuestion'
import QuestionText from './QuestionText'
import SimulacroSession, { clearSimulacroState, loadSimulacroState, type SimulacroState } from './SimulacroSession'
import StudyHome, { type ModuleStat } from './StudyHome'
import { clock, saveProgress, sendAttempt, type StudyMode } from './attempts'
import { MINUTOS_POR_PREGUNTA, ORDEN_SECCIONES, PESO_CON_AREA, PESO_SIN_AREA } from './simulacro-config'

export type { Question } from '@/lib/question-types'

type QuestionId = Question['id']

const NIVEL_STORAGE_KEY = 'simo_nivel'
const AREA_STORAGE_KEY = 'simo_area'
const PROGRESS_STORAGE_KEY = 'simo_study_progress'
const AJUSTE_LABEL = ['No alineada', 'Ajuste bajo', 'Ajuste medio', 'Ajuste alto']
// Nombre de la sesión que practica solo lo que se respondió mal
const REPASO = 'Repaso de errores'

function readSavedNivel(): NivelId | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(NIVEL_STORAGE_KEY)
    return NIVELES.some((n) => n.id === saved) ? (saved as NivelId) : null
  } catch {
    return null
  }
}

function readSavedArea(): AreaId | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(AREA_STORAGE_KEY)
    return AREAS_FUNCIONALES.some((a) => a.id === saved) ? (saved as AreaId) : null
  } catch {
    return null
  }
}

function readLocalProgress(): ProgressData {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

// Las comportamentales de un nivel solo se muestran a quien eligió ese nivel; el resto aplica a todos
function appliesToNivel(q: Question, nivel: NivelId | null) {
  if (!q.nivel || q.nivel.includes('todos')) return true
  return nivel !== null && q.nivel.includes(nivel)
}

const nivelLabel = (id: string) => NIVELES.find((n) => n.id === id)?.label ?? id

// Pantalla para elegir el nivel antes de abrir un módulo que depende de él
function NivelPicker({ nivel, onChoose }: { nivel: NivelId | null; onChoose: (n: NivelId) => void }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-5 max-w-2xl">
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <Users className="w-5 h-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">¿A qué nivel de cargo te presentas?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Las situaciones comportamentales cambian según las competencias de cada nivel (Decreto 815 de 2018). Puedes cambiarlo cuando quieras.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {NIVELES.map((n) => (
          <button
            key={n.id}
            type="button"
            aria-pressed={nivel === n.id}
            onClick={() => onChoose(n.id)}
            className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              nivel === n.id
                ? 'bg-brand-700 border-brand-700 text-white'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Las claves son los ids como texto ("34" o "TC-909-001")
interface ProgressData {
  [questionId: string]: 'correct' | 'incorrect'
}

// Registra una respuesta del modo estudio con el tiempo desde que se mostró la pregunta
function logAttempt(questionId: QuestionId, selected: string, shownAt: number, mode: StudyMode) {
  sendAttempt(questionId, selected, clock() - shownAt, mode)
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Orden de práctica: primero lo que no se ha visto, luego lo que se falló y al final lo acertado
function practiceOrder(qs: Question[], progress: ProgressData): Question[] {
  const rank = (q: Question) => (progress[String(q.id)] === undefined ? 0 : progress[String(q.id)] === 'incorrect' ? 1 : 2)
  return shuffle(qs).sort((a, b) => rank(a) - rank(b))
}

// Arma el simulacro por secciones (generales, aptitudes y comportamentales), solo con preguntas aptas
function buildSimulacro(allPool: Question[], n: number, area: AreaId | null): Question[] {
  const areaModulo = AREAS_FUNCIONALES.find((a) => a.id === area)?.modulo
  // Las funcionales solo entran si son del área elegida
  const pool = allPool.filter((q) => sectionOf(q.modulo) !== 'funcionales' || q.modulo === areaModulo)
  const pesos = areaModulo ? PESO_CON_AREA : PESO_SIN_AREA
  const bySection = Object.fromEntries(ORDEN_SECCIONES.map((s) => [s, shuffle(pool.filter((q) => sectionOf(q.modulo) === s))])) as Record<SectionId, Question[]>
  const picked: Question[] = []
  ORDEN_SECCIONES.forEach((s) => {
    picked.push(...bySection[s].slice(0, Math.round(n * pesos[s])))
  })
  // Si a una sección le faltan preguntas, se completa con las de las demás
  if (picked.length < n) {
    const used = new Set(picked)
    picked.push(...shuffle(pool.filter((q) => !used.has(q))).slice(0, n - picked.length))
  }
  return picked.slice(0, n).sort((a, b) => ORDEN_SECCIONES.indexOf(sectionOf(a.modulo)) - ORDEN_SECCIONES.indexOf(sectionOf(b.modulo)))
}

export default function StudyApp({ questions, userName }: { questions: Question[]; userName?: string | null }) {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeModuleQuestions, setActiveModuleQuestions] = useState<Question[]>([])
  // Simulacro en curso (preguntas + estado) y simulacro guardado que se puede retomar
  const [simulacro, setSimulacro] = useState<{ questions: Question[]; state: SimulacroState } | null>(null)
  const [savedSimulacro, setSavedSimulacro] = useState<SimulacroState | null>(loadSimulacroState)
  const [progress, setProgress] = useState<ProgressData>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [nivel, setNivel] = useState<NivelId | null>(readSavedNivel)
  const [area, setArea] = useState<AreaId | null>(readSavedArea)
  // Módulo que se abrirá cuando el usuario elija su nivel
  const [pendingModule, setPendingModule] = useState<string | null>(null)

  const visibleQuestions = useMemo(() => questions.filter((q) => appliesToNivel(q, nivel)), [questions, nivel])

  // Carga el progreso de la base de datos; si está vacía o no responde, usa el guardado en el navegador
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/progress')
        const data = res.ok ? (await res.json()).data : null
        if (data && Object.keys(data).length > 0) {
          setProgress(data)
          localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data))
        } else {
          setProgress(readLocalProgress())
        }
      } catch (e) {
        console.error('Error fetching progress:', e)
        setProgress(readLocalProgress())
      } finally {
        setIsLoaded(true)
      }
    }
    fetchProgress()
  }, [])

  // Save progress locally (syncing to DB happens at the end of session)
  const handleSaveProgress = (questionId: QuestionId, status: 'correct' | 'incorrect') => {
    handleSaveProgressBatch({ [String(questionId)]: status })
  }

  const handleSaveProgressBatch = (entries: ProgressData) => {
    setProgress((prev) => {
      const next = { ...prev, ...entries }
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Avance por módulo (solo con las preguntas que el usuario puede practicar)
  const modulesStats: ModuleStat[] = useMemo(() => {
    const stats: Record<string, { total: number; correct: number; incorrect: number }> = {}
    visibleQuestions.forEach((q) => {
      const m = (stats[q.modulo] ??= { total: 0, correct: 0, incorrect: 0 })
      m.total += 1
      const status = progress[String(q.id)]
      if (status === 'correct') m.correct += 1
      if (status === 'incorrect') m.incorrect += 1
    })
    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      progress: Math.round(((data.correct + data.incorrect) / data.total) * 100) || 0,
    }))
  }, [visibleQuestions, progress])

  // Total user progress metrics (solo sobre las preguntas que el usuario puede practicar hoy)
  const totalStats = useMemo(() => {
    const total = visibleQuestions.length
    let correct = 0
    let incorrect = 0
    visibleQuestions.forEach((q) => {
      const status = progress[String(q.id)]
      if (status === 'correct') correct++
      if (status === 'incorrect') incorrect++
    })
    const completed = correct + incorrect
    const percent = Math.round((completed / total) * 100) || 0
    return { total, correct, incorrect, completed, percent }
  }, [visibleQuestions, progress])

  if (!isLoaded) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Cargando tu progreso">
        <div className="h-9 w-56 rounded-lg bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-3xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
      </div>
    )
  }

  // Solo entran al simulacro las preguntas verificadas o conservadas (no las de concepto básico)
  const simulacroPool = visibleQuestions.filter((q) => !q.fundamentos)

  const startSimulacro = (n: number) => {
    const picked = buildSimulacro(simulacroPool, n, area)
    const state: SimulacroState = {
      ids: picked.map((q) => String(q.id)),
      answers: {},
      flags: {},
      timeSpent: {},
      current: 0,
      startedAt: clock(),
      durationMs: picked.length * MINUTOS_POR_PREGUNTA * 60 * 1000,
    }
    clearSimulacroState()
    setSavedSimulacro(null)
    setSimulacro({ questions: picked, state })
  }

  // Retoma el simulacro guardado; si alguna pregunta ya no existe, se descarta
  const resumeSimulacro = () => {
    if (!savedSimulacro) return
    const byId = new Map(questions.map((q) => [String(q.id), q]))
    const qs = savedSimulacro.ids.map((id) => byId.get(id))
    if (qs.some((q) => !q)) {
      clearSimulacroState()
      setSavedSimulacro(null)
      return
    }
    setSimulacro({ questions: qs as Question[], state: savedSimulacro })
  }

  const discardSimulacro = () => {
    clearSimulacroState()
    setSavedSimulacro(null)
  }

  if (simulacro) {
    return (
      <SimulacroSession
        key={simulacro.state.startedAt}
        questions={simulacro.questions}
        initialState={simulacro.state}
        onSaveProgress={handleSaveProgressBatch}
        onExit={() => {
          setSimulacro(null)
          setSavedSimulacro(loadSimulacroState())
        }}
      />
    )
  }

  const startModule = (modName: string, nivelForSession: NivelId | null = nivel) => {
    // Los módulos con preguntas por nivel piden el nivel antes de empezar
    const hasNivelQuestions = questions.some((q) => q.modulo === modName && q.nivel && !q.nivel.includes('todos'))
    if (hasNivelQuestions && !nivelForSession) {
      setPendingModule(modName)
      return
    }
    const modQs = questions.filter((q) => q.modulo === modName && appliesToNivel(q, nivelForSession))
    setActiveModuleQuestions(practiceOrder(modQs, progress))
    setActiveModule(modName)
  }

  // Practica solo las preguntas que se respondieron mal
  const startReview = () => {
    const wrong = visibleQuestions.filter((q) => progress[String(q.id)] === 'incorrect')
    if (!wrong.length) return
    setActiveModuleQuestions(shuffle(wrong))
    setActiveModule(REPASO)
  }

  const chooseArea = (a: AreaId | null) => {
    setArea(a)
    try {
      if (a) localStorage.setItem(AREA_STORAGE_KEY, a)
      else localStorage.removeItem(AREA_STORAGE_KEY)
    } catch {}
  }

  const chooseNivel = (n: NivelId) => {
    setNivel(n)
    try {
      localStorage.setItem(NIVEL_STORAGE_KEY, n)
    } catch {}
    if (pendingModule) {
      const modName = pendingModule
      setPendingModule(null)
      startModule(modName, n)
    }
  }

  if (pendingModule) {
    return (
      <div className="space-y-6 animate-enter">
        <button
          onClick={() => setPendingModule(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </button>
        <NivelPicker nivel={nivel} onChoose={chooseNivel} />
      </div>
    )
  }

  if (activeModule) {
    return (
      <StudySession
        moduleName={activeModule}
        mode="modulo"
        questions={activeModuleQuestions}
        progress={progress}
        onSaveProgress={handleSaveProgress}
        onBack={() => setActiveModule(null)}
      />
    )
  }

  return (
    <StudyHome
      userName={userName}
      totalStats={totalStats}
      modulesStats={modulesStats}
      nivel={nivel}
      area={area}
      onChooseNivel={chooseNivel}
      onChooseArea={chooseArea}
      savedSimulacro={savedSimulacro}
      onResumeSimulacro={resumeSimulacro}
      onDiscardSimulacro={discardSimulacro}
      simulacroPoolSize={simulacroPool.length}
      onStartSimulacro={startSimulacro}
      onStartModule={(name) => startModule(name)}
      onReviewErrors={startReview}
    />
  )
}

// Sub-component for the actual study session
function StudySession({
  moduleName,
  mode,
  questions,
  progress,
  onSaveProgress,
  onBack
}: {
  moduleName: string,
  mode: 'modulo' | 'simulacro',
  questions: Question[],
  progress: ProgressData,
  onSaveProgress: (id: QuestionId, status: 'correct'|'incorrect') => void,
  onBack: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  // Respuesta dada en cada pregunta de la sesión: al volver con "Anterior" se ve la misma respuesta, sin poder cambiarla
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [sessionProgress, setSessionProgress] = useState<Record<string, 'correct'|'incorrect'>>({})
  // Puntaje de ajuste (0 a 3) de cada pregunta comportamental respondida en esta sesión
  const [sessionAjuste, setSessionAjuste] = useState<Record<string, number>>({})
  // Momento en que se mostró la pregunta actual, para medir cuánto tarda el usuario en responder
  const shownAtRef = useRef(0)
  useEffect(() => {
    shownAtRef.current = clock()
  }, [currentIndex])

  const question = questions[currentIndex]
  const selectedOption = answers[currentIndex] ?? null
  const showExplanation = selectedOption !== null

  // Lo respondido que aún no se ha guardado en la base de datos
  const pendingSyncRef = useRef<Record<string, 'correct'|'incorrect'>>({})
  const syncProgress = () => {
    saveProgress(pendingSyncRef.current)
    pendingSyncRef.current = {}
  }

  const handleFinish = () => {
    setIsFinished(true)
    syncProgress()
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

  // Al salir del módulo también se guarda lo respondido, aunque no se haya terminado
  const handleBack = () => {
    syncProgress()
    onBack()
  }

  if (!question && !isFinished) return null;

  if (isFinished) {
    const correctCount = Object.values(sessionProgress).filter(v => v === 'correct').length
    const totalAnswered = Object.keys(sessionProgress).length
    const score = Math.round((correctCount / questions.length) * 100) || 0
    const ajustes = Object.values(sessionAjuste)
    const ajustePromedio = ajustes.length ? Math.round((ajustes.reduce((a, b) => a + b, 0) / (ajustes.length * 3)) * 100) : null

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
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">¡Módulo terminado!</h2>
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

          {ajustePromedio !== null && (
            <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              En las {ajustes.length} situaciones comportamentales, tu ajuste promedio a la conducta esperada fue de <strong>{ajustePromedio}%</strong>.
              En estas preguntas &quot;correcta&quot; significa que elegiste la mejor opción.
            </p>
          )}

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

    setAnswers(prev => ({ ...prev, [currentIndex]: optionId }))

    const status: 'correct' | 'incorrect' = optionId === question.respuestaCorrecta ? 'correct' : 'incorrect'
    logAttempt(question.id, optionId, shownAtRef.current, mode)
    onSaveProgress(question.id, status)
    pendingSyncRef.current[String(question.id)] = status
    setSessionProgress(prev => ({ ...prev, [String(question.id)]: status }))
    if (isJuicioSituacional(question)) {
      const puntaje = question.opciones.find(o => o.id === optionId)?.puntaje ?? 0
      setSessionAjuste(prev => ({ ...prev, [String(question.id)]: puntaje }))
    }
  }

  // En juicio situacional no hay "incorrecta": cada opción tiene un ajuste de 0 a 3
  const sjt = isJuicioSituacional(question)
  const chosenPuntaje = sjt ? question.opciones.find(o => o.id === selectedOption)?.puntaje ?? null : null

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1)
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-6">
      <button
        onClick={handleBack}
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
            {question.fundamentos && (
              <span
                title="Pregunta de concepto básico: sirve para repasar definiciones. No entra al simulacro tipo examen."
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300"
              >
                <Lightbulb className="w-3.5 h-3.5" /> Concepto básico
              </span>
            )}
            {question.estado === 'beta' && (
              <span
                title="Pregunta nueva: ya pasó la revisión automática y a ciegas, y estamos validándola con las respuestas de los usuarios."
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300"
              >
                <FlaskConical className="w-3.5 h-3.5" /> Nueva · en validación
              </span>
            )}
            {sjt && question.nivel && !question.nivel.includes('todos') && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300">
                Nivel {question.nivel.map(nivelLabel).join(', ')}
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-slate-400 dark:text-slate-500">
            Pregunta {currentIndex + 1} de {questions.length}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6 sm:p-10 space-y-8">
          <QuestionText text={question.pregunta} />

          <div className="space-y-4">
            {question.opciones.map(opt => {
              const isSelected = selectedOption === opt.id
              const isCorrectAnswer = opt.id === question.respuestaCorrecta
              const isWrongSelection = isSelected && !isCorrectAnswer
              const showAsCorrect = showExplanation && isCorrectAnswer
              // En juicio situacional una elección con ajuste parcial (1 o 2) se marca en ámbar, no en rojo
              const isPartialSelection = sjt && isWrongSelection && (opt.puntaje ?? 0) > 0

              let baseClass = "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 "

              if (!showExplanation) {
                baseClass += "border-slate-200/80 dark:border-slate-850 hover:border-indigo-500/50 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 cursor-pointer"
              } else if (showAsCorrect) {
                baseClass += "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 font-semibold"
              } else if (isPartialSelection) {
                baseClass += "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-100 font-semibold"
              } else if (isWrongSelection) {
                baseClass += "border-red-500 bg-red-500/10 text-red-950 dark:text-red-100 font-semibold"
              } else if (sjt) {
                baseClass += "border-slate-200/80 dark:border-slate-800 opacity-80"
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
                    isPartialSelection ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20' :
                    isWrongSelection ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-500/20' :
                    'border-slate-300 dark:border-slate-700 text-slate-500'
                  }`}>
                    {opt.id}
                  </div>
                  <span className="pt-0.5 space-y-1.5">
                    <span className="block text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-snug">{opt.texto}</span>
                    {showExplanation && sjt && typeof opt.puntaje === 'number' && (
                      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {AJUSTE_LABEL[opt.puntaje]} · {opt.puntaje}/3
                      </span>
                    )}
                    {showExplanation && opt.explicacion && (sjt || showAsCorrect || isWrongSelection) && (
                      <span className="block text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-400 leading-relaxed">{opt.explicacion}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Explanation Area */}
          {showExplanation && (
            <div className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-sm">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>
                  {sjt && chosenPuntaje !== null
                    ? `TU RESPUESTA: ${AJUSTE_LABEL[chosenPuntaje].toUpperCase()} (${chosenPuntaje}/3)`
                    : 'EXPLICACIÓN IA EXPERTA'}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {question.explicacionIA}
              </p>
              {sjt && question.competencia && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <strong>Competencia:</strong> {question.competencia}
                  {question.subtema ? <> · <strong>Conducta evaluada:</strong> {question.subtema}</> : null}
                </p>
              )}
              {question.norma && (
                <p className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <Scale className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Fundamento: {question.norma}{question.articulos?.length ? `, ${question.articulos.join('; ')}` : ''}</span>
                </p>
              )}
              {!sjt && question.opciones.some((o) => o.explicacion) && (
                <details className="text-sm text-slate-700 dark:text-slate-300">
                  <summary className="cursor-pointer font-bold text-indigo-700 dark:text-indigo-300">Ver por qué cada opción es correcta o incorrecta</summary>
                  <ul className="mt-3 space-y-2">
                    {question.opciones.map((o) => (
                      <li key={o.id} className="leading-relaxed">
                        <strong>{o.id}.</strong> {o.explicacion}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {showExplanation && <ReportQuestion key={String(question.id)} questionId={question.id} />}
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
