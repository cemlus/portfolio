import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import DevNotice from '@/components/DevNotice';
import './globals.css';

/** Your real domain. Every OG and canonical URL is built from this. */
const SITE = 'https://example.com';

const DESCRIPTION =
  'The wrong hypothesis, the measurement that killed it, the fix that survived. ' +
  'Backend engineering notes by Siddhant Bhardwaj.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Siddhant Bhardwaj — Working notes',
    template: '%s — Working notes',
  },
  description: DESCRIPTION,
  authors: [{ name: 'Siddhant Bhardwaj' }],
  openGraph: {
    type: 'website',
    siteName: 'Working notes',
    title: 'Three systems, and how I got them wrong first.',
    description: DESCRIPTION,
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Working notes — Siddhant Bhardwaj' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Three systems, and how I got them wrong first.',
    description: DESCRIPTION,
    images: ['/og.png'],
  },
};

/**
 * Runs before first paint, so the dark palette is in place before the browser
 * draws the light one. Inline and blocking on purpose — deferring it is the
 * flash.
 */
const THEME_SCRIPT = `
try {
  var saved = localStorage.getItem('theme');
  var dark = saved ? saved === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
} catch (e) {}
`.trim();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Reveal.tsx adds the `in` class that lifts .reveal off opacity 0.
            Without JS nothing ever adds it, and the page reads as blank. */}
        <noscript>
          <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body>
        <div className="sheet">
          {children}
          <Footer />
        </div>
        <Reveal />
        <DevNotice />
      </body>
    </html>
  );
}
