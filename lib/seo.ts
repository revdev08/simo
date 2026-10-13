// Metadatos de las páginas públicas: canónica propia y vista previa al compartir (WhatsApp, Facebook, X).
// Cada página debe declarar su canónica; el layout raíz no la fija para que no se herede la de la portada.
import type { Metadata } from 'next'

export const SITE_URL = 'https://www.simotest.com'
export const SITE_NAME = 'SIMO Test'
const OG_IMAGE = { url: '/og-image.jpg', width: 1200, height: 630, alt: 'SIMO Test - Simulacros CNSC' }

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  imagenPropia = false,
}: {
  title: string
  description: string
  path: string // con barra inicial, por ejemplo "/concurso-docente"
  absoluteTitle?: boolean // true si el título no debe llevar " | SIMO Test"
  imagenPropia?: boolean // true si la ruta tiene su propio opengraph-image (tiene prioridad sobre esta)
}): Metadata {
  const url = `${SITE_URL}${path === '/' ? '' : path}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: 'es_CO', type: 'website', ...(imagenPropia ? {} : { images: [OG_IMAGE] }) },
    twitter: { card: 'summary_large_image', title, description, ...(imagenPropia ? {} : { images: [OG_IMAGE.url] }) },
  }
}

// Ruta de migas para los datos estructurados (BreadcrumbList)
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === '/' ? '' : it.path}`,
    })),
  }
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}
