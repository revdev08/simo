// Arma un plan de estudio semanal a partir de los módulos de una convocatoria y su peso.
// Sin dependencias del servidor: corre en el navegador.
import { sectionOf } from '@/lib/question-types'

export interface ModuloPlan {
  modulo: string
  peso: number // relativo: no tiene que sumar 1
}

export interface ItemSemana {
  modulo: string
  horas: number
  preguntas: number // preguntas nuevas sugeridas esa semana; 0 = repasar las falladas del módulo
}

export interface SemanaPlan {
  numero: number
  hasta?: number // si el bloque abarca varias semanas seguidas (solo en repaso)
  tipo: 'estudio' | 'repaso'
  items: ItemSemana[]
  simulacro?: 'control' | 'final'
}

// Ritmo de práctica leyendo la explicación: unas 12 preguntas por hora
export const PREGUNTAS_POR_HORA = 12
// Ningún módulo recibe más tiempo del que piden dos vueltas a sus preguntas (la segunda, para repasar errores)
const VUELTAS = 2

const media = (h: number) => Math.round(h * 2) / 2

// Aptitudes y comportamentales se practican un poco cada semana; los demás módulos van en bloques seguidos
const esTransversal = (modulo: string) => {
  const s = sectionOf(modulo)
  return s === 'aptitudes' || s === 'comportamentales'
}

// Reparte las horas según el peso sin pasar del tope de cada módulo; lo que sobra va a los que no lo alcanzan
function repartir(horas: number, pesos: number[], topes: number[]): number[] {
  const asignadas = pesos.map(() => 0)
  let libres = pesos.map((_, i) => i)
  let resto = horas
  while (libres.length && resto > 0.01) {
    const pesoLibre = libres.reduce((s, i) => s + pesos[i], 0)
    const saturados = libres.filter((i) => asignadas[i] + (resto * pesos[i]) / pesoLibre >= topes[i])
    if (!saturados.length) {
      for (const i of libres) asignadas[i] += (resto * pesos[i]) / pesoLibre
      break
    }
    for (const i of saturados) {
      resto -= topes[i] - asignadas[i]
      asignadas[i] = topes[i]
    }
    libres = libres.filter((i) => !saturados.includes(i))
  }
  return asignadas.map((h) => Math.max(0.5, media(h)))
}

export function armarPlan(
  modulos: ModuloPlan[],
  semanas: number,
  horasSemana: number,
  disponibles: Record<string, number>,
): SemanaPlan[] {
  const validos = modulos.filter((m) => m.peso > 0 && (disponibles[m.modulo] ?? 0) > 0).sort((a, b) => b.peso - a.peso)
  if (!validos.length || semanas < 1 || horasSemana <= 0) return []

  // La última semana es de simulacros y repaso, salvo que solo haya una
  const semanasEstudio = semanas === 1 ? 1 : semanas - 1
  const topes = validos.map((m) => Math.max(0.5, media((VUELTAS * disponibles[m.modulo]) / PREGUNTAS_POR_HORA)))
  // Las transversales reciben su parte fija; lo que sobre de los bloques no se les suma (se vuelve repaso)
  const horasTotales = semanasEstudio * horasSemana
  const pesoTotal = validos.reduce((a, m) => a + m.peso, 0)
  const idxBloques = validos.map((m, i) => (esTransversal(m.modulo) ? -1 : i)).filter((i) => i >= 0)
  const pesoBloques = idxBloques.reduce((a, i) => a + validos[i].peso, 0)
  const horasBloques = idxBloques.length
    ? repartir((horasTotales * pesoBloques) / pesoTotal, idxBloques.map((i) => validos[i].peso), idxBloques.map((i) => topes[i]))
    : []
  const horas = validos.map((m, i) =>
    esTransversal(m.modulo)
      ? Math.min(topes[i], Math.max(0.5, media((horasTotales * m.peso) / pesoTotal)))
      : horasBloques[idxBloques.indexOf(i)],
  )
  // Si las preguntas se acaban antes, el estudio se concentra en las primeras semanas y el resto es repaso
  const totalHoras = horas.reduce((a, h) => a + h, 0)
  const efectivas = Math.min(semanasEstudio, Math.max(1, Math.ceil(totalHoras / horasSemana)))

  const plan: SemanaPlan[] = Array.from({ length: efectivas }, (_, i) => ({ numero: i + 1, tipo: 'estudio', items: [] }))
  const usadas = new Map<string, number>()
  const agregar = (semana: SemanaPlan, modulo: string, h: number) => {
    if (h <= 0) return
    const quedan = Math.max(0, disponibles[modulo] - (usadas.get(modulo) ?? 0))
    const preguntas = Math.min(quedan, Math.round(h * PREGUNTAS_POR_HORA))
    usadas.set(modulo, (usadas.get(modulo) ?? 0) + preguntas)
    const previo = semana.items.find((it) => it.modulo === modulo)
    if (previo) {
      previo.horas = media(previo.horas + h)
      previo.preguntas += preguntas
    } else semana.items.push({ modulo, horas: media(h), preguntas })
  }

  // 1. Transversales: medias horas repartidas de forma pareja entre las semanas de estudio
  const ocupadas = plan.map(() => 0)
  validos.forEach((m, i) => {
    if (!esTransversal(m.modulo)) return
    const bloques = Math.round(horas[i] / 0.5)
    const porSemana = plan.map(() => 0)
    for (let j = 0; j < bloques; j++) porSemana[Math.floor((j * efectivas) / bloques)] += 0.5
    porSemana.forEach((h, s) => {
      agregar(plan[s], m.modulo, h)
      ocupadas[s] += h
    })
  })

  // 2. Bloques en orden de peso, llenando lo que queda de cada semana
  let s = 0
  let libre = Math.max(0.5, horasSemana - ocupadas[0])
  validos.forEach((m, i) => {
    if (esTransversal(m.modulo)) return
    let pendiente = horas[i]
    while (pendiente > 0) {
      if (libre <= 0) {
        if (s < efectivas - 1) {
          s += 1
          libre = Math.max(0.5, horasSemana - ocupadas[s])
        } else libre = pendiente // lo que no cabe se suma a la última semana de estudio
      }
      const h = Math.min(pendiente, libre)
      agregar(plan[s], m.modulo, h)
      pendiente = media(pendiente - h)
      libre = media(libre - h)
    }
  })

  // En cada semana, primero los bloques y después la práctica transversal
  for (const sem of plan) sem.items.sort((a, b) => Number(esTransversal(a.modulo)) - Number(esTransversal(b.modulo)))
  if (efectivas >= 4) plan[Math.floor(efectivas / 2) - 1].simulacro = 'control'
  if (efectivas < semanasEstudio) {
    plan.push({ numero: efectivas + 1, hasta: semanasEstudio > efectivas + 1 ? semanasEstudio : undefined, tipo: 'repaso', items: [] })
  }
  if (semanas === 1) {
    plan[0].simulacro = 'final'
    return plan
  }
  plan.push({ numero: semanas, tipo: 'repaso', items: [], simulacro: 'final' })
  return plan
}
