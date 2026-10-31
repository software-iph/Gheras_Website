import 'server-only';
import { db } from '@/lib/db/sql';
import type { Inquiry } from './types';

/** Contact-form inquiries (PostgreSQL table `inquiries`). */
type Row = {
  id: string; name: string; organisation: string; email: string; phone: string | null; type: Inquiry['type'];
  message: string; page_lang: Inquiry['pageLang']; status: Inquiry['status']; read: boolean; notes: string; created_at: Date;
};
const fromRow = (r: Row): Inquiry => ({
  id: r.id, name: r.name, organisation: r.organisation, email: r.email, phone: r.phone, type: r.type, message: r.message,
  pageLang: r.page_lang, status: r.status, read: r.read, notes: r.notes, createdAt: new Date(r.created_at).toISOString(),
});
const isId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export const inquiryStore = {
  async create(q: Inquiry) {
    await db()`
      insert into inquiries (id, name, organisation, email, phone, type, message, page_lang, status, read, notes, created_at)
      values (${q.id}, ${q.name}, ${q.organisation}, ${q.email}, ${q.phone}, ${q.type}, ${q.message},
              ${q.pageLang}, ${q.status}, ${q.read}, ${q.notes}, ${q.createdAt})`;
  },
  async list(): Promise<Inquiry[]> {
    return (await db()<Row[]>`select * from inquiries order by created_at desc`).map(fromRow);
  },
  async get(id: string): Promise<Inquiry | undefined> {
    if (!isId(id)) return undefined;
    const [row] = await db()<Row[]>`select * from inquiries where id = ${id}`;
    return row ? fromRow(row) : undefined;
  },
  async update(id: string, patch: Partial<Pick<Inquiry, 'status' | 'notes' | 'read'>>): Promise<Inquiry | undefined> {
    if (!isId(id) || !Object.keys(patch).length) return undefined;
    const sql = db();
    const [row] = await sql<Row[]>`update inquiries set ${sql(patch)} where id = ${id} returning *`;
    return row ? fromRow(row) : undefined;
  },
};
