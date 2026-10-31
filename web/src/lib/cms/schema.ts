import type { Section, SectionId, SiteContent } from '@/content/types';

/** A label in both dashboard languages. */
export type L2 = { en: string; ar: string };

/**
 * Editor field definitions. `path` is relative to the section object
 * (e.g. `fields.sub`, `items.2.title`). Limits come from the dashboard prototype where it
 * gives one; the rest are set from the layout's line lengths.
 */
export type FieldDef =
  | { kind: 'text' | 'area'; path: string; label: L2; limit?: number }
  | { kind: 'image'; path: string; label: L2; preset: 'hero' | 'circle' }
  | { kind: 'figure'; path: string; label: L2 };

export type SectionDef = {
  id: SectionId;
  name: L2;
  desc: L2;
  /** Public anchor the live preview jumps to. */
  anchor: string;
  fields: (s: Section) => FieldDef[];
};

const t = (path: string, en: string, ar: string, limit?: number): FieldDef => ({ kind: 'text', path, label: { en, ar }, limit });
const a = (path: string, en: string, ar: string, limit?: number): FieldDef => ({ kind: 'area', path, label: { en, ar }, limit });
const n2 = (i: number) => String(i + 1).padStart(2, '0');
const items = (s: Section, key = 'items') => ((s as unknown as Record<string, unknown[]>)[key] ?? []);

export const IMAGE_RULES = {
  hero: { ratio: 16 / 9, ratioLabel: '16:9', minWidth: 2400 },
  circle: { ratio: 1, ratioLabel: '1:1', minWidth: 1200 },
} as const;

export const SECTION_DEFS: SectionDef[] = [
  {
    id: 'hero', anchor: '#top',
    name: { en: 'Hero', ar: 'الواجهة' },
    desc: { en: 'First screen. One message, one action.', ar: 'الشاشة الأولى: رسالة واحدة وإجراء واحد.' },
    fields: () => [
      t('fields.eyebrow', 'Eyebrow', 'العنوان التمهيدي', 40),
      t('fields.headline', 'Headline (H1)', 'العنوان الرئيسي', 40),
      a('fields.sub', 'Supporting line', 'السطر الداعم', 160),
      { kind: 'image', path: 'fields.image.mediaId', label: { en: 'Background photo', ar: 'صورة الخلفية' }, preset: 'hero' },
      t('fields.primaryCta', 'Primary button', 'الزر الرئيسي', 24),
      t('fields.secondaryCta', 'Secondary button', 'الزر الثانوي', 24),
    ],
  },
  {
    id: 'about', anchor: '#about',
    name: { en: 'Belief statement', ar: 'بيان الإيمان' },
    desc: { en: 'One large line and two short paragraphs.', ar: 'سطر كبير وفقرتان قصيرتان.' },
    fields: () => [
      t('fields.eyebrow', 'Eyebrow', 'العنوان التمهيدي', 40),
      a('fields.statement', 'Statement', 'البيان', 90),
      a('fields.p1', 'Paragraph 1', 'الفقرة 1', 280),
      a('fields.p2', 'Paragraph 2', 'الفقرة 2', 280),
    ],
  },
  {
    id: 'figures', anchor: '#about',
    name: { en: 'Figures strip', ar: 'شريط الأرقام' },
    desc: { en: 'Shown only when every figure is real. Hide the section until then.', ar: 'يظهر فقط عندما تكون كل الأرقام حقيقية، ويُخفى حتى ذلك الحين.' },
    fields: (s) => items(s).map((_, i) => ({ kind: 'figure', path: `items.${i}`, label: { en: `Figure ${i + 1}`, ar: `الرقم ${i + 1}` } })),
  },
  {
    id: 'what-we-do', anchor: '#what-we-do',
    name: { en: 'What we do', ar: 'ماذا نفعل' },
    desc: { en: 'Six service cards. Icons come from the brand set.', ar: 'ست بطاقات خدمات، والأيقونات من مجموعة العلامة.' },
    fields: (s) => [
      t('fields.eyebrow', 'Eyebrow', 'العنوان التمهيدي', 40),
      t('fields.heading', 'Heading', 'العنوان', 70),
      a('fields.intro', 'Introduction', 'المقدمة', 220),
      ...items(s).flatMap((_, i) => [
        t(`items.${i}.title`, `Card ${i + 1} — title`, `البطاقة ${i + 1} — العنوان`, 48),
        a(`items.${i}.text`, `Card ${i + 1} — line`, `البطاقة ${i + 1} — السطر`, 110),
      ]),
      a('fields.closing', 'Closing line', 'السطر الختامي', 140),
    ],
  },
  {
    id: 'two-horizons', anchor: '#what-we-do',
    name: { en: 'Two horizons', ar: 'أفقان' },
    desc: { en: 'Eight strategic objectives, four under each side.', ar: 'ثمانية أهداف استراتيجية، أربعة لكل جانب.' },
    fields: (s) => [
      t('fields.eyebrow', 'Eyebrow', 'العنوان التمهيدي', 40),
      t('fields.heading', 'Heading', 'العنوان', 60),
      t('fields.todayTitle', 'Today — title', 'اليوم — العنوان', 40),
      t('fields.todaySub', 'Today — subline', 'اليوم — السطر', 80),
      ...items(s, 'today').flatMap((_, i) => [
        t(`today.${i}.title`, `Today ${n2(i)} — name`, `اليوم ${n2(i)} — الاسم`, 40),
        a(`today.${i}.text`, `Today ${n2(i)} — line`, `اليوم ${n2(i)} — السطر`, 110),
      ]),
      t('fields.tomorrowTitle', 'Tomorrow — title', 'الغد — العنوان', 40),
      t('fields.tomorrowSub', 'Tomorrow — subline', 'الغد — السطر', 80),
      ...items(s, 'tomorrow').flatMap((_, i) => [
        t(`tomorrow.${i}.title`, `Tomorrow ${n2(i + 4)} — name`, `الغد ${n2(i + 4)} — الاسم`, 40),
        a(`tomorrow.${i}.text`, `Tomorrow ${n2(i + 4)} — line`, `الغد ${n2(i + 4)} — السطر`, 110),
      ]),
      a('fields.caption', 'Centre caption', 'التعليق الأوسط', 100),
    ],
  },
  {
    id: 'mission-vision', anchor: '#values',
    name: { en: 'Mission & vision', ar: 'الرسالة والرؤية' },
    desc: { en: 'Word for word from the company profile.', ar: 'منقولة حرفياً من الملف التعريفي.' },
    fields: () => [a('fields.mission', 'Mission', 'الرسالة'), a('fields.vision', 'Vision', 'الرؤية')],
  },
  {
    id: 'values', anchor: '#values',
    name: { en: 'ICARE values', ar: 'القيم' },
    desc: { en: 'Five values, word for word from the profile.', ar: 'خمس قيم منقولة حرفياً من الملف التعريفي.' },
    fields: (s) => [
      t('fields.eyebrow', 'Eyebrow', 'العنوان التمهيدي', 40),
      t('fields.heading', 'Heading', 'العنوان', 60),
      a('fields.intro', 'Introduction', 'المقدمة', 160),
      ...items(s).flatMap((it, i) => {
        const letter = (it as { letter?: string }).letter ?? String(i + 1);
        return [
          t(`items.${i}.name`, `${letter} — name`, `${letter} — الاسم`, 24),
          a(`items.${i}.text`, `${letter} — text`, `${letter} — النص`),
        ];
      }),
    ],
  },
  {
    id: 'why', anchor: '#why',
    name: { en: 'Why GHERAS', ar: 'لماذا غراس' },
    desc: { en: 'Five differentiators, each with a circle photo.', ar: 'خمسة عناصر تميّز، لكل منها صورة دائرية.' },
    fields: (s) => [
      t('fields.eyebrow', 'Eyebrow', 'العنوان التمهيدي', 40),
      t('fields.heading', 'Heading', 'العنوان', 70),
      a('fields.intro', 'Introduction', 'المقدمة', 160),
      ...items(s).flatMap((_, i): FieldDef[] => [
        // 50 in the prototype; the approved title 03 is 51 characters, so the limit leaves room for it.
        t(`items.${i}.title`, `${n2(i)} — Title`, `${n2(i)} — العنوان`, 56),
        a(`items.${i}.text`, `${n2(i)} — Text`, `${n2(i)} — النص`, 200),
        { kind: 'image', path: `items.${i}.mediaId`, label: { en: `${n2(i)} — Photo`, ar: `${n2(i)} — الصورة` }, preset: 'circle' },
      ]),
    ],
  },
  {
    id: 'who', anchor: '#why',
    name: { en: 'Who we work with', ar: 'مع من نعمل' },
    desc: { en: 'Four audience panels. Each link pre-selects the inquiry type.', ar: 'أربع لوحات للجمهور؛ كل رابط يختار نوع الاستفسار مسبقاً.' },
    fields: (s) => [
      t('fields.eyebrow', 'Eyebrow', 'العنوان التمهيدي', 40),
      t('fields.heading', 'Heading', 'العنوان', 60),
      ...items(s).flatMap((_, i) => [
        t(`items.${i}.title`, `Panel ${i + 1} — title`, `اللوحة ${i + 1} — العنوان`, 40),
        a(`items.${i}.text`, `Panel ${i + 1} — sentence`, `اللوحة ${i + 1} — الجملة`, 130),
        t(`items.${i}.cta`, `Panel ${i + 1} — link`, `اللوحة ${i + 1} — الرابط`, 40),
      ]),
    ],
  },
  {
    id: 'contact', anchor: '#contact',
    name: { en: 'Contact', ar: 'التواصل' },
    desc: { en: 'Headline and form. Contact details live in Site settings.', ar: 'العنوان والنموذج. بيانات التواصل في إعدادات الموقع.' },
    fields: () => [
      t('fields.eyebrow', 'Eyebrow', 'العنوان التمهيدي', 40),
      t('fields.heading', 'Headline', 'العنوان', 50),
      a('fields.intro', 'Introduction', 'المقدمة', 200),
      t('fields.slogan', 'Slogan', 'الشعار', 50),
    ],
  },
  {
    id: 'footer', anchor: '#contact',
    name: { en: 'Footer', ar: 'التذييل' },
    desc: { en: 'Endorsement and social links live in Site settings.', ar: 'سطر الانتماء وروابط التواصل في إعدادات الموقع.' },
    fields: () => [t('fields.copyright', 'Copyright', 'حقوق النشر', 60)],
  },
];

export const sectionDef = (id: string) => SECTION_DEFS.find((d) => d.id === id);

/** Mission & vision and ICARE values are approved wording: locked until explicitly unlocked. */
export const LOCKED: SectionId[] = ['mission-vision', 'values'];

/** Hero always opens the page and the footer always closes it; the rest can be reordered. */
export const FIXED_POSITION: SectionId[] = ['hero', 'footer'];

/** Site settings fields with limits (SEO). */
export const SETTINGS_LIMITS: Record<string, number> = { 'seo.title': 60, 'seo.description': 155 };

/** Every bilingual text field in the content, with its limit, for checks across the whole draft. */
export function allTextFields(c: SiteContent): { section: SectionDef; field: Extract<FieldDef, { kind: 'text' | 'area' }>; s: Section }[] {
  const out: { section: SectionDef; field: Extract<FieldDef, { kind: 'text' | 'area' }>; s: Section }[] = [];
  for (const s of c.sections) {
    const def = sectionDef(s.id);
    if (!def) continue;
    for (const f of def.fields(s)) if (f.kind === 'text' || f.kind === 'area') out.push({ section: def, field: f, s });
  }
  return out;
}
