# Working notes — portfolio

Next.js 16 (App Router), statically exported. No CSS framework, no CMS.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out
npm run preview  # serve ./out to check the export
npm run typecheck
npm run check    # list what on the site is still a placeholder
```

There is no `start` script: `output: 'export'` produces plain files, so there is
no Node server for `next start` to run. Use `npm run preview`. There is no `lint`
script either — `next lint` was removed in Next 16 and this project has no
ESLint config; add Biome or the ESLint CLI directly if you want one.

## Layout

```
app/            layout.tsx (SITE, metadata, fonts, theme script), page.tsx, blog/
components/     Notebook, LatencyPlot, SiteHeader, ThemeToggle, Reveal, Footer
lib/            entries.ts (notebook data), posts.ts (blog), placeholders.ts
content/blog/   one markdown file per post
scripts/        check-placeholders.mjs — the build guard
```

## Why it's built this way

**Plain CSS, not Tailwind.** The design is a ruled-paper grid with a fixed
31px vertical rhythm and a two-column margin/main layout. Expressing that in
utility classes would have been noisier than a stylesheet, and every colour is
a CSS variable so the dark theme is a single override block.

**Entries are data, not MDX.** A notebook entry is highly structured — verdict
line, ruled-out hypotheses, metrics, proof links — so it lives as typed data in
`lib/entries.ts`. Blog posts are prose, so they're markdown. Using MDX for both
would have meant either losing the structure or writing a lot of custom
components.

**Fonts load via `<link>` rather than `next/font`.** Simpler, and it builds in
environments without network access to Google Fonts. If you'd rather
self-host, swap in `next/font/google` in `app/layout.tsx` and drop the
`<link>` tags.

## Adding a notebook entry

Add an object to the `entries` array in `lib/entries.ts`. Order in the array is
order on the page. Fields:

| Field | Notes |
| --- | --- |
| `label` | Gutter heading — `Entry 05` etc. |
| `annotation` | The blue margin note. Optional, but it's the best part. |
| `title` | The problem, as a headline. |
| `verdict` | The one-line answer. `~~13.08s~~` renders struck through. |
| `attempts` | Hypotheses. `held: false` renders struck through with a ✗. |
| `plot` | Set true to render the latency chart (currently HostelBite only). |
| `shots` | Screenshots, rendered as polaroids taped to the page. See below. |
| `metrics` | The measurement strip. |
| `links` | Proof links — repo, live site, the k6 script itself. |
| `keywords` | Extra search terms not visible in the copy. |

Entries are searchable immediately; the index reads their full text — including
the `caption` and `alt` of every shot.

## Adding a screenshot

Drop the file in `public/shots/` and add an entry to that entry's `shots` array:

```ts
shots: [
  {
    src: '/shots/hostelbite-explain.png',
    alt: 'MongoDB explain() output showing an IXSCAN stage where a COLLSCAN used to be.',
    caption: 'explain() — IXSCAN, at last',
    w: 1440,
    h: 1080,
  },
],
```

`w` and `h` are the file's real pixel dimensions; the browser uses them to
reserve space so the page never reflows as images load. The frame is a fixed
216×162 and crops with `object-fit: cover` — clicking opens the whole image, so
a crop only affects the thumbnail. Set `focus` (an `object-position`, e.g.
`'left top'`) when centring cuts the part that matters.

**Capturing one.** Crop to the content, not the whole desktop — a full 4K screen
scaled into a 216px frame is unreadable. Capture at roughly 2× the display size
(around 1440×1080) so it stays sharp on a retina screen. PNG for anything
text-heavy, so terminals and query plans stay crisp; WebP or JPEG for
photographs. Keep each file under ~200KB; the build warns above 400KB, because a
static export serves every byte uncompressed.

**Redact before you capture.** A Grafana panel or a terminal will happily include
hostnames, internal IPs, connection strings, bearer tokens and real user data.
Once it is in `public/` it is on the internet, and it stays in git history even
if you delete it afterwards.

## Adding a post

Drop a markdown file in `content/blog/`:

```markdown
---
title: Field order is the whole trick
date: 2026-06-14
tag: Databases
summary: One sentence shown on the index page.
---

Body goes here.
```

The route, the listing and the metadata are generated from the file. Sorting is
by `date`, newest first. The filename is the slug. `title` becomes the page's
`h1` in the masthead — which is why `.prose` styles start at `h2`.

There is one post in there already, on GridNode's scheduler. It was
reconstructed from the entry data rather than from your notes, so it is on the
placeholder list until you've read it over.

## Things to change before this goes live

These are tracked in `lib/placeholders.ts`, not just here. While any of them is
outstanding the dev server shows a corner notice, `npm run build` prints the
list, and a Vercel **production** build refuses to run at all. Flip `done: true`
as you fix each one — though for the four the script can verify on disk (proof
links, `SITE`, the method line, `resume.pdf`) the file on disk wins over the
flag, so a forgotten checkbox can't ship a guessed URL. Override with
`SKIP_PLACEHOLDER_CHECK=1` if you need to.

1. **The struck-through hypotheses are placeholders.** They're plausible
   reconstructions, not your actual dead ends. Replace them with what really
   happened — the section only has value because it's true, and it's the part
   an interviewer is most likely to ask you to walk through.
2. **Proof links** in `lib/entries.ts` point at guessed paths
   (`/tree/main/loadtest`, `/tree/main/infra`). Point them at the real files.
3. **`/resume.pdf`** — drop your PDF in `public/`. Keep it in sync with
   whichever resume variant you're actually sending out.
4. **`SITE`** in `app/layout.tsx` — set to your real domain so OG tags resolve.
5. **`public/og.png`** was generated with substitute fonts. Regenerate it in
   Newsreader and IBM Plex Mono when you get a chance, or rebuild it as a
   screenshot of the masthead.
6. **Method line** under the chart states t3.micro / Atlas M0. Correct it to
   whatever you actually ran on.

## Deploying

**Vercel** (what this is set up for) — import the repo, accept the defaults.
`output: 'export'` is respected and everything is static. Note that the
placeholder guard fails the build when `VERCEL_ENV=production`, so the first
production deploy will not go through until the list above is dealt with. That
is deliberate.

**GitHub Pages** — no workflow is committed. You'd add one that runs
`npm ci && npm run build` and publishes `out/`, plus an empty `public/.nojekyll`.
If you deploy to `username.github.io/repo-name` rather than a custom domain,
uncomment `basePath` and `assetPrefix` in `next.config.mjs`, otherwise the CSS
and JS 404.

## Accessibility and motion

Scroll reveals, the chart morph and the theme transition all no-op under
`prefers-reduced-motion: reduce`. The search is reachable with `/`, clearable
with `Escape`, and every interactive element has a visible focus ring. The
chart carries an `aria-label` that changes with the toggle state, and the
caption is a live region, so the before/after comparison is available without
seeing the curve.
