'use client'

// Panel organizado alrededor de la convocatoria elegida: cómo vas, qué sigue y el plan por módulos
import { createElement } from 'react'
import { ArrowRight, CalendarClock, CalendarDays, CircleCheck, Flame, RotateCcw, Target } from 'lucide-react'
import { sectionOf } from '@/lib/question-types'
import type { SemanaPlan } from '@/lib/convocatorias/plan'
import { moduleIcon, SECTION_STYLE } from './module-meta'
import { ESTADO_LABEL, estimacionConfiable, type AvancePlan, type EstadoModulo, type ModuloAvance } from './plan-progreso'
import type { SeleccionConvocatoria } from './simulacro-convocatoria'
import type { ResumenSimulacro } from './meta-progreso'
import { ProgressBar } from './ui'

const ESTADO_TONO: Record<EstadoModulo, string> = {
  sin_empezar: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  en_curso: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  reforzar: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  dominado: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

const fechaLarga = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
}

function Metrica({ label, valor, detalle, children }: { label: string; valor: string; detalle: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700/60 p-4">
      <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{valor}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{detalle}</p>
      {children}
    </div>
  )
}

export function PlanHero({
  seleccion,
  avance,
  diasPrueba,
  minimo,
  falladas,
  ultimoSimulacro,
  siguiente,
  onCambiar,
  onStartModule,
  onReviewErrors,
}: {
  seleccion: SeleccionConvocatoria
  avance: AvancePlan
  diasPrueba: number | null
  minimo: number | null
  falladas: number
  ultimoSimulacro: ResumenSimulacro | null
  siguiente: { modulo: ModuloAvance; razon: string } | null
  onCambiar: () => void
  onStartModule: (modulo: string) => void
  onReviewErrors: () => void
}) {
  const { convocatoria, perfil } = seleccion
  const confiable = estimacionConfiable(avance)

  return (
    <section aria-labelledby="plan-title" className="rounded-3xl border border-brand-200/70 dark:border-brand-500/25 bg-gradient-to-br from-brand-50 via-white to-white dark:from-brand-500/10 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">Tu concurso</p>
          <h2 id="plan-title" className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {convocatoria.nombre}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{perfil.label}</p>
        </div>
        <button type="button" onClick={onCambiar} className="text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
          Cambiar concurso
        </button>
      </div>

      <p className="mt-3 inline-flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
        <CalendarClock className="shrink-0 mt-0.5 w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden />
        {diasPrueba !== null && convocatoria.fechaPrueba ? (
          <span>
            <strong className="text-slate-900 dark:text-white">
              {diasPrueba === 0 ? 'La prueba es hoy' : `Faltan ${diasPrueba} ${diasPrueba === 1 ? 'día' : 'días'}`}
            </strong>{' '}
            para la prueba escrita ({fechaLarga(convocatoria.fechaPrueba)}).
          </span>
        ) : (
          <span>{convocatoria.estado}</span>
        )}
      </p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Metrica label="Plan practicado" valor={`${avance.cobertura}%`} detalle="Ponderado por lo que pesa cada tema">
          <ProgressBar value={avance.cobertura} className="mt-2.5" label="Parte del plan practicada" />
        </Metrica>
        <Metrica
          label="Acierto en tu plan"
          valor={confiable ? `${avance.estimacion}%` : '—'}
          detalle={
            confiable
              ? minimo
                ? (avance.estimacion ?? 0) >= minimo
                  ? `Por encima del mínimo de ${minimo} de la eliminatoria`
                  : `El mínimo de la eliminatoria es ${minimo}`
                : 'Ponderado por lo que pesa cada tema'
              : 'Responde al menos 5 preguntas en los temas que más pesan'
          }
        >
          {confiable && <ProgressBar value={avance.estimacion ?? 0} className="mt-2.5" barClass={minimo && (avance.estimacion ?? 0) < minimo ? 'bg-amber-500' : 'bg-emerald-500'} label="Acierto en tu plan" />}
        </Metrica>
        <Metrica
          label={ultimoSimulacro ? 'Último simulacro' : 'Por repasar'}
          valor={ultimoSimulacro ? `${ultimoSimulacro.conocimientos ?? ultimoSimulacro.comportamentales ?? 0}/100` : String(falladas)}
          detalle={
            ultimoSimulacro
              ? `${ultimoSimulacro.n} preguntas · ${new Date(ultimoSimulacro.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`
              : falladas === 1
                ? 'pregunta fallada'
                : 'preguntas falladas'
          }
        >
          {!ultimoSimulacro && falladas > 0 && (
            <button type="button" onClick={onReviewErrors} className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">
              <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Repasar
            </button>
          )}
        </Metrica>
      </div>

      {siguiente && (
        <div className="mt-4 rounded-2xl bg-brand-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              {createElement(moduleIcon(siguiente.modulo.modulo) ?? Target, { className: 'w-5 h-5', 'aria-hidden': true })}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">Lo que más te suma hoy</p>
              <p className="font-semibold leading-snug">{siguiente.modulo.modulo}</p>
              <p className="text-sm text-brand-100/80">{siguiente.razon}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStartModule(siguiente.modulo.modulo)}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-900 font-semibold px-5 py-2.5 hover:bg-brand-50"
          >
            {siguiente.modulo.vistas ? 'Continuar' : 'Empezar'} <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      )}
    </section>
  )
}

export function SemanaCard({
  semana,
  semanaActual,
  semanas,
  hechasSemana,
  racha,
  horasSemana,
  onHoras,
  onStartModule,
}: {
  semana: SemanaPlan | null
  semanaActual: number
  semanas: number
  hechasSemana: number
  racha: number
  horasSemana: number
  onHoras: (h: number) => void
  onStartModule: (modulo: string) => void
}) {
  const meta = semana?.items.reduce((s, it) => s + it.preguntas, 0) ?? 0
  const pct = meta ? Math.min(100, Math.round((hechasSemana / meta) * 100)) : 0

  return (
    <section aria-labelledby="semana-title" className="min-w-0 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <p id="semana-title" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <CalendarDays className="w-4 h-4" aria-hidden /> Semana {semanaActual} de {semanas}
        </p>
        {racha > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300" title="Días seguidos practicando">
            <Flame className="w-3.5 h-3.5" aria-hidden /> {racha} {racha === 1 ? 'día' : 'días'} seguidos
          </span>
        )}
      </div>

      {semana && semana.tipo === 'estudio' && semana.items.length ? (
        <>
          <h3 className="mt-3 font-semibold text-lg text-slate-900 dark:text-white">Esta semana te toca</h3>
          <ul className="mt-3 space-y-2">
            {semana.items.map((it) => (
              <li key={it.modulo}>
                <button
                  type="button"
                  onClick={() => onStartModule(it.modulo)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="min-w-0 font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{it.modulo}</span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {it.preguntas ? `${it.preguntas} preguntas` : 'repaso'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {semana.simulacro && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Al final de la semana, haz un simulacro de control.</p>}
        </>
      ) : (
        <>
          <h3 className="mt-3 font-semibold text-lg text-slate-900 dark:text-white">Semana de repaso</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Haz simulacros completos en días distintos y repasa solo lo que fallaste. No empieces temas nuevos.
          </p>
        </>
      )}

      <div className="mt-auto pt-5 space-y-3">
        {meta > 0 && (
          <div>
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Meta de la semana</span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                {hechasSemana} de {meta}
              </span>
            </div>
            <ProgressBar value={pct} className="mt-1.5" barClass={pct >= 100 ? 'bg-emerald-500' : undefined} label="Meta de preguntas de la semana" />
          </div>
        )}
        <label className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          Horas por semana
          <select
            value={horasSemana}
            onChange={(e) => onHoras(Number(e.target.value))}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {[3, 6, 10, 15].map((h) => (
              <option key={h} value={h}>
                {h} h
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}

export function PlanModulos({ avance, onStartModule }: { avance: AvancePlan; onStartModule: (modulo: string) => void }) {
  return (
    <section aria-labelledby="plan-modulos-title" className="space-y-5">
      <div>
        <h2 id="plan-modulos-title" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Tu plan de estudio
        </h2>
        <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400">Los temas que evalúa tu empleo, del que más pesa al que menos.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {avance.modulos.map((m) => {
          const Icon = moduleIcon(m.modulo)
          const style = SECTION_STYLE[sectionOf(m.modulo)]
          return (
            <button
              key={m.modulo}
              type="button"
              onClick={() => onStartModule(m.modulo)}
              className="group text-left rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col gap-4 hover:border-brand-300 dark:hover:border-brand-500/40 hover:shadow-lg hover:shadow-slate-900/5 transition-[border-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <div className="flex items-start gap-3">
                <span className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${style.tile}`}>
                  <Icon className="w-5 h-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug text-slate-900 dark:text-white">{m.modulo}</h3>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-brand-700 dark:text-brand-300" title="Peso en tu plan">
                      {Math.round(m.peso * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {m.total} preguntas{m.acierto !== null ? ` · ${m.acierto}% de aciertos` : ''}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${ESTADO_TONO[m.estado]}`}>
                    {m.estado === 'dominado' && <CircleCheck className="w-3.5 h-3.5" aria-hidden />}
                    {ESTADO_LABEL[m.estado]}
                  </span>
                </div>
              </div>
              <div className="mt-auto space-y-2">
                <ProgressBar value={m.visto} barClass={style.bar} label={`Avance en ${m.modulo}`} />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">{m.visto}% visto</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-700 dark:text-brand-300">
                    {m.vistas ? 'Continuar' : 'Empezar'}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
