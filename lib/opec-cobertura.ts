// Cuántas preguntas tenemos de cada tema de la ficha de una OPEC. Cada competencia de la ficha apunta a un tema
// (data/opec/temas-<slug>.json); el tema se cubre con preguntas etiquetadas (data/opec/etiquetas-<slug>.json)
// o con un módulo del banco que trata ese tema. Verificación: scripts/opec/verificar-temas.mjs.
import temasDian from '@/data/opec/temas-dian-2676.json'
import etiquetasDian from '@/data/opec/etiquetas-dian-2676.json'
import { findActiveQuestion, getModuleCounts } from '@/lib/questions'

type Tema = { id: string; nombre: string; etiqueta: boolean; modulos: string[]; competencias: string[] }
type Datos = { temas: Tema[]; etiquetas: Record<string, string[]> }

const DATOS: Record<string, Datos> = {
  'dian-2676': { temas: temasDian.temas as Tema[], etiquetas: etiquetasDian.preguntas as Record<string, string[]> },
}

export type CoberturaTema = {
  competencia: string
  tema: { id: string; nombre: string } | null
  preguntas: string[] // ids de las preguntas etiquetadas con el tema
  modulos: { modulo: string; n: number }[] // módulos del banco que tratan el tema
}

const clave = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]+/g, '')

function indice(slug: string) {
  const datos = DATOS[slug]
  if (!datos) return null
  const temaDe = new Map<string, Tema>()
  for (const t of datos.temas) for (const c of t.competencias) temaDe.set(clave(c), t)
  const porTema = new Map<string, string[]>()
  for (const [id, temas] of Object.entries(datos.etiquetas)) {
    if (!findActiveQuestion(id)) continue
    for (const t of temas) porTema.set(t, [...(porTema.get(t) ?? []), id])
  }
  return { temaDe, porTema }
}

export function coberturaDe(slug: string, competencias: string[]): CoberturaTema[] {
  const ind = indice(slug)
  const modulos = getModuleCounts()
  return competencias.map((competencia) => {
    const t = ind?.temaDe.get(clave(competencia))
    if (!t) return { competencia, tema: null, preguntas: [], modulos: [] }
    return {
      competencia,
      tema: { id: t.id, nombre: t.nombre },
      preguntas: t.etiqueta ? (ind?.porTema.get(t.id) ?? []) : [],
      modulos: t.modulos.map((m) => ({ modulo: m, n: modulos[m] ?? 0 })).filter((m) => m.n > 0),
    }
  })
}

export const tieneCobertura = (c: CoberturaTema) => c.preguntas.length > 0 || c.modulos.length > 0
