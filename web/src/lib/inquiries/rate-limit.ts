import 'server-only';

// Sliding-window limit per client key, held in memory. Good enough for a single
// server; move to a shared store (e.g. the database) when running several instances.
const WINDOW_MS = 10 * 60 * 1000;
const MAX = 5;
const hits = new Map<string, number[]>();

export function allow(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return true;
}

/** For sign-in: check without counting, and count only failed attempts. */
export function blocked(key: string, now = Date.now()): boolean {
  return (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS).length >= MAX;
}
export function fail(key: string, now = Date.now()) {
  hits.set(key, [...(hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS), now]);
}
