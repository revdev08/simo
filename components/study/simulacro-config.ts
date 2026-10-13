// Configuración del simulacro tipo examen (la usan el inicio del panel y el armado del simulacro)
import type { SectionId } from '@/lib/question-types'

export const SIMULACRO_OPCIONES = [
  { n: 20, label: 'Rápido' },
  { n: 40, label: 'Estándar' },
  { n: 80, label: 'Completo' },
] as const

export const MINUTOS_POR_PREGUNTA = 2

// Sin área funcional el simulacro no incluye preguntas funcionales; con área, entran las de esa área
export const PESO_SIN_AREA: Record<SectionId, number> = { generales: 0.6, funcionales: 0, aptitudes: 0.15, comportamentales: 0.25 }
export const PESO_CON_AREA: Record<SectionId, number> = { generales: 0.45, funcionales: 0.2, aptitudes: 0.15, comportamentales: 0.2 }
export const ORDEN_SECCIONES: SectionId[] = ['generales', 'funcionales', 'aptitudes', 'comportamentales']
