import 'server-only';
import { randomUUID } from 'node:crypto';
import type postgres from 'postgres';
import seed from '@/content/published.json';
import type { SiteContent } from '@/content/types';
import { db, json } from '@/lib/db/sql';
import { diffContent, mergeForPublish, summarize, type FieldDiff } from './diff';

/**
 * Draft vs published (handoff README → Data model), in PostgreSQL:
 * one working draft (`cms_draft`, the full content JSON) and the change log `cms_revisions`
 * — draft saves with their field diff, and immutable published versions with a snapshot.
 */
export type Revision = {
  id: string;
  version: number | null;
  status: 'draft' | 'published';
  author: string;
  createdAt: string;
  note: string;
  summary: { en: string; ar: string };
  diff: FieldDiff[];
  /** Published revisions only: the content that went live. */
  snapshot?: SiteContent;
};

type Note = string | { en: string; ar: string };
type Tx = postgres.TransactionSql;

const initial = () => structuredClone(seed) as unknown as SiteContent;
/** Serialises publishes and the first-run seed (transaction-scoped advisory lock). */
const PUBLISH_LOCK = 4_242_001;

type RevRow = {
  id: string; version: number | null; status: 'draft' | 'published'; author: string; created_at: Date;
  note: string; summary: Revision['summary']; diff: FieldDiff[]; snapshot: SiteContent | null;
};
const fromRow = (r: RevRow): Revision => ({
  id: r.id, version: r.version, status: r.status, author: r.author, createdAt: new Date(r.created_at).toISOString(),
  note: r.note, summary: r.summary, diff: r.diff, ...(r.snapshot ? { snapshot: r.snapshot } : {}),
});

async function insertRevision(tx: Tx, r: Revision) {
  await tx`
    insert into cms_revisions (id, version, status, author, created_at, note, summary, diff, snapshot)
    values (${r.id}, ${r.version}, ${r.status}, ${r.author}, ${r.createdAt}, ${r.note},
            ${json(r.summary)}, ${json(r.diff)}, ${r.snapshot ? json(r.snapshot) : null})`;
}

/** v1 = the content from the handoff, recorded the first time the database is used. */
async function ensureFirstRevision(tx: Tx) {
  await tx`select pg_advisory_xact_lock(${PUBLISH_LOCK})`;
  const [{ n }] = await tx<{ n: number }[]>`select count(*)::int as n from cms_revisions`;
  if (n > 0) return;
  await insertRevision(tx, {
    id: randomUUID(), version: 1, status: 'published', author: 'GHERAS', createdAt: new Date().toISOString(),
    note: 'Initial content from the design handoff',
    summary: { en: 'Published · v1 — initial content', ar: 'نُشر · الإصدار 1 — المحتوى الأولي' },
    diff: [], snapshot: initial(),
  });
}

/* ---------- Reads ---------- */
export async function listRevisions(): Promise<Revision[]> {
  const sql = db();
  let rows = await sql<RevRow[]>`select * from cms_revisions order by seq`;
  if (!rows.length) {
    await sql.begin(ensureFirstRevision);
    rows = await sql<RevRow[]>`select * from cms_revisions order by seq`;
  }
  return rows.map(fromRow);
}

export async function getPublished(): Promise<{ content: SiteContent; version: number } | null> {
  const [row] = await db()<{ snapshot: SiteContent; version: number }[]>`
    select snapshot, version from cms_revisions where status = 'published' order by version desc limit 1`;
  return row ? { content: row.snapshot, version: row.version } : null;
}

export async function getDraft(): Promise<SiteContent> {
  const [row] = await db()<{ content: SiteContent }[]>`select content from cms_draft where id = 1`;
  return row?.content ?? initial();
}

/** Field changes that would go live on publish (empty Arabic fields keep their published text, so they don't count). */
export async function pendingChanges(): Promise<{ draft: SiteContent; published: SiteContent; diffs: FieldDiff[] }> {
  const [draft, pub] = await Promise.all([getDraft(), getPublished()]);
  const published = pub?.content ?? initial();
  return { draft, published, diffs: diffContent(published, mergeForPublish(draft, published)) };
}

/* ---------- Writes ---------- */
/** Apply a change to the latest draft and log it, atomically. Returns the diff (empty when nothing changed). */
export async function updateDraft(author: string, fn: (d: SiteContent) => SiteContent, note: Note = ''): Promise<FieldDiff[]> {
  const n = typeof note === 'string' ? { en: note, ar: note } : note;
  return db().begin(async (tx) => {
    await ensureFirstRevision(tx);
    const [row] = await tx<{ content: SiteContent }[]>`select content from cms_draft where id = 1 for update`;
    const current = row?.content ?? initial();
    const next = fn(current);
    const diffs = diffContent(current, next);
    if (!diffs.length) return [];
    await tx`
      insert into cms_draft (id, content, updated_at) values (1, ${json(next)}, now())
      on conflict (id) do update set content = excluded.content, updated_at = now()`;
    await insertRevision(tx, {
      id: randomUUID(), version: null, status: 'draft', author, createdAt: new Date().toISOString(), note: n.en,
      summary: { en: n.en || summarize(diffs, next, 'en'), ar: n.ar || summarize(diffs, next, 'ar') }, diff: diffs,
    });
    return diffs;
  });
}

/** Replace the whole draft (used where the caller built the next draft itself). */
export async function saveDraft(next: SiteContent, author: string, note: Note = ''): Promise<FieldDiff[]> {
  return updateDraft(author, () => next, note);
}

export async function publishDraft(author: string, note: string): Promise<Revision | null> {
  return db().begin(async (tx) => {
    await ensureFirstRevision(tx); // also takes the publish lock
    const [d] = await tx<{ content: SiteContent }[]>`select content from cms_draft where id = 1`;
    const [p] = await tx<{ snapshot: SiteContent; version: number }[]>`
      select snapshot, version from cms_revisions where status = 'published' order by version desc limit 1`;
    const draft = d?.content ?? initial();
    const published = p?.snapshot ?? initial();
    const live = mergeForPublish(draft, published);
    const diffs = diffContent(published, live);
    if (!diffs.length) return null;
    const version = (p?.version ?? 0) + 1;
    const rev: Revision = {
      id: randomUUID(), version, status: 'published', author, createdAt: new Date().toISOString(), note,
      summary: { en: `Published · v${version}${note ? ` — ${note}` : ''}`, ar: `نُشر · الإصدار ${version}${note ? ` — ${note}` : ''}` },
      diff: diffs, snapshot: live,
    };
    await insertRevision(tx, rev);
    return rev;
  });
}

/** Restore copies a published revision into the draft (it does not publish). */
export async function restoreRevision(id: string, author: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  const [row] = await db()<{ snapshot: SiteContent | null; version: number | null }[]>`
    select snapshot, version from cms_revisions where id = ${id}`;
  if (!row?.snapshot) return false;
  await saveDraft(row.snapshot, author, { en: `Restored v${row.version}`, ar: `استعادة الإصدار ${row.version}` });
  return true;
}
