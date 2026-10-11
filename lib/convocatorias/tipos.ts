// Tipos del catálogo de convocatorias (páginas públicas de "Mi convocatoria")
import type { AreaId, NivelId } from '@/lib/question-types'
import type { ModuloPlan } from './plan'

export interface PruebaConvocatoria {
  nombre: string
  peso: number // porcentaje en la calificación final
  caracter: 'Eliminatoria' | 'Clasificatoria'
  minimo?: number // puntaje mínimo aprobatorio, si es eliminatoria
}

// Un perfil agrupa empleos parecidos dentro de la convocatoria (por ejemplo, "Profesional en áreas tributarias")
export interface PerfilConvocatoria {
  id: string
  label: string
  nivel?: NivelId
  area?: AreaId // área funcional que conviene elegir en el panel
  modulos: ModuloPlan[]
}

export interface Convocatoria {
  slug: string
  nombre: string // nombre corto para tarjetas y títulos
  titulo: string // título SEO de la página
  entidad: string
  vacantes?: number
  vacantesAprox?: boolean // la cifra es "más de" o "cerca de" (oferta preliminar o cambiante)
  vacantesNota?: string // de dónde sale la cifra
  niveles: string
  estado: string // en qué va el proceso (con fecha de revisión en `revisado`)
  revisado: string // AAAA-MM-DD
  resumen: string
  pruebas?: PruebaConvocatoria[]
  pruebasNota?: string
  perfiles: PerfilConvocatoria[]
  cobertura: string // qué cubre SIMO TEST de esta convocatoria, dicho sin exagerar
  faltantes?: string // qué no cubrimos todavía
  fuentes: { label: string; url: string }[]
}
