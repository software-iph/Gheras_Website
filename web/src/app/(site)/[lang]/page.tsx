import { notFound } from 'next/navigation';
import { getPublishedContent } from '@/content';
import { isLang } from '@/content/types';
import { SitePage } from '@/components/site/SitePage';

// Rendered on first visit and cached; re-read the published content every 5 minutes as a safety net.
// Publishing revalidates /en and /ar immediately.
export const revalidate = 300;

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <SitePage lang={lang} content={await getPublishedContent()} />;
}
