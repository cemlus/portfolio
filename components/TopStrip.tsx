'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { profile } from '@/lib/entries';
import ThemeToggle from './ThemeToggle';

const NAV = [
  { href: '/', label: 'Notes' },
  { href: '/blog', label: 'Writing' },
];

export default function TopStrip() {
  const pathname = usePathname();
  const here = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  return (
    <div className="strip">
      <div className="stripin">
        <span className="who">{profile.name}</span>
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
          <a href={profile.resume}>Résumé</a>
          <ThemeToggle />
        </nav>
      </div>
    </div>
  );
}
