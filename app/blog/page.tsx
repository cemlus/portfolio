import Link from 'next/link';
import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import { getPosts, formatDate } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Longer notes on backend systems — scheduling, indexes, and networks that drop.',
};

export default function BlogIndex() {
  const posts = getPosts();

  return (
    <>
      <SiteHeader
        title="Writing"
        say={
          <>
            Where a margin note ran long — <em>the same problems, with room to show the work.</em>
          </>
        }
      />

      {posts.map((post, i) => (
        <article
          key={post.slug}
          className="postlist g2 reveal"
          data-delay={Math.min(i, 3) * 60}
        >
          <div className="gutter">
            <b>{post.tag}</b>
            {formatDate(post.date)}
          </div>
          <div className="main">
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.summary}</p>
          </div>
        </article>
      ))}

      {posts.length === 0 ? (
        <p className="nores">
          Nothing written up yet.
          <br />
          Drop a markdown file in <b>content/blog/</b> and it appears here.
        </p>
      ) : null}
    </>
  );
}
