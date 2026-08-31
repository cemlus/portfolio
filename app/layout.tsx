import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import TopStrip from '@/components/TopStrip';
import Reveal from '@/components/Reveal';
import './globals.css';

/** Your real domain. Every OG and canonical URL is built from this. */
const SITE = 'https://portfolio-pied-nine-73.vercel.app/';

const DESCRIPTION =
  'The wrong hypothesis, the measurement that killed it, the fix that survived. ' +
  'Backend engineering notes by Siddhant Bhardwaj.';

export const metadata: Metadata = {
  metadataBase: new URL('https://portfolio-pied-nine-73.vercel.app'),

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
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Working notes — Siddhant Bhardwaj',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Three systems, and how I got them wrong first.',
    description: DESCRIPTION,
    images: ['/og.png'],
  },
};

/**
 * Runs before first paint, so a saved dark choice is in place before the browser
 * draws the light one. Inline and blocking on purpose — deferring it is the flash.
 *
 * Light is the default: prefers-color-scheme is deliberately not consulted, so a
 * visitor on a dark OS still lands on the light site. Only an explicit toggle,
 * saved in localStorage, switches it.
 */
const THEME_SCRIPT = `
try {
  document.documentElement.dataset.theme =
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
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
        <TopStrip />
        <div className="sheet">
          {children}
          <Footer />
        </div>
        <Reveal />
      </body>
    </html>
  );
}
