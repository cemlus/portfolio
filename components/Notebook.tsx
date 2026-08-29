'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { entries, record, toolset, type Entry } from '@/lib/entries';
import LatencyPlot from './LatencyPlot';
import Polaroids from './Polaroids';

const CHIPS = [
  { label: 'latency', q: 'latency' },
  { label: 'concurrency', q: 'concurrency' },
  { label: 'infrastructure', q: 'terraform' },
  { label: 'security', q: 'gvisor' },
  { label: 'databases', q: 'postgres' },
  { label: 'all', q: '' },
];

/** Renders ~~struck~~ segments without pulling in a markdown parser. */
function Struck({ text }: { text: string }) {
  const parts = text.split(/(~~[^~]+~~)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('~~') && part.endsWith('~~') ? (
          <s key={i}>{part.slice(2, -2)}</s>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

function haystack(entry: Entry) {
  return [
    entry.name,
    entry.title,
    entry.verdict,
    entry.keywords,
    entry.stack ?? '',
    ...(entry.body ?? []),
    ...(entry.attempts ?? []).flatMap((a) => [a.claim, a.note]),
    ...(entry.metrics ?? []).flatMap((m) => [m.k, m.v, m.s ?? '']),
    ...(entry.shots ?? []).flatMap((s) => [s.caption, s.alt]),
  ]
    .join(' ')
    .toLowerCase();
}

export default function Notebook() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(
    () => entries.map((e) => ({ entry: e, text: haystack(e) })),
    []
  );

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => index.filter(({ text }) => !q || text.includes(q)).map(({ entry }) => entry),
    [index, q]
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const el = inputRef.current;
      if (!el) return;
      if (event.key === '/' && document.activeElement !== el) {
        event.preventDefault();
        el.focus();
      }
      if (event.key === 'Escape' && document.activeElement === el) {
        setQuery('');
        el.blur();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="find g2 reveal">
        <div className="l">
          Index
          <span>
            {q
              ? `${matches.length} of ${entries.length} matching`
              : `${entries.length} entries`}
          </span>
        </div>
        <div>
          <div className="ln">
            <span className="car" aria-hidden="true">
              ⌕
            </span>
            <input
              ref={inputRef}
              type="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="latency, concurrency, gvisor, idempotency…"
              aria-label="Search these notes"
            />
            <span className="k" aria-hidden="true">
              press /
            </span>
          </div>
          <div className="chips">
            {CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                data-on={q === chip.q && (chip.q !== '' || q === '')}
                onClick={() => {
                  setQuery(chip.q);
                  inputRef.current?.focus();
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {matches.map((entry, i) => (
        <article
          key={entry.id}
          id={entry.id}
          className="entry g2 reveal"
          data-delay={Math.min(i, 3) * 60}
        >
          <div className="gutter">
            <b>{entry.label}</b>
            {entry.name}
            {entry.meta.map((line) => (
              <Fragment key={line}>
                <br />
                {line}
              </Fragment>
            ))}
            {entry.annotation ? (
              <span className="an">↳ {entry.annotation}</span>
            ) : null}
          </div>

          <div className="main" style={entry.id === 'record' ? { maxWidth: '40rem' } : undefined}>
            {entry.id === 'record' ? (
              <>
                <h2>Record</h2>
                <table className="log">
                  <tbody>
                    {record.map((row) => (
                      <tr key={row.what}>
                        <td className="d">{row.when}</td>
                        <td>
                          <b>{row.what}</b>
                          <span>{row.note}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="stack">{toolset}</p>
              </>
            ) : (
              <>
                <h2>{entry.title}</h2>
                <p className="verdict">
                  <Struck text={entry.verdict} />
                </p>

                {entry.attempts ? (
                  <ul className="tries">
                    {entry.attempts.map((a) => (
                      <li key={a.claim}>
                        <span className={a.held ? 'm ok' : 'm'} aria-hidden="true">
                          {a.held ? '✓' : '✗'}
                        </span>
                        <span>
                          {a.held ? <b>{a.claim}</b> : <s>{a.claim}</s>}{' '}
                          <i>— {a.note}</i>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {entry.shots ? <Polaroids shots={entry.shots} /> : null}

                {entry.plot ? <LatencyPlot /> : null}

                {entry.metrics ? (
                  <div className="meas">
                    {entry.metrics.map((m) => (
                      <div key={m.k}>
                        <p className="k">{m.k}</p>
                        <p className="v">{m.v}</p>
                        {m.s ? <p className="s">{m.s}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {entry.body?.map((para) => (
                  <p key={para.slice(0, 32)}>{para}</p>
                ))}

                {entry.links ? (
                  <p className="proof">
                    <span>Check it</span>
                    {entry.links.map((l) => (
                      <a key={l.label} href={l.href} rel="noreferrer">
                        {l.label} ↗
                      </a>
                    ))}
                  </p>
                ) : null}

                {entry.stack ? <p className="stack">{entry.stack}</p> : null}
              </>
            )}
          </div>
        </article>
      ))}

      {matches.length === 0 ? (
        <p className="nores">
          Nothing filed under <b>{query.trim()}</b>.
          <br />
          Try <b>latency</b>, <b>gvisor</b>, <b>idempotency</b> or <b>terraform</b>.
        </p>
      ) : null}
    </>
  );
}
