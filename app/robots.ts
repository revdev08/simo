import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// El panel, la administración, la API y las vistas de desarrollo no tienen contenido público
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/api/', '/dev-preview', '/unsubscribe'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
