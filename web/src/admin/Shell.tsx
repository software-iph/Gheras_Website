'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Icon } from '@/components/brand/Icon';
import { LogoHorizontal } from '@/components/brand/Logo';
import { setAdminLang, signOut } from '@/lib/auth/actions';
import { publish } from '@/lib/cms/actions';
import { dict, initials, type UILang } from './i18n';

export type PublishSummary = {
  pending: number;
  overLimit: number;
  emptyEn: number;
  badUrls: number;
  imageProblems: number;
  emptyAr: number;
  placeholders: number;
  /** Fields that block publishing, named for the dialog (first few). */
  blockers: { where: { en: string; ar: string }; lang?: 'en' | 'ar'; detail?: string }[];
};

const NAV = [
  { href: '/admin', key: 'overview', icon: 'pivot' },
  { href: '/admin/editor', key: 'editor', icon: 'crop' },
  { href: '/admin/media', key: 'media', icon: 'land' },
  { href: '/admin/inquiries', key: 'inbox', icon: 'mail' },
  { href: '/admin/history', key: 'history', icon: 'commitment' },
  { href: '/admin/settings', key: 'settings', icon: 'excellence' },
  { href: '/admin/users', key: 'users', icon: 'partner' },
] as const;

export function Shell({ lang, user, unread, summary, children }: {
  lang: UILang;
  user: { name: string };
  unread: number;
  summary: PublishSummary;
  children: React.ReactNode;
}) {
  const t = dict(lang);
  const path = usePathname();
  const router = useRouter();
  const [publishOpen, setPublishOpen] = useState(false);
  const current = NAV.find((n) => (n.href === '/admin' ? path === '/admin' : path.startsWith(n.href))) ?? NAV[0];

  // Other screens (overview card, publish links) open the dialog via ?publish=1 or this event.
  useEffect(() => {
    const open = () => setPublishOpen(true);
    window.addEventListener('gheras:publish', open);
    return () => window.removeEventListener('gheras:publish', open);
  }, []);

  const toggleLang = async () => {
    await setAdminLang(lang === 'ar' ? 'en' : 'ar');
    router.refresh();
  };

  return (
    <div className="shell">
      <aside className="side">
        <div className="side__logo"><LogoHorizontal scheme="reversed" rtl={lang === 'ar'} width={168} alt={lang === 'ar' ? 'غراس' : 'GHERAS'} /></div>
        <nav className="side__nav" aria-label={lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}>
          {NAV.map((n) => {
            const on = n === current;
            const label = t[n.key];
            return (
              <Link key={n.href} href={n.href} className="side__item" aria-current={on ? 'page' : undefined}>
                <Icon glyph={n.icon} size={20} color={on ? '#FAF8F2' : '#E8D3A0'} accent="#C99A3B" />
                <span>{label}</span>
                {n.key === 'inbox' && unread > 0 && <span className="badge" aria-label={`${unread} ${t.hInq}`}>{unread}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="side__foot">
          <div className="side__user">
            <span className="avatar" style={{ width: 36, height: 36, background: '#3F5A2A', fontSize: 13 }}>{initials(user.name)}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span className="ellipsis" style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: 12, color: '#E8D3A0' }}>{t.admin}</span>
            </span>
          </div>
          <div className="side__btns">
            <button type="button" className="side__btn" lang={lang === 'ar' ? 'en' : 'ar'} onClick={toggleLang}>{t.otherLang}</button>
            <form action={signOut} style={{ flex: 1, display: 'flex' }}><button type="submit" className="side__btn">{t.signOut}</button></form>
          </div>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="top">
          <h1 className="d-h top__title">{t[current.key]}</h1>
          {summary.pending > 0 && <span className="draft-chip">{t.draftChip(summary.pending)}</span>}
          <a href={`/${lang}/preview`} target="_blank" rel="noopener" className="b b--md b--secondary">{t.previewSite}</a>
          <button type="button" className="b b--md b--primary" onClick={() => setPublishOpen(true)}>{t.publish}</button>
        </header>
        <main className="main">{children}</main>
      </div>

      {publishOpen && <PublishDialog lang={lang} summary={summary} onClose={() => setPublishOpen(false)} />}
    </div>
  );
}

function PublishDialog({ lang, summary: s, onClose }: { lang: UILang; summary: PublishSummary; onClose: () => void }) {
  const t = dict(lang);
  const router = useRouter();
  const [note, setNote] = useState('');
  const [pending, start] = useTransition();
  const [result, setResult] = useState<'published' | 'blocked' | 'nothing' | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const blocked = s.overLimit + s.emptyEn + s.badUrls > 0;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('input, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !ref.current) return;
      const els = [...ref.current.querySelectorAll<HTMLElement>('input, button:not([disabled])')];
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);

  const checks: { ok: boolean; warn?: boolean; text: string }[] = [
    s.overLimit ? { ok: false, text: t.c1bad(s.overLimit) } : { ok: true, text: t.c1ok },
    ...(s.emptyEn ? [{ ok: false, text: t.cEnBad(s.emptyEn) }] : []),
    ...(s.badUrls ? [{ ok: false, text: t.cUrlBad(s.badUrls) }] : []),
    s.imageProblems ? { ok: false, warn: true, text: t.c2bad(s.imageProblems) } : { ok: true, text: t.c2ok },
    s.emptyAr ? { ok: false, warn: true, text: t.c3(s.emptyAr) } : { ok: true, text: t.c3ok },
    ...(s.placeholders ? [{ ok: false, warn: true, text: t.c4(s.placeholders) }] : []),
  ];

  const go = () => start(async () => {
    const r = await publish(note);
    setResult(r.ok ? 'published' : r.error === 'blocked' ? 'blocked' : 'nothing');
    router.refresh();
  });

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="pub-title" ref={ref}>
        <h2 id="pub-title" className="d-h" style={{ fontSize: 28 }}>{t.pubTitle}</h2>
        {result === 'published' ? (
          <>
            <p role="status" className="check" style={{ background: '#E6EBDA', margin: 0 }}><strong style={{ color: '#3F5A2A' }}>✓</strong>{t.published}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="button" className="b b--primary" onClick={onClose}>OK</button></div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.pending ? t.pubBody(s.pending) : t.nothingToPublish}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {checks.map((c, i) => (
                <div key={i} className="check" style={{ background: c.ok ? '#E6EBDA' : c.warn ? '#F6EBD2' : '#F3E2D9' }}>
                  <span aria-hidden="true" style={{ fontWeight: 700, color: c.ok ? '#3F5A2A' : c.warn ? '#86621E' : '#8E3B24' }}>{c.ok ? '✓' : c.warn ? '⚠' : '✕'}</span>
                  <span style={{ flex: 1 }}>{c.text}</span>
                </div>
              ))}
            </div>
            <label className="field-label" style={{ fontSize: 13, gap: 6 }}>
              {t.pubNote}
              <input className="in" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.pubNotePh} maxLength={200} />
            </label>
            {s.blockers.length > 0 && (
              <ul style={{ margin: 0, paddingInlineStart: 20, fontSize: 13, lineHeight: 1.7, color: '#8E3B24' }}>
                {s.blockers.map((b, i) => (
                  <li key={i}>{b.where[lang]}{b.lang ? ` (${b.lang.toUpperCase()})` : ''}{b.detail ? ` · ${b.detail}` : ''}</li>
                ))}
              </ul>
            )}
            {result === 'blocked' && <p role="alert" className="err" style={{ margin: 0 }}>{t.c1bad(s.overLimit)}</p>}
            {result === 'nothing' && <p role="alert" className="err" style={{ margin: 0 }}>{t.nothingToPublish}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="b b--secondary" onClick={onClose}>{t.cancel}</button>
              <button type="button" className="b b--primary" onClick={go} disabled={pending || blocked || !s.pending}>
                {pending ? t.publishing : t.publishNow}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Open the publish dialog from anywhere inside the shell. */
export const openPublishDialog = () => window.dispatchEvent(new Event('gheras:publish'));
