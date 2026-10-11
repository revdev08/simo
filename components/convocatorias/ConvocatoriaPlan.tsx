'use client'

// Elige el perfil de empleo dentro de la convocatoria y muestra qué estudiar y el plan semanal
import { ArrowRight, BookOpen, Settings2, Timer } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AREAS_FUNCIONALES, NIVELES } from '@/lib/question-types'
import type { PerfilConvocatoria } from '@/lib/convocatorias/tipos'
import PlanBuilder from './PlanBuilder'

const pct = (n: number, total: number) => `${Math.round((n / total) * 100)}%`

export default function ConvocatoriaPlan({
  slug,
  nombre,
  perfiles,
  disponibles,
}: {
  slug: string
  nombre: string
  perfiles: PerfilConvocatoria[]
  disponibles: Record<string, number>
}) {
  const [perfilId, setPerfilId] = useState(perfiles[0]?.id)
  const perfil = perfiles.find((p) => p.id === perfilId) ?? perfiles[0]
  if (!perfil) return null
  const modulos = perfil.modulos.filter((m) => (disponibles[m.modulo] ?? 0) > 0)
  const totalPeso = modulos.reduce((s, m) => s + m.peso, 0)
  const nivel = NIVELES.find((n) => n.id === perfil.nivel)?.label
  const area = AREAS_FUNCIONALES.find((a) => a.id === perfil.area)?.label

  return (
    <div className="space-y-10">
      {perfiles.length > 1 && (
        <div>
          <p id="perfil-label" className="text-sm font-semibold text-slate-900 dark:text-white">
            ¿A qué empleo te presentas?
          </p>
          <div role="radiogroup" aria-labelledby="perfil-label" className="mt-3 flex flex-wrap gap-2">
            {perfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={p.id === perfil.id}
                onClick={() => setPerfilId(p.id)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold text-left transition-colors cursor-pointer ${
                  p.id === perfil.id
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <section>
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Qué estudiar y cuánto pesa
        </h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[...modulos]
            .sort((a, b) => b.peso - a.peso)
            .map((m) => (
              <li key={m.modulo} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/dashboard?modulo=${encodeURIComponent(m.modulo)}`}
                    className="min-w-0 font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {m.modulo}
                  </Link>
                  <span className="shrink-0 text-sm font-bold text-blue-600 dark:text-blue-400">{pct(m.peso, totalPeso)}</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden>
                  <div className="h-full rounded-full bg-blue-600" style={{ width: pct(m.peso, totalPeso) }} />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{disponibles[m.modulo]} preguntas para practicar</p>
              </li>
            ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          El porcentaje es el tiempo de estudio que te sugerimos, no el peso oficial de cada tema en la prueba.
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tu plan semana a semana</h3>
        <div className="mt-4">
          <PlanBuilder key={perfil.id} modulos={modulos} disponibles={disponibles} />
        </div>
      </section>

      <section className="rounded-3xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-5 sm:p-6">
        <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Simulacro de {nombre}
        </h3>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          En tu panel, el simulacro reparte las preguntas con los pesos de este perfil, con cronómetro y resultado por módulo.
          {area ? <> Al abrirlo desde aquí también elegimos por ti el área <strong>{area}</strong>.</> : null}
          {nivel ? <> Si aún no tienes nivel, quedará en <strong>{nivel}</strong>.</> : null}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard?convocatoria=${encodeURIComponent(slug)}&perfil=${encodeURIComponent(perfil.id)}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
          >
            Hacer el simulacro de esta convocatoria <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Settings2 className="w-3.5 h-3.5" aria-hidden /> Puedes cambiar la convocatoria en «Configura tu prueba».
          </span>
        </div>
      </section>
    </div>
  )
}
