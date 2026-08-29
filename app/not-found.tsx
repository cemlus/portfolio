import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

export default function NotFound() {
  return (
    <>
      <SiteHeader
        title="Nothing filed here."
        say={
          <>
            That page isn&rsquo;t in the notebook — <em>a wrong turn, or a link that rotted.</em>
          </>
        }
      />
      <section className="entry g2">
        <div className="gutter">
          <b>404</b>
          Not found
        </div>
        <div className="main">
          <p className="proof">
            <span>Try</span>
            <Link href="/">The notes ↗</Link>
            <Link href="/blog">Writing ↗</Link>
          </p>
        </div>
      </section>
    </>
  );
}
