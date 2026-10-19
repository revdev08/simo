// Temas de la ficha de una OPEC con lo que tenemos para practicar cada uno: preguntas del tema, un módulo que lo
// trata o nada todavía. La cobertura se calcula en lib/opec-cobertura.ts.
import Link from 'next/link'
import { ArrowRight, CircleCheck, CircleDashed, CircleX } from 'lucide-react'
import { tieneCobertura, type CoberturaTema } from '@/lib/opec-cobertura'

const practicarTema = (c: CoberturaTema) =>
  `/dashboard?preguntas=${encodeURIComponent(c.preguntas.join(','))}&tema=${encodeURIComponent(c.tema?.nombre ?? c.competencia)}`
const practicarModulo = (modulo: string) => `/dashboard?modulo=${encodeURIComponent(modulo)}`

function Fila({ c }: { c: CoberturaTema }) {
  const n = c.preguntas.length
  return (
    <li className="flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800 py-2.5 first:border-t-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="flex gap-2 text-sm text-slate-800 dark:text-slate-200">
        {n >= 5 ? (
          <CircleCheck className="mt-0.5 w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
        ) : n > 0 || c.modulos.length ? (
          <CircleDashed className="mt-0.5 w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        ) : (
          <CircleX className="mt-0.5 w-4 h-4 shrink-0 text-slate-400" aria-hidden />
        )}
        {c.competencia}
      </span>
      <span className="pl-6 text-xs sm:shrink-0 sm:pl-0 sm:text-right">
        {n > 0 && (
          <Link href={practicarTema(c)} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline dark:text-blue-300">
            {n} {n === 1 ? 'pregunta' : 'preguntas'} · practicar <ArrowRight className="w-3 h-3" aria-hidden />
          </Link>
        )}
        {c.modulos.map((m) => (
          <Link key={m.modulo} href={practicarModulo(m.modulo)} className="block font-semibold text-blue-700 hover:underline dark:text-blue-300">
            Módulo {m.modulo} ({m.n})
          </Link>
        ))}
        {!tieneCobertura(c) && <span className="text-slate-500 dark:text-slate-400">Aún no tenemos preguntas</span>}
      </span>
    </li>
  )
}

export default function TemasOpec({ titulo, items, destacado = false }: { titulo: string; items: CoberturaTema[]; destacado?: boolean }) {
  if (!items.length) return null
  const cubiertos = items.filter(tieneCobertura).length
  return (
    <div className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 ${destacado ? 'border-blue-200 dark:border-blue-900' : 'border-slate-200 dark:border-slate-800'}`}>
      <h3 className="font-bold text-slate-900 dark:text-white">{titulo}</h3>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Tenemos práctica para {cubiertos} de {items.length} {items.length === 1 ? 'tema' : 'temas'}
      </p>
      <ul className="mt-2">
        {items.map((c) => (
          <Fila key={c.competencia} c={c} />
        ))}
      </ul>
    </div>
  )
}
