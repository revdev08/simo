// Cómo identifica cada concurso el empleo del aspirante, y dónde se encuentran sus ejes temáticos. Cambia los textos
// de la herramienta de ejes y del plan:
// - 'opec': concursos de la CNSC; cada empleo es una OPEC con sus ejes en SIMO.
// - 'area': concurso docente; el temario es por cargo o área y es el mismo en todas las entidades territoriales.
// - 'cargo': concursos propios de una entidad (no de la CNSC), como la Procuraduría.
import type { Convocatoria } from './tipos'

export type ModoEmpleo = 'opec' | 'area' | 'cargo'

export const modoEmpleo = (c: Pick<Convocatoria, 'empleo' | 'fueraCnsc'>): ModoEmpleo => c.empleo ?? (c.fueraCnsc ? 'cargo' : 'opec')

export type TextosEmpleo = {
  nota: string // aviso encima de los planes por perfil
  enlace: string // texto del enlace a la herramienta de ejes (en la página y en el panel)
  titulo: string // título de la herramienta de ejes
  intro: string
  ayuda: string // dónde encontrar los ejes
}

export function textosEmpleo(c: Pick<Convocatoria, 'empleo' | 'fueraCnsc' | 'ejesAyuda'>): TextosEmpleo {
  const modo = modoEmpleo(c)
  if (modo === 'area')
    return {
      nota: 'Los planes de abajo son por cargo o área: el temario es el mismo en todas las entidades territoriales.',
      enlace: 'Cuando salgan los ejes de tu área, ajusta el plan con ellos',
      titulo: 'Ajusta el plan con los ejes de tu área',
      intro: 'Cuando la CNSC publique los ejes temáticos de tu cargo o área, pégalos aquí: armamos el plan con los módulos que coinciden y te decimos cuáles todavía no cubrimos.',
      ayuda: c.ejesAyuda ?? 'Los publica la CNSC por cargo y área, en la guía de orientación del concurso.',
    }
  if (modo === 'cargo')
    return {
      nota: 'Los planes de abajo son por tipo de cargo.',
      enlace: '¿Tienes los temas de tu cargo? Pégalos y ajustamos el plan',
      titulo: 'Ajusta el plan a tu cargo',
      intro: 'Los perfiles de arriba agrupan los cargos por tipo. Si tienes los temas que la convocatoria pide para tu cargo, pégalos aquí: armamos el plan con los módulos que coinciden y te decimos cuáles todavía no cubrimos.',
      ayuda: c.ejesAyuda ?? 'Están en la convocatoria de la entidad, en la descripción de cada cargo.',
    }
  return {
    nota: 'Los planes de abajo son por tipo de empleo.',
    enlace: '¿Tienes tu OPEC? Pega sus ejes temáticos y ajustamos el plan',
    titulo: 'Ajusta el plan a tu empleo (OPEC)',
    intro: 'Los perfiles de arriba agrupan los empleos por tipo. Si ya tienes los ejes temáticos de tu empleo, pégalos aquí: armamos el plan con los módulos que coinciden y te decimos cuáles todavía no cubrimos.',
    ayuda: c.ejesAyuda ?? 'Los encuentras en SIMO, en la ficha de tu empleo (OPEC), o en el anexo del acuerdo de la convocatoria.',
  }
}
