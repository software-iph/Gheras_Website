'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/content/types';
import { careersUi } from '@/i18n/careers';
import { ui, type NavId } from '@/i18n/ui';
import { Arrow, Icon } from '@/components/brand/Icon';
import { LogoHorizontal } from '@/components/brand/Logo';

const NAV: NavId[] = ['about', 'what-we-do', 'values', 'why', 'contact'];

/**
 * Fixed header (+ mobile menu), progress bar, growing stem and back-to-top.
 * They share one rAF-throttled scroll listener. Stem and bar track position even with reduced motion.
 */
export function Chrome({ lang, ctaLabel, page = 'home', careers = false }: {
  lang: Lang; ctaLabel: string;
  /** Which page this is: on the careers page, section links point back to the home page. */
  page?: 'home' | 'careers';
  /** Show the Careers link (when careers is switched on in the dashboard). */
  careers?: boolean;
}) {
  const t = ui[lang];
  const base = page === 'home' ? '' : `/${lang}`;
  const careersHref = `/${lang}/careers`;
  const rtl = lang === 'ar';
  const other = t.otherLang;
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<NavId | ''>('');
  const [showTop, setShowTop] = useState(false);
  const [nodes, setNodes] = useState<number[]>([]);
  const [on, setOn] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<number[]>([]);

  const onScroll = useCallback(() => {
    const y = scrollY, vh = innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const prog = Math.min(1, y / max);
    setSolid(y > 80);
    setShowTop(y > vh * 1.5);
    let a: NavId | '' = '';
    for (const id of NAV) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < 160) a = id;
    }
    setActive(a);
    setOn(nodesRef.current.filter((f) => prog >= f - 0.002).length);
    if (lineRef.current) lineRef.current.style.transform = `scaleY(${prog.toFixed(4)})`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${prog.toFixed(4)})`;
  }, []);

  const layout = useCallback(() => {
    const vh = innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const fr = [...document.querySelectorAll<HTMLElement>('main > section[data-section]')].slice(1)
      .map((sc) => Math.min(1, Math.max(0, (sc.getBoundingClientRect().top + scrollY - vh * 0.5) / max)));
    nodesRef.current = fr;
    setNodes(fr);
    onScroll();
  }, [onScroll]);

  useEffect(() => {
    let raf = 0;
    const tick = () => { raf = 0; onScroll(); };
    const scroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', layout);
    layout();
    document.fonts?.ready.then(layout);
    const late = setTimeout(layout, 1200);
    return () => {
      removeEventListener('scroll', scroll);
      removeEventListener('resize', layout);
      clearTimeout(late);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [layout, onScroll]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const langHref = page === 'careers' ? `/${other.lang}/careers` : `/${other.lang}${active ? `#${active}` : ''}`;

  return (
    <>
      <header className={solid ? 'hdr is-solid' : 'hdr'}>
        <div className="hdr__in">
          <a href={`${base}#top`} aria-label={t.backToTopLogo} className="hdr__logo">
            <span className="hdr__logo-rev"><LogoHorizontal scheme="reversed" rtl={rtl} width={200} /></span>
            <span className="hdr__logo-full"><LogoHorizontal scheme="full" rtl={rtl} width={200} /></span>
          </a>
          <nav aria-label={t.navLabel} className="hdr__nav">
            <div className="hdr__links">
              {NAV.map((id) => (
                <a key={id} href={`${base}#${id}`} className="hdr__link" aria-current={active === id ? 'true' : undefined}>{t.nav[id]}</a>
              ))}
              {careers && (
                <a href={careersHref} className="hdr__link" aria-current={page === 'careers' ? 'page' : undefined}>{careersUi[lang].nav}</a>
              )}
            </div>
            <a href={langHref} lang={other.lang} hrefLang={other.lang} className="lang-pill hdr__desk">
              <Icon glyph="globe" size={16} color="currentColor" accent="currentColor" />{other.label}
            </a>
            <a href={`${base}#contact`} className="btn btn--primary hdr__desk">{ctaLabel}<Arrow color="#FAF8F2" /></a>
            <button type="button" className="menu-btn" aria-label={t.openMenu} aria-expanded={menuOpen}
              aria-controls="site-menu" onClick={() => setMenuOpen(true)}>
              <span /><span /><span />
            </button>
          </nav>
        </div>
        <div className="hdr__bar" ref={barRef} aria-hidden="true" />
      </header>

      {menuOpen && <Menu lang={lang} ctaLabel={ctaLabel} langHref={langHref} base={base} careersHref={careers ? careersHref : null} onClose={closeMenu} />}

      <a href="#top" aria-label={t.backToTop} className={showTop ? 'to-top is-visible' : 'to-top'}>
        <span><Icon glyph="arrow" size={20} color="#FAF8F2" accent="#FAF8F2" /></span>
      </a>

      <div className="stem" aria-hidden="true">
        <div className="stem__track" />
        <div className="stem__line" ref={lineRef} />
        {nodes.map((f, i) => (
          <div key={i} className="stem__node" style={{
            top: `${(f * 100).toFixed(2)}%`,
            opacity: i < on ? 1 : 0,
            transform: `scale(${i < on ? 1 : 0.3}) rotate(${i % 2 ? 40 : -40}deg)`,
          }}>
            <svg viewBox="0 0 14 14" width="14" height="14"><path d="M1 7Q7 1.5 13 7Q7 12.5 1 7Z" fill={i % 2 ? '#8A9A4B' : '#C99A3B'} /></svg>
          </div>
        ))}
      </div>
    </>
  );
}

/** Full-screen mobile menu: traps focus, locks scroll, closes on Escape and returns focus to the trigger. */
function Menu({ lang, ctaLabel, langHref, base, careersHref, onClose }: {
  lang: Lang; ctaLabel: string; langHref: string; base: string; careersHref: string | null; onClose: () => void;
}) {
  const t = ui[lang];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = ref.current!;
    const focusables = () => [...root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const els = focusables();
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus?.();
    };
  }, [onClose]);

  return (
    <div id="site-menu" className="menu" role="dialog" aria-modal="true" aria-label={t.menuLabel} ref={ref}>
      <div className="menu__top">
        <LogoHorizontal scheme="reversed" rtl={lang === 'ar'} width={156} />
        <button type="button" className="menu__close" aria-label={t.closeMenu} onClick={onClose}><span /><span /></button>
      </div>
      <nav aria-label={t.menuLabel} className="menu__nav">
        {NAV.map((id) => <a key={id} href={`${base}#${id}`} className="menu__link" onClick={onClose}>{t.nav[id]}</a>)}
        {careersHref && <a href={careersHref} className="menu__link" onClick={onClose}>{careersUi[lang].nav}</a>}
      </nav>
      <div className="menu__spacer" />
      <div className="menu__actions">
        <a href={langHref} lang={t.otherLang.lang} hrefLang={t.otherLang.lang} className="menu__lang">
          <Icon glyph="globe" size={18} color="#FAF8F2" accent="#FAF8F2" />{t.otherLang.label}
        </a>
        <a href={`${base}#contact`} className="btn btn--gold menu__cta" onClick={onClose}>{ctaLabel}<Arrow color="#1F2A1C" /></a>
      </div>
    </div>
  );
}
