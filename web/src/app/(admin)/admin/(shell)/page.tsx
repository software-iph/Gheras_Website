import Link from 'next/link';
import { dashboardState } from '@/admin/data';
import { TYPE_COLORS, dict, initials, relTime } from '@/admin/i18n';
import { getAdminLang } from '@/admin/lang';
import { PublishButton } from '@/admin/PublishButton';
import { Icon } from '@/components/brand/Icon';
import { requireAdmin } from '@/lib/auth/session';
import { listRevisions } from '@/lib/cms/store';

export default async function OverviewPage() {
  const admin = await requireAdmin();
  const lang = await getAdminLang();
  const t = dict(lang);
  const [state, revs] = await Promise.all([dashboardState(), listRevisions()]);
  const lastPub = revs.findLastIndex((r) => r.status === 'published');
  const pendingRevs = revs.slice(lastPub + 1).reverse();
  const recent = [...revs].reverse().slice(0, 4);
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Tripoli' }).format(new Date()));
  const firstName = admin.name.split(/\s+/)[0];
  const { report } = state;

  const health = [
    { n: report.emptyAr.length, t: t.hMissingAr, d: t.hMissingArD, dot: '#C99A3B', bg: '#FDF7EA', href: report.emptyAr[0]?.sectionId ? `/admin/editor?section=${report.emptyAr[0].sectionId}` : '/admin/editor' },
    { n: report.placeholders.length, t: t.hPlaceholders, d: t.hPlaceholdersD, dot: '#86621E', bg: '#F6EBD2', href: '/admin/settings' },
    { n: report.missingAlt.length, t: t.hAlt, d: t.hAltD, dot: '#8E3B24', bg: '#F3E2D9', href: '/admin/media?filter=alt' },
    { n: state.unread.length, t: t.hInq, d: t.hInqD, dot: '#3F5A2A', bg: '#E6EBDA', href: '/admin/inquiries' },
  ];
  const newest = state.inquiries.filter((q) => q.status !== 'archived').slice(0, 3);

  return (
    <div className="ov">
      <div>
        <div className="d-h" style={{ fontSize: 32 }}>{t.greet(hour, firstName)}</div>
        <div className="muted" style={{ fontSize: 15, marginTop: 4 }}>{t.greetSub}</div>
      </div>

      <div className="ov__grid">
        <section className="draft-card" aria-labelledby="draft-status">
          <div className="draft-card__ring" aria-hidden="true" />
          <span id="draft-status" className="d-eyebrow" style={{ color: '#C99A3B' }}>{t.draftStatus}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span className="draft-card__n">{state.summary.pending}</span>
            <span style={{ fontSize: 17, color: '#E8D3A0' }}>{state.summary.pending ? t.unpub : t.nothingPending}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingRevs.slice(0, 3).map((r) => (
              <div key={r.id} className="draft-card__row">
                <span>{r.summary[lang]}</span>
                <span style={{ color: '#E8D3A0', whiteSpace: 'nowrap' }}>{relTime(r.createdAt, lang)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative' }}>
            <PublishButton className="b b--gold">{t.reviewPublish}</PublishButton>
            <Link href="/admin/history" className="b b--ghost-dark">{t.seeHistory}</Link>
          </div>
        </section>

        <section className="card pad-24" style={{ display: 'flex', flexDirection: 'column', gap: 14 }} aria-labelledby="health">
          <span id="health" style={{ fontWeight: 700, fontSize: 15 }}>{t.health}</span>
          {health.map((h) => (
            <Link key={h.t} href={h.href} className="health" style={{ background: h.bg }}>
              <span className="health__n" style={{ background: h.dot }}>{h.n}</span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#1F2A1C' }}>{h.t}</span>
                <span className="muted" style={{ fontSize: 12 }}>{h.d}</span>
              </span>
              <span className="cta-arrow-static" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : undefined, display: 'flex' }}><Icon glyph="arrow" size={16} /></span>
            </Link>
          ))}
        </section>
      </div>

      <div className="ov__grid">
        <section className="card pad-24" aria-labelledby="new-inq">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span id="new-inq" style={{ fontWeight: 700, fontSize: 15 }}>{t.newInq}</span>
            <Link href="/admin/inquiries" style={{ fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{t.openInbox}</Link>
          </div>
          {newest.length === 0 && <p className="muted" style={{ fontSize: 14, margin: 0, paddingTop: 12, borderTop: '1px solid rgba(31,42,28,.08)' }}>{t.noInquiries}</p>}
          {newest.map((q) => {
            const [bg, ink] = TYPE_COLORS[q.type];
            return (
              <Link key={q.id} href={`/admin/inquiries?id=${q.id}`} className="list-row">
                <span className="avatar" style={{ width: 36, height: 36, background: '#EFE7D6', fontSize: 13 }}>{initials(q.name)}</span>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span dir="auto" style={{ fontWeight: 600, fontSize: 14 }}>{q.name}{q.organisation && <> · <span className="muted" style={{ fontWeight: 500 }}>{q.organisation}</span></>}</span>
                  <span className="muted ellipsis" style={{ fontSize: 13 }} dir={q.pageLang === 'ar' ? 'rtl' : 'ltr'}>{q.message}</span>
                </span>
                <span className="pill" style={{ background: bg, color: ink }}>{t.inquiryTypes[q.type]}</span>
              </Link>
            );
          })}
        </section>

        <section className="card pad-24" aria-labelledby="recent">
          <div id="recent" style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{t.recent}</div>
          {recent.map((r) => (
            <Link key={r.id} href={`/admin/history?id=${r.id}`} className="list-row" style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', alignItems: 'start', padding: '10px 0' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 5, background: r.status === 'published' ? '#3F5A2A' : '#C99A3B' }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.summary[lang]}</span>
                <span className="muted" style={{ fontSize: 12 }}>{r.author}</span>
              </span>
              <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{relTime(r.createdAt, lang)}</span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
