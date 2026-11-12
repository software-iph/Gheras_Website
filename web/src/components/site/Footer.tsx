import { pick } from '@/content';
import type { FooterSection, Lang, SiteContent, SocialKey } from '@/content/types';
import { careersUi } from '@/i18n/careers';
import { ui, type NavId } from '@/i18n/ui';
import { LogoHorizontal } from '@/components/brand/Logo';

const NAV: NavId[] = ['about', 'what-we-do', 'values', 'why', 'contact'];
const SOCIAL: SocialKey[] = ['linkedin', 'instagram', 'x', 'facebook', 'youtube'];

export function Footer({ lang, content, section, page = 'home', careers = false }: {
  lang: Lang; content: SiteContent; section?: FooterSection; page?: 'home' | 'careers'; careers?: boolean;
}) {
  const base = page === 'home' ? '' : `/${lang}`;
  const t = ui[lang];
  const { endorsement, social } = content.site;
  const endorse = endorsement.visible ? pick(endorsement.text, lang) : null;
  const links = SOCIAL.filter((k) => social[k]);
  return (
    <footer className="ftr">
      <div className="ftr__furrows" aria-hidden="true" />
      <div className="wrap">
        <div className="ftr__top">
          <div className="ftr__brand">
            <LogoHorizontal scheme="reversed" rtl={lang === 'ar'} width={240} alt={lang === 'ar' ? 'غراس للاستثمار الزراعي' : 'GHERAS Agricultural Investment'} />
            {endorse && <span className="ftr__endorse">{endorse}</span>}
          </div>
          <nav aria-label={t.footerNavLabel} className="ftr__nav">
            {NAV.map((id) => <a key={id} href={`${base}#${id}`}>{t.nav[id]}</a>)}
            {careers && <a href={`/${lang}/careers`}>{careersUi[lang].nav}</a>}
          </nav>
          <div className="ftr__social">
            <span className="ftr__social-label">{t.follow}</span>
            {links.length
              ? links.map((k) => <a key={k} href={social[k]!} rel="noopener noreferrer" target="_blank">{t.social[k]}</a>)
              : <span className="ph ph--dark">{t.socialPlaceholder}</span>}
          </div>
        </div>
        <div className="ftr__rule" />
        <div className="ftr__bottom">
          <span>{pick(section?.fields.copyright, lang)}</span>
          <div className="ftr__langs">
            <span className="ftr__current">{t.thisLang}</span>
            <span aria-hidden="true">·</span>
            <a href={page === 'careers' ? `/${t.otherLang.lang}/careers` : `/${t.otherLang.lang}`} lang={t.otherLang.lang} hrefLang={t.otherLang.lang} className="ftr__other">{t.otherLang.label}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
