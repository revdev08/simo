'use client'

// Elegir el concurso y el empleo dentro del panel: con eso se arma el plan con los temas y pesos de ese perfil
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarClock, ClipboardList } from 'lucide-react'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'
import type { Convocatoria } from '@/lib/convocatorias/tipos'

const formato = new Intl.NumberFormat('es-CO')

// Primera frase del estado del proceso, para la tarjeta
const estadoCorto = (c: Convocatoria) => c.estado.split('. ')[0].replace(/\.$/, '')

export default function ConvocatoriaPicker({
  actual,
  onElegir,
  onOmitir,
  onCancelar,
}: {
  actual?: string | null
  onElegir: (clave: string) => void
  onOmitir?: () => void // "estudiar sin convocatoria"
  onCancelar?: () => void // cerrar sin cambiar (cuando ya tenía una)
}) {
  const [slug, setSlug] = useState<string | null>(actual?.split(':')[0] ?? null)
  const elegida = CONVOCATORIAS.find((c) => c.slug === slug) ?? null

  return (
    <section
      aria-labelledby="concurso-title"
      className="rounded-3xl border border-brand-200 dark:border-brand-500/30 bg-gradient-to-br from-brand-50 to-white dark:from-brand-500/10 dark:to-slate-900 p-5 sm:p-7"
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-brand-700 text-white">
          <ClipboardList className="w-5 h-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 id="concurso-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {elegida ? `¿A qué empleo de ${elegida.nombre} te presentas?` : '¿A qué concurso te presentas?'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
            {elegida
              ? 'Cada perfil tiene sus temas y pesos. Con él armamos tu plan, tu simulacro y tu progreso.'
              : 'Elige tu convocatoria y te mostramos qué estudiar, cuánto pesa cada tema y cómo vas.'}
          </p>
        </div>
      </div>

      {!elegida ? (
        <>
          <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONVOCATORIAS.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => (c.perfiles.length === 1 ? onElegir(`${c.slug}:${c.perfiles[0].id}`) : setSlug(c.slug))}
                  className="group h-full w-full text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:border-brand-400 dark:hover:border-brand-500/60 hover:shadow-md transition-[border-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold leading-snug text-slate-900 dark:text-white">{c.nombre}</span>
                    <ArrowRight className="shrink-0 mt-0.5 w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
                  </span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{c.entidad}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {c.vacantes ? (
                      <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {c.vacantesAprox ? 'Unas ' : ''}
                        {formato.format(c.vacantes)} vacantes
                      </span>
                    ) : null}
                    {c.fechaPrueba ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                        <CalendarClock className="w-3.5 h-3.5" aria-hidden /> Prueba con fecha
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 line-clamp-1">{estadoCorto(c)}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {onCancelar && (
              <button type="button" onClick={onCancelar} className="font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Cancelar
              </button>
            )}
            {onOmitir && (
              <button type="button" onClick={onOmitir} className="font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                Mi concurso no está en la lista: estudiar en general
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div role="radiogroup" aria-label={`Empleos de ${elegida.nombre}`} className="mt-5 grid sm:grid-cols-2 gap-2.5">
            {elegida.perfiles.map((p) => {
              const clave = `${elegida.slug}:${p.id}`
              const marcado = actual === clave
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={marcado}
                  onClick={() => onElegir(clave)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    marcado
                      ? 'border-brand-700 bg-brand-700 text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-brand-400'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Los perfiles agrupan los empleos por tipo.{' '}
            <Link href={`/mi-convocatoria/${elegida.slug}#ejes`} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
              ¿Tienes tu {elegida.fueraCnsc ? 'cargo' : 'OPEC'}? Pega sus ejes temáticos y ajustamos el plan
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setSlug(null)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden /> Ver todos los concursos
          </button>
        </>
      )}
    </section>
  )
}
