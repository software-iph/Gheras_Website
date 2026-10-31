import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang } from '@/content/types';
import { SitePage } from '@/components/site/SitePage';
import { requireAdmin } from '@/lib/auth/session';
import { getDraft } from '@/lib/cms/store';

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** The working draft, rendered exactly like the live page. Admin only; used by the editor's live preview. */
export default async function PreviewPage({ params, searchParams }: PageProps<'/[lang]/preview'>) {
  await requireAdmin();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const { embed } = await searchParams;
  return <SitePage lang={lang} content={await getDraft()} preview embed={embed === '1'} />;
}
