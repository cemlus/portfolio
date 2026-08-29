'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { profile } from '@/lib/entries';
import ThemeToggle from './ThemeToggle';

const NAV = [
  { href: '/', label: 'Notes' },
  { href: '/blog', label: 'Writing' },
];

/** https://github.com/cemlus → github/cemlus */
function handle(url: string) {
  const { hostname, pathname } = new URL(url);
  return `${hostname.replace(/^www\./, '').split('.')[0]}${pathname}`;
}

type Props = {
  /** The page's only h1. */
  title: string;
  /** The line under it. Wrap a phrase in <em> for the accent colour. */
  say?: ReactNode;
  /** Optional mono line in the verdict green, as on the OG card. */
  meta?: ReactNode;
};

export default function SiteHeader({ title, say, meta }: Props) {
  const pathname = usePathname();
  const here = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  return (
    <>
      <header className="head g2">
        <div className="l">
          Working notes
          <br />
          {profile.name}
          <br />
          {profile.location}
          <br />
          {profile.cohort}
          <br />
          <br />
          <a href={profile.github} rel="noreferrer">
            {handle(profile.github)}
          </a>
        </div>
        <div>
          <h1>{title}</h1>
          {say ? <p className="say">{say}</p> : null}
          {meta ? <p className="verdict">{meta}</p> : null}
        </div>
      </header>

      <div className="topbar">
        <nav>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={here === item.href || (item.href !== '/' && here.startsWith(item.href))}
            >
              {item.label}
            </Link>
          ))}
          <a href={profile.resume}>Resume</a>
        </nav>
        <ThemeToggle />
      </div>
    </>
  );
}
