// Datos del aspirante que se guardan junto a su progreso (en la misma fila de `user_progress`),
// con claves que empiezan por "_" para no confundirse con los ids de las preguntas.
// Así "Mi progreso" los lee en el servidor y se conservan entre dispositivos.

export const CLAVE_SIMULACROS = '_simulacros'
export const CLAVE_ACTIVIDAD = '_actividad'
export const CLAVE_PERFIL = '_perfil'

// Cuántos simulacros y días de actividad se conservan
const MAX_SIMULACROS = 30
const MAX_DIAS = 90

export type Respuesta = 'correct' | 'incorrect'

export interface ResumenSimulacro {
  fecha: number
  n: number
  respondidas: number
  conocimientos: number | null // 0-100
  comportamentales: number | null // 0-100
  titulo?: string // "DIAN 2676 · Gestor o Inspector de tributos"
  convocatoria?: string // "dian-2676:tributos"
  minimo?: number
  modulos: Record<string, [number, number]> // [correctas, total]
}

export interface PerfilGuardado {
  convocatoria?: string | null
  nivel?: string | null
  area?: string | null
  inicio?: string // AAAA-MM-DD: día en que eligió la convocatoria (para el plan semanal)
}

export interface MetaProgreso {
  simulacros: ResumenSimulacro[]
  actividad: Record<string, number> // AAAA-MM-DD → preguntas respondidas
  perfil: PerfilGuardado | null
}

const esObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)

// Separa las respuestas a preguntas de los datos del aspirante
export function separarProgreso(data: unknown): { respuestas: Record<string, Respuesta>; meta: MetaProgreso } {
  const respuestas: Record<string, Respuesta> = {}
  const meta: MetaProgreso = { simulacros: [], actividad: {}, perfil: null }
  if (!esObjeto(data)) return { respuestas, meta }
  for (const [k, v] of Object.entries(data)) {
    if (!k.startsWith('_')) {
      if (v === 'correct' || v === 'incorrect') respuestas[k] = v
    } else if (k === CLAVE_SIMULACROS && Array.isArray(v)) {
      meta.simulacros = v.filter((s): s is ResumenSimulacro => esObjeto(s) && typeof s.fecha === 'number' && typeof s.n === 'number')
    } else if (k === CLAVE_ACTIVIDAD && esObjeto(v)) {
      for (const [dia, n] of Object.entries(v)) if (/^\d{4}-\d{2}-\d{2}$/.test(dia) && typeof n === 'number') meta.actividad[dia] = n
    } else if (k === CLAVE_PERFIL && esObjeto(v)) {
      meta.perfil = v as PerfilGuardado
    }
  }
  return { respuestas, meta }
}

// Fecha local en formato AAAA-MM-DD
export function hoyISO(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function sumarActividad(actividad: Record<string, number>, n: number, dia = hoyISO()): Record<string, number> {
  const next = { ...actividad, [dia]: (actividad[dia] ?? 0) + n }
  const dias = Object.keys(next).sort()
  for (const viejo of dias.slice(0, Math.max(0, dias.length - MAX_DIAS))) delete next[viejo]
  return next
}

export function agregarSimulacro(lista: ResumenSimulacro[], s: ResumenSimulacro): ResumenSimulacro[] {
  return [...lista, s].sort((a, b) => a.fecha - b.fecha).slice(-MAX_SIMULACROS)
}

// Días seguidos con práctica, contando hasta hoy (o hasta ayer, si hoy aún no ha practicado)
export function rachaActual(actividad: Record<string, number>, hoy = new Date()): number {
  let racha = 0
  const d = new Date(hoy)
  if (!actividad[hoyISO(d)]) d.setDate(d.getDate() - 1)
  while (actividad[hoyISO(d)]) {
    racha++
    d.setDate(d.getDate() - 1)
  }
  return racha
}

// Preguntas respondidas desde el lunes de esta semana
export function preguntasEstaSemana(actividad: Record<string, number>, hoy = new Date()): number {
  const d = new Date(hoy)
  const desdeLunes = (d.getDay() + 6) % 7
  let total = 0
  for (let i = 0; i <= desdeLunes; i++) {
    total += actividad[hoyISO(d)] ?? 0
    d.setDate(d.getDate() - 1)
  }
  return total
}

// Guarda los datos del aspirante en su fila de progreso. No bloquea: si falla, sigue en el navegador.
export function guardarMeta(parcial: Partial<Record<typeof CLAVE_SIMULACROS | typeof CLAVE_ACTIVIDAD | typeof CLAVE_PERFIL, unknown>>) {
  fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress: parcial }),
    keepalive: true,
  }).catch(() => {})
}
