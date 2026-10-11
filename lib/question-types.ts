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
      'Control Interno',
      'Planeación y Proyectos de Inversión',
      'Contabilidad Pública',
      'Almacén e Inventarios',
      'Sistema de Salud y ESE',
      'Gestión Territorial',
      'Derecho Laboral',
      'Inspección, Vigilancia y Control del Trabajo',
      'Gestión Tributaria (DIAN)',
      'Aduanero y Cambiario (DIAN)',
      'Carrera y Gestión Institucional (DIAN)',
      'Pedagogía y Normativa Docente',
      'Saber Disciplinar: Primaria',
      'Saber Disciplinar: Matemáticas',
      'Saber Disciplinar: Lenguaje',
      'Saber Disciplinar: Ciencias Naturales',
      'Saber Disciplinar: Ciencias Sociales',
      'Saber Disciplinar: Preescolar',
      'Saber Disciplinar: Inglés',
      'Saber Disciplinar: Tecnología e Informática',
      'Saber Disciplinar: Educación Física',
      'Saber Disciplinar: Educación Artística',
      'Saber Disciplinar: Filosofía y Ética',
      'Orientación Escolar',
      'Competencias Blandas del Docente',
      'Gestión Escolar (Directivos Docentes)',
      'Gestión Ambiental',
      'Distrito Capital (Bogotá)',
      'Políticas Sociales y Enfoque Diferencial',
      'Protección de Personas (UNP)',
      'Vigilancia Sanitaria (INVIMA)',
      'Procuraduría General de la Nación',
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
    modulos: [
      'Razonamiento Lógico y Cuantitativo',
      'Comprensión Lectora',
      'Lectura Crítica (Prueba Docente)',
      'Razonamiento Cuantitativo (Prueba Docente)',
      'Herramientas de Oficina y Seguridad Digital',
    ],
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
  { id: 'control_interno', label: 'Control interno', frase: 'control interno', modulo: 'Control Interno' },
  { id: 'planeacion', label: 'Planeación', frase: 'planeación y proyectos de inversión', modulo: 'Planeación y Proyectos de Inversión' },
  { id: 'contabilidad', label: 'Contabilidad', frase: 'contabilidad pública', modulo: 'Contabilidad Pública' },
  { id: 'almacen', label: 'Almacén e inventarios', frase: 'almacén e inventarios', modulo: 'Almacén e Inventarios' },
  { id: 'salud', label: 'Salud (ESE)', frase: 'sistema de salud y ESE', modulo: 'Sistema de Salud y ESE' },
  { id: 'territorial', label: 'Gestión territorial', frase: 'gestión territorial', modulo: 'Gestión Territorial' },
  { id: 'laboral', label: 'Derecho laboral', frase: 'derecho laboral', modulo: 'Derecho Laboral' },
  { id: 'ivc_trabajo', label: 'Inspección del trabajo', frase: 'inspección del trabajo', modulo: 'Inspección, Vigilancia y Control del Trabajo' },
  { id: 'dian_tributaria', label: 'DIAN: tributaria', frase: 'gestión tributaria', modulo: 'Gestión Tributaria (DIAN)' },
  { id: 'dian_aduanera', label: 'DIAN: aduanera y cambiaria', frase: 'aduanas y cambios', modulo: 'Aduanero y Cambiario (DIAN)' },
  { id: 'dian_institucional', label: 'DIAN: carrera y gestión', frase: 'carrera y gestión de la DIAN', modulo: 'Carrera y Gestión Institucional (DIAN)' },
  { id: 'docente', label: 'Docente', frase: 'pedagogía y normativa docente', modulo: 'Pedagogía y Normativa Docente' },
  { id: 'docente_primaria', label: 'Docente de primaria', frase: 'saber disciplinar de primaria', modulo: 'Saber Disciplinar: Primaria' },
  { id: 'docente_matematicas', label: 'Docente de matemáticas', frase: 'saber disciplinar de matemáticas', modulo: 'Saber Disciplinar: Matemáticas' },
  { id: 'docente_lenguaje', label: 'Docente de lenguaje', frase: 'saber disciplinar de lenguaje', modulo: 'Saber Disciplinar: Lenguaje' },
  { id: 'docente_ciencias', label: 'Docente de ciencias naturales', frase: 'saber disciplinar de ciencias naturales', modulo: 'Saber Disciplinar: Ciencias Naturales' },
  { id: 'docente_sociales', label: 'Docente de ciencias sociales', frase: 'saber disciplinar de ciencias sociales', modulo: 'Saber Disciplinar: Ciencias Sociales' },
  { id: 'docente_preescolar', label: 'Docente de preescolar', frase: 'saber disciplinar de preescolar', modulo: 'Saber Disciplinar: Preescolar' },
  { id: 'docente_ingles', label: 'Docente de inglés', frase: 'saber disciplinar de inglés', modulo: 'Saber Disciplinar: Inglés' },
  { id: 'docente_tecnologia', label: 'Docente de tecnología', frase: 'saber disciplinar de tecnología e informática', modulo: 'Saber Disciplinar: Tecnología e Informática' },
  { id: 'docente_educacion_fisica', label: 'Docente de educación física', frase: 'saber disciplinar de educación física', modulo: 'Saber Disciplinar: Educación Física' },
  { id: 'docente_artistica', label: 'Docente de artística', frase: 'saber disciplinar de educación artística', modulo: 'Saber Disciplinar: Educación Artística' },
  { id: 'docente_filosofia', label: 'Docente de filosofía o ética', frase: 'saber disciplinar de filosofía y ética', modulo: 'Saber Disciplinar: Filosofía y Ética' },
  { id: 'docente_orientador', label: 'Docente orientador', frase: 'orientación escolar', modulo: 'Orientación Escolar' },
  { id: 'directivo_docente', label: 'Directivo docente', frase: 'gestión escolar', modulo: 'Gestión Escolar (Directivos Docentes)' },
  { id: 'ambiental', label: 'Ambiental (CAR)', frase: 'gestión ambiental', modulo: 'Gestión Ambiental' },
  { id: 'bogota', label: 'Bogotá D.C.', frase: 'régimen del Distrito Capital', modulo: 'Distrito Capital (Bogotá)' },
  { id: 'social', label: 'Políticas sociales', frase: 'políticas sociales y enfoque diferencial', modulo: 'Políticas Sociales y Enfoque Diferencial' },
  { id: 'unp', label: 'Protección (UNP)', frase: 'prevención y protección (UNP)', modulo: 'Protección de Personas (UNP)' },
  { id: 'invima', label: 'Vigilancia sanitaria (INVIMA)', frase: 'vigilancia sanitaria', modulo: 'Vigilancia Sanitaria (INVIMA)' },
  { id: 'procuraduria', label: 'Procuraduría', frase: 'funciones de la Procuraduría', modulo: 'Procuraduría General de la Nación' },
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

// Lo mínimo que necesita el reporte de rendimiento. `activa` indica si hoy se puede practicar
// (el reporte también cuenta respuestas antiguas a preguntas ya retiradas).
export type ReportQuestion = Pick<Question, 'id' | 'modulo' | 'tema' | 'nivel'> & { activa: boolean }
