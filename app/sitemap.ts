import { MetadataRoute } from 'next'
import { CONVOCATORIAS } from '@/lib/convocatorias/catalogo'

const BASE = 'https://www.simotest.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date()
  return [
    { url: BASE, lastModified: ahora, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/simulacro-gratis`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/mi-convocatoria`, lastModified: ahora, changeFrequency: 'weekly', priority: 0.9 },
    ...CONVOCATORIAS.map((c) => ({
      url: `${BASE}/mi-convocatoria/${c.slug}`,
      lastModified: new Date(c.revisado),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    { url: `${BASE}/guia`, lastModified: ahora, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
