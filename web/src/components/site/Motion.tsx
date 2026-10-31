'use client';

import { useEffect } from 'react';

const E = 'cubic-bezier(.22,.61,.36,1)';
const RISE: Keyframe[] = [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }];

/**
 * Progressive-enhancement motion layer (timings from the handoff motion table).
 * Each reveal plays once; only transform, opacity, clip-path and stroke are animated;
 * nothing runs with prefers-reduced-motion. No pinning, no scroll hijacking.
 */
export function Motion({ rtl }: { rtl: boolean }) {
  useEffect(() => {
    const root = document.documentElement;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('motion-done');
      return;
    }
    const q = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
    const qa = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
    const cleanups: (() => void)[] = [];
    let heroDone = false;

    /* Load sequence */
    const photo = q('[data-m=hero-photo]');
    if (photo) {
      const a = photo.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 1600, easing: E });
      a.onfinish = () => { heroDone = true; onScroll(); };
    }
    qa('[data-m=word]').forEach((w, i) => w.animate(RISE, { duration: 600, delay: 220 + i * 80, easing: E, fill: 'backwards' }));
    qa('[data-m=hero-in]').forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 600, delay: [80, 640, 860][i] ?? 860, easing: E, fill: 'backwards' },
    ));
    const art = q('[data-m=draw]');
    if (art) {
      qa<SVGGeometryElement>('path, ellipse', art).forEach((p) => {
        let L = 300;
        try { L = Math.ceil(p.getTotalLength()) || 300; } catch { /* keep default */ }
        p.animate(
          [{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }],
          { duration: 1200, delay: 400, easing: E, fill: 'backwards' },
        );
      });
    }
    // Animations now hold the hidden start state; release the pre-hydration CSS guard.
    root.classList.add('motion-done');

    /* Reveal on enter */
    const jobs = new Map<Element, Animation[]>();
    const add = (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) => {
      const a = el.animate(kf, { easing: E, fill: 'both', ...o });
      a.pause();
      a.currentTime = 0;
      a.onfinish = () => a.cancel();
      jobs.set(el, [...(jobs.get(el) ?? []), a]);
    };
    const sections = qa('main > section[data-section]').slice(1);
    for (const sec of sections) {
      const c = qa('[data-rv], h2, h3, p, article, li, form > label, dl, form > div:not(.hp)', sec)
        .filter((el) => !el.closest('[data-m=hz-l],[data-m=hz-r]') && el.id !== 'belief');
      const set = new Set(c);
      const top = c.filter((el) => {
        for (let p = el.parentElement; p && p !== sec; p = p.parentElement) if (set.has(p)) return false;
        return true;
      });
      const idx = new Map<Element | null, number>();
      top.forEach((el) => {
        const k = el.parentElement, i = idx.get(k) ?? 0;
        idx.set(k, i + 1);
        add(el, RISE, { duration: 560, delay: Math.min(i, 6) * 70 });
      });
      // Gold Rule grows toward its label.
      qa('.rule', sec).forEach((sp) => {
        const lead = sp.dataset.rule === 'lead';
        sp.style.transformOrigin = lead !== rtl ? 'right' : 'left';
        add(sp, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 600, delay: 80 });
      });
      qa('[data-m=ring]', sec).forEach((r, i) =>
        add(r, [{ strokeDasharray: '0 100' }, { strokeDasharray: '25 75' }], { duration: 1200, delay: 200 + i * 80 }));
      const dx = rtl ? -64 : 64;
      qa('[data-m=hz-l]', sec).forEach((el) => add(el, [{ opacity: 0, transform: `translateX(${dx}px)` }, { opacity: 1, transform: 'none' }], { duration: 800 }));
      qa('[data-m=hz-r]', sec).forEach((el) => add(el, [{ opacity: 0, transform: `translateX(${-dx}px)` }, { opacity: 1, transform: 'none' }], { duration: 800 }));
      qa('[data-m=hz-c]', sec).forEach((el) => add(el, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }], { duration: 700 }));
      qa('[data-m=hz-l],[data-m=hz-r]', sec).forEach((col) =>
        qa('[data-m=hz-i]', col).forEach((li, i) => add(li, RISE, { duration: 560, delay: 320 + i * 90 })));
      qa('[data-m=iris]', sec).forEach((el) =>
        add(el, [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(50% at 50% 50%)' }], { duration: 900 }));
    }
    const play = (el: Element) => { jobs.get(el)?.forEach((a) => a.play()); jobs.delete(el); };
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { play(en.target); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    const vh = innerHeight;
    jobs.forEach((_, el) => { if (el.getBoundingClientRect().top < vh * 0.94) play(el); else io.observe(el); });
    cleanups.push(() => io.disconnect());

    /* Scroll-linked: hero depth, belief words, mission pattern drift */
    const dim = q('[data-m=hero-dim]');
    const belief = q('#belief');
    const lit = qa('[data-m=lit]');
    lit.forEach((w) => { w.style.transition = `opacity .35s ${E}`; });
    const drift = q('[data-m=drift]');
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    function onScroll() {
      const y = scrollY, h = innerHeight;
      if (photo && heroDone && innerWidth >= 1024) photo.style.transform = `translateY(${(y * 0.25).toFixed(1)}px)`;
      if (dim) dim.style.opacity = (clamp(y / (h * 0.9)) * 0.55).toFixed(3);
      if (belief && lit.length) {
        const p = clamp((h * 0.82 - belief.getBoundingClientRect().top) / (h * 0.42));
        lit.forEach((w, i) => {
          const o = (i + 0.5) / lit.length <= p ? '1' : '.18';
          if (w.style.opacity !== o) w.style.opacity = o;
        });
      }
      if (drift) {
        const r = drift.getBoundingClientRect(), tt = (h - r.top) / (h + r.height);
        drift.style.transform = `translateY(${((tt - 0.5) * -40).toFixed(1)}px)`;
      }
    }
    let raf = 0;
    const onScrollRaf = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; onScroll(); }); };
    addEventListener('scroll', onScrollRaf, { passive: true });
    onScroll();
    cleanups.push(() => { removeEventListener('scroll', onScrollRaf); if (raf) cancelAnimationFrame(raf); });

    return () => cleanups.forEach((fn) => fn());
  }, [rtl]);

  return null;
}

