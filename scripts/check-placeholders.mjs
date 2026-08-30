#!/usr/bin/env node
/**
 * Build guard. Reports anything on the site that is still a stand-in.
 *
 * Two sources of truth, deliberately:
 *   - `lib/placeholders.ts` — the hand-maintained list, for things no script
 *     can judge (are those really the hypotheses you tried?).
 *   - the checks below — for the ones a script *can* judge, so a forgotten
 *     `done: true` never lets a guessed URL ship.
 * Where both speak, the file on disk wins.
 *
 * Warns on a local build. Exits non-zero on a Vercel production build.
 * Escape hatch: SKIP_PLACEHOLDER_CHECK=1
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : '');
/** A file we cannot read is a file we cannot clear — treat it as unfixed. */
const scan = (p, pattern) => {
  const src = read(p);
  return src === '' ? true : pattern.test(src);
};

/** Pull the list out of the .ts file without needing a TypeScript loader. */
function registry() {
  const src = read('lib/placeholders.ts');
  const body = src.slice(src.indexOf('placeholders: Placeholder[] = ['));
  return [...body.matchAll(/\{[^{}]*?id:\s*'([^']+)'[^{}]*?\}/gs)].map((m) => ({
    id: m[1],
    what: (m[0].match(/what:\s*\n?\s*'([^']*)'/) ?? [, m[1]])[1],
    where: (m[0].match(/where:\s*\n?\s*'([^']*)'/) ?? [, ''])[1],
    done: /done:\s*true/.test(m[0]),
  }));
}

/**
 * id -> true when the placeholder is still present on disk. Only for the ones
 * that leave a detectable trace; everything else falls through to its flag.
 */
const detected = {
  // 'proof-links' and 'method-line' used to live here. Both have been reviewed by
  // hand, and neither heuristic can tell a checked URL from a guessed one any more
  // — left in, they would outvote the done flags and block the deploy forever.
  'site-url': () => scan('app/layout.tsx', /SITE\s*=\s*'https:\/\/example\.com'/),
};

const open = [];
for (const item of registry()) {
  const probe = detected[item.id];
  const still = probe ? probe() : !item.done;
  if (!still) continue;
  open.push({ ...item, contradicted: probe && item.done });
}

/**
 * Screenshots are the easiest way to turn a 40KB page into a 4MB one, and a
 * static export serves every byte as-is.
 */
const IMAGE = /\.(png|jpe?g|webp|gif|avif)$/i;

function heavyShots(limit = 400 * 1024, dir = join(root, 'public'), prefix = '') {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      const full = join(dir, e.name);
      if (e.isDirectory()) return heavyShots(limit, full, `${prefix}${e.name}/`);
      if (!IMAGE.test(e.name)) return [];
      const { size } = statSync(full);
      return size > limit ? [{ name: `${prefix}${e.name}`, size }] : [];
    })
    .sort((a, b) => b.size - a.size);
}

const heavy = heavyShots();
const strict = process.env.VERCEL_ENV === 'production';

if (process.env.SKIP_PLACEHOLDER_CHECK === '1') {
  console.log('placeholders — check skipped (SKIP_PLACEHOLDER_CHECK=1)');
  process.exit(0);
}

const kb = (n) => `${Math.round(n / 1024)}KB`;

if (open.length === 0 && heavy.length === 0) {
  console.log('placeholders — none outstanding.');
  process.exit(0);
}

if (heavy.length > 0) {
  console.log('\n  Oversized screenshots (over 400KB each):');
  for (const f of heavy) console.log(`    ${f.name} — ${kb(f.size)}`);
  console.log('    Crop and recompress; see the README.');
}

if (open.length === 0) {
  console.log('\nplaceholders — none outstanding.');
  process.exit(0);
}

const bar = '─'.repeat(64);
console.log(`\n${bar}`);
console.log(`  ${open.length} placeholder${open.length === 1 ? '' : 's'} still in place`);
console.log(bar);
for (const item of open) {
  console.log(`\n  ${item.what}`);
  console.log(`    → ${item.where}`);
  if (item.contradicted) {
    console.log(`    ! marked done:true in lib/placeholders.ts, but still on disk`);
  }
}
console.log(`\n${bar}`);

if (strict) {
  console.error('\nRefusing to build for production with placeholders outstanding.');
  console.error('Fix them, or set SKIP_PLACEHOLDER_CHECK=1 to override.\n');
  process.exit(1);
}
console.log('Building anyway — this is not a production deploy.\n');
