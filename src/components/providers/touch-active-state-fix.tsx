'use client';

import { useEffect } from 'react';

// iOS Safari only keeps an element in the CSS :active state for a tap
// when *something* on the page is listening for touch events — without
// this, :active styles (globals.css's pressed-state feedback) never
// visibly apply there, since iOS treats a plain tap as going straight to
// click. A single no-op document-level listener is the standard fix.
export function TouchActiveStateFix() {
  useEffect(() => {
    const noop = () => {};
    document.addEventListener('touchstart', noop, { passive: true });
    return () => document.removeEventListener('touchstart', noop);
  }, []);

  return null;
}
