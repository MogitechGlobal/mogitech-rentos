import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://rentos.mogitechglobal.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://rentos.mogitechglobal.com/marketplace',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9, // High priority because it drives leads
    },
    {
      url: 'https://rentos.mogitechglobal.com/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}