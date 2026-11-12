// Careers types and limits shared by the site, the dashboard and the server. Keep free of server-only imports.
import type { Lang, Localized } from '@/content/types';

export const EMPLOYMENT = ['full-time', 'part-time', 'contract', 'internship'] as const;
export type Employment = (typeof EMPLOYMENT)[number];

export const APP_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected', 'archived'] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export type Job = {
  id: string;
  title: Localized;
  department: Localized;
  location: Localized;
  employment: Employment;
  description: Localized;
  applyMode: 'form' | 'link';
  applyUrl: string | null;
  status: 'open' | 'closed';
  sort: number;
  createdAt: string;
  updatedAt: string;
};

/** A blank job for the "New job" form. */
export const newJob = (): Omit<Job, 'createdAt' | 'updatedAt'> => ({
  id: '', title: { en: '', ar: '' }, department: { en: '', ar: '' }, location: { en: '', ar: '' }, employment: 'full-time',
  description: { en: '', ar: '' }, applyMode: 'form', applyUrl: null, status: 'open', sort: 0,
});

/** Live settings for the careers page (stored in app_settings under "careers"). */
export type CareersSettings = {
  /** Show the Careers page and its links on the site. */
  enabled: boolean;
  intro: Localized;
  /** Offer a "general application" (not for a specific job). */
  general: boolean;
};

export const DEFAULT_CAREERS: CareersSettings = {
  enabled: false,
  intro: {
    en: 'Help us grow Libyan agriculture. We look for people who care about land, water and long-term results.',
    ar: 'ساهم معنا في تنمية الزراعة الليبية. نبحث عن أشخاص يهتمون بالأرض والماء والنتائج طويلة الأمد.',
  },
  general: true,
};

export type Application = {
  id: string;
  jobId: string | null;
  jobTitle: string | null;
  name: string;
  email: string;
  phone: string | null;
  link: string | null;
  message: string;
  cv: { name: string; original: string; type: string; size: number } | null;
  pageLang: Lang;
  status: AppStatus;
  read: boolean;
  notes: string;
  createdAt: string;
};

/** CV upload rules (checked in the browser and again on the server). */
export const CV_MAX_BYTES = 10 * 1024 * 1024;
export const CV_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export type ApplyResult =
  | { ok: true }
  | { ok: false; error: 'invalid' | 'cv' | 'cv-size' | 'closed' | 'rate' | 'server' };
