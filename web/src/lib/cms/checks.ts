import type { Media, SiteContent, SocialKey } from '@/content/types';
import { getPath } from './diff';
import { IMAGE_RULES, SETTINGS_LIMITS, allTextFields, sectionDef, type L2 } from './schema';

export type Usage = { mediaId: string; where: L2; preset: 'hero' | 'circle' | 'share'; sectionId?: string };
const SHARE = { ratio: 1200 / 630, ratioLabel: '1200 × 630', minWidth: 600 };

/** Where each media item is used (hero, Why circles, share image). */
export function mediaUsage(c: SiteContent): Usage[] {
  const out: Usage[] = [];
  for (const s of c.sections) {
    const def = sectionDef(s.id);
    if (!def) continue;
    for (const f of def.fields(s)) {
      if (f.kind !== 'image') continue;
      const id = getPath(s, f.path);
      if (typeof id === 'string') out.push({ mediaId: id, sectionId: s.id, where: { en: `${def.name.en} · ${f.label.en}`, ar: `${def.name.ar} · ${f.label.ar}` }, preset: f.preset });
    }
  }
  if (c.site.seo.shareImage) out.push({ mediaId: c.site.seo.shareImage, where: { en: 'SEO · Share image', ar: 'محركات البحث · صورة المشاركة' }, preset: 'share' });
  return out;
}

export type ImageIssue = 'missing' | 'small';

/** Any aspect ratio is fine (the site crops around the focal point); only very small photos get a hint. */
export function imageIssues(m: Media, preset: Usage['preset']): ImageIssue[] {
  if (!m.url) return ['missing'];
  const rule = preset === 'share' ? SHARE : IMAGE_RULES[preset];
  const out: ImageIssue[] = [];
  if (m.width && m.width < rule.minWidth) out.push('small');
  return out;
}

export const ruleFor = (preset: Usage['preset']) => (preset === 'share' ? SHARE : IMAGE_RULES[preset]);

const URL_RE = /^https:\/\/[^\s/$.?#].[^\s]*$/i;
export const validUrl = (v: string) => URL_RE.test(v.trim());
const SOCIAL: SocialKey[] = ['linkedin', 'instagram', 'x', 'facebook', 'youtube'];

const SETTINGS_NAMES: Record<string, L2> = {
  'seo.title': { en: 'Site settings — SEO page title', ar: 'إعدادات الموقع — عنوان الصفحة' },
  'seo.description': { en: 'Site settings — SEO description', ar: 'إعدادات الموقع — وصف محركات البحث' },
};

export type Problem = { where: L2; lang?: 'en' | 'ar'; detail?: string; sectionId?: string };

export type Report = {
  overLimit: Problem[];
  emptyEn: Problem[];
  emptyAr: Problem[];
  badUrls: Problem[];
  imageProblems: Problem[];
  missingAlt: Problem[];
  placeholders: Problem[];
};

export function checkContent(c: SiteContent): Report {
  const r: Report = { overLimit: [], emptyEn: [], emptyAr: [], badUrls: [], imageProblems: [], missingAlt: [], placeholders: [] };
  const name = (def: { name: L2 }, f: { label: L2 }): L2 => ({ en: `${def.name.en} — ${f.label.en}`, ar: `${def.name.ar} — ${f.label.ar}` });

  for (const { section, field, s } of allTextFields(c)) {
    const v = getPath(s, field.path) as { en?: string | null; ar?: string | null } | undefined;
    const en = v?.en ?? '', ar = v?.ar ?? '';
    const where = name(section, field);
    if (field.limit) {
      if (en.length > field.limit) r.overLimit.push({ where, lang: 'en', detail: `${en.length}/${field.limit}`, sectionId: s.id });
      if (ar.length > field.limit) r.overLimit.push({ where, lang: 'ar', detail: `${ar.length}/${field.limit}`, sectionId: s.id });
    }
    if (!en.trim()) r.emptyEn.push({ where, lang: 'en', sectionId: s.id });
    if (!ar.trim()) r.emptyAr.push({ where, lang: 'ar', sectionId: s.id });
  }
  for (const [key, limit] of Object.entries(SETTINGS_LIMITS)) {
    const v = getPath(c.site, key) as { en?: string | null; ar?: string | null };
    for (const lang of ['en', 'ar'] as const) {
      const len = (v?.[lang] ?? '').length;
      if (len > limit) r.overLimit.push({ where: SETTINGS_NAMES[key] ?? { en: key, ar: key }, lang, detail: `${len}/${limit}` });
    }
  }
  for (const k of SOCIAL) {
    const v = c.site.social[k];
    if (v && !validUrl(v)) r.badUrls.push({ where: { en: `Social link — ${k}`, ar: `رابط التواصل — ${k}` }, detail: v });
  }
  if (c.site.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.site.contact.email)) {
    r.badUrls.push({ where: { en: 'Contact — email', ar: 'التواصل — البريد الإلكتروني' }, detail: c.site.contact.email });
  }

  for (const u of mediaUsage(c)) {
    const m = c.media.find((x) => x.id === u.mediaId);
    if (!m) continue;
    const issues = imageIssues(m, u.preset);
    if (issues.includes('missing')) r.placeholders.push({ where: u.where });
    else if (issues.length) r.imageProblems.push({ where: u.where, detail: issues.join(', ') });
    if (m.url && !m.alt.ar?.trim()) r.missingAlt.push({ where: u.where, lang: 'ar' });
    if (m.url && !m.alt.en?.trim()) r.missingAlt.push({ where: u.where, lang: 'en' });
  }

  const ct = c.site.contact;
  const ph = (en: string, ar: string) => r.placeholders.push({ where: { en, ar } });
  if (!ct.email) ph('Contact — email', 'التواصل — البريد الإلكتروني');
  if (!ct.phone) ph('Contact — phone', 'التواصل — الهاتف');
  if (!ct.address.en?.trim() || !ct.address.ar?.trim()) ph('Contact — address', 'التواصل — العنوان');
  if (ct.replyTimeDays == null) ph('Contact — reply time', 'التواصل — مدة الرد');
  if (!SOCIAL.some((k) => c.site.social[k])) ph('Footer — social links', 'التذييل — روابط التواصل');
  const fig = c.sections.find((s) => s.id === 'figures') as { items?: { value: number | null }[] } | undefined;
  fig?.items?.forEach((it, i) => { if (it.value == null) ph(`Figures — figure ${i + 1}`, `الأرقام — الرقم ${i + 1}`); });
  return r;
}

/** Problems that block publishing. Empty Arabic fields only warn: they keep the published text. */
export const blocking = (r: Report) => [...r.overLimit, ...r.emptyEn, ...r.badUrls];
