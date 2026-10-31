import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { fontVariables } from '../../fonts';
import { getPublishedContent, pick } from '@/content';
import { LANGS, isLang } from '@/content/types';
import '@/styles/tokens.css';
import '@/styles/site.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
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
