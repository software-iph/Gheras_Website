import { getSection, pick } from '@/content';
import type { Lang, Section, SiteContent } from '@/content/types';
import {
  Belief, Contact, Figures, Hero, MissionVision, TwoHorizons, Values, WhatWeDo, Who, Why, figuresReady, type Ctx,
} from './sections';
import { Chrome } from './Chrome';
import { Footer } from './Footer';
import { Motion } from './Motion';
import { motionGuardScript } from './motion-guard';

function renderSection(s: Section, ctx: Ctx) {
  switch (s.id) {
    case 'hero': return <Hero key={s.id} s={s} ctx={ctx} />;
    case 'about': return <Belief key={s.id} s={s} ctx={ctx} />;
    case 'figures': return figuresReady(s) ? <Figures key={s.id} s={s} ctx={ctx} /> : null;
    case 'what-we-do': return <WhatWeDo key={s.id} s={s} ctx={ctx} />;
    case 'two-horizons': return <TwoHorizons key={s.id} s={s} ctx={ctx} />;
    case 'mission-vision': return <MissionVision key={s.id} s={s} ctx={ctx} />;
    case 'values': return <Values key={s.id} s={s} ctx={ctx} />;
    case 'why': return <Why key={s.id} s={s} ctx={ctx} />;
    case 'who': return <Who key={s.id} s={s} ctx={ctx} />;
    case 'contact': return <Contact key={s.id} s={s} ctx={ctx} />;
    case 'footer': return null;
  }
}

/** The one-page site, rendered from a content snapshot (published, or the draft in preview). */
export function SitePage({ lang, content, preview = false, embed = false }: { lang: Lang; content: SiteContent; preview?: boolean; embed?: boolean }) {
  const ctx: Ctx = { lang, content };
  const sections = content.sections
    .filter((s) => s.visible || s.id === 'figures')
    .sort((a, b) => a.order - b.order);
  const hero = getSection(content, 'hero');
  const footer = getSection(content, 'footer');
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: motionGuardScript }} />
      <Chrome lang={lang} ctaLabel={pick(hero?.fields.primaryCta, lang) ?? ''} />
      <main id="top">{sections.map((s) => renderSection(s, ctx))}</main>
      {footer?.visible !== false && <Footer lang={lang} content={content} section={footer} />}
      <Motion rtl={lang === 'ar'} />
      {preview && !embed && <div className="preview-badge" lang="en">DRAFT PREVIEW</div>}
      {/* In the editor's scaled iframe (2300 px tall) the hero keeps a normal screen height. */}
      {embed && <style>{'.hero{min-height:max(640px,min(100vh,900px))}'}</style>}
    </>
  );
}
