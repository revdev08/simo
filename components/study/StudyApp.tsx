'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { BookOpen, CheckCircle, Play, ArrowLeft, ChevronRight, Sparkles, Award, BarChart3, FlaskConical, Scale, Users, Clock, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { MODULE_SECTIONS, NIVELES, isJuicioSituacional, sectionOf, type NivelId, type Question, type SectionId } from '@/lib/question-types'
import ReportQuestion from './ReportQuestion'
import QuestionText from './QuestionText'
import SimulacroSession, { clearSimulacroState, formatDuration, loadSimulacroState, type SimulacroState } from './SimulacroSession'
import { clock, saveProgress, sendAttempt, type StudyMode } from './attempts'

export type { Question } from '@/lib/question-types'

type QuestionId = Question['id']

const NIVEL_STORAGE_KEY = 'simo_nivel'
const AJUSTE_LABEL = ['No alineada', 'Ajuste bajo', 'Ajuste medio', 'Ajuste alto']

function readSavedNivel(): NivelId | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(NIVEL_STORAGE_KEY)
    return NIVELES.some((n) => n.id === saved) ? (saved as NivelId) : null
  } catch {
    return null
  }
}

// Las comportamentales de un nivel solo se muestran a quien eligió ese nivel; el resto aplica a todos
function appliesToNivel(q: Question, nivel: NivelId | null) {
  if (!q.nivel || q.nivel.includes('todos')) return true
  return nivel !== null && q.nivel.includes(nivel)
}

const nivelLabel = (id: string) => NIVELES.find((n) => n.id === id)?.label ?? id

function NivelPicker({ nivel, onChoose, compact = false }: { nivel: NivelId | null, onChoose: (n: NivelId) => void, compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 ${compact ? 'p-4 flex flex-wrap items-center justify-between gap-3' : 'p-6 sm:p-8 space-y-5'}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="font-extrabold text-slate-900 dark:text-white">{compact ? 'Nivel del cargo al que te presentas' : '¿A qué nivel de cargo te presentas?'}</p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Ajusta las preguntas comportamentales a las competencias de tu nivel (Decreto 815 de 2018). Puedes cambiarlo cuando quieras.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {NIVELES.map((n) => (
          <button
            key={n.id}
            type="button"
            aria-pressed={nivel === n.id}
            onClick={() => onChoose(n.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
              nivel === n.id
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500'
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

// Simulacro tipo examen: 2 minutos por pregunta y una mezcla parecida a la de las pruebas reales
const SIMULACRO_OPCIONES = [
  { n: 20, label: 'Rápido' },
  { n: 40, label: 'Estándar' },
  { n: 80, label: 'Completo' },
] as const
const MINUTOS_POR_PREGUNTA = 2
const PESO_SECCION: Record<SectionId, number> = { generales: 0.6, aptitudes: 0.15, comportamentales: 0.25 }
const ORDEN_SECCIONES: SectionId[] = ['generales', 'aptitudes', 'comportamentales']

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Arma el simulacro por secciones (generales, aptitudes y comportamentales), solo con preguntas aptas
function buildSimulacro(pool: Question[], n: number): Question[] {
  const bySection = Object.fromEntries(ORDEN_SECCIONES.map((s) => [s, shuffle(pool.filter((q) => sectionOf(q.modulo) === s))])) as Record<SectionId, Question[]>
  const picked: Question[] = []
  ORDEN_SECCIONES.forEach((s) => {
    picked.push(...bySection[s].slice(0, Math.round(n * PESO_SECCION[s])))
  })
  // Si a una sección le faltan preguntas, se completa con las de las demás
  if (picked.length < n) {
    const used = new Set(picked)
    picked.push(...shuffle(pool.filter((q) => !used.has(q))).slice(0, n - picked.length))
  }
  return picked.slice(0, n).sort((a, b) => ORDEN_SECCIONES.indexOf(sectionOf(a.modulo)) - ORDEN_SECCIONES.indexOf(sectionOf(b.modulo)))
}

export default function StudyApp({ questions }: { questions: Question[] }) {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [activeModuleQuestions, setActiveModuleQuestions] = useState<Question[]>([])
  // Simulacro en curso (preguntas + estado) y simulacro guardado que se puede retomar
  const [simulacro, setSimulacro] = useState<{ questions: Question[]; state: SimulacroState } | null>(null)
  const [savedSimulacro, setSavedSimulacro] = useState<SimulacroState | null>(loadSimulacroState)
  const [progress, setProgress] = useState<ProgressData>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [nivel, setNivel] = useState<NivelId | null>(readSavedNivel)
  // Módulo que se abrirá cuando el usuario elija su nivel
  const [pendingModule, setPendingModule] = useState<string | null>(null)

  const visibleQuestions = useMemo(() => questions.filter((q) => appliesToNivel(q, nivel)), [questions, nivel])

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
  const handleSaveProgress = (questionId: QuestionId, status: 'correct' | 'incorrect') => {
    handleSaveProgressBatch({ [String(questionId)]: status })
  }

  const handleSaveProgressBatch = (entries: ProgressData) => {
    setProgress((prev) => {
      const next = { ...prev, ...entries }
      try {
        localStorage.setItem('simo_study_progress', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Compute modules and stats
  const modulesStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number; incorrect: number }> = {}

    visibleQuestions.forEach(q => {
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
  }, [visibleQuestions, progress])

  // Total user progress metrics (solo sobre las preguntas que el usuario puede practicar hoy)
  const totalStats = useMemo(() => {
    const total = visibleQuestions.length
    let correct = 0
    let incorrect = 0
    visibleQuestions.forEach(q => {
      const status = progress[String(q.id)]
      if (status === 'correct') correct++
      if (status === 'incorrect') incorrect++
    })
    const completed = correct + incorrect
    const percent = Math.round((completed / total) * 100) || 0
    return { total, correct, incorrect, completed, percent }
  }, [visibleQuestions, progress])

  if (!isLoaded) return <div className="p-8 text-center text-slate-500 animate-pulse font-semibold">Cargando tu progreso...</div>

  // Solo entran al simulacro las preguntas verificadas o conservadas (no las de concepto básico)
  const simulacroPool = visibleQuestions.filter((q) => !q.fundamentos)

  const startSimulacro = (n: number) => {
    const picked = buildSimulacro(simulacroPool, n)
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
    const hasNivelQuestions = questions.some(q => q.modulo === modName && q.nivel && !q.nivel.includes('todos'))
    if (hasNivelQuestions && !nivelForSession) {
      setPendingModule(modName)
      return
    }
    const modQs = questions.filter(q => q.modulo === modName && appliesToNivel(q, nivelForSession))
    const shuffled = [...modQs].sort(() => 0.5 - Math.random())
    setActiveModuleQuestions(shuffled)
    setActiveModule(modName)
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
      <div className="space-y-6 animate-in fade-in duration-300">
        <button
          onClick={() => setPendingModule(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a módulos
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

        <Link href="/dashboard/report" className="bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group cursor-pointer">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Reporte Detallado</span>
            <div className="text-xl sm:text-2xl font-black text-white">Ver Estadísticas</div>
            <p className="text-xs text-indigo-200">Analiza tus puntos débiles →</p>
          </div>
          <div className="w-11 h-11 bg-white/20 group-hover:bg-white/30 transition-colors rounded-xl flex items-center justify-center text-white shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Simulacro guardado */}
      {savedSimulacro && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-800 dark:text-slate-200">
            <strong>Tienes un simulacro sin terminar</strong> ({Object.keys(savedSimulacro.answers).length} de {savedSimulacro.ids.length} respondidas).
            El tiempo sigue corriendo: {savedSimulacro.startedAt + savedSimulacro.durationMs > clock() ? `quedan ${formatDuration(savedSimulacro.startedAt + savedSimulacro.durationMs - clock())}` : 'ya se acabó; al abrirlo verás el resultado'}.
          </p>
          <div className="flex gap-2">
            <button onClick={discardSimulacro} className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              Descartar
            </button>
            <button onClick={resumeSimulacro} className="px-4 py-2 text-sm font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-400">
              Continuar simulacro
            </button>
          </div>
        </div>
      )}

      {/* Simulacro tipo examen */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 border border-slate-200/60 dark:border-slate-800/80">
        <div className="space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Condiciones de examen
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Simulacro tipo examen</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
            Con cronómetro ({MINUTOS_POR_PREGUNTA} minutos por pregunta) y sin ver las respuestas hasta el final, como en la prueba real.
            Mezcla competencias generales, aptitudes y comportamentales{nivel ? ` de tu nivel (${nivelLabel(nivel)})` : ''}, y al terminar te muestra tu resultado por módulo.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          {SIMULACRO_OPCIONES.map((op, i) => (
            <button
              key={op.n}
              onClick={() => startSimulacro(op.n)}
              disabled={simulacroPool.length < op.n}
              className={`flex flex-col items-center justify-center px-5 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                i === SIMULACRO_OPCIONES.length - 1
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700'
              }`}
            >
              <span className="flex items-center gap-2"><Play className="w-4 h-4" /> {op.label}</span>
              <span className={`text-xs font-semibold ${i === SIMULACRO_OPCIONES.length - 1 ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {op.n} preguntas · {formatDuration(op.n * MINUTOS_POR_PREGUNTA * 60 * 1000)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Estudiar por módulo</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Practica un tema con la explicación de cada respuesta al instante.</p>
        </div>
      </div>

      <NivelPicker nivel={nivel} onChoose={chooseNivel} compact />

      {MODULE_SECTIONS.map((section) => {
        const mods = (section.modulos as readonly string[])
          .map((name) => modulesStats.find((m) => m.name === name))
          .filter((m): m is (typeof modulesStats)[number] => !!m)
        if (!mods.length) return null
        return (
          <section key={section.id} className="space-y-4" aria-labelledby={`sec-${section.id}`}>
            <div>
              <h3 id={`sec-${section.id}`} className="text-lg font-black text-slate-900 dark:text-white">{section.titulo}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{section.descripcion}</p>
            </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mods.map(mod => (
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
          </section>
        )
      })}
    </div>
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
