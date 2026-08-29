import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { getPost, getPosts, formatDate } from '@/lib/posts';

type Props = { params: Promise<{ slug: string }> };

// output: 'export' cannot render a slug that was not enumerated at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Not found' };

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.summary },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      {/* The post title is the page's h1, which is why .prose starts at h2. */}
      <SiteHeader title={post.title} say={post.summary} />

      <article className="entry g2 reveal">
        <div className="gutter">
          <b>{post.tag}</b>
          {formatDate(post.date)}
          <span className="an">
            <Link href="/blog">↳ back to writing</Link>
          </span>
        </div>
        <div className="main prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
    </>
  );
}
