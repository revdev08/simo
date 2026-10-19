import { MetadataRoute } from 'next'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'
import { AREAS_DOCENTES, REVISADO_DOCENTE } from '@/lib/concurso-docente'
import { SITE_URL as BASE } from '@/lib/seo'
import { actualizadoOpecs, opecsDe, slugsConOpecs } from '@/lib/opec'

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date()
  const docente = new Date(REVISADO_DOCENTE)
  return [
    { url: BASE, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/concurso-docente`, lastModified: docente, changeFrequency: 'weekly', priority: 0.9 },
    ...AREAS_DOCENTES.map((a) => ({
      url: `${BASE}/concurso-docente/${a.slug}`,
      lastModified: docente,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${BASE}/simulacro-gratis`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/mi-convocatoria`, lastModified: ahora, changeFrequency: 'weekly', priority: 0.9 },
    ...CONVOCATORIAS.map((c) => ({
      url: `${BASE}/mi-convocatoria/${c.slug}`,
      lastModified: new Date(c.revisado),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...slugsConOpecs().flatMap((slug) =>
      opecsDe(slug).map((o) => ({
        url: `${BASE}/mi-convocatoria/${slug}/opec/${o.opec}`,
        lastModified: new Date(actualizadoOpecs(slug) ?? ahora),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ),
    { url: `${BASE}/guia`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
