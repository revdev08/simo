// Avance del aspirante en el plan de su convocatoria: cuánto ha visto de cada módulo,
// cómo le va y qué le conviene estudiar ahora. Lo usan el panel y "Mi progreso".
import type { Convocatoria, PerfilConvocatoria } from '@/lib/convocatorias/tipos'
import { armarPlan, type SemanaPlan } from '@/lib/convocatorias/plan'

// Con menos respuestas que estas, el porcentaje de aciertos de un módulo aún no dice mucho
export const MIN_RESPUESTAS_MODULO = 5

export interface ConteoModulo {
  name: string
  total: number
  correct: number
  incorrect: number
}

export type EstadoModulo = 'sin_empezar' | 'en_curso' | 'reforzar' | 'dominado'

export interface ModuloAvance {
  modulo: string
  peso: number // parte del plan, de 0 a 1
  total: number
  vistas: number
  correctas: number
  falladas: number
  visto: number // 0-100
  acierto: number | null // 0-100, solo con respuestas suficientes
  estado: EstadoModulo
}

export interface AvancePlan {
  modulos: ModuloAvance[] // del que más pesa al que menos
  cobertura: number // 0-100, ponderada por peso
  estimacion: number | null // acierto ponderado en los módulos con datos suficientes
  pesoConDatos: number // parte del plan (0-1) que respalda la estimación
}

export const ESTADO_LABEL: Record<EstadoModulo, string> = {
  sin_empezar: 'Sin empezar',
  en_curso: 'En curso',
  reforzar: 'Por reforzar',
  dominado: 'Dominado',
}

export function avanceDelPlan(perfil: PerfilConvocatoria, conteos: ConteoModulo[]): AvancePlan {
  const porNombre = new Map(conteos.map((c) => [c.name, c]))
  const conPreguntas = perfil.modulos.filter((m) => (porNombre.get(m.modulo)?.total ?? 0) > 0)
  const pesoTotal = conPreguntas.reduce((s, m) => s + m.peso, 0) || 1

  const modulos = conPreguntas
    .map((m): ModuloAvance => {
      const c = porNombre.get(m.modulo)!
      const vistas = c.correct + c.incorrect
      const acierto = vistas >= MIN_RESPUESTAS_MODULO ? Math.round((c.correct / vistas) * 100) : null
      const visto = Math.min(100, Math.round((vistas / c.total) * 100))
      const estado: EstadoModulo =
        vistas === 0 ? 'sin_empezar' : acierto !== null && acierto < 60 ? 'reforzar' : visto >= 80 && (acierto ?? 0) >= 75 ? 'dominado' : 'en_curso'
      return { modulo: m.modulo, peso: m.peso / pesoTotal, total: c.total, vistas, correctas: c.correct, falladas: c.incorrect, visto, acierto, estado }
    })
    .sort((a, b) => b.peso - a.peso)

  const cobertura = Math.round(modulos.reduce((s, m) => s + m.peso * m.visto, 0))
  const conDatos = modulos.filter((m) => m.acierto !== null)
  const pesoConDatos = conDatos.reduce((s, m) => s + m.peso, 0)
  const estimacion = pesoConDatos ? Math.round(conDatos.reduce((s, m) => s + m.peso * (m.acierto ?? 0), 0) / pesoConDatos) : null
  return { modulos, cobertura, estimacion, pesoConDatos }
}

// La estimación solo se muestra si los módulos con datos suman al menos la mitad del plan
export const estimacionConfiable = (a: AvancePlan) => a.estimacion !== null && a.pesoConDatos >= 0.5

// Qué estudiar ahora: el módulo donde más puntos se pueden ganar (peso × lo que falta por dominar)
export function siguientePaso(a: AvancePlan): { modulo: ModuloAvance; razon: string } | null {
  const candidatos = a.modulos.filter((m) => m.estado !== 'dominado')
  if (!candidatos.length) return null
  const falta = (m: ModuloAvance) => 1 - (m.visto / 100) * ((m.acierto ?? 50) / 100)
  const mejor = [...candidatos].sort((x, y) => y.peso * falta(y) - x.peso * falta(x))[0]
  const pct = Math.round(mejor.peso * 100)
  const razon =
    mejor.estado === 'reforzar'
      ? `Aciertas el ${mejor.acierto}% y pesa ${pct}% de tu prueba. Repasa tus errores y sigue practicando.`
      : mejor.estado === 'sin_empezar'
        ? `Pesa ${pct}% de tu prueba y aún no lo empiezas.`
        : `Pesa ${pct}% de tu prueba y llevas ${mejor.visto}% visto.`
  return { modulo: mejor, razon }
}

// Días que faltan para la prueba (null si no hay fecha o ya pasó)
export function diasParaPrueba(c: Convocatoria, hoy = new Date()): number | null {
  if (!c.fechaPrueba) return null
  const [y, m, d] = c.fechaPrueba.split('-').map(Number)
  const prueba = new Date(y, m - 1, d)
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const dias = Math.round((prueba.getTime() - inicio.getTime()) / 86_400_000)
  return dias >= 0 ? dias : null
}

// Plan semanal desde el día en que eligió la convocatoria: hasta la prueba, o 8 semanas si no hay fecha
export function planSemanal(
  c: Convocatoria,
  perfil: PerfilConvocatoria,
  disponibles: Record<string, number>,
  horasSemana: number,
  inicio: string | undefined,
  hoy = new Date(),
): { semanaActual: number; semanas: number; plan: SemanaPlan[] } | null {
  const [y, m, d] = (inicio ?? '').split('-').map(Number)
  const desde = inicio && y ? new Date(y, m - 1, d) : new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const transcurridas = Math.max(0, Math.floor((hoy.getTime() - desde.getTime()) / (7 * 86_400_000)))
  const dias = diasParaPrueba(c, desde)
  const semanas = dias !== null ? Math.max(1, Math.min(26, Math.ceil(dias / 7))) : 8
  const plan = armarPlan(perfil.modulos, semanas, horasSemana, disponibles)
  if (!plan.length) return null
  return { semanaActual: Math.min(semanas, transcurridas + 1), semanas, plan }
}

// La semana del plan que corresponde a un número (los bloques de repaso pueden abarcar varias)
export const semanaDelPlan = (plan: SemanaPlan[], n: number) => plan.find((s) => s.numero === n || (s.hasta !== undefined && s.numero <= n && n <= s.hasta)) ?? null
