import { headline, profile } from '@/lib/entries';

const LINKS = [
  { label: 'GitHub', href: profile.github },
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'LeetCode', href: profile.leetcode },
  { label: 'Résumé', href: profile.resume },
  { label: 'Email', href: `mailto:${profile.email}` },
];

export default function Cover() {
  return (
    <header className="cover reveal">
      <p className="eyebrow">
        {profile.role} · {profile.location} · {profile.cohort}
      </p>

      <h1>{profile.name}</h1>

      <p className="lead">
        Three systems, and how I got them wrong first —{' '}
        <em>the wrong hypothesis, the measurement that killed it, the fix that survived.</em>
      </p>

      <div className="band">
        <p className="bandtag">Measured, not estimated</p>
        <div className="bandgrid">
          {headline.map((m) => (
            <div key={m.k}>
              <p className="bv">{m.v}</p>
              <p className="bk">{m.k}</p>
              <p className="bs">{m.s}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="coverlinks">
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} rel="noreferrer">
            {l.label}
          </a>
        ))}
      </p>
    </header>
  );
}
