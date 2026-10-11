import type { Metadata } from 'next'

// La página es de cliente: los metadatos van aquí para que tenga título y canónica propios
export const metadata: Metadata = {
  title: 'Simulacro CNSC gratis',
  description:
    'Haz gratis un simulacro tipo CNSC de 10 preguntas de competencias generales y razonamiento, con la explicación de cada respuesta.',
  alternates: { canonical: 'https://www.simotest.com/simulacro-gratis' },
}

export default function SimulacroGratisLayout({ children }: { children: React.ReactNode }) {
  return children
}
