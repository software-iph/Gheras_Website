import 'server-only';
import type { Localized } from '@/content/types';
import { db, json } from '@/lib/db/sql';
import { DEFAULT_CAREERS, type Application, type AppStatus, type CareersSettings, type Job } from './types';

/** Jobs, applications and the careers settings (PostgreSQL). */
const isId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);
const loc = (v: unknown): Localized => {
  const o = (v ?? {}) as Record<string, unknown>;
  return { en: typeof o.en === 'string' ? o.en : '', ar: typeof o.ar === 'string' ? o.ar : '' };
};

type JobRow = {
  id: string; title: unknown; department: unknown; location: unknown; employment: Job['employment']; description: unknown;
  apply_mode: Job['applyMode']; apply_url: string | null; status: Job['status']; sort: number; created_at: Date; updated_at: Date;
};
const jobFromRow = (r: JobRow): Job => ({
  id: r.id, title: loc(r.title), department: loc(r.department), location: loc(r.location), employment: r.employment,
  description: loc(r.description), applyMode: r.apply_mode, applyUrl: r.apply_url, status: r.status, sort: r.sort,
  createdAt: new Date(r.created_at).toISOString(), updatedAt: new Date(r.updated_at).toISOString(),
});

type AppRow = {
  id: string; job_id: string | null; job_title: string | null; name: string; email: string; phone: string | null; link: string | null;
  message: string; cv_name: string | null; cv_original: string | null; cv_type: string | null; cv_size: number | null;
  page_lang: Application['pageLang']; status: AppStatus; read: boolean; notes: string; created_at: Date;
};
const appFromRow = (r: AppRow): Application => ({
  id: r.id, jobId: r.job_id, jobTitle: r.job_title, name: r.name, email: r.email, phone: r.phone, link: r.link, message: r.message,
  cv: r.cv_name ? { name: r.cv_name, original: r.cv_original ?? r.cv_name, type: r.cv_type ?? '', size: r.cv_size ?? 0 } : null,
  pageLang: r.page_lang, status: r.status, read: r.read, notes: r.notes, createdAt: new Date(r.created_at).toISOString(),
});

export const careersStore = {
  /* ---------- Settings ---------- */
  async settings(): Promise<CareersSettings> {
    const [row] = await db()<{ value: Partial<CareersSettings> }[]>`select value from app_settings where key = 'careers'`;
    const v = row?.value ?? {};
    return { enabled: !!v.enabled, intro: v.intro ? loc(v.intro) : DEFAULT_CAREERS.intro, general: v.general ?? DEFAULT_CAREERS.general };
  },
  async saveSettings(s: CareersSettings) {
    await db()`
      insert into app_settings (key, value, updated_at) values ('careers', ${json(s)}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()`;
  },

  /* ---------- Jobs ---------- */
  async jobs(onlyOpen = false): Promise<Job[]> {
    const sql = db();
    const rows = onlyOpen
      ? await sql<JobRow[]>`select * from jobs where status = 'open' order by sort, created_at desc`
      : await sql<JobRow[]>`select * from jobs order by (status = 'closed'), sort, created_at desc`;
    return rows.map(jobFromRow);
  },
  async job(id: string): Promise<Job | undefined> {
    if (!isId(id)) return undefined;
    const [row] = await db()<JobRow[]>`select * from jobs where id = ${id}`;
    return row ? jobFromRow(row) : undefined;
  },
  async saveJob(j: Omit<Job, 'createdAt' | 'updatedAt'>) {
    await db()`
      insert into jobs (id, title, department, location, employment, description, apply_mode, apply_url, status, sort)
      values (${j.id}, ${json(j.title)}, ${json(j.department)}, ${json(j.location)}, ${j.employment}, ${json(j.description)},
              ${j.applyMode}, ${j.applyUrl}, ${j.status}, ${j.sort})
      on conflict (id) do update set
        title = excluded.title, department = excluded.department, location = excluded.location,
        employment = excluded.employment, description = excluded.description, apply_mode = excluded.apply_mode,
        apply_url = excluded.apply_url, status = excluded.status, sort = excluded.sort, updated_at = now()`;
  },
  async deleteJob(id: string) {
    if (isId(id)) await db()`delete from jobs where id = ${id}`;
  },
  /** Applications per job (all statuses except archived). */
  async applicationCounts(): Promise<Record<string, number>> {
    const rows = await db()<{ job_id: string; n: number }[]>`
      select job_id, count(*)::int as n from job_applications where job_id is not null and status <> 'archived' group by job_id`;
    return Object.fromEntries(rows.map((r) => [r.job_id, r.n]));
  },

  /* ---------- Applications ---------- */
  async createApplication(a: Application) {
    await db()`
      insert into job_applications (id, job_id, job_title, name, email, phone, link, message, cv_name, cv_original, cv_type, cv_size,
                                    page_lang, status, read, notes, created_at)
      values (${a.id}, ${a.jobId}, ${a.jobTitle}, ${a.name}, ${a.email}, ${a.phone}, ${a.link}, ${a.message},
              ${a.cv?.name ?? null}, ${a.cv?.original ?? null}, ${a.cv?.type ?? null}, ${a.cv?.size ?? null},
              ${a.pageLang}, ${a.status}, ${a.read}, ${a.notes}, ${a.createdAt})`;
  },
  async applications(): Promise<Application[]> {
    return (await db()<AppRow[]>`select * from job_applications order by created_at desc`).map(appFromRow);
  },
  async application(id: string): Promise<Application | undefined> {
    if (!isId(id)) return undefined;
    const [row] = await db()<AppRow[]>`select * from job_applications where id = ${id}`;
    return row ? appFromRow(row) : undefined;
  },
  async updateApplication(id: string, patch: Partial<{ status: AppStatus; read: boolean; notes: string }>) {
    if (!isId(id) || !Object.keys(patch).length) return;
    const sql = db();
    await sql`update job_applications set ${sql(patch)} where id = ${id}`;
  },
  async deleteApplication(id: string): Promise<Application | undefined> {
    if (!isId(id)) return undefined;
    const [row] = await db()<AppRow[]>`delete from job_applications where id = ${id} returning *`;
    return row ? appFromRow(row) : undefined;
  },
  async unreadApplications(): Promise<number> {
    const [{ n }] = await db()<{ n: number }[]>`select count(*)::int as n from job_applications where not read and status <> 'archived'`;
    return n;
  },
};
