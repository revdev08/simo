'use client'

import React, { useState } from 'react'
import { Flag, CheckCircle } from 'lucide-react'
import { REPORT_REASONS } from '@/lib/question-types'

type Status = 'closed' | 'open' | 'sending' | 'sent' | 'error'

// Botón y formulario para que el usuario reporte un error en una pregunta
export default function ReportQuestion({ questionId }: { questionId: number | string }) {
  const [status, setStatus] = useState<Status>('closed')
  const [motivo, setMotivo] = useState<string>(REPORT_REASONS[0].id)
  const [comentario, setComentario] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fieldId = `report-${questionId}`

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (motivo === 'otro' && !comentario.trim()) {
      setErrorMsg('Cuéntanos cuál es el error.')
      setStatus('error')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, motivo, comentario }),
      })
      if (res.ok) {
        setStatus('sent')
      } else {
        const data = await res.json().catch(() => null)
        setErrorMsg(data?.error ?? 'No se pudo enviar el reporte. Intenta de nuevo.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('No se pudo enviar el reporte. Revisa tu conexión e intenta de nuevo.')
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle className="w-4 h-4" /> Gracias. Revisaremos esta pregunta.
      </p>
    )
  }

  if (status === 'closed') {
    return (
      <button
        type="button"
        onClick={() => setStatus('open')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
      >
        <Flag className="w-3.5 h-3.5" /> Reportar un error en esta pregunta
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
      <div className="space-y-1.5">
        <label htmlFor={`${fieldId}-motivo`} className="text-sm font-bold text-slate-800 dark:text-slate-200">
          ¿Qué problema encontraste?
        </label>
        <select
          id={`${fieldId}-motivo`}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
        >
          {REPORT_REASONS.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${fieldId}-comentario`} className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Detalle {motivo === 'otro' ? '' : <span className="font-normal text-slate-500">(opcional)</span>}
        </label>
        <textarea
          id={`${fieldId}-comentario`}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Por ejemplo: el artículo citado fue modificado por…"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
        />
      </div>
      {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setStatus('closed')}
          className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-4 py-2 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl disabled:opacity-50"
        >
          {status === 'sending' ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </div>
    </form>
  )
}
