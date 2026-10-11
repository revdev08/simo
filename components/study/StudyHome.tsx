'use client'

import { useState } from 'react'
import { ArrowRight, CircleCheck, RotateCcw, SlidersHorizontal, Target, Timer } from 'lucide-react'
import { AREAS_FUNCIONALES, MODULE_SECTIONS, NIVELES, type AreaId, type NivelId, type SectionId } from '@/lib/question-types'
import { moduleIcon, SECTION_STYLE } from './module-meta'
import { MINUTOS_POR_PREGUNTA, PESO_CON_AREA, PESO_SIN_AREA, SIMULACRO_OPCIONES } from './simulacro-config'
import { formatDuration, type SimulacroState } from './SimulacroSession'
import { clock } from './attempts'

export interface ModuleStat {
  name: string
  total: number
  correct: number
  incorrect: number
  progress: number
}

export interface TotalStats {
  total: number
  correct: number
  incorrect: number
  completed: number
  percent: number
}

const nivelLabel = (id: string) => NIVELES.find((n) => n.id === id)?.label ?? id
const areaInfo = (id: AreaId | null) => AREAS_FUNCIONALES.find((a) => a.id === id)
const accuracyOf = (m: Pick<ModuleStat, 'correct' | 'incorrect'>) =>
  m.correct + m.incorrect ? Math.round((m.correct / (m.correct + m.incorrect)) * 100) : null

// "40 min", "1 h 20 min"
function humanMinutes(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`
}

// Módulo sugerido: el que ya empezó y va más avanzado; si no, el primero sin empezar (el área del cargo primero)
function recommend(stats: ModuleStat[], area: AreaId | null) {
  const areaModulo = areaInfo(area)?.modulo
  const orden = [
    ...(areaModulo ? [areaModulo] : []),
    ...MODULE_SECTIONS.filter((s) => s.id !== 'funcionales').flatMap((s) => s.modulos as readonly string[]),
  ]
  const list = orden.map((n) => stats.find((m) => m.name === n)).filter((m): m is ModuleStat => !!m)
  const started = list.filter((m) => m.progress > 0 && m.progress < 100).sort((a, b) => b.progress - a.progress)[0]
  if (started) return { mod: started, reason: `Vas en ${started.progress}%. Termina de verlo.` }
  const fresh = list.find((m) => m.progress === 0)
  if (fresh) return { mod: fresh, reason: fresh.name === areaModulo ? 'Es el área de tu cargo.' : 'Un buen punto de partida.' }
  const weakest = [...list].sort((a, b) => (accuracyOf(a) ?? 100) - (accuracyOf(b) ?? 100))[0]
  return weakest ? { mod: weakest, reason: `Aciertas el ${accuracyOf(weakest)}%. Vale la pena repasarlo.` } : null
}

function ProgressBar({ value, className = '', barClass = 'bg-brand-600 dark:bg-brand-500', label }: { value: number; className?: string; barClass?: string; label?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ${className}`}
    >
      <div className={`h-full rounded-full transition-[width] duration-700 ${barClass}`} style={{ width: `${value}%` }} />
    </div>
  )
}

function StatCard({ label, value, hint, children }: { label: string; value: string | number; hint: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-5 flex flex-col">
      <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</span>
      {children}
    </div>
  )
}

// Nivel y área del cargo: definen las comportamentales y las funcionales que se practican
function ProfileCard({
  nivel,
  area,
  onChooseNivel,
  onChooseArea,
}: {
  nivel: NivelId | null
  area: AreaId | null
  onChooseNivel: (n: NivelId) => void
  onChooseArea: (a: AreaId | null) => void
}) {
  const [editing, setEditing] = useState(!nivel)

  if (!editing && nivel) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <SlidersHorizontal className="w-4 h-4 text-slate-400" aria-hidden />
        <span className="text-sm text-slate-600 dark:text-slate-400">Tu prueba:</span>
        <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">Nivel {nivelLabel(nivel)}</span>
        <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
          {area ? `Área: ${areaInfo(area)?.label}` : 'Sin área funcional'}
        </span>
        <button type="button" onClick={() => setEditing(true)} className="ml-auto text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
          Cambiar
        </button>
      </div>
    )
  }

  return (
    <section aria-labelledby="perfil-title" className="rounded-2xl border border-brand-200 dark:border-brand-500/30 bg-brand-50/70 dark:bg-brand-500/10 p-5 sm:p-6 space-y-5">
      <div>
        <h2 id="perfil-title" className="text-lg font-bold text-slate-900 dark:text-white">Configura tu prueba</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Así ajustamos las preguntas a tu cargo. Puedes cambiarlo cuando quieras.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <fieldset>
          <legend className="text-sm font-semibold text-slate-900 dark:text-white">Nivel del cargo</legend>
          <p className="text-xs text-slate-500 dark:text-slate-400">Define las situaciones comportamentales que verás (Decreto 815 de 2018).</p>
          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NIVELES.map((n) => (
              <button
                key={n.id}
                type="button"
                aria-pressed={nivel === n.id}
                onClick={() => onChooseNivel(n.id)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  nivel === n.id
                    ? 'bg-brand-700 border-brand-700 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="area-cargo" className="text-sm font-semibold text-slate-900 dark:text-white">
            Área de tu cargo <span className="font-normal text-slate-500">(opcional)</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">Suma preguntas funcionales de esa área a tus simulacros.</p>
          <select
            id="area-cargo"
            value={area ?? ''}
            onChange={(e) => onChooseArea((e.target.value || null) as AreaId | null)}
            className="mt-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-2 focus:outline-brand-500"
          >
            <option value="">Ninguna</option>
            {AREAS_FUNCIONALES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.modulo}
              </option>
            ))}
          </select>
        </div>
      </div>
      {nivel && (
        <div className="flex justify-end">
          <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold">
            Listo
          </button>
        </div>
      )}
    </section>
  )
}

export default function StudyHome({
  userName,
  totalStats,
  modulesStats,
  nivel,
  area,
  onChooseNivel,
  onChooseArea,
  savedSimulacro,
  onResumeSimulacro,
  onDiscardSimulacro,
  simulacroPoolSize,
  onStartSimulacro,
  onStartModule,
  onReviewErrors,
}: {
  userName?: string | null
  totalStats: TotalStats
  modulesStats: ModuleStat[]
  nivel: NivelId | null
  area: AreaId | null
  onChooseNivel: (n: NivelId) => void
  onChooseArea: (a: AreaId | null) => void
  savedSimulacro: SimulacroState | null
  onResumeSimulacro: () => void
  onDiscardSimulacro: () => void
  simulacroPoolSize: number
  onStartSimulacro: (n: number) => void
  onStartModule: (name: string) => void
  onReviewErrors: () => void
}) {
  const [section, setSection] = useState<SectionId>('generales')
  const [size, setSize] = useState<number>(SIMULACRO_OPCIONES[1].n)

  const accuracy = accuracyOf(totalStats)
  const rec = recommend(modulesStats, area)
  const areaModulo = areaInfo(area)?.modulo
  const pesos = area ? PESO_CON_AREA : PESO_SIN_AREA
  const pct = (x: number) => `${Math.round(x * 100)}%`

  const sectionMods = (id: SectionId) => {
    const sec = MODULE_SECTIONS.find((s) => s.id === id)!
    const mods = (sec.modulos as readonly string[]).map((n) => modulesStats.find((m) => m.name === n)).filter((m): m is ModuleStat => !!m)
    // El módulo del área elegida va primero
    return id === 'funcionales' && areaModulo ? [...mods].sort((a, b) => Number(b.name === areaModulo) - Number(a.name === areaModulo)) : mods
  }
  const current = MODULE_SECTIONS.find((s) => s.id === section)!

  return (
    <div className="space-y-8 sm:space-y-10 animate-enter">
      {/* Saludo y resumen */}
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{userName ? `Hola, ${userName}` : 'Hola'}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {totalStats.completed
              ? `Llevas ${totalStats.completed} preguntas respondidas. Sigue así.`
              : 'Empieza por un módulo o mide tu nivel con un simulacro.'}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Avance" value={`${totalStats.percent}%`} hint={`${totalStats.completed} de ${totalStats.total}`}>
            <ProgressBar value={totalStats.percent} className="mt-3" label="Avance total" />
          </StatCard>
          <StatCard label="Aciertos" value={accuracy === null ? '—' : `${accuracy}%`} hint={`${totalStats.correct} correctas`} />
          <StatCard label="Por repasar" value={totalStats.incorrect} hint={totalStats.incorrect === 1 ? 'pregunta fallada' : 'preguntas falladas'}>
            {totalStats.incorrect > 0 && (
              <button
                type="button"
                onClick={onReviewErrors}
                className="mt-2 self-start inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
              >
                Repasar <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </button>
            )}
          </StatCard>
        </div>
      </div>

      <ProfileCard nivel={nivel} area={area} onChooseNivel={onChooseNivel} onChooseArea={onChooseArea} />

      {/* Acciones principales */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-5">
        <section aria-labelledby="simulacro-title" className="lg:col-span-3 relative overflow-hidden rounded-3xl bg-brand-950 text-white p-6 sm:p-8">
          <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-200">
              <Timer className="w-4 h-4" aria-hidden /> Simulacro tipo examen
            </p>
            <h2 id="simulacro-title" className="mt-3 text-2xl sm:text-[1.75rem] font-bold leading-tight tracking-tight">
              Practica en condiciones de examen
            </h2>
            <p className="mt-2 text-sm sm:text-base text-brand-100/80 max-w-lg">
              Con cronómetro y sin ver las respuestas hasta el final. Al terminar ves tu resultado por módulo.
            </p>

            {savedSimulacro ? (
              <div className="mt-6 rounded-2xl bg-white/10 border border-white/15 p-4 sm:p-5">
                <p className="font-semibold">Tienes un simulacro sin terminar</p>
                <p className="mt-1 text-sm text-brand-100/80">
                  {Object.keys(savedSimulacro.answers).length} de {savedSimulacro.ids.length} respondidas ·{' '}
                  {savedSimulacro.startedAt + savedSimulacro.durationMs > clock()
                    ? `quedan ${formatDuration(savedSimulacro.startedAt + savedSimulacro.durationMs - clock())}`
                    : 'el tiempo ya terminó; al abrirlo verás el resultado'}
                </p>
                <ProgressBar
                  value={Math.round((Object.keys(savedSimulacro.answers).length / savedSimulacro.ids.length) * 100)}
                  className="mt-3 bg-white/15 dark:bg-white/15"
                  barClass="bg-white"
                  label="Avance del simulacro"
                />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={onResumeSimulacro} className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-900 font-semibold px-5 py-2.5 hover:bg-brand-50">
                    Continuar simulacro <ArrowRight className="w-4 h-4" aria-hidden />
                  </button>
                  <button type="button" onClick={onDiscardSimulacro} className="px-4 py-2.5 text-sm font-semibold text-brand-100 hover:text-white">
                    Descartar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div role="radiogroup" aria-label="Tamaño del simulacro" className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                  {SIMULACRO_OPCIONES.map((op) => {
                    const selected = size === op.n
                    return (
                      <button
                        key={op.n}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={simulacroPoolSize < op.n}
                        onClick={() => setSize(op.n)}
                        className={`rounded-xl px-3 py-3 text-left border transition-colors disabled:opacity-40 ${
                          selected ? 'bg-white border-white text-brand-950' : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="block text-sm font-semibold">{op.label}</span>
                        <span className={`block text-xs mt-0.5 ${selected ? 'text-slate-600' : 'text-brand-100/70'}`}>
                          {op.n} preguntas
                          <span className="hidden sm:inline"> · {humanMinutes(op.n * MINUTOS_POR_PREGUNTA)}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-4 text-xs sm:text-sm text-brand-100/80 leading-relaxed">
                  {humanMinutes(size * MINUTOS_POR_PREGUNTA)} en total. Incluye generales ({pct(pesos.generales)})
                  {area ? `, ${areaInfo(area)?.frase} (${pct(pesos.funcionales)})` : ''}, aptitudes ({pct(pesos.aptitudes)}) y comportamentales ({pct(pesos.comportamentales)})
                  {nivel ? ` de nivel ${nivelLabel(nivel).toLowerCase()}` : ''}.
                  {!area && ' Elige el área de tu cargo para sumar preguntas funcionales.'}
                </p>
                <button
                  type="button"
                  onClick={() => onStartSimulacro(size)}
                  disabled={simulacroPoolSize < size}
                  className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-900 font-semibold px-6 py-3 hover:bg-brand-50 disabled:opacity-50"
                >
                  Empezar simulacro <ArrowRight className="w-4 h-4" aria-hidden />
                </button>
              </>
            )}
          </div>
        </section>

        <section aria-labelledby="sigue-title" className="lg:col-span-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 flex flex-col">
          <p id="sigue-title" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Target className="w-4 h-4" aria-hidden /> Sigue estudiando
          </p>
          {rec ? (
            <>
              <div className="mt-4 flex items-start gap-3">
                {(() => {
                  const Icon = moduleIcon(rec.mod.name)
                  const sec = MODULE_SECTIONS.find((s) => (s.modulos as readonly string[]).includes(rec.mod.name))?.id ?? 'generales'
                  return (
                    <span className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${SECTION_STYLE[sec].tile}`}>
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                  )
                })()}
                <div>
                  <h3 className="font-semibold text-lg leading-snug text-slate-900 dark:text-white">{rec.mod.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{rec.reason}</p>
                </div>
              </div>
              <ProgressBar value={rec.mod.progress} className="mt-5" label={`Avance en ${rec.mod.name}`} />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {rec.mod.correct + rec.mod.incorrect} de {rec.mod.total} preguntas vistas
              </p>
              <div className="mt-auto pt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onStartModule(rec.mod.name)}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5"
                >
                  {rec.mod.progress > 0 ? 'Continuar' : 'Empezar'} <ArrowRight className="w-4 h-4" aria-hidden />
                </button>
                {totalStats.incorrect > 0 && (
                  <button
                    type="button"
                    onClick={onReviewErrors}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden /> Repasar errores
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="mt-4 text-slate-600 dark:text-slate-400">Elige un módulo abajo para empezar.</p>
          )}
        </section>
      </div>

      {/* Módulos por sección */}
      <section aria-labelledby="modulos-title" className="space-y-5">
        <div>
          <h2 id="modulos-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Estudiar por módulo</h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">Practica un tema y mira la explicación de cada respuesta al instante.</p>
        </div>

        <div role="tablist" aria-label="Tipo de competencia" className="grid grid-cols-2 sm:flex gap-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 p-1 sm:w-fit">
          {MODULE_SECTIONS.map((s) => {
            const selected = section === s.id
            const count = sectionMods(s.id).reduce((acc, m) => acc + m.total, 0)
            return (
              <button
                key={s.id}
                id={`tab-${s.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${s.id}`}
                onClick={() => setSection(s.id)}
                className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  selected ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {SECTION_STYLE[s.id].tab}
                <span className="ml-1.5 text-xs font-medium text-slate-400 tabular-nums">{count}</span>
              </button>
            )
          })}
        </div>

        <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`} className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">{current.descripcion}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionMods(current.id).map((mod) => {
              const Icon = moduleIcon(mod.name)
              const style = SECTION_STYLE[current.id]
              const acc = accuracyOf(mod)
              const done = mod.progress === 100
              const isArea = mod.name === areaModulo
              return (
                <button
                  key={mod.name}
                  type="button"
                  onClick={() => onStartModule(mod.name)}
                  className="group text-left rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col gap-4 hover:border-brand-300 dark:hover:border-brand-500/40 hover:shadow-lg hover:shadow-slate-900/5 transition-[border-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${style.tile}`}>
                      <Icon className="w-5 h-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-semibold leading-snug text-slate-900 dark:text-white">{mod.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {mod.total} preguntas{acc !== null ? ` · ${acc}% de aciertos` : ''}
                      </p>
                      {done ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <CircleCheck className="w-3.5 h-3.5" aria-hidden /> Completado
                        </span>
                      ) : isArea ? (
                        <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">Tu área</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-auto space-y-2">
                    <ProgressBar value={mod.progress} barClass={style.bar} label={`Avance en ${mod.name}`} />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">{mod.progress}% visto</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-brand-700 dark:text-brand-300">
                        {mod.progress > 0 ? 'Continuar' : 'Empezar'}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
