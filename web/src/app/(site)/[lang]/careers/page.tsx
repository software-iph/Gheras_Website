import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedContent, getSection, pick } from '@/content';
import { isLang } from '@/content/types';
import { CareersList } from '@/components/site/Careers';
import { Chrome } from '@/components/site/Chrome';
import { Eyebrow } from '@/components/site/Eyebrow';
import { Footer } from '@/components/site/Footer';
import { Motion } from '@/components/site/Motion';
import { Track } from '@/components/site/Track';
import { motionGuardScript } from '@/components/site/motion-guard';
import { careersUi } from '@/i18n/careers';
import { publicCareers } from '@/lib/careers/public';

// Rendered on first visit and cached; job changes in the dashboard revalidate it immediately.
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<'/[lang]/careers'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = careersUi[lang];
  return {
    title: `${t.nav} — ${lang === 'ar' ? 'غراس' : 'GHERAS'}`,
    alternates: { canonical: `/${lang}/careers`, languages: { en: '/en/careers', ar: '/ar/careers', 'x-default': '/en/careers' } },
  };
}

export default async function CareersPage({ params }: PageProps<'/[lang]/careers'>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [content, { settings, jobs }] = await Promise.all([getPublishedContent(), publicCareers()]);
  if (!settings.enabled) notFound();
  const t = careersUi[lang];
  const hero = getSection(content, 'hero');
  const footer = getSection(content, 'footer');
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: motionGuardScript }} />
      <Chrome lang={lang} ctaLabel={pick(hero?.fields.primaryCta, lang) ?? ''} page="careers" careers />
      <main id="top">
        <section data-section="careers-hero" className="careers-hero" aria-labelledby="careers-h">
          <div className="careers-hero__inner">
            <Eyebrow dark>{t.eyebrow}</Eyebrow>
            <h1 id="careers-h" className="careers-hero__title">{t.title}</h1>
            {pick(settings.intro, lang) && <p className="careers-hero__intro">{pick(settings.intro, lang)}</p>}
          </div>
        </section>
        <section data-section="jobs" className="section careers">
          <div className="wrap">
            <CareersList lang={lang} jobs={jobs} general={settings.general} />
          </div>
        </section>
      </main>
      {footer?.visible !== false && <Footer lang={lang} content={content} section={footer} page="careers" careers />}
      <Motion rtl={lang === 'ar'} />
      <Track />
    </>
  );
}
