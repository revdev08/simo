'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { ArrowLeft, Users } from 'lucide-react'
import { AREAS_FUNCIONALES, NIVELES, sectionOf, type AreaId, type NivelId, type Question, type SectionId } from '@/lib/question-types'
import SimulacroSession, { clearSimulacroState, loadSimulacroState, type SimulacroState } from './SimulacroSession'
import StudyHome, { type ModuleStat } from './StudyHome'
import StudySession from './StudySession'
import { clock } from './attempts'
import { MINUTOS_POR_PREGUNTA, ORDEN_SECCIONES, PESO_CON_AREA, PESO_SIN_AREA } from './simulacro-config'
import {
  armarSimulacroConvocatoria,
  buscarSeleccion,
  CONVOCATORIA_STORAGE_KEY,
  minimoEliminatoria,
  poolDelPerfil,
} from './simulacro-convocatoria'
import {
  agregarSimulacro,
  CLAVE_ACTIVIDAD,
  CLAVE_PERFIL,
  CLAVE_SIMULACROS,
  guardarMeta,
  hoyISO,
  separarProgreso,
  sumarActividad,
  type PerfilGuardado,
  type ResumenSimulacro,
} from './meta-progreso'

export type { Question } from '@/lib/question-types'

type QuestionId = Question['id']

const NIVEL_STORAGE_KEY = 'simo_nivel'
const AREA_STORAGE_KEY = 'simo_area'
const PROGRESS_STORAGE_KEY = 'simo_study_progress'
const HORAS_STORAGE_KEY = 'simo_horas_semana'
const SIN_CONVOCATORIA_KEY = 'simo_sin_convocatoria'
const INICIO_STORAGE_KEY = 'simo_plan_inicio'

// Lee y escribe preferencias del navegador sin romper si el almacenamiento no está disponible
function leerLocal(clave: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}
function escribirLocal(clave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(clave)
    else localStorage.setItem(clave, valor)
  } catch {}
}
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

function readSavedConvocatoria(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(CONVOCATORIA_STORAGE_KEY)
    return buscarSeleccion(saved) ? saved : null
  } catch {
    return null
  }
}

// Elección que llega por URL desde una página de convocatoria (?convocatoria=…&perfil=…)
function readConvocatoriaIntent() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return buscarSeleccion(`${params.get('convocatoria')}:${params.get('perfil')}`)
}

function readLocalProgress(): unknown {
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
  // Si se llega desde una convocatoria, su perfil define el área y, si aún no hay, el nivel
  const [nivel, setNivel] = useState<NivelId | null>(() => readSavedNivel() ?? readConvocatoriaIntent()?.perfil.nivel ?? null)
  const [area, setArea] = useState<AreaId | null>(() => readConvocatoriaIntent()?.perfil.area ?? readSavedArea())
  // Módulo que se abrirá cuando el usuario elija su nivel
  const [pendingModule, setPendingModule] = useState<string | null>(null)
  // Convocatoria y perfil elegidos ("slug:perfil"): habilitan el simulacro con los pesos de ese proceso
  const [convocatoriaClave, setConvocatoriaClave] = useState<string | null>(() => readConvocatoriaIntent()?.clave ?? readSavedConvocatoria())
  const seleccion = useMemo(() => buscarSeleccion(convocatoriaClave), [convocatoriaClave])
  // Eligió estudiar sin convocatoria (no se le vuelve a preguntar)
  const [sinConvocatoria, setSinConvocatoria] = useState(() => leerLocal(SIN_CONVOCATORIA_KEY) === '1')
  const [horasSemana, setHorasSemana] = useState(() => Number(leerLocal(HORAS_STORAGE_KEY)) || 6)
  // Día en que eligió la convocatoria: desde ahí cuentan las semanas del plan
  const [planInicio, setPlanInicio] = useState<string | null>(() => leerLocal(INICIO_STORAGE_KEY))
  // Constancia (preguntas por día) e historial de simulacros: se guardan junto al progreso
  const [actividad, setActividad] = useState<Record<string, number>>({})
  const [simulacros, setSimulacros] = useState<ResumenSimulacro[]>([])
  const metaRef = useRef<{ actividad: Record<string, number>; simulacros: ResumenSimulacro[] }>({ actividad: {}, simulacros: [] })
  const actividadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const visibleQuestions = useMemo(() => questions.filter((q) => appliesToNivel(q, nivel)), [questions, nivel])

  // Guarda la elección que llegó por URL y limpia la dirección
  useEffect(() => {
    const elegida = readConvocatoriaIntent()
    if (!elegida) return
    window.history.replaceState(null, '', window.location.pathname)
    try {
      localStorage.setItem(CONVOCATORIA_STORAGE_KEY, elegida.clave)
      if (elegida.perfil.area) localStorage.setItem(AREA_STORAGE_KEY, elegida.perfil.area)
      if (elegida.perfil.nivel && !localStorage.getItem(NIVEL_STORAGE_KEY)) localStorage.setItem(NIVEL_STORAGE_KEY, elegida.perfil.nivel)
      if (!localStorage.getItem(INICIO_STORAGE_KEY)) localStorage.setItem(INICIO_STORAGE_KEY, hoyISO())
      localStorage.removeItem(SIN_CONVOCATORIA_KEY)
    } catch {}
    const perfil: PerfilGuardado = {
      convocatoria: elegida.clave,
      nivel: readSavedNivel(),
      area: elegida.perfil.area ?? readSavedArea(),
      inicio: leerLocal(INICIO_STORAGE_KEY) ?? hoyISO(),
    }
    guardarMeta({ [CLAVE_PERFIL]: perfil })
  }, [])

  // Si quedó constancia sin enviar al cerrar la pestaña o salir del panel, se manda en ese momento
  useEffect(() => {
    const flush = () => {
      if (!actividadTimer.current) return
      clearTimeout(actividadTimer.current)
      actividadTimer.current = null
      guardarMeta({ [CLAVE_ACTIVIDAD]: metaRef.current.actividad })
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [])

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
        // ?practicar=errores&modulo=… repasa solo los errores de ese módulo
        const wrong = questions.filter(
          (q) => appliesToNivel(q, savedNivel) && loaded[String(q.id)] === 'incorrect' && (!pedidoModulo || q.modulo === pedidoModulo),
        )
        if (!wrong.length) return
        setActiveModuleQuestions(shuffle(wrong))
        setActiveModule(pedidoModulo ? `${REPASO}: ${pedidoModulo}` : REPASO)
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
      let raw: unknown
      try {
        const res = await fetch('/api/progress')
        const data = res.ok ? (await res.json()).data : null
        if (data && Object.keys(data).length > 0) {
          raw = data
          localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data))
        } else {
          raw = readLocalProgress()
        }
      } catch (e) {
        console.error('Error fetching progress:', e)
        raw = readLocalProgress()
      }
      const { respuestas: loaded, meta } = separarProgreso(raw)
      metaRef.current = { actividad: meta.actividad, simulacros: meta.simulacros }
      setActividad(meta.actividad)
      setSimulacros(meta.simulacros)
      // En otro dispositivo pudo elegir convocatoria, nivel o área: si aquí no hay, se usan esos
      const p = meta.perfil
      if (p) {
        const guardada = buscarSeleccion(p.convocatoria ?? null)
        if (guardada && !readSavedConvocatoria() && leerLocal(SIN_CONVOCATORIA_KEY) !== '1') {
          setConvocatoriaClave(guardada.clave)
          escribirLocal(CONVOCATORIA_STORAGE_KEY, guardada.clave)
          if (p.inicio && !leerLocal(INICIO_STORAGE_KEY)) {
            setPlanInicio(p.inicio)
            escribirLocal(INICIO_STORAGE_KEY, p.inicio)
          }
        }
        const nivelGuardado = NIVELES.find((n) => n.id === p.nivel)?.id
        if (!readSavedNivel() && nivelGuardado) {
          setNivel(nivelGuardado)
          escribirLocal(NIVEL_STORAGE_KEY, nivelGuardado)
        }
        const areaGuardada = AREAS_FUNCIONALES.find((a) => a.id === p.area)?.id
        if (!readSavedArea() && areaGuardada) {
          setArea(areaGuardada)
          escribirLocal(AREA_STORAGE_KEY, areaGuardada)
        }
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

  // Copia en el navegador: respuestas más constancia e historial (por si la base de datos no responde)
  const guardarLocal = (respuestas: ProgressData) => {
    escribirLocal(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ ...respuestas, [CLAVE_ACTIVIDAD]: metaRef.current.actividad, [CLAVE_SIMULACROS]: metaRef.current.simulacros }),
    )
  }

  // Suma las preguntas de hoy y las envía unos segundos después (agrupa las de una misma sesión)
  const registrarActividad = (n: number) => {
    if (!n) return
    const next = sumarActividad(metaRef.current.actividad, n)
    metaRef.current = { ...metaRef.current, actividad: next }
    setActividad(next)
    if (actividadTimer.current) clearTimeout(actividadTimer.current)
    actividadTimer.current = setTimeout(() => {
      actividadTimer.current = null
      guardarMeta({ [CLAVE_ACTIVIDAD]: metaRef.current.actividad })
    }, 4000)
  }

  const handleSaveProgressBatch = (entries: ProgressData) => {
    registrarActividad(Object.keys(entries).length)
    setProgress((prev) => {
      const next = { ...prev, ...entries }
      guardarLocal(next)
      return next
    })
  }

  const registrarSimulacro = (resumen: ResumenSimulacro) => {
    const next = agregarSimulacro(metaRef.current.simulacros, resumen)
    metaRef.current = { ...metaRef.current, simulacros: next }
    setSimulacros(next)
    guardarLocal(progress)
    guardarMeta({ [CLAVE_SIMULACROS]: next })
  }

  // El perfil (convocatoria, nivel, área) también se guarda en la cuenta, para "Mi progreso" y otros dispositivos
  const guardarPerfil = (cambios: Partial<PerfilGuardado>) => {
    const perfil: PerfilGuardado = { convocatoria: convocatoriaClave, nivel, area, inicio: planInicio ?? undefined, ...cambios }
    guardarMeta({ [CLAVE_PERFIL]: perfil })
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

  const convocatoriaPoolSize = seleccion ? poolDelPerfil(simulacroPool, seleccion.perfil).length : 0

  const startSimulacro = (n: number, modo: 'general' | 'convocatoria' = 'general') => {
    const conv = modo === 'convocatoria' ? seleccion : null
    const picked = conv ? armarSimulacroConvocatoria(simulacroPool, n, conv.perfil) : buildSimulacro(simulacroPool, n, area)
    if (!picked.length) return
    const state: SimulacroState = {
      ids: picked.map((q) => String(q.id)),
      answers: {},
      flags: {},
      timeSpent: {},
      current: 0,
      startedAt: clock(),
      durationMs: picked.length * MINUTOS_POR_PREGUNTA * 60 * 1000,
      ...(conv
        ? { titulo: `${conv.convocatoria.nombre} · ${conv.perfil.label}`, minimo: minimoEliminatoria(conv.convocatoria), convocatoria: conv.clave }
        : {}),
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

  const chooseArea = (a: AreaId | null, guardar = true) => {
    setArea(a)
    escribirLocal(AREA_STORAGE_KEY, a)
    if (guardar) guardarPerfil({ area: a })
  }

  // Al elegir una convocatoria se sugiere el área de su perfil (el usuario puede cambiarla después).
  // El plan semanal empieza a contar desde hoy.
  const chooseConvocatoria = (clave: string | null) => {
    const elegida = buscarSeleccion(clave)
    const cambia = (elegida?.clave ?? null) !== convocatoriaClave
    setConvocatoriaClave(elegida ? elegida.clave : null)
    escribirLocal(CONVOCATORIA_STORAGE_KEY, elegida ? elegida.clave : null)
    const inicio = elegida && cambia ? hoyISO() : planInicio
    if (elegida && cambia) {
      setPlanInicio(inicio)
      escribirLocal(INICIO_STORAGE_KEY, inicio)
    }
    if (elegida) {
      setSinConvocatoria(false)
      escribirLocal(SIN_CONVOCATORIA_KEY, null)
    }
    if (elegida?.perfil.area) chooseArea(elegida.perfil.area, false)
    guardarPerfil({ convocatoria: elegida?.clave ?? null, inicio: inicio ?? undefined, ...(elegida?.perfil.area ? { area: elegida.perfil.area } : {}) })
  }

  const omitirConvocatoria = () => {
    setSinConvocatoria(true)
    escribirLocal(SIN_CONVOCATORIA_KEY, '1')
  }

  const chooseHoras = (h: number) => {
    setHorasSemana(h)
    escribirLocal(HORAS_STORAGE_KEY, String(h))
  }

  const chooseNivel = (n: NivelId) => {
    setNivel(n)
    escribirLocal(NIVEL_STORAGE_KEY, n)
    guardarPerfil({ nivel: n })
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
        onFinish={registrarSimulacro}
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
      convocatoria={seleccion}
      convocatoriaPoolSize={convocatoriaPoolSize}
      onChooseConvocatoria={chooseConvocatoria}
      sinConvocatoria={sinConvocatoria}
      onOmitirConvocatoria={omitirConvocatoria}
      actividad={actividad}
      simulacros={simulacros}
      horasSemana={horasSemana}
      onHorasSemana={chooseHoras}
      planInicio={planInicio ?? undefined}
      onStartSimulacro={startSimulacro}
      onStartModule={(name) => startModule(name)}
      onReviewErrors={startReview}
    />
  )
}
