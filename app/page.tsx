// Portada: metadatos y datos estructurados en el servidor; la página interactiva está en ./home
import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import LandingPage, { type AvisoPortada } from './home'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
}

// Se vuelve a generar cada hora para que los avisos cambien solos con la fecha
export const revalidate = 3600

const AVISO_DIAN: AvisoPortada = {
  href: '/mi-convocatoria/dian-2676',
  texto: '¿Te presentas a la DIAN el 8 de noviembre? Plan y simulacro de tu perfil',
}
const AVISO_DOCENTE: AvisoPortada = {
  href: '/concurso-docente',
  texto: 'Concurso docente 2026: más de 28.000 vacantes. Qué estudiar según tu área',
}
// Después de la prueba de la DIAN (8 de noviembre de 2026, hora de Colombia) solo queda el aviso docente
const FIN_AVISO_DIAN = Date.parse('2026-11-09T05:00:00Z')

const ORGANIZACION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: 'revolutiondev08@gmail.com',
  description: 'Plataforma independiente de preparación para los concursos de mérito de la CNSC en Colombia.',
}
const SITIO = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'es-CO',
}

function avisosVigentes(): AvisoPortada[] {
  return Date.now() < FIN_AVISO_DIAN ? [AVISO_DIAN, AVISO_DOCENTE] : [AVISO_DOCENTE]
}

export default function Page() {
  const avisos = avisosVigentes()
  return (
    <>
      <JsonLd data={[ORGANIZACION, SITIO]} />
      <LandingPage avisos={avisos} />
    </>
  )
}
