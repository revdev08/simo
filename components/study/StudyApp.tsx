'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Users } from 'lucide-react'
import { AREAS_FUNCIONALES, NIVELES, sectionOf, type AreaId, type NivelId, type Question, type SectionId } from '@/lib/question-types'
import SimulacroSession, { clearSimulacroState, loadSimulacroState, type SimulacroState } from './SimulacroSession'
import StudyHome, { type ModuleStat } from './StudyHome'
import StudySession from './StudySession'
import { clock } from './attempts'
import { MINUTOS_POR_PREGUNTA, ORDEN_SECCIONES, PESO_CON_AREA, PESO_SIN_AREA } from './simulacro-config'

export type { Question } from '@/lib/question-types'

type QuestionId = Question['id']

const NIVEL_STORAGE_KEY = 'simo_nivel'
const AREA_STORAGE_KEY = 'simo_area'
const PROGRESS_STORAGE_KEY = 'simo_study_progress'
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
  // Cambia en cada sesión nueva para que empiece desde cero (por ejemplo, al repasar lo fallado)
  const [sessionKey, setSessionKey] = useState(0)
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

  // Carga el progreso de la base de datos; si está vacía o no responde, usa el guardado en el navegador.
  // Si la URL pide una práctica (desde "Mi progreso": ?modulo=… o ?practicar=errores), la abre al cargar.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pedidoModulo = params.get('modulo')
    const pedidoErrores = params.get('practicar') === 'errores'

    const abrirPedido = (loaded: ProgressData) => {
      if (!pedidoModulo && !pedidoErrores) return
      window.history.replaceState(null, '', window.location.pathname)
      const savedNivel = readSavedNivel()
      if (pedidoErrores) {
        const wrong = questions.filter((q) => appliesToNivel(q, savedNivel) && loaded[String(q.id)] === 'incorrect')
        if (!wrong.length) return
        setActiveModuleQuestions(shuffle(wrong))
        setActiveModule(REPASO)
      } else if (pedidoModulo) {
        const needsNivel = questions.some((q) => q.modulo === pedidoModulo && q.nivel && !q.nivel.includes('todos'))
        if (needsNivel && !savedNivel) {
          setPendingModule(pedidoModulo)
          return
        }
        const modQs = questions.filter((q) => q.modulo === pedidoModulo && appliesToNivel(q, savedNivel))
        if (!modQs.length) return
        setActiveModuleQuestions(practiceOrder(modQs, loaded))
        setActiveModule(pedidoModulo)
      }
      setSessionKey((k) => k + 1)
    }

    const fetchProgress = async () => {
      let loaded: ProgressData
      try {
        const res = await fetch('/api/progress')
        const data = res.ok ? (await res.json()).data : null
        if (data && Object.keys(data).length > 0) {
          loaded = data
          localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data))
        } else {
          loaded = readLocalProgress()
        }
      } catch (e) {
        console.error('Error fetching progress:', e)
        loaded = readLocalProgress()
      }
      setProgress(loaded)
      abrirPedido(loaded)
      setIsLoaded(true)
    }
    fetchProgress()
  }, [questions])

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


  const openSession = (name: string, qs: Question[]) => {
    setActiveModuleQuestions(qs)
    setActiveModule(name)
    setSessionKey((k) => k + 1)
  }

  const startModule = (modName: string, nivelForSession: NivelId | null = nivel) => {
    // Los módulos con preguntas por nivel piden el nivel antes de empezar
    const hasNivelQuestions = questions.some((q) => q.modulo === modName && q.nivel && !q.nivel.includes('todos'))
    if (hasNivelQuestions && !nivelForSession) {
      setPendingModule(modName)
      return
    }
    const modQs = questions.filter((q) => q.modulo === modName && appliesToNivel(q, nivelForSession))
    openSession(modName, practiceOrder(modQs, progress))
  }

  // Practica solo las preguntas que se respondieron mal
  const startReview = () => {
    const wrong = visibleQuestions.filter((q) => progress[String(q.id)] === 'incorrect')
    if (!wrong.length) return
    openSession(REPASO, shuffle(wrong))
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
        onRetryWrong={(wrong) => {
          setSimulacro(null)
          setSavedSimulacro(loadSimulacroState())
          openSession(REPASO, shuffle(wrong))
        }}
        onPracticeModule={(modulo) => {
          setSimulacro(null)
          setSavedSimulacro(loadSimulacroState())
          startModule(modulo)
        }}
      />
    )
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
        key={sessionKey}
        moduleName={activeModule}
        questions={activeModuleQuestions}
        onSaveProgress={handleSaveProgress}
        onBack={() => setActiveModule(null)}
        onRetry={(wrong) => openSession(REPASO, shuffle(wrong))}
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
