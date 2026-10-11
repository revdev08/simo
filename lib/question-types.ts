// Tipos compartidos del banco de preguntas (servidor y cliente).
// El formato completo v2 está en docs/banco/GUIA_REDACCION.md; aquí solo va lo que usa la app.

export interface QuestionOption {
  id: string
  texto: string
  explicacion?: string // solo en preguntas v2: por qué la opción es correcta o incorrecta
  puntaje?: number // solo en juicio situacional: ajuste de 0 a 3 a la conducta esperada
}

// Niveles jerárquicos para las comportamentales (Decreto 1083 de 2015, art. 2.2.4.8)
export const NIVELES = [
  { id: 'asistencial', label: 'Asistencial' },
  { id: 'tecnico', label: 'Técnico' },
  { id: 'profesional', label: 'Profesional' },
  { id: 'asesor', label: 'Asesor' },
] as const

export type NivelId = (typeof NIVELES)[number]['id']

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
  formato?: string // "juicio_situacional" en las comportamentales con puntaje
  nivel?: string[] // ["todos"] o los niveles a los que aplica
  competencia?: string
  subtema?: string
  fundamentos?: boolean // pregunta de concepto básico: sirve para estudiar, no entra al simulacro
}

// Módulos agrupados como las pruebas de la CNSC. El orden de las listas es el orden en pantalla.
export const MODULE_SECTIONS = [
  {
    id: 'generales',
    titulo: 'Competencias generales',
    descripcion: 'Lo que se evalúa en casi todas las convocatorias: Estado, empleo público, procedimiento y gestión.',
    modulos: [
      'Constitución y Estructura del Estado',
      'Empleo Público y Carrera Administrativa',
      'Derecho de Petición y Procedimiento Administrativo',
      'Transparencia, Datos Personales y Archivo',
      'Disciplinario y Anticorrupción',
      'Gestión Pública: MIPG, Presupuesto y Contratación',
      'Atención al Ciudadano',
    ],
  },
  {
    id: 'funcionales',
    titulo: 'Competencias funcionales',
    descripcion: 'Temas propios del área de tu cargo. En el simulacro solo entran si eliges tu área.',
    modulos: [
      'Talento Humano',
      'Contratación Estatal Aplicada',
      'Gestión Jurídica',
      'Gestión Financiera y Presupuestal',
      'Seguridad y Salud en el Trabajo',
      'Gestión Documental',
      'TIC y Gobierno Digital',
    ],
  },
  {
    id: 'comportamentales',
    titulo: 'Competencias comportamentales',
    descripcion: 'Situaciones laborales calificadas según las conductas del Decreto 815 de 2018 para tu nivel.',
    modulos: ['Competencias Comportamentales'],
  },
  {
    id: 'aptitudes',
    titulo: 'Aptitudes',
    descripcion: 'Razonamiento, lectura y herramientas de trabajo.',
    modulos: ['Razonamiento Lógico y Cuantitativo', 'Comprensión Lectora', 'Herramientas de Oficina y Seguridad Digital'],
  },
] as const

export type SectionId = (typeof MODULE_SECTIONS)[number]['id']

// Áreas funcionales (capa 3): cada una corresponde a un módulo de la sección "funcionales".
// `label` va en el botón; `frase` completa "más preguntas del área de …".
export const AREAS_FUNCIONALES = [
  { id: 'talento_humano', label: 'Talento humano', frase: 'talento humano', modulo: 'Talento Humano' },
  { id: 'contratacion', label: 'Contratación', frase: 'contratación', modulo: 'Contratación Estatal Aplicada' },
  { id: 'juridica', label: 'Jurídica', frase: 'jurídica', modulo: 'Gestión Jurídica' },
  { id: 'financiera', label: 'Financiera', frase: 'financiera y presupuestal', modulo: 'Gestión Financiera y Presupuestal' },
  { id: 'sst', label: 'Seguridad y salud (SST)', frase: 'seguridad y salud en el trabajo', modulo: 'Seguridad y Salud en el Trabajo' },
  { id: 'gestion_documental', label: 'Gestión documental', frase: 'gestión documental', modulo: 'Gestión Documental' },
  { id: 'tic', label: 'TIC', frase: 'TIC y gobierno digital', modulo: 'TIC y Gobierno Digital' },
] as const

export type AreaId = (typeof AREAS_FUNCIONALES)[number]['id']

export function sectionOf(modulo: string): SectionId {
  return MODULE_SECTIONS.find((s) => (s.modulos as readonly string[]).includes(modulo))?.id ?? 'generales'
}

export const isJuicioSituacional = (q: Pick<Question, 'formato'>) => q.formato === 'juicio_situacional'

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
