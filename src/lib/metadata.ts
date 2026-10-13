import type { Metadata } from 'next';
import { site } from '@/content/site';

const configuredUrl = process.env.SITE_URL;
export const officialUrl =
  configuredUrl && /^https?:\/\//.test(configuredUrl)
    ? configuredUrl.replace(/\/$/, '')
    : undefined;
export const indexable =
  Boolean(officialUrl) &&
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production') &&
  process.env.NODE_ENV === 'production';

export function pageMetadata(title: string, path: string, internal = false): Metadata {
  const url = officialUrl ? new URL(path, officialUrl).href : undefined;
  return {
    title,
    description: site.description,
    alternates: { canonical: url },
    robots:
      indexable && !internal ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description: site.description,
      url,
      type: 'website',
      siteName: site.name,
      locale: 'pt_BR',
      images: [
        {
          url: officialUrl ? `${officialUrl}/art/social.jpg` : '/art/social.jpg',
          width: 1200,
          height: 630,
          alt: 'Mansa. Clareza para construir no seu tempo.',
        },
      ],
    },
    twitter: { card: 'summary_large_image', title, description: site.description },
  };
}
