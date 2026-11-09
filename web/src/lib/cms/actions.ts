'use server';

import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { revalidatePath } from 'next/cache';
import type { Localized, Section, SiteContent, SocialKey } from '@/content/types';
import { requireAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db/sql';
import { UPLOADS_DIR, isUploadName } from '@/lib/db/uploads';
import { inquiryStore } from '@/lib/inquiries/store';
import { blocking, checkContent, mediaUsage } from './checks';
import { getPath, setPath } from './diff';
import { FIXED_POSITION, LOCKED, sectionDef } from './schema';
import { getDraft, pendingChanges, publishDraft, restoreRevision, saveDraft, updateDraft } from './store';

const MAX = 5000;
const str = (v: unknown) => (typeof v === 'string' ? v.slice(0, MAX) : '');
const loc = (v: unknown): Localized => {
  const o = (v ?? {}) as Record<string, unknown>;
  return { en: str(o.en), ar: str(o.ar) };
};
const refresh = () => revalidatePath('/admin', 'layout');

export type ActionResult = { ok: true; changed?: number } | { ok: false; error: string };

/**
 * Save one section from the page editor. Only the schema's field paths are copied from the
 * submitted object, so the request cannot change structure, ids, order or visibility.
 */
export async function saveSection(id: string, submitted: Section, opts: { unlocked?: boolean; alts?: Record<string, Localized> } = {}): Promise<ActionResult> {
  const admin = await requireAdmin();
  const def = sectionDef(id);
  if (!def) return { ok: false, error: 'unknown-section' };
  if (LOCKED.includes(def.id) && !opts.unlocked) return { ok: false, error: 'locked' };
  const draft = await getDraft();
  const current = draft.sections.find((s) => s.id === id);
  if (!current) return { ok: false, error: 'unknown-section' };

  let next: Section = current;
  for (const f of def.fields(current)) {
    const v = getPath(submitted, f.path);
    if (f.kind === 'text' || f.kind === 'area') next = setPath(next, f.path, loc(v));
    else if (f.kind === 'figure') {
      const o = (v ?? {}) as { value?: unknown; label?: unknown };
      const num = typeof o.value === 'number' && Number.isFinite(o.value) && o.value >= 0 ? o.value : null;
      next = setPath(setPath(next, `${f.path}.value`, num), `${f.path}.label`, loc(o.label));
    } else if (f.kind === 'image' && typeof v === 'string' && draft.media.some((m) => m.id === v)) {
      next = setPath(next, f.path, v);
    }
  }
  const media = draft.media.map((m) => (opts.alts?.[m.id] ? { ...m, alt: loc(opts.alts[m.id]) } : m));
  const diffs = await saveDraft({ ...draft, media, sections: draft.sections.map((s) => (s.id === id ? next : s)) }, admin.name);
  refresh();
  return { ok: true, changed: diffs.length };
}

export async function setSectionVisible(id: string, visible: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  await updateDraft(admin.name, (d) => ({ ...d, sections: d.sections.map((s) => (s.id === id ? { ...s, visible: !!visible } : s)) }));
  refresh();
  return { ok: true };
}

/** New order for the movable sections; hero stays first and footer last. */
export async function reorderSections(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  await updateDraft(admin.name, (d) => {
    const sorted = [...d.sections].sort((a, b) => a.order - b.order);
    const movable = sorted.filter((s) => !FIXED_POSITION.includes(s.id));
    if (ids.length !== movable.length || !movable.every((s) => ids.includes(s.id))) return d;
    const seq = [sorted.find((s) => s.id === 'hero'), ...ids.map((id) => movable.find((s) => s.id === id)), sorted.find((s) => s.id === 'footer')]
      .filter(Boolean) as Section[];
    const order = new Map(seq.map((s, i) => [s.id, i + 1]));
    return { ...d, sections: d.sections.map((s) => ({ ...s, order: order.get(s.id) ?? s.order })) };
  }, { en: 'Section order changed', ar: 'تغيير ترتيب الأقسام' });
  refresh();
  return { ok: true };
}

export async function saveSettings(site: SiteContent['site']): Promise<ActionResult> {
  const admin = await requireAdmin();
  const draft = await getDraft();
  const n = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 500) : null);
  const days = Number(site.contact?.replyTimeDays);
  const socialKeys: SocialKey[] = ['linkedin', 'instagram', 'x', 'facebook', 'youtube'];
  const share = n(site.seo?.shareImage);
  const next: SiteContent['site'] = {
    seo: { title: loc(site.seo?.title), description: loc(site.seo?.description), shareImage: share && draft.media.some((m) => m.id === share) ? share : null },
    contact: {
      email: n(site.contact?.email), phone: n(site.contact?.phone), address: loc(site.contact?.address),
      replyTimeDays: site.contact?.replyTimeDays != null && String(site.contact.replyTimeDays) !== '' && Number.isInteger(days) && days > 0 && days < 100 ? days : null,
    },
    social: Object.fromEntries(socialKeys.map((k) => [k, n(site.social?.[k])])) as SiteContent['site']['social'],
    endorsement: { visible: !!site.endorsement?.visible, text: loc(site.endorsement?.text) },
  };
  const diffs = await saveDraft({ ...draft, site: next }, admin.name);
  refresh();
  return { ok: true, changed: diffs.length };
}

export async function saveMediaDetails(id: string, patch: { alt?: Localized; focal?: { x: number; y: number } }): Promise<ActionResult> {
  const admin = await requireAdmin();
  const clamp = (v: unknown) => Math.min(1, Math.max(0, Number(v) || 0));
  await updateDraft(admin.name, (d) => ({
    ...d,
    media: d.media.map((m) => (m.id !== id ? m : {
      ...m,
      ...(patch.alt ? { alt: loc(patch.alt) } : {}),
      ...(patch.focal ? { focal: { x: Math.round(clamp(patch.focal.x) * 1000) / 1000, y: Math.round(clamp(patch.focal.y) * 1000) / 1000 } } : {}),
    })),
  }));
  refresh();
  return { ok: true };
}

/**
 * Remove a photo from the library. Refused while the draft still uses it. The file itself is
 * deleted only when no published version (the live site, or one that could be restored) shows it.
 */
export async function deleteMedia(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  let removed: SiteContent['media'][number] | undefined;
  let inUse = false;
  await updateDraft(admin.name, (d) => {
    const m = d.media.find((x) => x.id === id);
    if (!m) return d;
    if (mediaUsage(d).some((u) => u.mediaId === id)) { inUse = true; return d; }
    removed = m;
    return { ...d, media: d.media.filter((x) => x.id !== id) };
  }, { en: 'Image deleted', ar: 'حذف صورة' });
  if (inUse) return { ok: false, error: 'in-use' };
  if (!removed) return { ok: false, error: 'not-found' };
  const name = removed.url?.split('/').pop() ?? '';
  if (isUploadName(name)) {
    const [shown] = await db()`select 1 from cms_revisions where status = 'published' and snapshot::text like ${'%' + name + '%'} limit 1`;
    if (!shown) {
      await db()`delete from media_files where name = ${name}`;
      await unlink(path.join(/*turbopackIgnore: true*/ UPLOADS_DIR, name)).catch(() => undefined);
    }
  }
  refresh();
  return { ok: true };
}

export async function publish(note: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const { draft } = await pendingChanges();
  if (blocking(checkContent(draft)).length) return { ok: false, error: 'blocked' };
  const rev = await publishDraft(admin.name, str(note).trim().slice(0, 200));
  if (!rev) return { ok: false, error: 'nothing' };
  revalidatePath('/en');
  revalidatePath('/ar');
  refresh();
  return { ok: true };
}

export async function restore(revisionId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const ok = await restoreRevision(revisionId, admin.name);
  refresh();
  return ok ? { ok: true } : { ok: false, error: 'not-found' };
}

/* ---------- Inquiries ---------- */
export async function markInquiryRead(id: string) {
  await requireAdmin();
  const q = await inquiryStore.get(id);
  if (q && !q.read) { await inquiryStore.update(id, { read: true }); refresh(); }
}

export async function setInquiryStatus(id: string, status: 'new' | 'replied' | 'archived') {
  await requireAdmin();
  if (!['new', 'replied', 'archived'].includes(status)) return;
  await inquiryStore.update(id, { status, read: true });
  refresh();
}

export async function saveInquiryNotes(id: string, notes: string) {
  await requireAdmin();
  await inquiryStore.update(id, { notes: str(notes) });
  refresh();
}
