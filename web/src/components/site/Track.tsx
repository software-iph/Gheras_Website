'use client';

import { useEffect } from 'react';

let last = '';

/**
 * Cookie-free visit counter: reports one page view per page load (path, referrer, screen width).
 * No cookies or local storage; the server keeps only a daily-rotating anonymous hash.
 */
export function Track() {
  useEffect(() => {
    const key = `${location.pathname}|${performance.timeOrigin}`;
    if (last === key) return; // React may run effects twice in development
    last = key;
    const body = JSON.stringify({ p: location.pathname, r: document.referrer, w: innerWidth });
    try {
      if (!navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'text/plain' }))) {
        fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => undefined);
      }
    } catch { /* counting must never break the page */ }
  }, []);
  return null;
}
