'use client'

// Guía de inicio del panel: los 4 pasos para sacarle provecho a SIMO Test. Cada paso se marca solo con lo que
// hace el aspirante; la tarjeta se oculta al terminarlos o con «Ya entendí», y «¿Cómo funciona?» la vuelve a abrir.
import { useState, useSyncExternalStore } from 'react'
import { Check, ClipboardList, HelpCircle, RotateCcw, Target, Timer } from 'lucide-react'

const CLAVE_OCULTA = 'simo_guia_oculta'
export const CLAVE_REPASO = 'simo_guia_repaso'
const EVENTO = 'simo-guia'
export const RESPUESTAS_GUIA = 10

// Las marcas viven en el navegador; se leen sin desajustar el render del servidor
const suscribir = (cb: () => void) => {
  window.addEventListener('storage', cb)
  window.addEventListener(EVENTO, cb)
  return () => {
    window.removeEventListener('storage', cb)
    window.removeEventListener(EVENTO, cb)
  }
}
function useMarca(clave: string): boolean {
  return useSyncExternalStore(
    suscribir,
    () => {
      try {
        return localStorage.getItem(clave) === '1'
      } catch {
        return false
      }
    },
    () => false,
  )
}
export function marcarGuia(clave: string, valor: boolean) {
  try {
    if (valor) localStorage.setItem(clave, '1')
    else localStorage.removeItem(clave)
  } catch {}
  window.dispatchEvent(new Event(EVENTO))
}

type Paso = {
  icono: typeof Check
  titulo: string
  detalle: string
  hecho: boolean
  avance?: string
  accion?: { texto: string; onClick: () => void }
  nota?: string
}

export default function GuiaInicio({
  concursoElegido,
  respondidas,
  falladas,
  simulacros,
  onElegirConcurso,
  onPracticar,
  onRepasar,
  onSimulacro,
}: {
  concursoElegido: boolean
  respondidas: number
  falladas: number
  simulacros: number
  onElegirConcurso: () => void
  onPracticar: () => void
  onRepasar: () => void
  onSimulacro: () => void
}) {
  const oculta = useMarca(CLAVE_OCULTA)
  const repaso = useMarca(CLAVE_REPASO)
  const [abierta, setAbierta] = useState(false)

  const pasos: Paso[] = [
    {
      icono: ClipboardList,
      titulo: 'Elige tu concurso y tu cargo',
      detalle: 'Con eso te armamos el plan: qué módulos evalúa tu prueba, cuánto pesa cada uno y qué estudiar cada semana.',
      hecho: concursoElegido,
      accion: concursoElegido ? undefined : { texto: 'Elegir concurso', onClick: onElegirConcurso },
    },
    {
      icono: Target,
      titulo: `Responde tus primeras ${RESPUESTAS_GUIA} preguntas`,
      detalle: 'Cada pregunta explica por qué cada opción es correcta o incorrecta: así aprendes también de los errores.',
      hecho: respondidas >= RESPUESTAS_GUIA,
      avance: `${Math.min(respondidas, RESPUESTAS_GUIA)} de ${RESPUESTAS_GUIA}`,
      accion: { texto: 'Practicar', onClick: onPracticar },
    },
    {
      icono: RotateCcw,
      titulo: 'Repasa tus errores',
      detalle: 'Los temas donde fallas quedan «Por reforzar» y puedes practicar solo las preguntas que fallaste.',
      hecho: repaso,
      accion: falladas > 0 ? { texto: 'Repasar errores', onClick: onRepasar } : undefined,
      nota: falladas > 0 ? undefined : 'Se activa cuando falles alguna pregunta.',
    },
    {
      icono: Timer,
      titulo: 'Haz tu primer simulacro',
      detalle: 'Mídete con el formato de tu prueba y mira en «Mi progreso» tu puntaje frente al mínimo para pasar.',
      hecho: simulacros > 0,
      accion: { texto: 'Ir al simulacro', onClick: onSimulacro },
    },
  ]
  const hechos = pasos.filter((p) => p.hecho).length
  const completa = hechos === pasos.length
  const siguiente = pasos.findIndex((p) => !p.hecho)

  if (!abierta && (oculta || completa)) {
    return (
      <button
        type="button"
        onClick={() => setAbierta(true)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
      >
        <HelpCircle className="w-4 h-4" aria-hidden /> ¿Cómo funciona SIMO Test?
      </button>
    )
  }

  return (
    <section
      aria-labelledby="guia-title"
      className="rounded-3xl border border-brand-200 dark:border-brand-500/30 bg-gradient-to-br from-brand-50 to-white dark:from-brand-500/10 dark:to-slate-900 p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">Empieza aquí</p>
          <h2 id="guia-title" className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {completa ? '¡Ya conoces todo lo que hace SIMO Test!' : 'Así le sacas el máximo provecho en 4 pasos'}
          </h2>
        </div>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
          {hechos} de {pasos.length} pasos
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-800" role="progressbar" aria-valuenow={hechos} aria-valuemin={0} aria-valuemax={pasos.length} aria-label="Pasos completados">
        <div className="h-full rounded-full bg-brand-600 transition-[width] duration-500" style={{ width: `${(hechos / pasos.length) * 100}%` }} />
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {pasos.map((p, i) => {
          const Icono = p.icono
          const esSiguiente = i === siguiente
          return (
            <li
              key={p.titulo}
              className={`flex gap-3 rounded-2xl border p-3 sm:p-4 ${
                p.hecho
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                  : esSiguiente
                    ? 'border-brand-300 bg-white shadow-sm dark:border-brand-500/50 dark:bg-slate-900'
                    : 'border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/60'
              }`}
            >
              <span
                className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                  p.hecho ? 'bg-emerald-500 text-white' : esSiguiente ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {p.hecho ? <Check className="w-5 h-5" aria-hidden /> : <Icono className="w-[18px] h-[18px]" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  <span className="sr-only">{p.hecho ? 'Hecho: ' : `Paso ${i + 1}: `}</span>
                  {p.titulo}
                </p>
                {/* En celular solo el siguiente paso muestra su explicación y su botón, para que la guía no ocupe toda la pantalla */}
                <p className={`mt-0.5 text-sm text-slate-600 dark:text-slate-300 ${esSiguiente ? "" : "hidden sm:block"}`}>{p.detalle}</p>
                {!p.hecho && (p.accion || p.avance || p.nota) && (
                  <div className={`mt-2.5 flex-wrap items-center gap-x-3 gap-y-1 ${esSiguiente ? "flex" : "hidden sm:flex"}`}>
                    {p.accion && (
                      <button
                        type="button"
                        onClick={p.accion.onClick}
                        className={`rounded-xl px-3.5 py-1.5 text-sm font-semibold ${
                          esSiguiente
                            ? 'bg-brand-700 text-white hover:bg-brand-800'
                            : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
                        }`}
                      >
                        {p.accion.texto}
                      </button>
                    )}
                    {p.avance && <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">{p.avance}</span>}
                    {p.nota && <span className="text-xs text-slate-500 dark:text-slate-400">{p.nota}</span>}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => {
            marcarGuia(CLAVE_OCULTA, true)
            setAbierta(false)
          }}
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {completa ? 'Cerrar' : 'Ya entendí, ocultar'}
        </button>
      </div>
    </section>
  )
}
