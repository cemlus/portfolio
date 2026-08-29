import { profile, toolset } from '@/lib/entries';

const ELSEWHERE = [
  { label: 'Email', href: `mailto:${profile.email}` },
  { label: 'GitHub', href: profile.github },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'LeetCode', href: profile.leetcode },
  { label: 'Resume', href: profile.resume },
];

export default function Footer() {
  return (
    <footer className="close g2 reveal">
      <div className="gutter">
        <b>End</b>
        {profile.role}
        <br />
        {profile.location}
        <span className="an">↳ Happy to walk through any of it in detail.</span>
      </div>
      <div className="main">
        <p className="proof">
          <span>Reach me</span>
          {ELSEWHERE.map((link) => (
            <a key={link.label} href={link.href} rel="noreferrer">
              {link.label} ↗
            </a>
          ))}
        </p>
        <p className="stack">{toolset}</p>
      </div>
    </footer>
  );
}
