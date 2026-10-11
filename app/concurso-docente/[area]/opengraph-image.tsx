import { AREAS_DOCENTES, mayuscula } from '@/lib/concurso-docente'
import { OG_SIZE, imagenDocente } from '@/lib/og-docente'

export const alt = 'Concurso docente 2026: qué estudiar en tu área'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return AREAS_DOCENTES.map((a) => ({ area: a.slug }))
}

const formato = new Intl.NumberFormat('es-CO')

export default async function Image({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params
  const a = AREAS_DOCENTES.find((x) => x.slug === area) ?? AREAS_DOCENTES[0]
  return imagenDocente({
    titulo: mayuscula(a.nombre),
    dato: `${formato.format(a.vacantes)} vacantes`,
    detalle: 'Qué evalúa la prueba, temario y simulacro · simotest.com',
  })
}
