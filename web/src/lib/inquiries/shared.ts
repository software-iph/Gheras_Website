// Shared by the contact form (client) and the server action. Keep free of server-only imports.

// Same email rule as the prototype's client-side check.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: 'invalid' | 'rate' | 'server' };
