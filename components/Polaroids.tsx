'use client';

import { useRef, useState } from 'react';
import type { Shot } from '@/lib/entries';

/**
 * Screenshots, taped to the page.
 *
 * The frame crops with object-fit: cover so that screenshots of any dimension
 * keep the 31px ruled rhythm; the dialog is where the uncropped image lives.
 *
 * The lightbox is a native <dialog> opened with showModal(), which gives us the
 * focus trap, Escape-to-close, focus return to the invoking button and
 * top-layer stacking for free. Rotation comes from CSS :nth-child rather than
 * Math.random(), which would differ between the server and client renders and
 * break hydration.
 */
export default function Polaroids({ shots }: { shots: Shot[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Shot | null>(null);

  function show(shot: Shot) {
    setOpen(shot);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <div className="tape">
        {shots.map((shot) => (
          <button
            key={shot.src}
            type="button"
            className="pol"
            onClick={() => show(shot)}
            /* The button's label replaces the img alt in the accessible name, so
               the description has to live here or a screen reader never hears it. */
            aria-label={`${shot.alt} Select to enlarge.`}
          >
            <span className="pic">
              <img
                src={shot.src}
                alt={shot.alt}
                width={shot.w}
                height={shot.h}
                loading="lazy"
                decoding="async"
                style={shot.focus ? { objectPosition: shot.focus } : undefined}
              />
            </span>
            <span className="cap">{shot.caption}</span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="lb"
        onClose={() => setOpen(null)}
        onClick={(event) => {
          // Clicking the backdrop lands on the dialog itself, never on its children.
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        {open ? (
          <figure>
            <img src={open.src} alt={open.alt} width={open.w} height={open.h} />
            <figcaption>
              {open.caption}
              <button type="button" onClick={() => dialogRef.current?.close()}>
                close ✕
              </button>
            </figcaption>
          </figure>
        ) : null}
      </dialog>
    </>
  );
}
