// Piezas visuales compartidas por el inicio, el estudio por módulo y el simulacro
import React from 'react'

export function ProgressBar({
  value,
  className = '',
  barClass = 'bg-brand-600 dark:bg-brand-500',
  label,
}: {
  value: number
  className?: string
  barClass?: string
  label?: string
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ${className}`}
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${barClass}`} style={{ width: `${value}%` }} />
    </div>
  )
}

const BADGE_TONES = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
} as const

export type BadgeTone = keyof typeof BADGE_TONES

export function Badge({ tone = 'neutral', title, children }: { tone?: BadgeTone; title?: string; children: React.ReactNode }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  )
}

export const DIFICULTAD_TONE: Record<string, BadgeTone> = { Baja: 'green', Media: 'amber', Alta: 'red' }

// Estado visual de una opción de respuesta
export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'partial' | 'dimmed'

const OPTION_STYLES: Record<OptionState, { card: string; letter: string }> = {
  idle: {
    card: 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-brand-400 hover:bg-brand-50/40 dark:hover:border-brand-500/60 dark:hover:bg-brand-500/5',
    letter: 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 group-hover:border-brand-500 group-hover:text-brand-700 dark:group-hover:text-brand-300',
  },
  selected: {
    card: 'border-brand-600 bg-brand-50/70 dark:border-brand-400 dark:bg-brand-500/10',
    letter: 'border-brand-600 bg-brand-600 text-white dark:border-brand-400 dark:bg-brand-500',
  },
  correct: {
    card: 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-500/10',
    letter: 'border-emerald-500 bg-emerald-500 text-white',
  },
  wrong: {
    card: 'border-red-500 bg-red-50/80 dark:bg-red-500/10',
    letter: 'border-red-500 bg-red-500 text-white',
  },
  partial: {
    card: 'border-amber-500 bg-amber-50/80 dark:bg-amber-500/10',
    letter: 'border-amber-500 bg-amber-500 text-white',
  },
  dimmed: {
    card: 'border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 opacity-60',
    letter: 'border-slate-300 dark:border-slate-700 text-slate-400',
  },
}

// Opción de respuesta: tarjeta grande, fácil de tocar en el celular
export function OptionCard({
  letter,
  text,
  state,
  onClick,
  disabled,
  role,
  ariaChecked,
  children,
}: {
  letter: string
  text: string
  state: OptionState
  onClick?: () => void
  disabled?: boolean
  role?: 'radio'
  ariaChecked?: boolean
  children?: React.ReactNode
}) {
  const s = OPTION_STYLES[state]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role={role}
      aria-checked={ariaChecked}
      className={`group w-full text-left rounded-2xl border-2 p-4 sm:p-5 flex items-start gap-3.5 transition-colors disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${s.card}`}
    >
      <span className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${s.letter}`}>{letter}</span>
      <span className="min-w-0 flex-1 pt-1 space-y-2">
        <span className="block text-[15px] sm:text-base leading-relaxed text-slate-800 dark:text-slate-100">{text}</span>
        {children}
      </span>
    </button>
  )
}

// Etiquetas del puntaje de ajuste (0 a 3) en juicio situacional
export const AJUSTE_LABEL = ['No alineada', 'Ajuste bajo', 'Ajuste medio', 'Ajuste alto']

// Anillo de puntaje (0 a 100)
export function ScoreRing({ value, size = 128, label }: { value: number; size?: number; label: string }) {
  const stroke = 10
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const tone = value >= 70 ? 'text-emerald-500' : value >= 50 ? 'text-amber-500' : 'text-red-500'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-slate-100 dark:stroke-slate-800" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className={`fill-none stroke-current transition-[stroke-dashoffset] duration-700 ${tone}`}
        />
      </svg>
      <span className="absolute text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{value}%</span>
    </div>
  )
}

// Desplaza suave, salvo que el usuario pida menos movimiento
export function scrollIntoViewSoft(el: Element | null, block: ScrollLogicalPosition = 'nearest') {
  if (!el) return
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block })
}

// Ignora los atajos de teclado mientras se escribe en un campo
export function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
}

// Convierte la tecla pulsada en la letra de una opción (A–D o 1–4)
export function optionFromKey(key: string, ids: string[]): string | null {
  const k = key.toUpperCase()
  if (ids.includes(k)) return k
  const n = Number(key)
  return Number.isInteger(n) && n >= 1 && n <= ids.length ? ids[n - 1] : null
}
