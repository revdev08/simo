import { pageMetadata } from '@/lib/seo'

// La página es de cliente: los metadatos van aquí para que tenga título y canónica propios
export const metadata = pageMetadata({
  title: 'Simulacro CNSC gratis',
  description:
    'Haz gratis un simulacro tipo CNSC de 10 preguntas de competencias generales y razonamiento, con la explicación de cada respuesta.',
  path: '/simulacro-gratis',
})

export default function SimulacroGratisLayout({ children }: { children: React.ReactNode }) {
  return children
}
