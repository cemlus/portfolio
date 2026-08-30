import Link from 'next/link';
import { profile } from '@/lib/entries';

const REACH = [
  { label: 'Email', href: `mailto:${profile.email}` },
  { label: 'GitHub', href: profile.github },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'LeetCode', href: profile.leetcode },
  { label: 'Résumé', href: profile.resume },
];

export default function Footer() {
  return (
    <footer className="close reveal">
      <h2>Happy to walk through any of it, including the parts that didn&rsquo;t work.</h2>

      <p className="closesay">
        I&rsquo;m looking for a 2026 SWE internship in backend or infrastructure. The
        longer write-ups live in <Link href="/blog">the writing</Link>.
      </p>

      <p className="reach">
        {REACH.map((link) => (
          <a key={link.label} href={link.href} rel="noreferrer">
            {link.label}
          </a>
        ))}
      </p>

      <p className="sign">
        <span>{profile.role}</span>
        <span>{profile.location}</span>
        <span>Last entry — June 2026</span>
      </p>
    </footer>
  );
}
