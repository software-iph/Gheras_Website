import type { Metadata } from 'next';
import Link from 'next/link';
import { RestoreButton } from '@/admin/RestoreButton';
import { dict, fullDate, relTime } from '@/admin/i18n';
import { getAdminLang } from '@/admin/lang';
import { requireAdmin } from '@/lib/auth/session';
import { labelFor } from '@/lib/cms/diff';
import { getDraft, listRevisions } from '@/lib/cms/store';

export const metadata: Metadata = { title: 'Change history' };
const MAX_DIFFS = 40;

export default async function HistoryPage({ searchParams }: PageProps<'/admin/history'>) {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = dict(lang);
  const { id } = await searchParams;
  const [revs, draft] = await Promise.all([listRevisions(), getDraft()]);
  const list = [...revs].reverse();
  const sel = list.find((r) => r.id === id) ?? list[0];
  const show = (v: unknown) => (v === null || v === '' ? t.empty : typeof v === 'boolean' ? (v ? t.on : t.off) : String(v));

  return (
    <div className="split">
      <div className="card" style={{ padding: '8px 20px' }}>
        {list.map((r) => {
          const pub = r.status === 'published';
          return (
            <Link key={r.id} href={`/admin/history?id=${r.id}`} className="hist-row" aria-current={sel?.id === r.id ? 'true' : undefined}>
              <span className="hist-dot" style={{ background: pub ? '#3F5A2A' : '#C99A3B', boxShadow: `0 0 0 3px ${pub ? '#E6EBDA' : '#F6EBD2'}` }} />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.summary[lang]}</span>
                <span className="muted" style={{ fontSize: 12 }}>{r.author} · {relTime(r.createdAt, lang)}</span>
              </span>
              <span className="pill pill--sm" style={{ background: pub ? '#E6EBDA' : '#F6EBD2', color: pub ? '#3F5A2A' : '#86621E' }}>
                {pub ? t.publishedTag : t.draftTag}
              </span>
            </Link>
          );
        })}
      </div>

      {sel && (
        <article className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <h2 className="d-h" style={{ fontSize: 24 }}>{sel.summary[lang]}</h2>
              <div className="muted" style={{ fontSize: 14 }}>{sel.author} · {fullDate(sel.createdAt, lang)}</div>
            </div>
            {sel.snapshot && <RestoreButton lang={lang} id={sel.id} />}
          </div>
          {sel.diff.length === 0 && <p className="muted" style={{ margin: 0 }}>{t.noDiffs}</p>}
          {sel.diff.slice(0, MAX_DIFFS).map((d) => {
            const l = labelFor(d.path, sel.snapshot ?? draft);
            const ar = l.lang === 'ar';
            const langName = l.lang ? (l.lang === 'en' ? (lang === 'ar' ? 'إنجليزي' : 'English') : (lang === 'ar' ? 'عربي' : 'Arabic')) : '';
            return (
              <div key={d.path} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{l.group[lang]} — {l.field[lang]}{langName && ` — ${langName}`}</span>
                <div className="diff">
                  <div className={`diff__before ${ar ? 'ar-text' : 'en-text'}`} dir={ar ? 'rtl' : 'ltr'}>
                    <div className="diff__tag" style={{ color: '#8E3B24' }}>{t.before}</div>
                    <span className="v">{show(d.before)}</span>
                  </div>
                  <div className={`diff__after ${ar ? 'ar-text' : 'en-text'}`} dir={ar ? 'rtl' : 'ltr'}>
                    <div className="diff__tag" style={{ color: '#3F5A2A' }}>{t.after}</div>
                    {show(d.after)}
                  </div>
                </div>
              </div>
            );
          })}
          {sel.diff.length > MAX_DIFFS && <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t.moreDiffs(sel.diff.length - MAX_DIFFS)}</p>}
        </article>
      )}
    </div>
  );
}
