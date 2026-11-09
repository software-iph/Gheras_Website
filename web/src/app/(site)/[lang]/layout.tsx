import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { fontVariables } from '../../fonts';
import { getPublishedContent, pick } from '@/content';
import { isLang } from '@/content/types';
import '@/styles/tokens.css';
import '@/styles/site.css';

/**
 * No pages are built ahead of time: the build has no database, so a build-time page would show the
 * bundled seed (and a localhost SITE_URL) after every deploy. /en and /ar are rendered from the
 * published content on their first visit, then cached (see `revalidate` in page.tsx).
 * Other values are rejected by `isLang` below.
 */
export function generateStaticParams() {
  return [];
}

export const viewport: Viewport = { themeColor: '#1F2A1C' };

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const { site, media } = await getPublishedContent();
  const share = site.seo.shareImage ? media.find((m) => m.id === site.seo.shareImage) : undefined;
  const title = pick(site.seo.title, lang) ?? 'GHERAS';
  const description = pick(site.seo.description, lang) ?? undefined;
  return {
    metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
    title,
    description,
    alternates: {
      canonical: `/${lang}`,
      languages: { en: '/en', ar: '/ar', 'x-default': '/en' },
    },
    openGraph: {
      title,
      description,
      locale: lang === 'ar' ? 'ar_LY' : 'en',
      type: 'website',
      ...(share?.url ? { images: [{ url: share.url, width: share.width ?? 1200, height: share.height ?? 630 }] } : {}),
    },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
