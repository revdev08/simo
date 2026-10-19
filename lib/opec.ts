// Las OPEC de cada convocatoria con su ficha del Manual de Funciones (data/opec/<slug>.json, armado con
// scripts/opec/construir.mjs). Con ellas, «Escribe tu OPEC» muestra el empleo del aspirante y su plan.
import dian2676 from '@/data/opec/dian-2676.json'

export type Opec = {
  opec: number
  denominacion: string
  codigo: string
  grado: string
  nivel: string | null
  ficha: string | null
  procesos: string[]
  subprocesos: string[]
  aplicacion: string | null
  proposito: string | null
  funciones: string[]
  competenciasBasicas: string[]
  competenciasFuncionales: string[]
  asignacion: number | null
  vigenciaSalarial: number | null
  totalVacantes: number
  vacantes: { municipio: string; departamento: string; cantidad: number }[]
  documento: string | null
  perfil: string
}

type DatosOpec = { actualizado: string; fuente: string; opecs: Opec[] }

const DATOS: Record<string, DatosOpec> = {
  'dian-2676': dian2676 as DatosOpec,
}

export const tieneOpecs = (slug: string) => slug in DATOS
export const opecsDe = (slug: string): Opec[] => DATOS[slug]?.opecs ?? []
export const actualizadoOpecs = (slug: string) => DATOS[slug]?.actualizado ?? null
export const opecDe = (slug: string, numero: number) => opecsDe(slug).find((o) => o.opec === numero) ?? null
export const slugsConOpecs = () => Object.keys(DATOS)

// Enlace a la ficha en PDF, tal como la publica SIMO
export const fichaUrl = (documento: string) =>
  `https://simo.cnsc.gov.co/documents/get-document?docId=${encodeURIComponent(documento)}&contentType=application/pdf`
