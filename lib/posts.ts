import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const DIR = path.join(process.cwd(), 'content', 'blog');

export type Post = {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  tag: string;
  summary: string;
};

export type FullPost = Post & { html: string };

function parse(file: string): Post & { body: string } {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
  const { data, content } = matter(raw);
  const slug = file.replace(/\.md$/, '');

  for (const field of ['title', 'date', 'summary'] as const) {
    if (!data[field]) {
      throw new Error(`content/blog/${file} is missing "${field}" in its frontmatter`);
    }
  }

  return {
    slug,
    title: String(data.title),
    // gray-matter parses bare YAML dates into Date objects; normalise both forms
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date),
    tag: String(data.tag ?? 'Notes'),
    summary: String(data.summary),
    body: content,
  };
}

/** Newest first, as the README specifies. */
export function getPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { body: _body, ...post } = parse(f);
      return post;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<FullPost | null> {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(DIR, file))) return null;
  const { body, ...post } = parse(file);
  return { ...post, html: await marked.parse(body) };
}

/** 2026-06-14 → 14 Jun 2026 */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
