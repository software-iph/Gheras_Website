import type { Metadata } from 'next';
import Link from 'next/link';
import { ApplicationActions, CareersSettingsForm, JobForm } from '@/admin/CareersAdmin';
import { dict, fullDate, initials, relTime } from '@/admin/i18n';
import { getAdminLang } from '@/admin/lang';
import { requireAdmin } from '@/lib/auth/session';
import { careersStore } from '@/lib/careers/store';
import { newJob, type AppStatus } from '@/lib/careers/types';

export const metadata: Metadata = { title: 'Careers' };

const STATUS_COLORS: Record<AppStatus, [string, string]> = {
  new: ['#F6EBD2', '#86621E'], reviewing: ['#DDEAEA', '#2F6F73'], shortlisted: ['#E6EBDA', '#3F5A2A'],
  rejected: ['#F3E2D9', '#8E3B24'], archived: ['#F3EFE6', '#6B675C'],
};
const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function CareersAdminPage({ searchParams }: PageProps<'/admin/careers'>) {
  await requireAdmin();
  const lang = await getAdminLang();
  const T = dict(lang);
  const t = T.cr;
  const sp = await searchParams;
  const tab = sp.tab === 'jobs' ? 'jobs' : sp.tab === 'settings' ? 'settings' : 'apps';
  const settings = await careersStore.settings();

  const tabs: [typeof tab, string][] = [['apps', t.tabApps], ['jobs', t.tabJobs], ['settings', t.tabSettings]];
  const header = (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
      <div className="chips" role="tablist">
        {tabs.map(([k, label]) => (
          <Link key={k} href={k === 'apps' ? '/admin/careers' : `/admin/careers?tab=${k}`} className="chip" role="tab" aria-selected={tab === k}
            aria-pressed={tab === k} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', height: 38 }}>{label}</Link>
        ))}
      </div>
      {settings.enabled
        ? <a href={`/${lang}/careers`} target="_blank" rel="noopener" className="b b--md b--secondary" style={{ marginInlineStart: 'auto' }}>{t.viewOnSite}</a>
        : <Link href="/admin/careers?tab=settings" className="pill" style={{ marginInlineStart: 'auto', background: '#F6EBD2', color: '#86621E', padding: '8px 12px', textDecoration: 'underline', textUnderlineOffset: 3 }}>{t.siteOff} →</Link>}
    </div>
  );

  /* ---------- Settings ---------- */
  if (tab === 'settings') return <>{header}<CareersSettingsForm lang={lang} settings={settings} /></>;

  /* ---------- Jobs ---------- */
  if (tab === 'jobs') {
    const [jobs, counts] = await Promise.all([careersStore.jobs(), careersStore.applicationCounts()]);
    const editing = sp.job === 'new' ? newJob() : jobs.find((j) => j.id === sp.job) ?? (jobs.length ? undefined : newJob());
    return (
      <>
        {header}
        <div className="split">
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: 14, borderBottom: '1px solid rgba(31,42,28,.08)' }}>
              <Link href="/admin/careers?tab=jobs&job=new" className="b b--md b--primary" style={{ textDecoration: 'none' }}>+ {t.newJob}</Link>
            </div>
            {jobs.length === 0 && <p className="muted" style={{ padding: 14, margin: 0, fontSize: 14 }}>{t.jobsEmpty}</p>}
            {jobs.map((j) => (
              <Link key={j.id} href={`/admin/careers?tab=jobs&job=${j.id}`} className="inq-row" aria-current={editing && 'id' in editing && editing.id === j.id ? 'true' : undefined}>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span dir="auto" style={{ fontWeight: 700, fontSize: 14 }}>{(lang === 'ar' ? j.title.ar || j.title.en : j.title.en || j.title.ar) || '—'}</span>
                  <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="pill pill--sm" style={j.status === 'open' ? { background: '#E6EBDA', color: '#3F5A2A' } : { background: '#F3EFE6', color: '#6B675C' }}>
                      {j.status === 'open' ? t.open : t.closed}
                    </span>
                    <span className="pill pill--sm" style={{ background: '#F3EFE6', color: '#6B675C' }}>{t.employmentTypes[j.employment]}</span>
                    {j.applyMode === 'link'
                      ? <span className="pill pill--sm" style={{ background: '#DDEAEA', color: '#2F6F73' }}>↗</span>
                      : <span className="muted" style={{ fontSize: 12, padding: '3px 0' }}>{t.applicants(counts[j.id] ?? 0)}</span>}
                  </span>
                </span>
              </Link>
            ))}
          </div>
          {editing
            ? <JobForm key={editing.id || 'new'} lang={lang} job={editing} />
            : <div className="card" style={{ padding: 28 }}><p className="muted" style={{ margin: 0 }}>{t.newJob} / {t.editJob}</p></div>}
        </div>
      </>
    );
  }

  /* ---------- Applications ---------- */
  const all = await careersStore.applications();
  const f = typeof sp.status === 'string' && ['new', 'reviewing', 'shortlisted', 'rejected', 'archived'].includes(sp.status) ? (sp.status as AppStatus) : 'all';
  const list = all.filter((a) => (f === 'all' ? a.status !== 'archived' : a.status === f));
  const sel = all.find((a) => a.id === sp.id) ?? list[0];
  const href = (o: { status?: string; id?: string }) => {
    const p = new URLSearchParams();
    const st = o.status ?? (f === 'all' ? undefined : f);
    if (st && st !== 'all') p.set('status', st);
    if (o.id) p.set('id', o.id);
    const s = p.toString();
    return `/admin/careers${s ? `?${s}` : ''}`;
  };
  const filters: [string, string][] = [['all', t.all], ...(['new', 'reviewing', 'shortlisted', 'rejected', 'archived'] as AppStatus[]).map((k) => [k, t.status[k]] as [string, string])];

  return (
    <>
      {header}
      <div className="split">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="chips" style={{ padding: 14, borderBottom: '1px solid rgba(31,42,28,.08)' }}>
            {filters.map(([k, label]) => (
              <Link key={k} href={href({ status: k })} className="chip" aria-pressed={f === k}
                style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
          {list.length === 0 && <p className="muted" style={{ padding: 14, margin: 0, fontSize: 14 }}>{t.noApps}</p>}
          {list.map((a) => {
            const [bg, ink] = STATUS_COLORS[a.status];
            return (
              <Link key={a.id} href={href({ id: a.id })} className="inq-row" aria-current={sel?.id === a.id ? 'true' : undefined}>
                <span className="unread-dot" style={{ background: !a.read ? '#C99A3B' : 'transparent' }} aria-label={!a.read ? 'unread' : undefined} />
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span dir="auto" style={{ fontWeight: a.read ? 500 : 700, fontSize: 14 }}>{a.name}</span>
                    <span className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{relTime(a.createdAt, lang)}</span>
                  </span>
                  <span className="muted ellipsis" dir="auto" style={{ fontSize: 13 }}>{a.jobTitle ?? t.general}</span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <span className="pill pill--sm" style={{ background: bg, color: ink }}>{t.status[a.status]}</span>
                    {a.cv && <span className="pill pill--sm" style={{ background: '#F3EFE6', color: '#6B675C' }}>{t.cv}</span>}
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
                  <div className="muted" style={{ fontSize: 14 }} dir="auto">{sel.jobTitle ?? t.general} · {fullDate(sel.createdAt, lang)}</div>
                </div>
              </div>
              <span className="pill" style={{ padding: '6px 12px', background: STATUS_COLORS[sel.status][0], color: STATUS_COLORS[sel.status][1] }}>{t.status[sel.status]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, fontSize: 13 }}>
              <div className="info-box"><div className="muted" style={{ marginBottom: 4 }}>{t.email}</div><div dir="ltr" style={{ fontWeight: 600, textAlign: 'start', wordBreak: 'break-all' }}>{sel.email}</div></div>
              <div className="info-box"><div className="muted" style={{ marginBottom: 4 }}>{t.phone}</div><div dir="ltr" style={{ fontWeight: 600, textAlign: 'start' }}>{sel.phone || '—'}</div></div>
              <div className="info-box"><div className="muted" style={{ marginBottom: 4 }}>{t.link}</div>
                <div dir="ltr" style={{ fontWeight: 600, textAlign: 'start', wordBreak: 'break-all' }}>
                  {sel.link && /^https?:\/\//i.test(sel.link) ? <a href={sel.link} target="_blank" rel="noopener noreferrer">{sel.link}</a> : sel.link || '—'}
                </div>
              </div>
              <div className="info-box"><div className="muted" style={{ marginBottom: 4 }}>{t.cv}</div>
                <div style={{ fontWeight: 600, wordBreak: 'break-all' }} dir="auto">{sel.cv ? `${sel.cv.original} · ${fmtSize(sel.cv.size)}` : t.noCv}</div>
              </div>
              <div className="info-box"><div className="muted" style={{ marginBottom: 4 }}>{t.sentFrom}</div><div style={{ fontWeight: 600 }}>{sel.pageLang === 'ar' ? t.pageAr : t.pageEn}</div></div>
            </div>
            <div className={`msg ${sel.pageLang === 'ar' ? 'ar-text' : 'en-text'}`} dir={sel.pageLang === 'ar' ? 'rtl' : 'ltr'} lang={sel.pageLang}>
              {sel.message || <span className="muted">{t.noMessage}</span>}
            </div>
            <ApplicationActions key={sel.id} lang={lang} app={sel} />
          </article>
        ) : (
          <div className="card" style={{ padding: 28 }}><p className="muted" style={{ margin: 0 }}>{t.noSelection}</p></div>
        )}
      </div>
    </>
  );
}
