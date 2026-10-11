// Contenido de las páginas públicas del concurso docente (/concurso-docente y una por área).
// Cifras: suma de los 90 proyectos de acuerdo publicados por la CNSC el 19 de agosto de 2026.
// Revisar cuando salgan los acuerdos en firme y la guía de orientación.

export const REVISADO_DOCENTE = '2026-10-11'
export const SLUG_CONVOCATORIA_DOCENTE = 'docentes-2026'

export interface Referente {
  label: string
  url: string
}

export interface AreaDocente {
  slug: string
  perfilId: string // id del perfil en el catálogo de convocatorias (docentes-2026)
  nombre: string // "primaria", "inglés"…, para frases
  titulo: string // H1
  seoTitle: string
  seoDescription: string
  cargo: string // "docente de primaria"
  vacantes: number
  vacantesDetalle?: string
  modulo: string // módulo del banco con el saber propio del cargo
  intro: string
  disciplinar: string[] // qué se estudia en la parte disciplinar y pedagógica
  referentes: Referente[]
}

const MEN = {
  estandares: { label: 'Estándares Básicos de Competencias (Guía 7, MEN, 2006)', url: 'https://www.mineducacion.gov.co/1621/articles-340021_recurso_1.pdf' },
  ley115: { label: 'Ley 115 de 1994, Ley General de Educación', url: 'https://www.mineducacion.gov.co/1759/articles-85906_archivo_pdf.pdf' },
  dl1278: { label: 'Decreto Ley 1278 de 2002, Estatuto de Profesionalización Docente', url: 'https://www.mineducacion.gov.co/1621/articles-86102_archivo_pdf.pdf' },
  res3842: { label: 'Resolución 3842 de 2022, manual de funciones y competencias', url: 'https://www.mineducacion.gov.co/1780/articles-409868_pdf.pdf' },
  guia49: { label: 'Guía 49: convivencia escolar (Ley 1620 de 2013)', url: 'https://contenidos.mineducacion.gov.co/ntg/men/pdf/Guia%20No.%2049.pdf' },
}

export const AREAS_DOCENTES: AreaDocente[] = [
  {
    slug: 'primaria',
    perfilId: 'primaria',
    nombre: 'primaria',
    titulo: 'Concurso docente 2026 para primaria',
    seoTitle: 'Concurso docente 2026 primaria: qué estudiar y simulacro',
    seoDescription:
      'Primaria tiene 8.059 vacantes en el concurso docente 2026. Qué evalúa la prueba, temario de matemáticas, lenguaje y ciencias de 1.° a 5.°, y simulacro.',
    cargo: 'docente de primaria',
    vacantes: 8059,
    modulo: 'Saber Disciplinar: Primaria',
    intro:
      'Es el cargo con más plazas del concurso: casi tres de cada diez vacantes. El docente de primaria enseña todas las áreas básicas de 1.° a 5.°, así que la parte disciplinar mezcla matemáticas, lenguaje y ciencias naturales y sociales, con su didáctica.',
    disciplinar: [
      'Matemáticas de 1.° a 5.°: sistema de numeración, operaciones, fracciones, medición, geometría y datos.',
      'Lenguaje: lectura y escritura inicial, comprensión, producción de textos, oralidad y literatura infantil.',
      'Ciencias naturales y sociales de primaria, y cómo enseñarlas.',
      'Didáctica en aulas regulares, rurales y multigrado (Escuela Nueva).',
    ],
    referentes: [
      MEN.estandares,
      { label: 'DBA de matemáticas, versión 2', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-06/dba_matematicas-min.pdf' },
      { label: 'DBA de lenguaje, versión 2', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-05/dba_lenguaje-min.pdf' },
      { label: 'DBA de ciencias naturales', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-05/dba_c.naturales-min.pdf' },
    ],
  },
  {
    slug: 'preescolar',
    perfilId: 'preescolar',
    nombre: 'preescolar',
    titulo: 'Concurso docente 2026 para preescolar',
    seoTitle: 'Concurso docente 2026 preescolar: temario y preguntas',
    seoDescription:
      'Preescolar es la segunda área con más vacantes (3.723). Qué evalúa la prueba, temario de educación inicial según las Bases curriculares y simulacro.',
    cargo: 'docente de preescolar',
    vacantes: 3723,
    modulo: 'Saber Disciplinar: Preescolar',
    intro:
      'Con 3.723 plazas, preescolar es la segunda área más grande del concurso. La parte disciplinar se apoya en las Bases curriculares para la educación inicial y preescolar y en las normas del grado de transición.',
    disciplinar: [
      'Desarrollo infantil y propósitos de la educación inicial.',
      'Actividades rectoras: juego, arte, literatura y exploración del medio.',
      'Lectura y escritura emergentes, pensamiento matemático inicial y desarrollo socioemocional.',
      'Observación, documentación y valoración cualitativa; transición a primero; trabajo con familias.',
      'Normas: ingreso a transición, informes descriptivos y promoción automática (Decreto 1075 de 2015).',
    ],
    referentes: [
      { label: 'Bases curriculares para la educación inicial y preescolar (MEN, 2017)', url: 'https://www.mineducacion.gov.co/1780/articles-341880_recurso_1.pdf' },
      { label: 'DBA de transición', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-06/dba_transicion-min_0.pdf' },
      { label: 'Lineamientos curriculares de preescolar (1998)', url: 'https://www.mineducacion.gov.co/1780/articles-339975_recurso_11.pdf' },
    ],
  },
  {
    slug: 'matematicas',
    perfilId: 'matematicas',
    nombre: 'matemáticas',
    titulo: 'Concurso docente 2026 para matemáticas',
    seoTitle: 'Concurso docente 2026 matemáticas: qué estudiar',
    seoDescription:
      'Matemáticas tiene 1.945 vacantes en el concurso docente 2026. Temario de 6.° a 11.° (aritmética, álgebra, funciones, estadística) y su didáctica, y simulacro.',
    cargo: 'docente de matemáticas',
    vacantes: 1945,
    modulo: 'Saber Disciplinar: Matemáticas',
    intro:
      'El docente de matemáticas de secundaria y media se evalúa en el saber del área y en cómo enseñarlo, con los cinco pensamientos de los Estándares del MEN.',
    disciplinar: [
      'Aritmética y álgebra de 6.° a 9.°: enteros, racionales, proporcionalidad, porcentajes, ecuaciones e inecuaciones.',
      'Funciones y precálculo de 10.° y 11.°: exponenciales, logarítmicas, trigonométricas, sucesiones y variación.',
      'Geometría, medición, estadística y probabilidad.',
      'Didáctica: errores frecuentes de los estudiantes y cómo intervenir.',
    ],
    referentes: [
      MEN.estandares,
      { label: 'DBA de matemáticas, versión 2', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-06/dba_matematicas-min.pdf' },
      { label: 'Lineamientos curriculares de matemáticas (1998)', url: 'https://www.mineducacion.gov.co/1780/articles-339975_matematicas.pdf' },
    ],
  },
  {
    slug: 'orientador',
    perfilId: 'orientador',
    nombre: 'orientación escolar',
    titulo: 'Concurso docente 2026 para docente orientador',
    seoTitle: 'Concurso docente orientador 2026: qué estudiar',
    seoDescription:
      'El cargo de docente orientador tiene 1.892 vacantes. Funciones, Plan Nacional de Orientación Escolar, rutas de atención y casos de la prueba, con simulacro.',
    cargo: 'docente orientador',
    vacantes: 1892,
    modulo: 'Orientación Escolar',
    intro:
      'Con 1.892 plazas, el docente orientador es el cuarto cargo con más vacantes. Su prueba disciplinar gira alrededor de las funciones del cargo, el Plan Nacional de Orientación Escolar y la atención de casos con las rutas de la Ley 1620.',
    disciplinar: [
      'Funciones del orientador en la Resolución 3842 de 2022 y el Plan Nacional de Orientación Escolar (2021).',
      'Orientación socioocupacional, proyecto de vida, educación para la sexualidad y la ciudadanía.',
      'Casos de atención: riesgo suicida, violencia sexual, maltrato, consumo, embarazo adolescente y deserción.',
      'Rutas de atención, activación de entidades, confidencialidad y seguimiento.',
    ],
    referentes: [
      { label: 'Plan Nacional de Orientación Escolar (MEN, 2021)', url: 'https://www.mineducacion.gov.co/1759/articles-407341_recurso_1.pdf' },
      { label: 'Documento guía del docente orientador DG20 (MEN, 2014)', url: 'https://www.mineducacion.gov.co/1759/articles-342767_recurso_nuevo_20.pdf' },
      MEN.guia49,
      MEN.res3842,
    ],
  },
  {
    slug: 'ingles',
    perfilId: 'ingles',
    nombre: 'inglés',
    titulo: 'Concurso docente 2026 para inglés',
    seoTitle: 'Concurso docente 2026 inglés: temario y preguntas',
    seoDescription:
      'Inglés tiene 1.798 vacantes en el concurso docente 2026. Dominio de la lengua (B2), Guía 22, DBA y didáctica del inglés, con preguntas de práctica.',
    cargo: 'docente de inglés',
    vacantes: 1798,
    modulo: 'Saber Disciplinar: Inglés',
    intro:
      'El componente de inglés solo se evalúa a quienes se inscriben en ese empleo. Incluye el dominio de la lengua del docente y la didáctica del inglés con los estándares de la Guía 22.',
    disciplinar: [
      'Dominio de la lengua: gramática en contexto, vocabulario, lectura y pronunciación (nivel B2).',
      'Estructura de la Guía 22: niveles por grupos de grados y las cinco habilidades.',
      'Didáctica: enfoque comunicativo, aprendizaje basado en tareas, AICLE (CLIL), andamiaje y corrección de errores.',
      'Evaluación formativa y DBA de inglés de transición y primaria.',
    ],
    referentes: [
      { label: 'Guía 22: Estándares básicos de competencias en inglés (MEN, 2006)', url: 'https://www.mineducacion.gov.co/1621/articles-115174_archivo_pdf.pdf' },
      { label: 'DBA de inglés para transición y primaria', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-06/dba-transicion-y-primaria_ingles-min.pdf' },
    ],
  },
  {
    slug: 'ciencias-sociales',
    perfilId: 'sociales',
    nombre: 'ciencias sociales',
    titulo: 'Concurso docente 2026 para ciencias sociales',
    seoTitle: 'Concurso docente 2026 ciencias sociales: qué estudiar',
    seoDescription:
      'Ciencias sociales tiene 1.499 vacantes. Historia de Colombia, geografía, Constitución, competencias ciudadanas y su didáctica, con simulacro del concurso docente.',
    cargo: 'docente de ciencias sociales',
    vacantes: 1499,
    modulo: 'Saber Disciplinar: Ciencias Sociales',
    intro:
      'La CNSC anunció que el componente de ciencias sociales incluirá la historia de Colombia y su didáctica (Ley 1874 de 2017), además de geografía, Constitución y competencias ciudadanas.',
    disciplinar: [
      'Historia de Colombia y del mundo, y trabajo con fuentes históricas.',
      'Geografía física, humana y económica; regiones de Colombia.',
      'Constitución, democracia, mecanismos de participación y competencias ciudadanas.',
      'Economía básica y didáctica de las ciencias sociales.',
    ],
    referentes: [
      MEN.estandares,
      { label: 'Nuevos lineamientos de ciencias sociales (MEN, 2026)', url: 'https://www.mineducacion.gov.co/1780/articles-339975_recurso_17.pdf' },
      { label: 'DBA de ciencias sociales', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-05/dba_c.sociales-v2_0.pdf' },
    ],
  },
  {
    slug: 'lengua-castellana',
    perfilId: 'lenguaje',
    nombre: 'lengua castellana',
    titulo: 'Concurso docente 2026 para lengua castellana',
    seoTitle: 'Concurso docente 2026 lengua castellana: qué estudiar',
    seoDescription:
      'Lengua castellana tiene 1.316 vacantes. Lectura crítica, producción de textos, literatura, oralidad y su didáctica, con preguntas y simulacro del concurso docente.',
    cargo: 'docente de lengua castellana',
    vacantes: 1316,
    modulo: 'Saber Disciplinar: Lenguaje',
    intro:
      'El docente de lengua castellana se evalúa en los cinco factores de los Estándares de lenguaje y en su didáctica, de 6.° a 11.°.',
    disciplinar: [
      'Comprensión e interpretación de textos, lectura crítica y argumentación.',
      'Producción textual, gramática y ortografía en contexto.',
      'Literatura colombiana, latinoamericana y universal; géneros y recursos.',
      'Oralidad, medios de comunicación y ética de la comunicación.',
    ],
    referentes: [
      MEN.estandares,
      { label: 'DBA de lenguaje, versión 2', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-05/dba_lenguaje-min.pdf' },
      { label: 'Lineamientos curriculares de lengua castellana (1998)', url: 'https://www.mineducacion.gov.co/1780/articles-339975_recurso_6.pdf' },
    ],
  },
  {
    slug: 'ciencias-naturales',
    perfilId: 'ciencias',
    nombre: 'ciencias naturales, química y física',
    titulo: 'Concurso docente 2026 para ciencias naturales, química y física',
    seoTitle: 'Concurso docente 2026 ciencias naturales, química y física',
    seoDescription:
      'Ciencias naturales (1.236), química (780) y física (332): qué evalúa el concurso docente 2026, temario de biología, química y física, y preguntas de práctica.',
    cargo: 'docente de ciencias naturales, química o física',
    vacantes: 2348,
    vacantesDetalle: 'Ciencias naturales y educación ambiental 1.236, química 780 y física 332.',
    modulo: 'Saber Disciplinar: Ciencias Naturales',
    intro:
      'Ciencias naturales, química y física suman 2.348 plazas. La parte disciplinar cubre el entorno vivo y el entorno físico de los Estándares, con química y física de media para esos empleos.',
    disciplinar: [
      'Biología: célula, genética, evolución, fisiología, ecología y salud.',
      'Química: estructura atómica, enlaces, estequiometría, soluciones, equilibrio y pH.',
      'Física: cinemática, dinámica, energía, ondas, óptica, electricidad y magnetismo.',
      'Indagación científica, ciencia, tecnología y sociedad, y didáctica de las ciencias.',
    ],
    referentes: [
      MEN.estandares,
      { label: 'DBA de ciencias naturales', url: 'https://www.colombiaaprende.edu.co/sites/default/files/files_public/2026-05/dba_c.naturales-min.pdf' },
      { label: 'Lineamientos de ciencias naturales y educación ambiental (1998)', url: 'https://www.mineducacion.gov.co/1780/articles-339975_recurso_5.pdf' },
    ],
  },
  {
    slug: 'tecnologia',
    perfilId: 'tecnologia',
    nombre: 'tecnología e informática',
    titulo: 'Concurso docente 2026 para tecnología e informática',
    seoTitle: 'Concurso docente 2026 tecnología e informática',
    seoDescription:
      'Tecnología e informática tiene 1.091 vacantes. Guía 30, diseño tecnológico, pensamiento computacional y su didáctica, con preguntas del concurso docente.',
    cargo: 'docente de tecnología e informática',
    vacantes: 1091,
    modulo: 'Saber Disciplinar: Tecnología e Informática',
    intro: 'El referente del área es la Guía 30 del MEN, con sus cuatro componentes y el proceso de diseño tecnológico.',
    disciplinar: [
      'Naturaleza y evolución de la tecnología; apropiación y uso.',
      'Solución de problemas con tecnología: diseño, prototipos y pruebas.',
      'Pensamiento computacional, algoritmos y sistemas tecnológicos.',
      'Tecnología y sociedad, ciudadanía y seguridad digital.',
    ],
    referentes: [{ label: 'Guía 30: Orientaciones generales para la educación en tecnología (MEN, 2008)', url: 'https://www.mineducacion.gov.co/1621/articles-160915_archivo_pdf.pdf' }],
  },
  {
    slug: 'educacion-fisica',
    perfilId: 'educacion_fisica',
    nombre: 'educación física',
    titulo: 'Concurso docente 2026 para educación física',
    seoTitle: 'Concurso docente 2026 educación física: qué estudiar',
    seoDescription:
      'Educación física tiene 783 vacantes. Competencias motriz, expresiva y axiológica, capacidades físicas, evaluación y su didáctica, con preguntas del concurso docente.',
    cargo: 'docente de educación física',
    vacantes: 783,
    modulo: 'Saber Disciplinar: Educación Física',
    intro: 'El referente del área es el Documento 15 del MEN, con las competencias motriz, expresiva corporal y axiológica corporal.',
    disciplinar: [
      'Desarrollo motor por edades y competencia motriz.',
      'Capacidades físicas y su entrenamiento escolar con seguridad.',
      'Juego, deporte escolar, expresión corporal e inclusión.',
      'Evaluación en educación física.',
    ],
    referentes: [
      { label: 'Documento 15: Orientaciones pedagógicas para la educación física, recreación y deporte (MEN, 2010)', url: 'https://www.mineducacion.gov.co/1780/articles-340033_archivo_pdf_Orientaciones_EduFisica_Rec_Deporte.pdf' },
    ],
  },
  {
    slug: 'artistica',
    perfilId: 'artistica',
    nombre: 'educación artística',
    titulo: 'Concurso docente 2026 para educación artística',
    seoTitle: 'Concurso docente 2026 artística: música, danzas y artes',
    seoDescription:
      'Artística suma 1.283 vacantes: música 481, danzas 374, artes plásticas 339 y escénicas 89. Qué estudiar del Documento 16 y preguntas del concurso docente.',
    cargo: 'docente de educación artística',
    vacantes: 1283,
    vacantesDetalle: 'Música 481, danzas 374, artes plásticas 339 y artes escénicas 89.',
    modulo: 'Saber Disciplinar: Educación Artística',
    intro:
      'Los empleos de artística se ofertan por especialidad. La CNSC indicó que en música evaluará formación instrumental y dirección de ensambles con situaciones escritas, sin audición.',
    disciplinar: [
      'Competencias de sensibilidad, apreciación estética y comunicación (Documento 16).',
      'Música: lenguaje musical, pulso, ritmo, métrica, timbre y práctica de conjunto.',
      'Danza, artes plásticas y visuales, y teatro: elementos y procesos de creación.',
      'Evaluación en artes.',
    ],
    referentes: [
      { label: 'Documento 16: Orientaciones pedagógicas para la educación artística (MEN, 2010)', url: 'https://www.mineducacion.gov.co/1780/articles-340033_archivo_pdf_Orientaciones_Edu_Artistica_Basica_Media.pdf' },
    ],
  },
  {
    slug: 'filosofia',
    perfilId: 'filosofia',
    nombre: 'filosofía y ética',
    titulo: 'Concurso docente 2026 para filosofía y ética',
    seoTitle: 'Concurso docente 2026 filosofía y ética: qué estudiar',
    seoDescription:
      'Filosofía (149) y ética (130): qué evalúa el concurso docente 2026, competencias crítica, dialógica y creativa, problemas filosóficos y didáctica, con preguntas.',
    cargo: 'docente de filosofía o ética',
    vacantes: 279,
    vacantesDetalle: 'Filosofía 149 y ética y valores 130.',
    modulo: 'Saber Disciplinar: Filosofía y Ética',
    intro: 'El referente de filosofía es el Documento 14 del MEN; el de ética, los lineamientos de ética y valores y los estándares de competencias ciudadanas.',
    disciplinar: [
      'Competencias crítica, dialógica y creativa.',
      'Problemas del conocimiento, la ética, la política y la estética, con sus autores.',
      'Didáctica de la filosofía: seminario, disertación, diálogo filosófico.',
      'Ética y valores: desarrollo moral, dilemas, ética del cuidado y formación ciudadana.',
    ],
    referentes: [
      { label: 'Documento 14: Orientaciones pedagógicas para la filosofía en la media (MEN, 2010)', url: 'https://www.mineducacion.gov.co/1780/articles-340033_archivo_pdf_Orientaciones_Pedagogicas_Filosofia_en_Educacion_Media.pdf' },
      { label: 'Lineamientos de educación ética y valores humanos (1998)', url: 'https://www.mineducacion.gov.co/1780/articles-339975_recurso_9.pdf' },
    ],
  },
  {
    slug: 'directivos',
    perfilId: 'directivo',
    nombre: 'directivos docentes',
    titulo: 'Concurso de directivos docentes 2026: rector, coordinador y director rural',
    seoTitle: 'Concurso directivos docentes 2026: rector y coordinador',
    seoDescription:
      'Coordinador (1.074), rector (618) y director rural (42): qué evalúa el concurso 2026, mínimo de 70, Guía 34 y gestión escolar, con simulacro.',
    cargo: 'directivo docente',
    vacantes: 1734,
    vacantesDetalle: 'Coordinador 1.074, rector 618 y director rural 42.',
    modulo: 'Gestión Escolar (Directivos Docentes)',
    intro:
      'Para los directivos la prueba eliminatoria exige un mínimo de 70 puntos, más que los 60 de los docentes, y la psicotécnica pesa el 10 %. El saber propio del cargo es la gestión escolar.',
    disciplinar: [
      'Gestión directiva, académica, administrativa y financiera, y de la comunidad (Guía 34).',
      'Autoevaluación institucional, plan de mejoramiento y seguimiento.',
      'Gobierno escolar, Fondo de Servicios Educativos, jornada y evaluación de desempeño.',
      'Funciones del rector y del coordinador (Ley 715 de 2001 y Resolución 3842 de 2022).',
    ],
    referentes: [
      { label: 'Guía 34: Guía para el mejoramiento institucional (MEN, 2008)', url: 'https://www.mineducacion.gov.co/1759/articles-177745_archivo_pdf.pdf' },
      { label: 'Ley 715 de 2001', url: 'https://www.mineducacion.gov.co/1621/articles-86098_archivo_pdf.pdf' },
      MEN.res3842,
    ],
  },
]

// Normas comunes a todos los cargos docentes
export const REFERENTES_COMUNES: Referente[] = [MEN.ley115, MEN.dl1278, MEN.res3842, MEN.guia49]

// Vacantes por cargo o área en los proyectos de acuerdo (de mayor a menor)
export const VACANTES_POR_AREA: { area: string; vacantes: number; slug?: string }[] = [
  { area: 'Primaria', vacantes: 8059, slug: 'primaria' },
  { area: 'Preescolar', vacantes: 3723, slug: 'preescolar' },
  { area: 'Matemáticas', vacantes: 1945, slug: 'matematicas' },
  { area: 'Docente orientador', vacantes: 1892, slug: 'orientador' },
  { area: 'Inglés', vacantes: 1798, slug: 'ingles' },
  { area: 'Ciencias sociales', vacantes: 1499, slug: 'ciencias-sociales' },
  { area: 'Lengua castellana', vacantes: 1316, slug: 'lengua-castellana' },
  { area: 'Ciencias naturales y educación ambiental', vacantes: 1236, slug: 'ciencias-naturales' },
  { area: 'Tecnología e informática', vacantes: 1091, slug: 'tecnologia' },
  { area: 'Coordinador', vacantes: 1074, slug: 'directivos' },
  { area: 'Educación física', vacantes: 783, slug: 'educacion-fisica' },
  { area: 'Química', vacantes: 780, slug: 'ciencias-naturales' },
  { area: 'Rector', vacantes: 618, slug: 'directivos' },
  { area: 'Artística: música', vacantes: 481, slug: 'artistica' },
  { area: 'Artística: danzas', vacantes: 374, slug: 'artistica' },
  { area: 'Artística: artes plásticas', vacantes: 339, slug: 'artistica' },
  { area: 'Física', vacantes: 332, slug: 'ciencias-naturales' },
  { area: 'Religión', vacantes: 180 },
  { area: 'Filosofía', vacantes: 149, slug: 'filosofia' },
  { area: 'Ética y valores', vacantes: 130, slug: 'filosofia' },
  { area: 'Artística: artes escénicas', vacantes: 89, slug: 'artistica' },
  { area: 'Ciencias económicas y políticas', vacantes: 71 },
  { area: 'Director rural', vacantes: 42, slug: 'directivos' },
]

export const FAQ_DOCENTE: { q: string; a: string }[] = [
  {
    q: '¿Cuándo son las inscripciones del concurso docente 2026?',
    a: 'La CNSC publicó los proyectos de acuerdo y la oferta preliminar de empleos el 19 de agosto de 2026, pero aún no fija fechas oficiales. Según la prensa, las inscripciones irían de diciembre de 2026 a febrero de 2027 y las pruebas serían en el segundo semestre de 2027.',
  },
  {
    q: '¿Cuántas vacantes tiene el concurso docente?',
    a: 'La CNSC anunció más de 28.000 vacantes. Los 90 proyectos de acuerdo suman 28.001: primaria tiene 8.059, preescolar 3.723, matemáticas 1.945, orientador 1.892 e inglés 1.798.',
  },
  {
    q: '¿Qué evalúa la prueba escrita del concurso docente?',
    a: 'La prueba de aptitudes y competencias básicas tiene cuatro componentes: lectura crítica, razonamiento cuantitativo, competencias blandas (liderazgo, ética, trabajo en equipo y ciudadanía) y los conocimientos disciplinares y pedagógicos del cargo. La parte disciplinar depende del área a la que te inscribas.',
  },
  {
    q: '¿Cuál es el puntaje mínimo para pasar?',
    a: 'La prueba de aptitudes y competencias básicas es eliminatoria: los docentes necesitan 60 puntos y los directivos docentes 70, sobre 100.',
  },
  {
    q: '¿Cuánto pesa cada prueba?',
    a: 'Para docentes: aptitudes y competencias básicas 55 %, psicotécnica 5 %, valoración de antecedentes 30 % y entrevista 10 %. Para directivos: 55 %, 10 %, 25 % y 10 %. Son los pesos de los proyectos de acuerdo; los definitivos estarán en los acuerdos en firme.',
  },
  {
    q: '¿Qué debo estudiar para el concurso docente?',
    a: 'La normativa común (Ley 115 de 1994, Decreto Ley 1278 de 2002, Ley 1620 de 2013, educación inclusiva y Resolución 3842 de 2022), los referentes del MEN de tu área (Estándares, DBA, guías y documentos de orientaciones), y práctica de lectura crítica y razonamiento cuantitativo.',
  },
  {
    q: '¿Cuántas preguntas tiene la prueba y cuánto dura?',
    a: 'Todavía no es oficial: la CNSC lo publicará en la guía de orientación. En el concurso de 2016 la prueba tuvo 170 preguntas en cinco horas y media; en 2022 fue de casos con tres opciones de respuesta.',
  },
]

// "ciencias naturales, química y física" → "Ciencias naturales, química y física" (solo la primera letra)
export const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
