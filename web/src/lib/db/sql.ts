import 'server-only';
import postgres from 'postgres';

/**
 * The one PostgreSQL database (DATABASE_URL). Content, history, users, inquiries and
 * image files all live here. The pool is kept on globalThis so dev hot reloads reuse it.
 */
const g = globalThis as typeof globalThis & { __gherasSql?: postgres.Sql };

export function db(): postgres.Sql {
  if (!g.__gherasSql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set. Add it to .env.local and run `npm run db:migrate`.');
    g.__gherasSql = postgres(url, { max: 10, idle_timeout: 30, onnotice: () => {} });
  }
  return g.__gherasSql;
}

/** Store a value as jsonb. */
export const json = (v: unknown) => db().json(v as postgres.JSONValue);
