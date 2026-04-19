import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/super-admin/', '/portal/'], // Keep private routes hidden from Google
    },
    sitemap: 'https://rentos.mogitechglobal.com/sitemap.xml',
  }
}