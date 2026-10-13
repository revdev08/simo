import { OG_SIZE, imagenDocente } from '@/lib/og-docente'

export const alt = 'Concurso docente 2026: vacantes, prueba y cómo prepararte'
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return imagenDocente({
    titulo: 'Vacantes, prueba y qué estudiar según tu área',
    dato: 'Más de 28.000 vacantes',
    detalle: 'Temario por cargo, documentos del MEN y simulacro · simotest.com',
  })
}
