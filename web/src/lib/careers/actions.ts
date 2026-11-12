'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import type { Localized } from '@/content/types';
import { requireAdmin } from '@/lib/auth/session';
import { deleteCv } from './cv';
import { careersStore } from './store';
import { APP_STATUSES, EMPLOYMENT, type AppStatus, type CareersSettings, type Employment, type Job } from './types';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const loc = (v: unknown, max: number): Localized => {
  const o = (v ?? {}) as Record<string, unknown>;
  return { en: str(o.en, max), ar: str(o.ar, max) };
};
const validUrl = (v: string) => { try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; } };

/** The careers page and the home page (which shows the Careers link) change together. */
function revalidateSite() {
  for (const l of ['en', 'ar']) { revalidatePath(`/${l}`); revalidatePath(`/${l}/careers`); }
  revalidatePath('/admin', 'layout');
}

export type CareersResult = { ok: true; id?: string } | { ok: false; error: 'title' | 'url' | 'not-found' };

export async function saveJob(input: Partial<Job> & { id?: string }): Promise<CareersResult> {
  await requireAdmin();
  const title = loc(input.title, 120);
  if (!title.en && !title.ar) return { ok: false, error: 'title' };
  const applyMode = input.applyMode === 'link' ? 'link' : 'form';
  const applyUrl = str(input.applyUrl, 500) || null;
  if (applyMode === 'link' && (!applyUrl || !validUrl(applyUrl))) return { ok: false, error: 'url' };
  const id = input.id && /^[0-9a-f-]{36}$/i.test(input.id) ? input.id : randomUUID();
  await careersStore.saveJob({
    id,
    title,
    department: loc(input.department, 120),
    location: loc(input.location, 120),
    employment: (EMPLOYMENT as readonly string[]).includes(String(input.employment)) ? (input.employment as Employment) : 'full-time',
    description: loc(input.description, 8000),
    applyMode,
    applyUrl: applyMode === 'link' ? applyUrl : null,
    status: input.status === 'closed' ? 'closed' : 'open',
    sort: Number.isInteger(input.sort) ? Math.max(0, Math.min(9999, Number(input.sort))) : 0,
  });
  revalidateSite();
  return { ok: true, id };
}

export async function deleteJob(id: string): Promise<CareersResult> {
  await requireAdmin();
  await careersStore.deleteJob(id);
  revalidateSite();
  return { ok: true };
}

export async function saveCareersSettings(s: CareersSettings): Promise<CareersResult> {
  await requireAdmin();
  await careersStore.saveSettings({ enabled: !!s.enabled, general: !!s.general, intro: loc(s.intro, 600) });
  revalidateSite();
  return { ok: true };
}

export async function markApplicationRead(id: string) {
  await requireAdmin();
  await careersStore.updateApplication(id, { read: true });
  revalidatePath('/admin', 'layout');
}

export async function setApplicationStatus(id: string, status: AppStatus) {
  await requireAdmin();
  if (!(APP_STATUSES as readonly string[]).includes(status)) return;
  await careersStore.updateApplication(id, { status, read: true });
  revalidatePath('/admin', 'layout');
}

export async function saveApplicationNotes(id: string, notes: string) {
  await requireAdmin();
  await careersStore.updateApplication(id, { notes: str(notes, 5000) });
  revalidatePath('/admin', 'layout');
}

/** Deletes the application and its CV file (e.g. on request, or after the hiring round). */
export async function deleteApplication(id: string): Promise<CareersResult> {
  await requireAdmin();
  const gone = await careersStore.deleteApplication(id);
  if (!gone) return { ok: false, error: 'not-found' };
  if (gone.cv) await deleteCv(gone.cv.name);
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
