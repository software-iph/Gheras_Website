import 'server-only';
import published from './published.json';
import { getPublished } from '@/lib/cms/store';
import type { Lang, Localized, Media, SectionById, SectionId, SiteContent } from './types';

/**
 * Read API for published content: the latest published revision from the dashboard,
 * or the bundled seed (src/content/published.json) before anything has been published.
 * Publishing revalidates /en and /ar.
 */
export async function getPublishedContent(): Promise<SiteContent> {
  // Without a database (e.g. a build machine) the bundled seed is served until the first publish.
  if (!process.env.DATABASE_URL) return published as unknown as SiteContent;
  return (await getPublished())?.content ?? (published as unknown as SiteContent);
}

export function getSection<Id extends SectionId>(content: SiteContent, id: Id): SectionById<Id> | undefined {
  return content.sections.find((s) => s.id === id) as SectionById<Id> | undefined;
}

export function getMedia(content: SiteContent, id: string): Media | undefined {
  return content.media.find((m) => m.id === id);
}

/** Pick one language from a localized value. Missing values stay null so callers can show a placeholder. */
export function pick(value: Localized | null | undefined, lang: Lang): string | null {
  const v = value?.[lang];
  return v && v.trim() ? v : null;
}
