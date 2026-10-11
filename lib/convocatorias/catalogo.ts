// Catálogo de convocatorias grandes con su plan de estudio.
// Datos verificados en las fuentes oficiales de la CNSC el 11 de octubre de 2026 (ver `fuentes` de cada una).
// La Procuraduría no concursa por la CNSC: sus datos salen de sus documentos y, donde se indica, de la prensa.
// Los pesos de los módulos son una sugerencia de estudio de SIMO TEST, no el peso oficial de cada tema.
import type { ModuloPlan } from './plan'
import type { Convocatoria, PruebaConvocatoria } from './tipos'

const REVISADO = '2026-10-11'

// Prueba estándar del sistema general de carrera en los acuerdos de 2026
const PRUEBAS_SISTEMA_GENERAL: PruebaConvocatoria[] = [
  { nombre: 'Competencias funcionales', peso: 60, caracter: 'Eliminatoria', minimo: 65 },
  { nombre: 'Competencias comportamentales', peso: 20, caracter: 'Clasificatoria' },
  { nombre: 'Valoración de antecedentes', peso: 20, caracter: 'Clasificatoria' },
]
const NOTA_SISTEMA_GENERAL =
  'En los empleos sin requisito de experiencia, funcionales 75% y comportamentales 25%. No hay prueba de competencias generales: los temas del Estado y de la gestión pública entran dentro de las funcionales, según los ejes temáticos de cada empleo. En los procesos de 2026 con guía publicada, las funcionales fueron preguntas de juicio situacional con tres opciones; las nuestras tienen cuatro.'

// Lo que casi todos los empleos del sistema general ven dentro de la prueba funcional
const TRONCO: ModuloPlan[] = [
  { modulo: 'Derecho de Petición y Procedimiento Administrativo', peso: 3 },
  { modulo: 'Gestión Pública: MIPG, Presupuesto y Contratación', peso: 2 },
  { modulo: 'Constitución y Estructura del Estado', peso: 2 },
  { modulo: 'Empleo Público y Carrera Administrativa', peso: 1.5 },
  { modulo: 'Atención al Ciudadano', peso: 1.5 },
  { modulo: 'Transparencia, Datos Personales y Archivo', peso: 1 },
  { modulo: 'Disciplinario y Anticorrupción', peso: 1 },
  { modulo: 'Competencias Comportamentales', peso: 2.5 },
]
// Refuerzo para cargos asistenciales y técnicos
const OPERATIVO: ModuloPlan[] = [
  { modulo: 'Gestión Documental', peso: 1.5 },
  { modulo: 'Herramientas de Oficina y Seguridad Digital', peso: 1 },
]

const con = (...partes: ModuloPlan[][]): ModuloPlan[] => {
  const suma = new Map<string, number>()
  for (const m of partes.flat()) suma.set(m.modulo, (suma.get(m.modulo) ?? 0) + m.peso)
  return [...suma.entries()].map(([modulo, peso]) => ({ modulo, peso }))
}

export const CONVOCATORIAS: Convocatoria[] = [
  {
    slug: 'dian-2676',
    nombre: 'DIAN 2676',
    titulo: 'Concurso DIAN 2676: qué estudiar para la prueba del 8 de noviembre',
    entidad: 'DIAN · Sistema Específico de Carrera',
    vacantes: 1850,
    vacantesNota: '743 de ascenso y 1.107 de ingreso en el Acuerdo 21 de 2025. La CNSC anunció después 1.142 de ingreso.',
    niveles: 'Profesional (Gestor e Inspector), técnico (Analista) y asistencial (Facilitador)',
    estado: 'Prueba escrita el domingo 8 de noviembre de 2026, en una sesión de 5 horas.',
    fechaPrueba: '2026-11-08',
    revisado: REVISADO,
    resumen:
      'El concurso más urgente del año: más de 113.000 inscritos en ingreso para las vacantes de la DIAN. La prueba funcional es eliminatoria con 70 puntos y solo evalúa normas expedidas antes del 19 de junio de 2026.',
    pruebas: [
      { nombre: 'Competencias funcionales', peso: 65, caracter: 'Eliminatoria', minimo: 70 },
      { nombre: 'Competencias comportamentales', peso: 15, caracter: 'Clasificatoria' },
      { nombre: 'Integridad', peso: 10, caracter: 'Clasificatoria' },
      { nombre: 'Valoración de antecedentes', peso: 10, caracter: 'Clasificatoria' },
    ],
    pruebasNota:
      'Pesos para ingreso en empleos con experiencia. Sin experiencia: funcionales 70%, comportamentales 20% e integridad 10%. Las funcionales son de juicio situacional con tres opciones; las comportamentales y la de integridad son de autoinforme.',
    perfiles: [
      {
        id: 'tributos',
        label: 'Gestor o Inspector de tributos',
        nivel: 'profesional',
        area: 'dian_tributaria',
        modulos: [
          { modulo: 'Gestión Tributaria (DIAN)', peso: 7 },
          { modulo: 'Carrera y Gestión Institucional (DIAN)', peso: 2 },
          { modulo: 'Derecho de Petición y Procedimiento Administrativo', peso: 1.5 },
          { modulo: 'Atención al Ciudadano', peso: 1 },
          { modulo: 'Competencias Comportamentales', peso: 1.5 },
        ],
      },
      {
        id: 'aduanas',
        label: 'Aduanas y cambios',
        area: 'dian_aduanera',
        modulos: [
          { modulo: 'Aduanero y Cambiario (DIAN)', peso: 7 },
          { modulo: 'Gestión Tributaria (DIAN)', peso: 1.5 },
          { modulo: 'Carrera y Gestión Institucional (DIAN)', peso: 2 },
          { modulo: 'Derecho de Petición y Procedimiento Administrativo', peso: 1 },
          { modulo: 'Competencias Comportamentales', peso: 1.5 },
        ],
      },
      {
        id: 'apoyo',
        label: 'Áreas de apoyo (talento humano, financiera, jurídica)',
        area: 'dian_institucional',
        modulos: [
          { modulo: 'Carrera y Gestión Institucional (DIAN)', peso: 4 },
          { modulo: 'Gestión Pública: MIPG, Presupuesto y Contratación', peso: 2.5 },
          { modulo: 'Talento Humano', peso: 2 },
          { modulo: 'Derecho de Petición y Procedimiento Administrativo', peso: 2 },
          { modulo: 'Atención al Ciudadano', peso: 1.5 },
          { modulo: 'Gestión Financiera y Presupuestal', peso: 1 },
          { modulo: 'Contratación Estatal Aplicada', peso: 1 },
          { modulo: 'Competencias Comportamentales', peso: 1.5 },
        ],
      },
      {
        id: 'facilitador',
        label: 'Facilitador (asistencial)',
        nivel: 'asistencial',
        area: 'dian_institucional',
        modulos: [
          { modulo: 'Atención al Ciudadano', peso: 3 },
          { modulo: 'Derecho de Petición y Procedimiento Administrativo', peso: 2.5 },
          { modulo: 'Carrera y Gestión Institucional (DIAN)', peso: 2.5 },
          { modulo: 'Gestión Tributaria (DIAN)', peso: 1.5 },
          { modulo: 'Gestión Documental', peso: 1 },
          { modulo: 'Competencias Comportamentales', peso: 1.5 },
        ],
      },
    ],
    cobertura:
      'Casos de la DIAN sobre el Estatuto Tributario (renta, IVA, retención, régimen SIMPLE, facturación electrónica, procedimiento, sanciones y cobro), el régimen aduanero (Decreto 1165 de 2019), el régimen cambiario y la carrera específica de la DIAN (Decreto Ley 927 de 2023). También el derecho de petición, la atención de PQRS y el MIPG, que aparecen en los ejemplos oficiales.',
    faltantes:
      'Las pruebas comportamental y de integridad son de autoinforme: no tienen respuestas correctas. Nuestras situaciones comportamentales sirven para conocer las conductas esperadas, pero no reproducen ese formato. Los ejes exactos de cada empleo solo se ven con tu número de inscripción en el sitio del operador.',
    fuentes: [
      { label: 'Acuerdo 21 de 2025 (CNSC)', url: 'https://www.cnsc.gov.co/sites/default/files/2025-11/acuerdo-no-21-dian-2676-de-20251.pdf' },
      {
        label: 'Guía de orientación para las pruebas escritas',
        url: 'https://www.cnsc.gov.co/sites/default/files/2026-10/dian-2676_guia_orientacion_aspirante_presentacion-pruebas-escritas_0.pdf',
      },
      { label: 'Avisos del proceso DIAN 2676', url: 'https://www.cnsc.gov.co/convocatorias/dian-2676?field_tipo_de_contenido_convocat_target_id=64' },
    ],
  },
  {
    slug: 'docentes-2026',
    nombre: 'Docentes y Directivos Docentes 2026',
    titulo: 'Concurso docente 2026: plan de estudio para docentes y directivos',
    entidad: 'Entidades territoriales certificadas en educación',
    vacantes: 28000,
    vacantesAprox: true,
    vacantesNota: 'Según la oferta preliminar publicada por la CNSC.',
    niveles: 'Docente de aula, docente orientador, coordinador, rector y director rural',
    estado: 'En planeación. Según la prensa, inscripciones a comienzos de 2027 y pruebas en el segundo semestre de 2027.',
    revisado: REVISADO,
    resumen:
      'El concurso con más vacantes del país. La prueba eliminatoria evalúa lectura crítica, razonamiento cuantitativo y conocimientos pedagógicos y disciplinares; la parte normativa y pedagógica es común a todas las áreas.',
    pruebas: [
      { nombre: 'Aptitudes y competencias básicas', peso: 55, caracter: 'Eliminatoria', minimo: 60 },
      { nombre: 'Psicotécnica', peso: 5, caracter: 'Clasificatoria' },
      { nombre: 'Valoración de antecedentes', peso: 30, caracter: 'Clasificatoria' },
      { nombre: 'Entrevista', peso: 10, caracter: 'Clasificatoria' },
    ],
    pruebasNota:
      'Pesos del proyecto de acuerdo para docentes. Para directivos: mínimo de 70 en la eliminatoria, psicotécnica 10% y antecedentes 25%. Los definitivos estarán en los acuerdos en firme.',
    perfiles: [
      {
        id: 'primaria',
        label: 'Docente de primaria',
        area: 'docente_primaria',
        modulos: [
          { modulo: 'Saber Disciplinar: Primaria', peso: 5 },
          { modulo: 'Pedagogía y Normativa Docente', peso: 4 },
          { modulo: 'Comprensión Lectora', peso: 2 },
          { modulo: 'Razonamiento Lógico y Cuantitativo', peso: 2 },
          { modulo: 'Competencias Comportamentales', peso: 1 },
        ],
      },
      {
        id: 'matematicas',
        label: 'Docente de matemáticas',
        area: 'docente_matematicas',
        modulos: [
          { modulo: 'Saber Disciplinar: Matemáticas', peso: 5 },
          { modulo: 'Pedagogía y Normativa Docente', peso: 4 },
          { modulo: 'Comprensión Lectora', peso: 2 },
          { modulo: 'Razonamiento Lógico y Cuantitativo', peso: 2 },
          { modulo: 'Competencias Comportamentales', peso: 1 },
        ],
      },
      {
        id: 'lenguaje',
        label: 'Docente de lengua castellana',
        area: 'docente_lenguaje',
        modulos: [
          { modulo: 'Saber Disciplinar: Lenguaje', peso: 5 },
          { modulo: 'Pedagogía y Normativa Docente', peso: 4 },
          { modulo: 'Comprensión Lectora', peso: 2.5 },
          { modulo: 'Razonamiento Lógico y Cuantitativo', peso: 1.5 },
          { modulo: 'Competencias Comportamentales', peso: 1 },
        ],
      },
      {
        id: 'docente',
        label: 'Docente de otras áreas u orientador',
        area: 'docente',
        modulos: [
          { modulo: 'Pedagogía y Normativa Docente', peso: 5 },
          { modulo: 'Comprensión Lectora', peso: 3 },
          { modulo: 'Razonamiento Lógico y Cuantitativo', peso: 3 },
          { modulo: 'Competencias Comportamentales', peso: 1 },
        ],
      },
      {
        id: 'directivo',
        label: 'Rector, coordinador o director rural',
        area: 'directivo_docente',
        modulos: [
          { modulo: 'Gestión Escolar (Directivos Docentes)', peso: 5 },
          { modulo: 'Pedagogía y Normativa Docente', peso: 2 },
          { modulo: 'Comprensión Lectora', peso: 2.5 },
          { modulo: 'Razonamiento Lógico y Cuantitativo', peso: 2.5 },
          { modulo: 'Competencias Comportamentales', peso: 1 },
        ],
      },
    ],
    cobertura:
      'Pedagogía y normativa: evaluación de los aprendizajes (SIEE), educación inclusiva, convivencia escolar, competencias del manual de funciones (Resolución 3842 de 2022), primaria, preescolar y orientación, y la carrera del Decreto Ley 1278. Saber disciplinar con los Estándares Básicos del MEN: primaria (matemáticas, lenguaje y ciencias), matemáticas y lengua castellana de secundaria. Para directivos, gestión escolar. Además, lectura crítica y razonamiento cuantitativo.',
    faltantes:
      'Aún no cubrimos el saber disciplinar de inglés, educación física, artística, tecnología ni preescolar como área, ni la prueba psicotécnica. Ciencias naturales y sociales de secundaria están en preparación.',
    fuentes: [
      {
        label: 'Proyectos de acuerdo y OPEC preliminar (CNSC)',
        url: 'https://www.cnsc.gov.co/la-cnsc-publica-los-proyectos-de-acuerdo-el-anexo-tecnico-y-la-opec-preliminar-del-proceso-de',
      },
      { label: 'Estado de los procesos de la CNSC', url: 'https://www.cnsc.gov.co/conoce-el-estado-de-los-procesos-de-seleccion-que-adelanta-la-cnsc' },
    ],
  },
  {
    slug: 'empresas-sociales-del-estado-2',
    nombre: 'Empresas Sociales del Estado 2',
    titulo: 'Concurso ESE 2 (CNSC): qué estudiar para hospitales públicos',
    entidad: '98 Empresas Sociales del Estado (hospitales públicos)',
    vacantes: 3044,
    vacantesNota: 'En la modalidad abierta: 1.513 asistenciales, 161 técnicas y 904 profesionales.',
    niveles: 'Asistencial, técnico y profesional',
    estado: 'Inscripciones cerradas. Sigue la verificación de requisitos mínimos; aún no hay fecha de pruebas.',
    revisado: REVISADO,
    resumen:
      'Hospitales públicos de todo el país, con la mitad de las vacantes en el nivel asistencial. Además del tronco de la función pública, pesa el sistema de salud: derechos de los usuarios, régimen de las ESE, calidad y habilitación.',
    pruebas: PRUEBAS_SISTEMA_GENERAL,
    pruebasNota: NOTA_SISTEMA_GENERAL,
    perfiles: [
      {
        id: 'asistencial',
        label: 'Asistencial o técnico',
        nivel: 'asistencial',
        area: 'salud',
        modulos: con([{ modulo: 'Sistema de Salud y ESE', peso: 6 }], TRONCO, OPERATIVO),
      },
      {
        id: 'profesional',
        label: 'Profesional',
        nivel: 'profesional',
        area: 'salud',
        modulos: con([{ modulo: 'Sistema de Salud y ESE', peso: 6 }, { modulo: 'Contratación Estatal Aplicada', peso: 1 }], TRONCO),
      },
    ],
    cobertura:
      'Casos sobre el sistema de salud (Ley 1751 de 2015, Ley 100 de 1993, Ley 1438 de 2011), régimen y gobierno de las ESE, calidad (SOGCS, habilitación con la Resolución 3100 de 2019, PAMEC), historia clínica y talento humano en salud, más el tronco común de procedimiento, atención al ciudadano y Estado.',
    faltantes:
      'No cubrimos temas clínicos ni de enfermería, facturación en salud y RIPS, ni los ejes propios de cada hospital.',
    fuentes: [
      { label: 'Resolución 10565 de 2026: continuidad del proceso', url: 'https://www.cnsc.gov.co/sites/default/files/2026-09/res-continuidad-ps-ese-2.pdf' },
      {
        label: 'Oferta de vacantes (CNSC)',
        url: 'https://www.cnsc.gov.co/la-cnsc-oferta-mas-de-2500-vacantes-con-el-proceso-de-seleccion-empresas-sociales-del-estado-2',
      },
    ],
  },
  {
    slug: 'distrito-capital-7-territorial-14',
    nombre: 'Distrito Capital 7 y Territorial 14',
    titulo: 'Concurso Distrito Capital 7 y Territorial 14: plan de estudio',
    entidad: '51 entidades de Bogotá y del orden territorial',
    vacantes: 3228,
    vacantesNota: 'Incluye 771 en la Secretaría de Integración Social y 510 en la Secretaría de Hacienda de Bogotá.',
    niveles: 'Profesional, técnico y asistencial',
    estado: 'En divulgación. Las inscripciones se aplazaron al primer trimestre de 2027.',
    revisado: REVISADO,
    resumen:
      'Secretarías de Bogotá, gobernaciones y alcaldías de ocho departamentos. Todavía no abren inscripciones: es el mejor momento para empezar a estudiar.',
    pruebas: PRUEBAS_SISTEMA_GENERAL,
    pruebasNota: NOTA_SISTEMA_GENERAL,
    perfiles: [
      {
        id: 'integracion-social',
        label: 'Integración Social (Bogotá)',
        area: 'social',
        modulos: con(
          [
            { modulo: 'Políticas Sociales y Enfoque Diferencial', peso: 5 },
            { modulo: 'Distrito Capital (Bogotá)', peso: 2 },
          ],
          TRONCO,
        ),
      },
      {
        id: 'hacienda',
        label: 'Hacienda (Bogotá y territorios)',
        area: 'financiera',
        modulos: con(
          [
            { modulo: 'Gestión Financiera y Presupuestal', peso: 4 },
            { modulo: 'Contabilidad Pública', peso: 2.5 },
            { modulo: 'Distrito Capital (Bogotá)', peso: 1.5 },
            { modulo: 'Gestión Territorial', peso: 1 },
          ],
          TRONCO,
        ),
      },
      {
        id: 'territorial',
        label: 'Gobernaciones y alcaldías',
        area: 'territorial',
        modulos: con([{ modulo: 'Gestión Territorial', peso: 5 }, { modulo: 'Planeación y Proyectos de Inversión', peso: 1 }], TRONCO),
      },
      {
        id: 'asistencial',
        label: 'Asistencial o técnico',
        nivel: 'asistencial',
        area: 'territorial',
        modulos: con([{ modulo: 'Gestión Territorial', peso: 3 }], TRONCO, OPERATIVO),
      },
    ],
    cobertura:
      'Estatuto Orgánico y estructura de Bogotá, políticas sociales con enfoque diferencial (infancia, vejez, mujer, discapacidad), régimen municipal y departamental, recursos del SGP, presupuesto, tesorería y contabilidad pública, más el tronco común de procedimiento, atención al ciudadano y Estado.',
    faltantes: 'No cubrimos los tributos distritales (predial, ICA) ni los temas técnicos de Bomberos.',
    fuentes: [
      { label: 'Resolución 10583 de 2026: aplazamiento de inscripciones', url: 'https://www.cnsc.gov.co/sites/default/files/2026-09/resolucion-no-10583-del-17.09.2026-dc7-t14.pdf' },
      {
        label: 'Avisos del proceso',
        url: 'https://www.cnsc.gov.co/convocatorias/distrito-capital-7-y-territorial-14?field_tipo_de_contenido_convocat_target_id=64',
      },
    ],
  },
  {
    slug: 'entidades-orden-nacional-2026',
    nombre: 'Entidades del Orden Nacional 2026',
    titulo: 'Concurso Entidades del Orden Nacional 2026 (UNP, INVIMA, ADRES): plan de estudio',
    entidad: 'UNP, INVIMA, ADRES, Contaduría General, FONPRECON y Fondo Nacional de Estupefacientes',
    vacantes: 1665,
    vacantesNota: 'UNP 940, INVIMA 467 y ADRES 172, entre otras.',
    niveles: 'Asesor, profesional, técnico y asistencial (sobre todo profesional)',
    estado: 'Inscripciones cerradas. La verificación de requisitos está prevista entre diciembre de 2026 y febrero de 2027.',
    revisado: REVISADO,
    resumen:
      'Seis entidades nacionales, con la Unidad Nacional de Protección y el INVIMA a la cabeza. Las pruebas vendrán después de la verificación de requisitos, en 2027.',
    pruebas: PRUEBAS_SISTEMA_GENERAL,
    pruebasNota: NOTA_SISTEMA_GENERAL,
    perfiles: [
      {
        id: 'apoyo',
        label: 'Áreas administrativas y de apoyo',
        nivel: 'profesional',
        modulos: con(
          [
            { modulo: 'Contratación Estatal Aplicada', peso: 2 },
            { modulo: 'Talento Humano', peso: 2 },
            { modulo: 'Gestión Jurídica', peso: 1.5 },
            { modulo: 'Planeación y Proyectos de Inversión', peso: 1 },
          ],
          TRONCO,
        ),
      },
      {
        id: 'unp',
        label: 'UNP: prevención y protección',
        area: 'unp',
        modulos: con([{ modulo: 'Protección de Personas (UNP)', peso: 6 }], TRONCO),
      },
      {
        id: 'invima',
        label: 'INVIMA: vigilancia sanitaria',
        area: 'invima',
        modulos: con([{ modulo: 'Vigilancia Sanitaria (INVIMA)', peso: 6 }, { modulo: 'Sistema de Salud y ESE', peso: 1 }], TRONCO),
      },
      {
        id: 'salud',
        label: 'ADRES (sistema de salud)',
        area: 'salud',
        modulos: con([{ modulo: 'Sistema de Salud y ESE', peso: 5 }], TRONCO),
      },
      {
        id: 'contaduria',
        label: 'Contaduría General',
        area: 'contabilidad',
        modulos: con([{ modulo: 'Contabilidad Pública', peso: 5 }, { modulo: 'Gestión Financiera y Presupuestal', peso: 2 }], TRONCO),
      },
    ],
    cobertura:
      'El programa de prevención y protección de la UNP (Decreto 1066 de 2015 y Decreto Ley 4065 de 2011), la vigilancia sanitaria del INVIMA (Ley 9 de 1979, Resolución 2674 de 2013 y Decreto 677 de 1995), el tronco común de la función pública, las áreas de apoyo, el sistema de salud y la contabilidad pública.',
    faltantes:
      'De la UNP no cubrimos los protocolos operativos de los escoltas; del INVIMA, los temas técnicos de cada producto (dispositivos médicos, cosméticos, bebidas alcohólicas) ni el régimen sancionatorio propio. La UNP se reestructuró en 2026: confirma en el acuerdo los ejes de tu empleo.',
    fuentes: [
      { label: 'Resolución 10556 de 2026', url: 'https://www.cnsc.gov.co/sites/default/files/2026-09/resolucion-no-10556-de-2026-21.pdf' },
      { label: 'Acuerdo 81 de 2026 (UNP)', url: 'https://www.cnsc.gov.co/sites/default/files/2026-04/acuerdo-no-81-unp.pdf' },
    ],
  },
  {
    slug: 'corporaciones-autonomas-regionales',
    nombre: 'Corporaciones Autónomas Regionales',
    titulo: 'Concurso CAR (CNSC): qué estudiar para las corporaciones autónomas',
    entidad: '33 Corporaciones Autónomas Regionales',
    vacantes: 1700,
    vacantesAprox: true,
    vacantesNota: 'Cifra anunciada por la CNSC en agosto de 2026; luego se sumó la CDMB.',
    niveles: 'Profesional, técnico y asistencial',
    estado: 'Convocatoria publicada. Las inscripciones se aplazaron y aún no hay fecha nueva.',
    revisado: REVISADO,
    resumen:
      'Las autoridades ambientales regionales de todo el país en un solo proceso. Como las inscripciones están aplazadas, hay tiempo para preparar el componente ambiental desde ya.',
    pruebas: PRUEBAS_SISTEMA_GENERAL,
    pruebasNota: NOTA_SISTEMA_GENERAL,
    perfiles: [
      {
        id: 'ambiental-profesional',
        label: 'Profesional ambiental o jurídico',
        nivel: 'profesional',
        area: 'ambiental',
        modulos: con([{ modulo: 'Gestión Ambiental', peso: 6 }, { modulo: 'Planeación y Proyectos de Inversión', peso: 1 }], TRONCO),
      },
      {
        id: 'ambiental-tecnico',
        label: 'Técnico o asistencial',
        nivel: 'tecnico',
        area: 'ambiental',
        modulos: con([{ modulo: 'Gestión Ambiental', peso: 5 }], TRONCO, OPERATIVO),
      },
      {
        id: 'apoyo',
        label: 'Áreas administrativas',
        modulos: con(
          [
            { modulo: 'Gestión Ambiental', peso: 2 },
            { modulo: 'Contratación Estatal Aplicada', peso: 2 },
            { modulo: 'Talento Humano', peso: 1.5 },
            { modulo: 'Gestión Financiera y Presupuestal', peso: 1.5 },
          ],
          TRONCO,
        ),
      },
    ],
    cobertura:
      'SINA y régimen de las CAR, licencias y permisos ambientales, tasas, POMCA, procedimiento sancionatorio ambiental (Ley 1333 de 2009 reformada por la Ley 2387 de 2024) y gestión del riesgo de desastres, más el tronco común de procedimiento, atención al ciudadano y Estado.',
    faltantes:
      'No cubrimos los conocimientos técnicos de cada disciplina (hidrología, calidad del aire, biodiversidad, SIG) ni el ordenamiento territorial (POT).',
    fuentes: [
      {
        label: 'Acuerdos y anexos del proceso (CNSC)',
        url: 'https://www.cnsc.gov.co/la-cnsc-publico-el-acuerdo-y-los-anexos-tecnicos-del-proceso-de-seleccion-corporaciones-autonomas',
      },
      { label: 'Resolución 10567 de 2026: aplazamiento', url: 'https://www.cnsc.gov.co/sites/default/files/2026-09/resolucion-no-10567-car-1.pdf' },
    ],
  },
  {
    slug: 'territorial-12',
    nombre: 'Territorial 12',
    titulo: 'Concurso Territorial 12 (CNSC): plan de estudio',
    entidad: '23 gobernaciones, alcaldías y entidades de ocho departamentos',
    vacantes: 1573,
    vacantesNota: 'En la modalidad abierta: 396 profesionales, 320 técnicas, 385 asistenciales y 1 de asesor.',
    niveles: 'Profesional, técnico y asistencial',
    estado: 'Inscripciones cerradas. La verificación de requisitos mínimos se reanuda desde el 1 de enero de 2027.',
    revisado: REVISADO,
    resumen:
      'Gobernaciones de Norte de Santander, Bolívar y Caldas; alcaldías de Cúcuta, Neiva, Pereira y Soacha, entre otras. Los conductores tienen además una prueba de ejecución.',
    pruebas: PRUEBAS_SISTEMA_GENERAL,
    pruebasNota: NOTA_SISTEMA_GENERAL,
    perfiles: [
      {
        id: 'profesional',
        label: 'Profesional',
        nivel: 'profesional',
        area: 'territorial',
        modulos: con(
          [
            { modulo: 'Gestión Territorial', peso: 4 },
            { modulo: 'Planeación y Proyectos de Inversión', peso: 1.5 },
            { modulo: 'Gestión Financiera y Presupuestal', peso: 1.5 },
            { modulo: 'Contratación Estatal Aplicada', peso: 1 },
          ],
          TRONCO,
        ),
      },
      {
        id: 'asistencial',
        label: 'Asistencial o técnico',
        nivel: 'asistencial',
        area: 'territorial',
        modulos: con([{ modulo: 'Gestión Territorial', peso: 3 }], TRONCO, OPERATIVO),
      },
      {
        id: 'salud',
        label: 'Instituto Departamental de Salud',
        area: 'salud',
        modulos: con([{ modulo: 'Sistema de Salud y ESE', peso: 4 }, { modulo: 'Gestión Territorial', peso: 2 }], TRONCO),
      },
    ],
    cobertura:
      'Régimen municipal y departamental, competencias y recursos del SGP, planeación, presupuesto y contratación, más el tronco común de procedimiento, atención al ciudadano y Estado.',
    faltantes: 'No cubrimos la prueba de ejecución de los conductores ni los temas de tránsito, deporte o cultura de los institutos.',
    fuentes: [
      { label: 'Resolución 10880 de 2026', url: 'https://www.cnsc.gov.co/sites/default/files/2026-09/resolucion-no-10880.pdf' },
      { label: 'Avisos del proceso', url: 'https://www.cnsc.gov.co/convocatorias/territorial-12?field_tipo_de_contenido_convocat_target_id=64' },
    ],
  },
  {
    slug: 'entidades-orden-territorial-uapa',
    nombre: 'Entidades del Orden Territorial y UApA',
    titulo: 'Concurso Entidades del Orden Territorial y UApA: plan de estudio',
    entidad: '28 entidades territoriales y la Unidad de Alimentos para Aprender de Bogotá',
    vacantes: 1175,
    vacantesAprox: false,
    vacantesNota: 'Cifra aproximada de la modalidad abierta; 451 son de la Alcaldía y la Secretaría de Educación de Ibagué.',
    niveles: 'Profesional, técnico y asistencial',
    estado: 'Inscripciones cerradas. Los resultados de la verificación de requisitos saldrán desde enero de 2027.',
    revisado: REVISADO,
    resumen:
      'Alcaldías de Ibagué, Tunja y Bucaramanga, gobernaciones del Tolima y Boyacá y la UApA, entre otras. Las pruebas vendrán después de la verificación de requisitos.',
    pruebas: PRUEBAS_SISTEMA_GENERAL,
    pruebasNota: NOTA_SISTEMA_GENERAL,
    perfiles: [
      {
        id: 'profesional',
        label: 'Profesional',
        nivel: 'profesional',
        area: 'territorial',
        modulos: con(
          [
            { modulo: 'Gestión Territorial', peso: 4 },
            { modulo: 'Planeación y Proyectos de Inversión', peso: 1.5 },
            { modulo: 'Contratación Estatal Aplicada', peso: 1.5 },
          ],
          TRONCO,
        ),
      },
      {
        id: 'asistencial',
        label: 'Asistencial o técnico',
        nivel: 'asistencial',
        area: 'territorial',
        modulos: con([{ modulo: 'Gestión Territorial', peso: 3 }], TRONCO, OPERATIVO),
      },
    ],
    cobertura:
      'Régimen municipal y departamental, competencias en educación y salud de la Ley 715, planeación y contratación, más el tronco común de procedimiento, atención al ciudadano y Estado.',
    faltantes: 'No cubrimos el Programa de Alimentación Escolar de la UApA ni la administración de plantas docentes de las secretarías de educación.',
    fuentes: [
      {
        label: 'Avisos del proceso',
        url: 'https://www.cnsc.gov.co/convocatorias/entidades-del-orden-territorial-y-unidad-de-alimentos-para-aprender-uapa?field_tipo_de_contenido_convocat_target_id=64',
      },
      {
        label: 'Oferta de vacantes (CNSC)',
        url: 'https://www.cnsc.gov.co/mas-de-1000-vacantes-oferta-la-cnsc-en-ocho-departamentos-del-pais-con-el-proceso-de-seleccion',
      },
    ],
  },
  {
    slug: 'procuraduria-2026',
    nombre: 'Procuraduría 2026',
    titulo: 'Concurso Procuraduría 2026: plan de estudio para la prueba de conocimientos',
    entidad: 'Procuraduría General de la Nación (concurso propio, no de la CNSC)',
    fueraCnsc: true,
    vacantes: 2826,
    vacantesNota: 'Resolución 076 de 2026. Según el certificado de inscritos, se inscribieron unas 272.500 personas.',
    niveles: 'Asesor, ejecutivo, profesional, técnico, administrativo y operativo',
    estado: 'Inscripciones cerradas (7 al 18 de septiembre de 2026). La fecha de la prueba escrita aún no es oficial.',
    revisado: REVISADO,
    resumen:
      'El concurso de la Procuraduría para su sistema especial de carrera (Decretos Ley 262 y 263 de 2000). Cada empleo trae unos conocimientos esenciales comunes: ofimática, atención al usuario, documentos de oficina, estructura y funciones de la Procuraduría, sistemas de gestión, gestión documental y gestión pública.',
    pruebas: [
      { nombre: 'Conocimientos', peso: 70, caracter: 'Eliminatoria', minimo: 65 },
      { nombre: 'Competencias comportamentales', peso: 20, caracter: 'Clasificatoria' },
      { nombre: 'Análisis de antecedentes', peso: 10, caracter: 'Clasificatoria' },
    ],
    pruebasNota:
      'Pesos para asesor, ejecutivo y profesional según la Resolución 076 de 2026, tal como los reportó la prensa: confírmalos en el texto oficial. En los niveles técnico, administrativo y operativo, conocimientos 60%, comportamentales 20% y antecedentes 20%. La Resolución 133 de 2026 abrió la opción de cambiar la prueba escrita por una de ejecución en empleos que piden hasta bachillerato.',
    perfiles: [
      {
        id: 'profesional',
        label: 'Asesor, ejecutivo o profesional',
        nivel: 'profesional',
        area: 'procuraduria',
        modulos: [
          { modulo: 'Procuraduría General de la Nación', peso: 5 },
          { modulo: 'Disciplinario y Anticorrupción', peso: 3 },
          { modulo: 'Constitución y Estructura del Estado', peso: 2.5 },
          { modulo: 'Derecho de Petición y Procedimiento Administrativo', peso: 2.5 },
          { modulo: 'Gestión Pública: MIPG, Presupuesto y Contratación', peso: 1.5 },
          { modulo: 'Atención al Ciudadano', peso: 1 },
          { modulo: 'Gestión Documental', peso: 1 },
          { modulo: 'Herramientas de Oficina y Seguridad Digital', peso: 1 },
          { modulo: 'Transparencia, Datos Personales y Archivo', peso: 0.5 },
          { modulo: 'Competencias Comportamentales', peso: 2 },
        ],
      },
      {
        id: 'apoyo',
        label: 'Técnico, administrativo u operativo',
        nivel: 'tecnico',
        area: 'procuraduria',
        modulos: [
          { modulo: 'Procuraduría General de la Nación', peso: 4 },
          { modulo: 'Atención al Ciudadano', peso: 2 },
          { modulo: 'Gestión Documental', peso: 2 },
          { modulo: 'Herramientas de Oficina y Seguridad Digital', peso: 2 },
          { modulo: 'Derecho de Petición y Procedimiento Administrativo', peso: 2 },
          { modulo: 'Disciplinario y Anticorrupción', peso: 1.5 },
          { modulo: 'Constitución y Estructura del Estado', peso: 1.5 },
          { modulo: 'Gestión Pública: MIPG, Presupuesto y Contratación', peso: 1 },
          { modulo: 'Competencias Comportamentales', peso: 2 },
        ],
      },
    ],
    cobertura:
      'Estructura, funciones y régimen de la Procuraduría (Decreto Ley 262 de 2000 y Constitución, arts. 275 a 284), el Código General Disciplinario (Ley 1952 de 2019) y los conocimientos comunes de todos los empleos: atención al usuario, gestión documental, ofimática, procedimiento administrativo y gestión pública.',
    faltantes:
      'Los conocimientos específicos dependen de cada empleo (por ejemplo, tributario, penal o contratación): búscalos con el plan por ejes. Las comportamentales de la Procuraduría siguen su propio diccionario de competencias, y las nuestras siguen el Decreto 815 de 2018.',
    fuentes: [
      { label: 'Convocatorias del concurso (Procuraduría)', url: 'https://www.procuraduria.gov.co/Documents/2026/5.%20Mayo/CONVOCATORIAS.pdf' },
      {
        label: 'Certificado de inscritos (Procuraduría)',
        url: 'https://www.procuraduria.gov.co/Documents/2026/9.%20septiembre/CERTIFICADO%20DE%20INSCRITOS%20CONCURSO%20PGN.pdf',
      },
    ],
  },
]
