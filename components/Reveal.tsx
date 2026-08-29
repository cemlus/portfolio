'use client';

import { useEffect } from 'react';

/**
 * Adds the `in` class that globals.css waits for on `.reveal`.
 *
 * The MutationObserver is not optional: Notebook mounts and unmounts entries as
 * the search filters, so an entry that scrolls into view was often not in the
 * document when the page loaded. Without it, filtered-in entries sit at
 * opacity 0 forever.
 */
export default function Reveal() {
  useEffect(() => {
    const watched = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (batch) => {
        for (const record of batch) {
          if (!record.isIntersecting) continue;
          const el = record.target as HTMLElement;
          if (el.dataset.delay) el.style.transitionDelay = `${el.dataset.delay}ms`;
          el.classList.add('in');
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    );

    const scan = () => {
      for (const el of document.querySelectorAll('.reveal:not(.in)')) {
        if (watched.has(el)) continue;
        watched.add(el);
        io.observe(el);
      }
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
