'use client'

// "Pega tus ejes temáticos": relaciona cada eje con los módulos del banco y arma el plan con esos pesos.
import { AlertTriangle, CheckCircle2, ClipboardPaste, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { analizarEjes, type ResultadoEjes } from '@/lib/convocatorias/ejes'
import PlanBuilder from './PlanBuilder'

const EJEMPLO = `Constitución Política y estructura del Estado
Ley 909 de 2004 y carrera administrativa
Derecho de petición y CPACA
Presupuesto público: CDP, registro presupuestal y PAC
Contratación estatal: modalidades de selección y supervisión
Herramientas ofimáticas (Excel)`

export default function EjesTool({ disponibles }: { disponibles: Record<string, number> }) {
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState<ResultadoEjes | null>(null)
  const modulosConPreguntas = useMemo(
    () => new Set(Object.entries(disponibles).filter(([, n]) => n > 0).map(([m]) => m)),
    [disponibles],
  )

  const analizar = () => {
    if (!texto.trim()) return
    setResultado(analizarEjes(texto, modulosConPreguntas))
  }

  // Cada módulo pesa según cuántos ejes lo piden; aptitudes y comportamentales siempre entran con peso base
  const modulosPlan = useMemo(() => {
    if (!resultado) return []
    const base = resultado.modulos.map((m) => ({ modulo: m.modulo, peso: m.ejes }))
    for (const extra of ['Razonamiento Lógico y Cuantitativo', 'Comprensión Lectora', 'Competencias Comportamentales']) {
      if (!base.some((b) => b.modulo === extra) && modulosConPreguntas.has(extra)) base.push({ modulo: extra, peso: 0.5 })
    }
    return base
  }, [resultado, modulosConPreguntas])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6">
        <label htmlFor="ejes" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <ClipboardPaste className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden />
          Pega los ejes temáticos de tu empleo
        </label>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Los encuentras en SIMO, en la ficha del empleo (OPEC), o en el anexo del acuerdo de la convocatoria. Uno por línea.
        </p>
        <textarea
          id="ejes"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={7}
          placeholder={EJEMPLO}
          className="mt-4 w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={analizar}
            disabled={!texto.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="w-4 h-4" aria-hidden /> Armar mi plan
          </button>
          {!texto && (
            <button
              type="button"
              onClick={() => setTexto(EJEMPLO)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Usar un ejemplo
            </button>
          )}
        </div>
      </div>

      {resultado && (
        <div className="space-y-6" aria-live="polite">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Qué estudiar en SIMO TEST</h3>
              {resultado.modulos.length ? (
                <ul className="mt-3 space-y-2">
                  {resultado.modulos.map((m) => (
                    <li key={m.modulo} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{m.modulo}</span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        {m.ejes} {m.ejes === 1 ? 'eje' : 'ejes'} · {disponibles[m.modulo] ?? 0} preguntas
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  No reconocimos ningún eje. Prueba a pegarlos uno por línea, con el nombre de la norma o del tema.
                </p>
              )}
            </section>
            <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white">Cómo leímos cada eje</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {resultado.ejes.map((e, i) => (
                  <li key={i} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3">
                    <p className="text-slate-800 dark:text-slate-200">{e.texto}</p>
                    {e.modulos.length ? (
                      <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">→ {e.modulos.join(' · ')}</p>
                    ) : (
                      <p className="mt-1 flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3" aria-hidden /> Aún no tenemos preguntas de este eje
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {modulosPlan.length > 0 && (
            <section>
              <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Tu plan semana a semana</h3>
              <PlanBuilder modulos={modulosPlan} disponibles={disponibles} />
            </section>
          )}
        </div>
      )}
    </div>
  )
}
