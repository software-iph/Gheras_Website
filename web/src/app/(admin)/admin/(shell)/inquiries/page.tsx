import type { Metadata } from 'next';
import Link from 'next/link';
import { InquiryActions } from '@/admin/InquiryActions';
import { TYPE_COLORS, dict, fullDate, initials, relTime } from '@/admin/i18n';
import { getAdminLang } from '@/admin/lang';
import { INQUIRY_TYPES, type InquiryType } from '@/content/types';
import { requireAdmin } from '@/lib/auth/session';
import { inquiryStore } from '@/lib/inquiries/store';

export const metadata: Metadata = { title: 'Inquiries' };

type F = 'all' | InquiryType | 'archived';

export default async function InquiriesPage({ searchParams }: PageProps<'/admin/inquiries'>) {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = dict(lang);
  const sp = await searchParams;
  const f: F = (INQUIRY_TYPES as string[]).includes(String(sp.type)) ? (sp.type as InquiryType) : sp.type === 'archived' ? 'archived' : 'all';
  const all = await inquiryStore.list();
  const list = all.filter((q) => (f === 'archived' ? q.status === 'archived' : q.status !== 'archived' && (f === 'all' || q.type === f)));
  const sel = all.find((q) => q.id === sp.id) ?? list[0];
  const qs = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    if (f !== 'all') p.set('type', f);
    for (const [k, v] of Object.entries(o)) if (v) p.set(k, v); else p.delete(k);
    const s = p.toString();
    return `/admin/inquiries${s ? `?${s}` : ''}`;
  };
  const filters: [F, string][] = [['all', t.all], ...INQUIRY_TYPES.map((k) => [k, t.inquiryTypes[k]] as [F, string]), ['archived', t.archived]];

  return (
    <div className="split">
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="chips" style={{ padding: 14, borderBottom: '1px solid rgba(31,42,28,.08)' }}>
          {filters.map(([k, label]) => (
            <Link key={k} href={k === 'all' ? '/admin/inquiries' : `/admin/inquiries?type=${k}`} className="chip"
              aria-pressed={f === k} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        {list.length === 0 && <p className="muted" style={{ padding: 14, margin: 0, fontSize: 14 }}>{t.noInquiries}</p>}
        {list.map((q) => {
          const [bg, ink] = TYPE_COLORS[q.type];
          const unread = !q.read;
          return (
            <Link key={q.id} href={qs({ id: q.id })} className="inq-row" aria-current={sel?.id === q.id ? 'true' : undefined}>
              <span className="unread-dot" style={{ background: unread ? '#C99A3B' : 'transparent' }} aria-label={unread ? 'unread' : undefined} />
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span dir="auto" style={{ fontWeight: unread ? 700 : 500, fontSize: 14 }}>{q.name}</span>
                  <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{relTime(q.createdAt, lang)}</span>
                </span>
                {q.organisation && <span className="muted" dir="auto" style={{ fontSize: 13 }}>{q.organisation}</span>}
                <span className="ellipsis" style={{ fontSize: 13 }} dir={q.pageLang === 'ar' ? 'rtl' : 'ltr'}>{q.message}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <span className="pill pill--sm" style={{ background: bg, color: ink }}>{t.inquiryTypes[q.type]}</span>
                  {q.status === 'replied' && <span className="pill pill--sm" style={{ background: '#E6EBDA', color: '#3F5A2A' }}>✓ {t.replied}</span>}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {sel ? (
        <article className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span className="avatar" style={{ width: 48, height: 48, background: '#EFE7D6' }}>{initials(sel.name)}</span>
              <div>
                <h2 className="d-h" dir="auto" style={{ fontSize: 24 }}>{sel.name}</h2>
                <div className="muted" style={{ fontSize: 14 }}>{sel.organisation || '—'} · {fullDate(sel.createdAt, lang)}</div>
              </div>
            </div>
            <span className="pill" style={{ padding: '6px 12px', background: TYPE_COLORS[sel.type][0], color: TYPE_COLORS[sel.type][1] }}>{t.inquiryTypes[sel.type]}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, fontSize: 13 }}>
            <div className="info-box"><div className="muted" style={{ marginBottom: 4 }}>{t.email}</div><div dir="ltr" style={{ fontWeight: 600, textAlign: 'start', wordBreak: 'break-all' }}>{sel.email}</div></div>
            <div className="info-box"><div className="muted" style={{ marginBottom: 4 }}>{t.phone}</div><div dir="ltr" style={{ fontWeight: 600, textAlign: 'start' }}>{sel.phone || '—'}</div></div>
            <div className="info-box"><div className="muted" style={{ marginBottom: 4 }}>{t.sentFrom}</div><div style={{ fontWeight: 600 }}>{sel.pageLang === 'ar' ? t.pageAr : t.pageEn}</div></div>
          </div>
          <div className={`msg ${sel.pageLang === 'ar' ? 'ar-text' : 'en-text'}`} dir={sel.pageLang === 'ar' ? 'rtl' : 'ltr'} lang={sel.pageLang}>{sel.message}</div>
          <InquiryActions key={sel.id} lang={lang} inquiry={sel} />
        </article>
      ) : (
        <div className="card" style={{ padding: 28 }}><p className="muted" style={{ margin: 0 }}>{t.noSelection}</p></div>
      )}
    </div>
  );
}
