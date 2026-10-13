import type { MetadataRoute } from 'next';
import { indexable, officialUrl } from '@/lib/metadata';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      ...(indexable ? { allow: '/', disallow: '/estudo/' } : { disallow: '/' }),
    },
    sitemap: indexable ? `${officialUrl}/sitemap.xml` : undefined,
  };
}
