import type { MetadataRoute } from 'next';
import { indexable, officialUrl } from '@/lib/metadata';
export default function sitemap(): MetadataRoute.Sitemap {
  return indexable
    ? ['/', '/contato/', '/privacidade/'].map((path) => ({ url: `${officialUrl}${path}` }))
    : [];
}
