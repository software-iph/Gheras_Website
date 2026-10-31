import type { Localized, SiteContent } from '@/content/types';
import { sectionDef, type L2 } from './schema';

/* ---------- Path helpers (dotted, numeric segments index arrays) ---------- */
export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

export function setPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const clone = (o: unknown): Record<string, unknown> | unknown[] => (Array.isArray(o) ? [...o] : { ...(o as object) }) as Record<string, unknown>;
  const root = clone(obj) as Record<string, unknown>;
  let cur: Record<string, unknown> = root;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = value;
    else { cur[k] = clone(cur[k] ?? {}); cur = cur[k] as Record<string, unknown>; }
  });
  return root as T;
}

/* ---------- Flatten content to comparable leaves keyed by stable paths ---------- */
type Leaf = string | number | boolean | null;

function walk(v: unknown, prefix: string, out: Map<string, Leaf>) {
  if (v === null || typeof v !== 'object') { out.set(prefix, (v ?? null) as Leaf); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${prefix}.${i}`, out)); return; }
  for (const [k, x] of Object.entries(v)) if (k !== 'note') walk(x, prefix ? `${prefix}.${k}` : k, out);
}

/** Sections keyed by id and media by id, so reordering does not show as every field changing. */
export function flatten(c: SiteContent): Map<string, Leaf> {
  const out = new Map<string, Leaf>();
  walk(c.site, 'site', out);
  for (const s of c.sections) walk(s, `sections.${s.id}`, out);
  for (const m of c.media) walk(m, `media.${m.id}`, out);
  return out;
}

export type FieldDiff = { path: string; before: Leaf; after: Leaf };

export function diffContent(before: SiteContent | null, after: SiteContent): FieldDiff[] {
  const a = before ? flatten(before) : new Map<string, Leaf>();
  const b = flatten(after);
  const keys = new Set([...a.keys(), ...b.keys()]);
  const out: FieldDiff[] = [];
  for (const k of keys) {
    const x = a.get(k) ?? null, y = b.get(k) ?? null;
    if (x !== y && !(x === '' && y === null) && !(x === null && y === '')) out.push({ path: k, before: x, after: y });
  }
  return out;
}

/* ---------- Human labels for diffs (history, pending list) ---------- */
const SITE_LABELS: Record<string, L2> = {
  'seo.title': { en: 'SEO — page title', ar: 'محركات البحث — عنوان الصفحة' },
  'seo.description': { en: 'SEO — description', ar: 'محركات البحث — الوصف' },
  'seo.shareImage': { en: 'SEO — share image', ar: 'محركات البحث — صورة المشاركة' },
  'contact.email': { en: 'Contact — email', ar: 'التواصل — البريد الإلكتروني' },
  'contact.phone': { en: 'Contact — phone number', ar: 'التواصل — رقم الهاتف' },
  'contact.address': { en: 'Contact — address', ar: 'التواصل — العنوان' },
  'contact.replyTimeDays': { en: 'Contact — reply time', ar: 'التواصل — مدة الرد' },
  'endorsement.visible': { en: 'Footer — endorsement shown', ar: 'التذييل — إظهار سطر الانتماء' },
  'endorsement.text': { en: 'Footer — endorsement', ar: 'التذييل — سطر الانتماء' },
};
const LANG_SUFFIX: Record<string, L2> = { en: { en: 'English', ar: 'إنجليزي' }, ar: { en: 'Arabic', ar: 'عربي' } };

export type DiffLabel = { group: L2; field: L2; lang?: 'en' | 'ar' };

export function labelFor(path: string, content: SiteContent): DiffLabel {
  const parts = path.split('.');
  const last = parts[parts.length - 1];
  const lang = last === 'en' || last === 'ar' ? last : undefined;
  const base = lang ? parts.slice(0, -1).join('.') : path;

  if (parts[0] === 'sections') {
    const def = sectionDef(parts[1]);
    const group = def?.name ?? { en: parts[1], ar: parts[1] };
    const rest = base.split('.').slice(2).join('.');
    if (rest === 'visible') return { group, field: { en: 'Shown on site', ar: 'الظهور على الموقع' } };
    if (rest === 'order') return { group, field: { en: 'Position on page', ar: 'الترتيب في الصفحة' } };
    if (rest === 'locked') return { group, field: { en: 'Lock', ar: 'القفل' } };
    const s = content.sections.find((x) => x.id === parts[1]);
    const f = s && def?.fields(s).find((fd) => rest === fd.path || rest.startsWith(`${fd.path}.`));
    if (f) {
      if (f.kind === 'figure') {
        const sub = rest.slice(f.path.length + 1);
        return { group, field: { en: `${f.label.en} — ${sub.startsWith('value') ? 'number' : 'label'}`, ar: `${f.label.ar} — ${sub.startsWith('value') ? 'الرقم' : 'التسمية'}` }, lang };
      }
      return { group, field: f.label, lang };
    }
    return { group, field: { en: rest, ar: rest }, lang };
  }
  if (parts[0] === 'media') {
    const m = content.media.find((x) => x.id === parts[1]);
    const name = (m?.brief ?? parts[1]).split(' — ')[0];
    const rest = base.split('.').slice(2).join('.');
    const what: Record<string, L2> = {
      url: { en: 'Image file', ar: 'ملف الصورة' }, alt: { en: 'Alt text', ar: 'النص البديل' },
      focal: { en: 'Focal point', ar: 'مركز الصورة' }, 'focal.x': { en: 'Focal point', ar: 'مركز الصورة' }, 'focal.y': { en: 'Focal point', ar: 'مركز الصورة' },
    };
    return { group: { en: `Media — ${name}`, ar: `الصور — ${name}` }, field: what[rest] ?? { en: rest, ar: rest }, lang };
  }
  const rest = base.split('.').slice(1).join('.');
  if (rest.startsWith('social.')) {
    const k = rest.split('.')[1];
    return { group: { en: 'Social links', ar: 'روابط التواصل' }, field: { en: k, ar: k } };
  }
  return { group: { en: 'Site settings', ar: 'إعدادات الموقع' }, field: SITE_LABELS[rest] ?? { en: rest, ar: rest }, lang };
}

export function describe(l: DiffLabel, ui: 'en' | 'ar'): string {
  const lang = l.lang ? ` (${LANG_SUFFIX[l.lang][ui]})` : '';
  return `${l.group[ui]} — ${l.field[ui]}${lang}`;
}

/** One-line summary of a change set for the history timeline. */
export function summarize(diffs: FieldDiff[], content: SiteContent, ui: 'en' | 'ar'): string {
  if (!diffs.length) return ui === 'ar' ? 'بدون تغييرات' : 'No changes';
  const labels = diffs.map((d) => labelFor(d.path, content));
  const groups = [...new Set(labels.map((l) => l.group[ui]))];
  const fields = [...new Set(labels.map((l) => l.field[ui]))];
  if (groups.length === 1 && fields.length === 1) {
    const langs = [...new Set(labels.map((l) => l.lang).filter(Boolean))] as ('en' | 'ar')[];
    const ls = langs.length ? ` (${langs.map((x) => LANG_SUFFIX[x][ui]).join(ui === 'ar' ? '، ' : ', ')})` : '';
    return `${groups[0]} — ${fields[0]}${ls}`;
  }
  if (groups.length === 1) return ui === 'ar' ? `${groups[0]} — ${fields.length} حقول` : `${groups[0]} — ${fields.length} fields`;
  return ui === 'ar' ? `${groups.length} أقسام — ${diffs.length} تغييرات` : `${groups.length} areas — ${diffs.length} changes`;
}

/* ---------- Publish merge: an empty Arabic field keeps the last published Arabic value ---------- */
const isLocalized = (v: unknown): v is Localized =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 2 && 'en' in v && 'ar' in v;

export function mergeForPublish(draft: SiteContent, published: SiteContent | null): SiteContent {
  if (!published) return draft;
  const pub = flatten(published);
  const fix = (v: unknown, prefix: string): unknown => {
    if (isLocalized(v)) {
      const prev = pub.get(`${prefix}.ar`);
      return !v.ar?.trim() && typeof prev === 'string' && prev.trim() ? { ...v, ar: prev } : v;
    }
    if (Array.isArray(v)) return v.map((x, i) => fix(x, `${prefix}.${i}`));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fix(x, `${prefix}.${k}`)]));
    return v;
  };
  return {
    site: fix(draft.site, 'site') as SiteContent['site'],
    sections: draft.sections.map((s) => fix(s, `sections.${s.id}`) as typeof s),
    media: draft.media.map((m) => fix(m, `media.${m.id}`) as typeof m),
  };
}
