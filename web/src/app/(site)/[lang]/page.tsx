import { notFound } from 'next/navigation';
import { getPublishedContent } from '@/content';
import { isLang } from '@/content/types';
import { SitePage } from '@/components/site/SitePage';

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <SitePage lang={lang} content={await getPublishedContent()} />;
}
