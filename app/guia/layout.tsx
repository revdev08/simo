import { pageMetadata } from '@/lib/seo'

// La página es de cliente: los metadatos van aquí para que tenga título y canónica propios
export const metadata = pageMetadata({
  title: 'Guía para preparar tu concurso CNSC paso a paso',
  description:
    'Cómo prepararte para un concurso de la CNSC: qué hacer antes de la convocatoria, cómo inscribirte en SIMO, cómo estudiar para las pruebas escritas y qué esperar después.',
  path: '/guia',
})

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
  return children
}
