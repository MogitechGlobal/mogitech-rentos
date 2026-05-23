// apps/web/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rentos.mogitechglobal.com';
  const targetDate = new Date('2026-04-19');

  return [
    {
      url: `${baseUrl}/`,
      lastModified: targetDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: targetDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: targetDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
