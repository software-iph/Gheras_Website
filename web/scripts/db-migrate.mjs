// Apply db/migrations/*.sql in order, once each (tracked in schema_migrations).
// Usage: npm run db:migrate   (reads DATABASE_URL from the environment or .env.local)
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is not set (add it to .env.local).'); process.exit(1); }

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations');
const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const done = new Set((await sql`select name from schema_migrations`).map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  let applied = 0;
  for (const f of files) {
    if (done.has(f)) continue;
    const body = await readFile(path.join(dir, f), 'utf8');
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into schema_migrations (name) values (${f})`;
    });
    console.log(`applied ${f}`);
    applied++;
  }
  console.log(applied ? `${applied} migration(s) applied.` : 'Database is up to date.');
} catch (e) {
  console.error(`Migration failed: ${e.message}`);
  process.exitCode = 1;
} finally {
  await sql.end();
}
