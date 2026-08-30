import type { Figure } from '@/lib/entries';

/** Renders nothing until an entry actually has screenshots. */
export default function Figures({ figures }: { figures?: Figure[] }) {
  if (!figures || figures.length === 0) return null;

  return (
    <div className="figs">
      {figures.map((fig) => (
        <figure key={fig.src}>
          <img src={fig.src} alt={fig.alt} loading="lazy" decoding="async" />
          <figcaption>{fig.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
