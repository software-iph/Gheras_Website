import { notFound } from 'next/navigation';
import { getPublishedContent } from '@/content';
import { isLang } from '@/content/types';
import { SitePage } from '@/components/site/SitePage';

// Pages are pre-rendered at build time (from the seed when the build has no database), so
// re-read the published content periodically; publishing also revalidates immediately.
export const revalidate = 300;

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <SitePage lang={lang} content={await getPublishedContent()} />;
}
