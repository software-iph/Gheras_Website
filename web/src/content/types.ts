// Content model — mirrors the handoff README "Data model" and content.seed.json.

export const LANGS = ['en', 'ar'] as const;
export type Lang = (typeof LANGS)[number];
export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);

export type Localized = { en: string | null; ar: string | null };

export type InquiryType = 'Investment' | 'Partnership' | 'Supply' | 'Careers' | 'Other';
export const INQUIRY_TYPES: InquiryType[] = ['Investment', 'Partnership', 'Supply', 'Careers', 'Other'];

export type Media = {
  id: string;
  brief: string;
  ratio: string;
  minWidth: number;
  url: string | null;
  width: number | null;
  height: number | null;
  focal: { x: number; y: number };
  alt: Localized;
  /** Original file name of the uploaded image. */
  file?: string;
};

export type MediaRef = { mediaId: string; alt?: Localized };

export type Item = { title: Localized; text: Localized };

type SectionBase<Id extends string, F, Extra = object> = {
  id: Id;
  order: number;
  visible: boolean;
  locked?: boolean;
  fields: F;
} & Extra;

export type HeroSection = SectionBase<'hero', {
  eyebrow: Localized; headline: Localized; sub: Localized;
  primaryCta: Localized; secondaryCta: Localized; image: MediaRef;
}>;
export type AboutSection = SectionBase<'about', { eyebrow: Localized; statement: Localized; p1: Localized; p2: Localized }>;
export type FiguresSection = Omit<SectionBase<'figures', Record<string, never>>, 'fields'> & {
  fields?: Record<string, never>;
  items: { value: number | null; label: Localized }[];
};
export type WhatWeDoSection = SectionBase<'what-we-do',
  { eyebrow: Localized; heading: Localized; intro: Localized; closing: Localized },
  { items: (Item & { icon: string })[] }>;
export type TwoHorizonsSection = SectionBase<'two-horizons',
  { eyebrow: Localized; heading: Localized; todayTitle: Localized; todaySub: Localized;
    tomorrowTitle: Localized; tomorrowSub: Localized; caption: Localized },
  { today: Item[]; tomorrow: Item[] }>;
export type MissionVisionSection = SectionBase<'mission-vision', { mission: Localized; vision: Localized }>;
export type ValuesSection = SectionBase<'values',
  { eyebrow: Localized; heading: Localized; intro: Localized },
  { items: { letter: string; icon: string; name: Localized; text: Localized }[] }>;
export type WhySection = SectionBase<'why',
  { eyebrow: Localized; heading: Localized; intro: Localized },
  { items: (Item & { mediaId: string })[] }>;
export type WhoSection = SectionBase<'who',
  { eyebrow: Localized; heading: Localized },
  { items: (Item & { icon: string; inquiryType: InquiryType; cta: Localized })[] }>;
export type ContactSection = SectionBase<'contact', { eyebrow: Localized; heading: Localized; intro: Localized; slogan: Localized }>;
export type FooterSection = SectionBase<'footer', { copyright: Localized }>;

export type Section =
  | HeroSection | AboutSection | FiguresSection | WhatWeDoSection | TwoHorizonsSection
  | MissionVisionSection | ValuesSection | WhySection | WhoSection | ContactSection | FooterSection;
export type SectionId = Section['id'];
export type SectionById<Id extends SectionId> = Extract<Section, { id: Id }>;

export type SocialKey = 'linkedin' | 'instagram' | 'x' | 'facebook' | 'youtube';

export type Settings = {
  /** shareImage is a media id (1200 × 630). */
  seo: { title: Localized; description: Localized; shareImage: string | null };
  contact: { email: string | null; phone: string | null; address: Localized; replyTimeDays: number | null };
  social: Record<SocialKey, string | null>;
  endorsement: { visible: boolean; text: Localized };
};

export type SiteContent = { site: Settings; sections: Section[]; media: Media[] };
