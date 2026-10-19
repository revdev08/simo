'use client'

// «Escribe tu OPEC»: lleva a la página del empleo con su ficha, sus temas y su plan.
import { ArrowRight, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BuscarOpec({ slug, nombre, numeros }: { slug: string; nombre: string; numeros: number[] }) {
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')

  const buscar = (e: React.FormEvent) => {
    e.preventDefault()
    const numero = Number(texto.replace(/\D/g, ''))
    if (!numero) return setError('Escribe el número de tu OPEC: son solo números, por ejemplo 236844.')
    if (!numeros.includes(numero)) {
      return setError(`No encontramos la OPEC ${numero} entre las ${numeros.length} de ${nombre} (modalidad de ingreso). Revisa el número en SIMO, en tu constancia de inscripción.`)
    }
    router.push(`/mi-convocatoria/${slug}/opec/${numero}`)
  }

  return (
    <form id="opec" onSubmit={buscar} className="scroll-mt-24 rounded-3xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-5 sm:p-6">
      <label htmlFor="numero-opec" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
        <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden /> Escribe tu número de OPEC
      </label>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Te mostramos tu empleo, los temas de su ficha del Manual de Funciones, cuántas preguntas tenemos de cada uno y tu plan.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          id="numero-opec"
          inputMode="numeric"
          autoComplete="off"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setError('')
          }}
          placeholder="236844"
          aria-describedby={error ? 'opec-error' : undefined}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-xs"
        />
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 cursor-pointer">
          Ver mi empleo <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </div>
      {error && (
        <p id="opec-error" role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </form>
  )
}
