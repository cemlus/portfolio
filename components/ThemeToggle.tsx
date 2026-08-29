'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle() {
  // The inline script in app/layout.tsx has already stamped the real theme on
  // <html>; this only catches up with it after hydration.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // private mode, or storage disabled — the theme still applies for this page
    }
    setTheme(next);
  }

  return (
    <button type="button" className="toggle" onClick={toggle} aria-label="Switch colour theme">
      {/* the arrow makes it an action, not a statement of the current theme */}
      <span suppressHydrationWarning>{theme === 'dark' ? '\u2192 light' : '\u2192 dark'}</span>
    </button>
  );
}
