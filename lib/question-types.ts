// Tipos compartidos del banco de preguntas (servidor y cliente).
// El formato completo v2 está en docs/banco/GUIA_REDACCION.md; aquí solo va lo que usa la app.

export interface QuestionOption {
  id: string
  texto: string
  explicacion?: string // solo en preguntas v2: por qué la opción es correcta o incorrecta
}

export interface Question {
  id: number | string // números en el banco original, "TC-909-001" en el formato v2
  modulo: string
  tema: string
  dificultad: string
  pregunta: string
  opciones: QuestionOption[]
  respuestaCorrecta: string
  explicacionIA: string
  estado?: string // beta | estable | en_revision | borrador | retirada
  version?: number
  norma?: string
  articulos?: string[]
}

// Motivos para reportar un error (deben coincidir con el check de question_reports en lib/question-feedback.sql)
export const REPORT_REASONS = [
  { id: 'respuesta_incorrecta', label: 'La respuesta marcada como correcta está mal' },
  { id: 'mas_de_una_correcta', label: 'Hay más de una respuesta correcta' },
  { id: 'norma_desactualizada', label: 'La norma citada está derogada o desactualizada' },
  { id: 'redaccion_confusa', label: 'La pregunta es confusa o tiene errores de redacción' },
  { id: 'otro', label: 'Otro problema' },
] as const

// Lo mínimo que necesita el reporte de rendimiento
export type ReportQuestion = Pick<Question, 'id' | 'modulo' | 'tema'>
