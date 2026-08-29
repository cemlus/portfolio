import { outstanding } from '@/lib/placeholders';

/**
 * Development-only reminder of what on this page is still a stand-in.
 * Never reaches the static export — NODE_ENV is 'production' there, so this
 * returns null and Next drops it.
 */
export default function DevNotice() {
  if (process.env.NODE_ENV !== 'development') return null;

  const open = outstanding();
  if (open.length === 0) return null;

  return (
    <details
      style={{
        position: 'fixed',
        left: '1rem',
        bottom: '1rem',
        zIndex: 50,
        maxWidth: '26rem',
        background: 'var(--paper)',
        border: '1px solid var(--margin)',
        borderLeftWidth: '2px',
        padding: '0.5rem 0.8rem',
        fontFamily: 'var(--font-mono), ui-monospace, monospace',
        fontSize: '11px',
        lineHeight: 1.8,
        color: 'var(--pencil)',
        boxShadow: '0 2px 14px rgba(0,0,0,0.09)',
      }}
    >
      <summary style={{ color: 'var(--margin)', cursor: 'pointer', letterSpacing: '0.08em' }}>
        {open.length} placeholder{open.length === 1 ? '' : 's'} — dev only
      </summary>
      <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1rem' }}>
        {open.map((item) => (
          <li key={item.id} style={{ marginBottom: '0.4rem' }}>
            {item.what}
            <br />
            <span style={{ color: 'var(--pen)' }}>{item.where}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
