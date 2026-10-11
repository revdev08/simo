// Relaciona los ejes temáticos de una convocatoria (copiados de SIMO o del acuerdo) con los módulos del banco.
// Sin dependencias del servidor: corre en el navegador.

// Palabras clave por módulo, sin tildes y en minúscula. Las de 4 letras o menos solo cuentan como palabra
// completa (iva, pac, tic); las demás también como inicio de palabra (tributari → tributario, tributaria).
export const PALABRAS_POR_MODULO: Record<string, string[]> = {
  'Constitución y Estructura del Estado': [
    'constitucion', 'estructura del estado', 'organizacion del estado', 'ramas del poder', 'rama ejecutiva',
    'ley 489', 'descentralizacion', 'organos de control', 'mecanismos de participacion', 'participacion ciudadana',
    'derechos fundamentales', 'funcion administrativa', 'organizacion territorial', 'estado social de derecho',
  ],
  'Empleo Público y Carrera Administrativa': [
    'empleo publico', 'carrera administrativa', 'ley 909', 'ley 1960', 'merito', 'periodo de prueba',
    'evaluacion del desempeno', 'evaluacion de desempeno', 'comision de personal', 'retiro del servicio',
    'provision de empleos', 'gerencia publica', 'servidores publicos', 'funcion publica',
  ],
  'Derecho de Petición y Procedimiento Administrativo': [
    'derecho de peticion', 'ley 1755', 'cpaca', 'ley 1437', 'procedimiento administrativo', 'actos administrativos',
    'acto administrativo', 'notificacion', 'silencio administrativo', 'revocatoria directa', 'recursos administrativos',
    'actuacion administrativa', 'sancionatorio administrativo',
  ],
  'Transparencia, Datos Personales y Archivo': [
    'transparencia', 'acceso a la informacion', 'ley 1712', 'datos personales', 'habeas data', 'ley 1581',
    'informacion publica',
  ],
  'Carrera y Gestión Institucional (DIAN)': [
    'decreto ley 927', 'decreto 927', 'carrera dian', 'sistema especifico de carrera', 'gestion institucional dian',
  ],
  'Disciplinario y Anticorrupción': [
    'disciplinari', 'ley 1952', 'ley 2094', 'anticorrupcion', 'ley 1474', 'conflicto de interes', 'conflictos de interes',
    'inhabilidades', 'incompatibilidades', 'acoso laboral', 'ley 1010', 'etica publica', 'codigo de integridad',
  ],
  'Gestión Pública: MIPG, Presupuesto y Contratación': [
    'mipg', 'modelo integrado de planeacion', 'gestion publica', 'administracion publica', 'politicas de gestion',
    'decreto 1499', 'presupuesto publico', 'contratacion estatal', 'contratacion publica',
  ],
  'Atención al Ciudadano': [
    'atencion al ciudadano', 'servicio al ciudadano', 'atencion al usuario', 'pqrs', 'pqrsd', 'pqrsdf',
    'peticiones, quejas', 'racionalizacion de tramites', 'tramites', 'rendicion de cuentas', 'lenguaje claro',
    'accesibilidad', 'enfoque diferencial', 'ley 1618', 'control social',
  ],
  'Talento Humano': [
    'talento humano', 'gestion humana', 'administracion de personal', 'nomina', 'situaciones administrativas',
    'vacaciones', 'licencias', 'comisiones', 'prestaciones sociales', 'bienestar', 'capacitacion', 'incentivos',
    'manual de funciones', 'manual especifico', 'plan de vacantes', 'historia laboral', 'decreto 1083', 'decreto 1045',
    'decreto 1567', 'sigep',
  ],
  'Contratación Estatal Aplicada': [
    'contratacion', 'contratos estatales', 'contrato estatal', 'ley 80', 'ley 1150', 'decreto 1082',
    'modalidades de seleccion', 'licitacion', 'seleccion abreviada', 'minima cuantia', 'concurso de meritos',
    'contratacion directa', 'supervision', 'interventoria', 'liquidacion de contratos', 'secop', 'pliego',
    'estudios previos', 'garantias', 'colombia compra', 'acuerdo marco',
  ],
  'Gestión Jurídica': [
    'juridic', 'derecho administrativo', 'acciones constitucionales', 'accion de tutela', 'tutela',
    'accion de cumplimiento', 'acciones populares', 'medios de control', 'defensa judicial', 'conciliacion',
    'cobro coactivo', 'jurisdiccion coactiva', 'responsabilidad fiscal', 'ley 610', 'repeticion', 'contencioso',
    'derecho procesal', 'codigo general del proceso',
  ],
  'Gestión Financiera y Presupuestal': [
    'presupuest', 'gestion financiera', 'informacion financiera', 'decreto 111', 'estatuto organico', 'ejecucion presupuestal', 'cdp',
    'certificado de disponibilidad', 'registro presupuestal', 'vigencias futuras', 'pac', 'tesoreria', 'pagaduria',
    'cuentas por pagar', 'reservas presupuestales', 'finanzas publicas', 'sistema general de participaciones', 'sgp',
    'regalias', 'decreto 1068', 'siif', 'cuenta unica', 'mensualizado de caja',
  ],
  'Seguridad y Salud en el Trabajo': [
    'seguridad y salud', 'sst', 'sg-sst', 'salud ocupacional', 'riesgos laborales', 'accidente de trabajo',
    'enfermedad laboral', 'copasst', 'decreto 1072', 'resolucion 0312', 'estandares minimos', 'matriz de peligros',
    'arl', 'higiene industrial', 'plan de emergencias',
  ],
  'Gestión Documental': [
    'gestion documental', 'archivo', 'archivistic', 'tablas de retencion', 'trd', 'tvd', 'ley 594',
    'correspondencia', 'ventanilla unica', 'radicacion', 'transferencias documentales', 'pgd', 'pinar',
    'expediente electronico', 'documento electronico', 'organizacion documental',
  ],
  'TIC y Gobierno Digital': [
    'gobierno digital', 'tic', 'tecnologias de la informacion', 'seguridad de la informacion', 'datos abiertos',
    'interoperabilidad', 'arquitectura empresarial', 'decreto 1078', 'ciberseguridad', 'software', 'redes de datos',
    'bases de datos', 'infraestructura tecnologica', 'mintic', 'peti', 'sistemas de informacion', 'transformacion digital',
  ],
  'Control Interno': [
    'control interno', 'ley 87', 'meci', 'auditoria', 'lineas de defensa', 'plan de mejoramiento',
    'administracion del riesgo', 'mapa de riesgos', 'riesgos de gestion', 'riesgos de corrupcion', 'evaluacion independiente',
  ],
  'Planeación y Proyectos de Inversión': [
    'planeacion', 'plan de desarrollo', 'ley 152', 'proyectos de inversion', 'proyecto de inversion', 'banco de proyectos',
    'mga', 'bpin', 'poai', 'plan indicativo', 'plan de accion', 'indicadores', 'formulacion de proyectos',
    'seguimiento a proyectos', 'suifp', 'politicas publicas', 'planeacion estrategica',
  ],
  'Contabilidad Pública': [
    'contab', 'contaduria general', 'cgn', 'regimen de contabilidad', 'marco normativo para entidades',
    'estados financieros', 'nicsp', 'niif', 'depreciacion', 'conciliaciones bancarias', 'conciliacion bancaria', 'chip',
    'hechos economicos',
  ],
  'Almacén e Inventarios': [
    'almacen', 'inventari', 'bienes muebles', 'propiedades, planta y equipo', 'propiedad, planta y equipo',
    'propiedad planta y equipo', 'kardex', 'baja de bienes', 'enajenacion', 'custodia de bienes', 'activos fijos',
    'suministros', 'manejo de bienes', 'recursos fisicos',
  ],
  'Gestión Tributaria (DIAN)': [
    'tributari', 'impuesto', 'estatuto tributario', 'renta', 'iva', 'retencion en la fuente', 'fiscalizacion',
    'declaraciones tributarias', 'rut', 'facturacion electronica', 'factura electronica', 'sanciones tributarias',
    'procedimiento tributario', 'gravamen', 'contribuyente', 'obligaciones tributarias', 'devoluciones',
  ],
  'Aduanero y Cambiario (DIAN)': [
    'aduan', 'decreto 1165', 'importacion', 'exportacion', 'comercio exterior', 'cambiari', 'regimen cambiario',
    'arancel', 'clasificacion arancelaria', 'valoracion aduanera', 'contrabando', 'zona franca', 'zonas francas',
    'transito aduanero', 'mercancias',
  ],
  'Derecho Laboral': [
    'derecho laboral', 'derecho del trabajo', 'codigo sustantivo', 'contrato de trabajo', 'jornada de trabajo',
    'jornada laboral', 'salario', 'cesantias', 'prima de servicios', 'derecho colectivo', 'sindical', 'sindicato',
    'negociacion colectiva', 'convencion colectiva', 'huelga', 'ley 2466', 'reforma laboral', 'terminacion del contrato',
    'relaciones laborales', 'seguridad social',
  ],
  'Inspección, Vigilancia y Control del Trabajo': [
    'inspeccion del trabajo', 'inspeccion, vigilancia', 'inspeccion vigilancia', 'inspector de trabajo', 'ley 1610',
    'sancionatorio laboral', 'trabajo infantil', 'trabajo adolescente', 'despidos colectivos', 'formalizacion laboral',
    'autorizaciones laborales', 'conciliacion laboral', 'ivc',
  ],
  'Pedagogía y Normativa Docente': [
    'pedagog', 'didactic', 'evaluacion de los aprendizajes', 'evaluacion de aprendizajes', 'evaluacion formativa',
    'siee', 'decreto 1290', 'educacion inclusiva', 'inclusion educativa', 'piar', 'decreto 1421', 'convivencia escolar',
    'ley 1620', 'ley 115', 'ley general de educacion', 'decreto 1278', 'estatuto docente', 'profesionalizacion docente',
    'curricul', 'proyecto educativo institucional', 'pei', 'decreto 1075', 'practicas de aula', 'planeacion de clase',
  ],
  'Saber Disciplinar: Matemáticas': [
    'matematicas', 'pensamiento numerico', 'pensamiento variacional', 'pensamiento espacial', 'pensamiento metrico',
    'pensamiento aleatorio', 'algebra', 'geometria', 'estadistica', 'probabilidad', 'calculo', 'trigonometria',
    'didactica de las matematicas',
  ],
  'Saber Disciplinar: Lenguaje': [
    'lengua castellana', 'humanidades', 'literatura', 'produccion textual', 'comprension e interpretacion textual',
    'didactica del lenguaje', 'lectura y escritura', 'linguistica', 'medios de comunicacion y otros sistemas simbolicos',
  ],
  'Saber Disciplinar: Ciencias Naturales': [
    'ciencias naturales', 'biologia', 'quimica', 'fisica', 'educacion ambiental', 'entorno vivo', 'entorno fisico',
    'ciencia, tecnologia y sociedad', 'didactica de las ciencias',
  ],
  'Saber Disciplinar: Ciencias Sociales': [
    'ciencias sociales', 'historia', 'geografia', 'constitucion politica y democracia', 'competencias ciudadanas',
    'relaciones etico-politicas', 'relaciones espaciales y ambientales', 'didactica de las ciencias sociales',
  ],
  'Saber Disciplinar: Primaria': [
    'basica primaria', 'primaria', 'docente de primaria', 'primero a quinto', 'escuela nueva', 'multigrado',
    'lectoescritura', 'alfabetizacion inicial',
  ],
  'Gestión Escolar (Directivos Docentes)': [
    'gestion escolar', 'gestion directiva', 'gestion educativa', 'gobierno escolar', 'consejo directivo',
    'consejo academico', 'fondo de servicios educativos', 'fondos de servicios educativos', 'rector', 'coordinador',
    'ley 715', 'autoevaluacion institucional', 'plan de mejoramiento institucional', 'gestion comunitaria',
    'directivo docente', 'directivos docentes',
  ],
  'Gestión Ambiental': [
    'ambiental', 'medio ambiente', 'recursos naturales', 'ley 99', 'decreto 1076', 'licencia ambiental',
    'licencias ambientales', 'sancionatorio ambiental', 'ley 1333', 'vertimientos', 'concesion de aguas', 'pomca',
    'tasa retributiva', 'aprovechamiento forestal', 'gestion del riesgo', 'ley 1523', 'cambio climatico', 'sina',
  ],
  'Distrito Capital (Bogotá)': [
    'distrito capital', 'bogota', 'decreto 1421', 'estatuto organico de bogota', 'acuerdo 257', 'localidades',
    'alcaldias locales', 'juntas administradoras locales', 'concejo de bogota', 'administracion distrital',
    'decreto 352', 'tributos distritales', 'impuestos distritales', 'impuesto predial', 'industria y comercio',
    'ica', 'reteica', 'hacienda distrital',
  ],
  'Sistema de Salud y ESE': [
    'sistema general de seguridad social en salud', 'sgsss', 'ley 100', 'ley 1751', 'ley 1438', 'ley 1122',
    'decreto 780', 'empresa social del estado', 'empresas sociales del estado', 'habilitacion de servicios',
    'resolucion 3100', 'garantia de calidad', 'sogcs', 'pamec', 'acreditacion en salud', 'seguridad del paciente',
    'historia clinica', 'facturacion en salud', 'facturacion de servicios de salud', 'glosas', 'rips', 'eps', 'ips',
    'prestacion de servicios de salud', 'red de prestadores', 'urgencias', 'atencion primaria en salud',
  ],
  'Protección de Personas (UNP)': [
    'unidad nacional de proteccion', 'unp', 'prevencion y proteccion', 'medidas de proteccion', 'esquema de proteccion',
    'esquemas de proteccion', 'evaluacion del riesgo', 'riesgo extraordinario', 'cerrem', 'decreto 1066',
    'decreto 4065', 'proteccion de personas', 'defensores de derechos humanos',
  ],
  'Vigilancia Sanitaria (INVIMA)': [
    'invima', 'vigilancia sanitaria', 'inspeccion, vigilancia y control sanitario', 'registro sanitario',
    'registros sanitarios', 'codigo sanitario', 'ley 9 de 1979', 'resolucion 2674', 'decreto 677', 'medidas sanitarias',
    'buenas practicas de manufactura', 'bpm', 'alimentos', 'medicamentos', 'cosmeticos', 'dispositivos medicos',
  ],
  'Procuraduría General de la Nación': [
    'procuraduria', 'ministerio publico', 'decreto 262', 'decreto ley 262', 'procurador general', 'procuradores',
    'funcion preventiva', 'intervencion judicial', 'poder disciplinario preferente', 'vigilancia superior',
    'personerias',
  ],
  'Políticas Sociales y Enfoque Diferencial': [
    'enfoque diferencial', 'politica social', 'politicas sociales', 'infancia', 'adolescencia', 'ley 1098',
    'restablecimiento de derechos', 'adulto mayor', 'persona mayor', 'ley 1251', 'violencia contra la mujer',
    'ley 1257', 'discapacidad', 'poblacion vulnerable', 'comisaria de familia', 'integracion social', 'genero',
  ],
  'Herramientas de Oficina y Seguridad Digital': [
    'ofimatica', 'excel', 'word', 'hoja de calculo', 'hojas de calculo', 'procesador de texto', 'office',
    'correo electronico', 'herramientas informaticas', 'herramientas de oficina', 'seguridad digital',
  ],
  'Razonamiento Lógico y Cuantitativo': [
    'razonamiento', 'logic', 'cuantitativ', 'matematic', 'aritmetic', 'numeric', 'competencias basicas',
    'analisis de datos', 'interpretacion de datos',
  ],
  'Comprensión Lectora': [
    'comprension lectora', 'lectura critica', 'comprension de lectura', 'comprension de textos', 'redaccion',
    'ortografia', 'gramatica', 'comunicacion escrita', 'verbal',
  ],
  'Competencias Comportamentales': [
    'comportamental', 'decreto 815', 'trabajo en equipo', 'orientacion a resultados', 'orientacion al usuario',
    'compromiso con la organizacion', 'adaptacion al cambio', 'aprendizaje continuo', 'liderazgo', 'toma de decisiones',
    'resolucion de conflictos', 'comunicacion efectiva', 'psicotecnic',
  ],
}

export function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Una expresión por módulo para no recorrer cada palabra en cada línea
const PATRONES = Object.entries(PALABRAS_POR_MODULO).map(([modulo, palabras]) => {
  const partes = palabras.map((p) => (p.length <= 4 ? `${escapar(p)}(?![a-z0-9])` : escapar(p)))
  return { modulo, re: new RegExp(`(?<![a-z0-9])(?:${partes.join('|')})`, 'g') }
})

export interface EjeAnalizado {
  texto: string
  modulos: string[]
}

export interface ResultadoEjes {
  ejes: EjeAnalizado[]
  // Módulos ordenados por cuántos ejes los piden (y por coincidencias, si empatan)
  modulos: { modulo: string; ejes: number }[]
  sinCobertura: string[]
}

// Parte el texto pegado en ejes: líneas, viñetas, numerales y puntos y coma
export function separarEjes(texto: string): string[] {
  return texto
    .split(/\r?\n|;|•|·|▪|◦/)
    .map((l) => l.replace(/^\s*(?:[-*–]|\d+(?:\.\d+)*[.)-]?|[a-z][.)])\s+/i, '').trim())
    .filter((l) => l.length >= 4)
}

export function analizarEjes(texto: string, modulosDisponibles?: Set<string>): ResultadoEjes {
  const ejes = separarEjes(texto).map((linea) => {
    const norm = normalizar(linea)
    const hits = PATRONES.map(({ modulo, re }) => ({ modulo, n: norm.match(re)?.length ?? 0 }))
      .filter((h) => h.n > 0 && (!modulosDisponibles || modulosDisponibles.has(h.modulo)))
      .sort((a, b) => b.n - a.n)
    return { texto: linea, modulos: hits.map((h) => h.modulo), peso: hits }
  })
  const conteo = new Map<string, { ejes: number; hits: number }>()
  for (const e of ejes) {
    for (const h of e.peso) {
      const c = conteo.get(h.modulo) ?? { ejes: 0, hits: 0 }
      conteo.set(h.modulo, { ejes: c.ejes + 1, hits: c.hits + h.n })
    }
  }
  const modulos = [...conteo.entries()]
    .sort((a, b) => b[1].ejes - a[1].ejes || b[1].hits - a[1].hits)
    .map(([modulo, c]) => ({ modulo, ejes: c.ejes }))
  return {
    ejes: ejes.map(({ texto, modulos }) => ({ texto, modulos })),
    modulos,
    sinCobertura: ejes.filter((e) => !e.modulos.length).map((e) => e.texto),
  }
}
