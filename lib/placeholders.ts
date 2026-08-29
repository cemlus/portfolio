/**
 * Everything on this site that is currently a stand-in rather than the truth.
 *
 * The README lists these as prose; this list is the same information in a form
 * the build can read. Flip `done` to true as you fix each one. While anything
 * here is false the dev server shows a notice, `npm run build` warns, and a
 * production build on Vercel refuses to run at all.
 *
 * @see scripts/check-placeholders.mjs
 * @see components/DevNotice.tsx
 */
export type Placeholder = {
  id: string;
  /** what is wrong, in one line */
  what: string;
  /** the file to edit */
  where: string;
  done: boolean;
};

export const placeholders: Placeholder[] = [
  {
    id: 'attempts',
    what: 'Struck-through hypotheses are plausible reconstructions, not your real dead ends.',
    where: 'lib/entries.ts — the `attempts` array on each entry',
    done: false,
  },
  {
    id: 'proof-links',
    what: 'Proof links point at guessed repo paths (/tree/main/infra, /tree/main/loadtest).',
    where: 'lib/entries.ts — the `links` arrays',
    done: false,
  },
  {
    id: 'site-url',
    what: 'SITE is a placeholder domain, so every OG and canonical URL resolves wrong.',
    where: 'app/layout.tsx — the SITE constant',
    done: false,
  },
  {
    id: 'og-image',
    what: 'og.png was generated with substitute fonts, not Newsreader and IBM Plex Mono.',
    where: 'public/og.png — regenerate, or screenshot the masthead',
    done: false,
  },
  {
    id: 'method-line',
    what: 'The chart method line claims t3.micro and Atlas M0. Correct it to what you ran on.',
    where: 'components/LatencyPlot.tsx — the .method paragraph',
    done: false,
  },
  {
    id: 'screenshots',
    what: 'The polaroids are placeholder SVGs, not real screenshots of anything.',
    where: 'public/shots/ — replace, then repoint `shots` in lib/entries.ts',
    done: false,
  },
  {
    id: 'blog-gridnode',
    what: 'The GridNode post was reconstructed from the entry data. Verify it against what actually happened.',
    where: 'content/blog/the-fastest-node-was-the-flakiest.md',
    done: false,
  },
];

export const outstanding = () => placeholders.filter((p) => !p.done);
