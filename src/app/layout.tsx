import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/motion/SmoothScroll';
import EntryIntro from '@/components/motion/EntryIntro';
import { entryScript } from '@/components/motion/entry-script';
import { site } from '@/content/site';
import { officialUrl, pageMetadata } from '@/lib/metadata';
import '@/styles/global.css';
import '@/styles/motion.css';

export const metadata = {
  ...pageMetadata('Mansa S.A. — Clareza para construir no seu tempo', '/'),
  metadataBase: officialUrl ? new URL(officialUrl) : new URL('http://localhost:3000'),
  icons: { icon: '/mansa-logo.png' },
};
export const viewport: Viewport = { themeColor: '#082b24' };
const themeScript = `(()=>{let p='auto';try{p=localStorage.getItem('mansa-theme')||'auto'}catch{}if(!['auto','light','dark'].includes(p))p='auto';const h=new Date().getHours();const r=document.documentElement;r.dataset.theme=p==='auto'?(h>=18||h<6?'dark':'light'):p;r.dataset.themePreference=p})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/instrument-sans-latin-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: entryScript }} />
        {officialUrl && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: site.name,
                url: officialUrl,
                logo: `${officialUrl}/mansa-logo.png`,
                email: site.email,
                sameAs: [site.github],
                founder: [
                  { '@type': 'Person', name: 'David Rangel' },
                  { '@type': 'Person', name: 'Heitor Rosa' },
                ],
              }).replace(/</g, '\\u003c'),
            }}
          />
        )}
      </head>
      <body id="top">
        <EntryIntro />
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <Header />
        {children}
        <Footer />
        <SmoothScroll />
      </body>
    </html>
  );
}
