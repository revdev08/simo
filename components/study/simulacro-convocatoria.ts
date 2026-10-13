// Simulacro de una convocatoria: reparte las preguntas según los módulos y pesos del perfil elegido.
// Sin dependencias del servidor: lo usa el panel en el navegador.
import { sectionOf, type Question } from '@/lib/question-types'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'
import type { Convocatoria, PerfilConvocatoria } from '@/lib/convocatorias/tipos'
import { ORDEN_SECCIONES } from './simulacro-config'

// La convocatoria elegida se guarda como "slug:perfil" (por ejemplo, "dian-2676:tributos")
export const CONVOCATORIA_STORAGE_KEY = 'simo_convocatoria'

export interface SeleccionConvocatoria {
  clave: string
  convocatoria: Convocatoria
  perfil: PerfilConvocatoria
}

export function buscarSeleccion(clave: string | null | undefined): SeleccionConvocatoria | null {
  if (!clave) return null
  const [slug, perfilId] = clave.split(':')
  const convocatoria = CONVOCATORIAS.find((c) => c.slug === slug)
  const perfil = convocatoria?.perfiles.find((p) => p.id === perfilId)
  return convocatoria && perfil ? { clave, convocatoria, perfil } : null
}

// Puntaje mínimo de la prueba eliminatoria, si el catálogo lo trae
export function minimoEliminatoria(c: Convocatoria): number | undefined {
  return c.pruebas?.find((p) => p.caracter === 'Eliminatoria')?.minimo
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Preguntas disponibles para el perfil (las del pool que pertenecen a sus módulos)
export function poolDelPerfil(pool: Question[], perfil: PerfilConvocatoria): Question[] {
  const modulos = new Set(perfil.modulos.map((m) => m.modulo))
  return pool.filter((q) => modulos.has(q.modulo))
}

// Reparte n preguntas en proporción al peso de cada módulo, sin pasar de las que hay;
// lo que un módulo no alcanza a cubrir se reparte entre los demás.
export function armarSimulacroConvocatoria(pool: Question[], n: number, perfil: PerfilConvocatoria): Question[] {
  const porModulo = new Map(perfil.modulos.map((m) => [m.modulo, shuffle(pool.filter((q) => q.modulo === m.modulo))]))
  const cuota = new Map<string, number>()
  let activos = perfil.modulos.filter((m) => (porModulo.get(m.modulo)?.length ?? 0) > 0)
  let restantes = n

  while (restantes > 0 && activos.length) {
    const total = activos.reduce((s, m) => s + m.peso, 0)
    const partes = activos.map((m) => {
      const exacto = (restantes * m.peso) / total
      return { m, exacto, ent: Math.floor(exacto) }
    })
    // Mayor residuo: las unidades que faltan van a los módulos con la parte decimal más alta
    const faltan = restantes - partes.reduce((s, p) => s + p.ent, 0)
    ;[...partes].sort((a, b) => b.exacto - b.ent - (a.exacto - a.ent)).slice(0, faltan).forEach((p) => (p.ent += 1))

    const siguen: typeof activos = []
    for (const p of partes) {
      const usadas = cuota.get(p.m.modulo) ?? 0
      const disponibles = porModulo.get(p.m.modulo)!.length - usadas
      const toma = Math.min(p.ent, disponibles)
      cuota.set(p.m.modulo, usadas + toma)
      restantes -= toma
      if (disponibles - toma > 0) siguen.push(p.m)
    }
    activos = siguen
  }

  const orden = new Map(perfil.modulos.map((m, i) => [m.modulo, i]))
  return perfil.modulos
    .flatMap((m) => porModulo.get(m.modulo)!.slice(0, cuota.get(m.modulo) ?? 0))
    .sort(
      (a, b) =>
        ORDEN_SECCIONES.indexOf(sectionOf(a.modulo)) - ORDEN_SECCIONES.indexOf(sectionOf(b.modulo)) ||
        (orden.get(a.modulo) ?? 0) - (orden.get(b.modulo) ?? 0),
    )
}
