/**
 * Everything on this site that is currently a stand-in rather than the truth.
 *
 * The README lists these as prose; this list is the same information in a form
 * the build can read. Flip `done` to true as you fix each one. While anything
 * here is false `npm run build` warns, and a production build on Vercel refuses
 * to run at all.
 *
 * @see scripts/check-placeholders.mjs
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
    done: true,
  },
  {
    id: 'proof-links',
    what: 'Proof links point at guessed repo paths (/tree/main/infra, /tree/main/loadtest).',
    where: 'lib/entries.ts — the `links` arrays',
    done: true,
  },
  {
    id: 'site-url',
    what: 'SITE is a placeholder domain, so every OG and canonical URL resolves wrong.',
    where: 'app/layout.tsx — the SITE constant',
    done: true,
  },
  {
    id: 'method-line',
    what: 'The chart method line claims t3.micro and Atlas M0. Correct it to what you ran on.',
    where: 'components/LatencyPlot.tsx — the .method paragraph',
    done: true,
  },
  {
    id: 'blog-gridnode',
    what: 'The GridNode post was reconstructed from the entry data. Verify it against what actually happened.',
    where: 'content/blog/the-fastest-node-was-the-flakiest.md',
    done: true,
  },
];

export const outstanding = () => placeholders.filter((p) => !p.done);
