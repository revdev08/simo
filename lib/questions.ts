import 'server-only'
import type { Question, ReportQuestion } from './question-types'
import bancoOriginal from '@/questions.json'
import empleoPublico from '@/data/preguntas/empleo-publico.json'
import disciplinarioAnticorrupcion from '@/data/preguntas/disciplinario-anticorrupcion.json'
import gestionPublica from '@/data/preguntas/gestion-publica.json'
import comportamentales from '@/data/preguntas/comportamentales.json'
import constitucionEstado from '@/data/preguntas/constitucion-estado.json'
import procedimientoAdministrativo from '@/data/preguntas/procedimiento-administrativo.json'
import atencionCiudadano from '@/data/preguntas/atencion-ciudadano.json'
import transparenciaArchivo from '@/data/preguntas/transparencia-archivo.json'
import aptitudes from '@/data/preguntas/aptitudes.json'
import talentoHumano from '@/data/preguntas/talento-humano.json'
import contratacionAplicada from '@/data/preguntas/contratacion-aplicada.json'
import gestionJuridica from '@/data/preguntas/gestion-juridica.json'
import gestionFinanciera from '@/data/preguntas/gestion-financiera.json'
import sst from '@/data/preguntas/sst.json'
import gestionDocumental from '@/data/preguntas/gestion-documental.json'
import ticGobiernoDigital from '@/data/preguntas/tic-gobierno-digital.json'
import controlInterno from '@/data/preguntas/control-interno.json'
import planeacion from '@/data/preguntas/planeacion.json'
import contabilidad from '@/data/preguntas/contabilidad.json'

// Banco completo: el original más los lotes nuevos en formato v2 (data/preguntas/).
// Para publicar un lote nuevo, agrégalo a esta lista después de pasar `yarn validate:questions`.
const BANCO = [
  ...bancoOriginal,
  ...empleoPublico,
  ...disciplinarioAnticorrupcion,
  ...gestionPublica,
  ...comportamentales,
  ...constitucionEstado,
  ...procedimientoAdministrativo,
  ...atencionCiudadano,
  ...transparenciaArchivo,
  ...aptitudes,
  ...talentoHumano,
  ...contratacionAplicada,
  ...gestionJuridica,
  ...gestionFinanciera,
  ...sst,
  ...gestionDocumental,
  ...ticGobiernoDigital,
  ...controlInterno,
  ...planeacion,
  ...contabilidad,
] as unknown as (Question & Record<string, unknown>)[]

// Estados que no se muestran en la práctica: con error confirmado, sin revisar o retirados
const INACTIVE_STATES = ['borrador', 'en_revision', 'retirada']

const isActive = (q: Question) => !INACTIVE_STATES.includes(q.estado ?? '')

// Solo los campos que la app muestra; el texto de la norma y los metadatos de revisión
// quedan en el servidor para no inflar lo que se envía al navegador.
function toClient(q: Question): Question {
  return {
    id: q.id,
    modulo: q.modulo,
    tema: q.tema,
    dificultad: q.dificultad,
    pregunta: q.pregunta,
    opciones: q.opciones.map((o) => ({
      id: o.id,
      texto: o.texto,
      ...(o.explicacion ? { explicacion: o.explicacion } : {}),
      ...(typeof o.puntaje === 'number' ? { puntaje: o.puntaje } : {}),
    })),
    respuestaCorrecta: q.respuestaCorrecta,
    explicacionIA: q.explicacionIA,
    ...(q.estado ? { estado: q.estado } : {}),
    ...(q.version ? { version: q.version } : {}),
    ...(q.norma ? { norma: q.norma } : {}),
    ...(q.articulos ? { articulos: q.articulos } : {}),
    ...(q.fundamentos ? { fundamentos: true } : {}),
    ...(q.formato === 'juicio_situacional'
      ? { formato: q.formato, nivel: q.nivel, competencia: q.competencia, subtema: q.subtema }
      : {}),
  }
}

export function getPracticeQuestions(): Question[] {
  return BANCO.filter(isActive).map(toClient)
}

export function getReportQuestions(): ReportQuestion[] {
  return BANCO.map((q) => ({ id: q.id, modulo: q.modulo, tema: q.tema, activa: isActive(q) }))
}

// Busca una pregunta activa por id (los ids llegan como texto desde el navegador)
export function findActiveQuestion(id: unknown): Question | undefined {
  if (typeof id !== 'string' && typeof id !== 'number') return undefined
  const key = String(id)
  return BANCO.find((q) => String(q.id) === key && isActive(q))
}
