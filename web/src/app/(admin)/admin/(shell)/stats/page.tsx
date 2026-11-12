import type { Metadata } from 'next';
import { dict, type UILang } from '@/admin/i18n';
import { getAdminLang } from '@/admin/lang';
import { StatsFilters } from '@/admin/StatsFilters';
import { requireAdmin } from '@/lib/auth/session';
import { filterOptions, parseFilter, statsFor, type Row } from '@/lib/stats/query';
import { PAGE_LABELS, TRACKED_PATHS } from '@/lib/stats/track';

export const metadata: Metadata = { title: 'Statistics' };

const locale = (l: UILang) => (l === 'ar' ? 'ar-LY-u-nu-latn' : 'en-GB');
const num = (n: number, l: UILang) => new Intl.NumberFormat(locale(l)).format(n);
const dayLabel = (d: string, l: UILang, withYear = false) =>
  new Intl.DateTimeFormat(locale(l), { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`));

export default async function StatsPage({ searchParams }: PageProps<'/admin/stats'>) {
  await requireAdmin();
  const lang = await getAdminLang();
  const t = dict(lang).st;
  const sp = await searchParams;
  const { period, filter } = parseFilter(sp);
  const [s, opts] = await Promise.all([statsFor(filter), filterOptions()]);

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === 'string') qs.set(k, v);
  const pageLabel = (p: string) => PAGE_LABELS[p]?.[lang] ?? p;
  const sourceLabel = (k: string) => (k === 'Direct' ? t.direct : k);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1240 }}>
      <p className="muted" style={{ margin: 0, maxWidth: 760, lineHeight: 1.6, fontSize: 14 }}>{t.lead}</p>

      <StatsFilters lang={lang} period={period} from={filter.from} to={filter.to} page={filter.page} device={filter.device}
        language={filter.lang} source={filter.source}
        pages={TRACKED_PATHS.map((p) => [p, pageLabel(p)])} sources={opts.sources.map((x) => [x, sourceLabel(x)])}
        csvHref={`/admin/api/stats?${qs.toString()}`} />

      <div className="stats-kpis">
        <Kpi n={num(s.visitors, lang)} label={t.visitors} />
        <Kpi n={num(s.views, lang)} label={t.views} />
        <Kpi n={s.perDayVisitors.toLocaleString(locale(lang))} label={t.perDay} />
        <Kpi n={s.pagesPerVisitor.toLocaleString(locale(lang))} label={t.pagesPer} />
        <Kpi n={s.busiest ? num(s.busiest.visitors, lang) : '—'} label={s.busiest ? `${t.busiest} · ${dayLabel(s.busiest.day, lang)}` : t.busiest} />
      </div>

      <section className="card" style={{ padding: 24 }} aria-labelledby="chart-h">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <h2 id="chart-h" className="d-h" style={{ fontSize: 20 }}>{t.chart}</h2>
          <span className="muted" style={{ fontSize: 13 }}>{dayLabel(filter.from, lang, true)} – {dayLabel(filter.to, lang, true)}</span>
        </div>
        {s.visitors === 0 ? <p className="muted" style={{ margin: 0 }}>{t.none}</p> : <Chart data={s.perDay} lang={lang} />}
        <details style={{ marginTop: 16 }}>
          <summary className="b b--sm b--secondary" style={{ display: 'inline-flex', cursor: 'pointer', listStyle: 'none' }}>{t.asTable}</summary>
          <table className="stats-table" style={{ marginTop: 12 }}>
            <thead><tr><th>{t.date}</th><th>{t.visitors}</th><th>{t.views}</th></tr></thead>
            <tbody>{s.perDay.map((d) => <tr key={d.day}><td>{dayLabel(d.day, lang, true)}</td><td>{num(d.visitors, lang)}</td><td>{num(d.views, lang)}</td></tr>)}</tbody>
          </table>
        </details>
      </section>

      <div className="stats-grid">
        <BarTable title={t.topPages} rows={s.pages} label={pageLabel} lang={lang} cols={[t.visitors, t.views]} />
        <BarTable title={t.sources} rows={s.sources} label={sourceLabel} lang={lang} cols={[t.visitors]} />
        <BarTable title={t.byDevice} rows={s.devices} label={(k) => t.devices[k] ?? k} lang={lang} cols={[t.visitors]} />
        <BarTable title={t.byLang} rows={s.langs} label={(k) => t.langs[k] ?? k} lang={lang} cols={[t.visitors]} />
      </div>
    </div>
  );
}

function Kpi({ n, label }: { n: string; label: string }) {
  return (
    <div className="card stats-kpi">
      <div className="stats-kpi__n">{n}</div>
      <div className="muted" style={{ fontSize: 14, lineHeight: 1.4 }}>{label}</div>
    </div>
  );
}

/** Bars per day (SVG, no JavaScript needed). */
function Chart({ data, lang }: { data: { day: string; visitors: number }[]; lang: UILang }) {
  const W = 1000, H = 240, L = 40, B = 28;
  const max = Math.max(1, ...data.map((d) => d.visitors));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f));
  const bw = (W - L) / data.length;
  const every = Math.max(1, Math.ceil(data.length / 12));
  return (
    <svg viewBox={`0 0 ${W} ${H + B}`} width="100%" role="img" aria-label={dict(lang).st.chart} style={{ display: 'block', direction: 'ltr' }}>
      {ticks.map((v) => {
        const y = H - (v / top) * (H - 10);
        return (
          <g key={v}>
            <line x1={L} x2={W} y1={y} y2={y} stroke="rgba(31,42,28,.08)" />
            <text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#6B675C">{v}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.visitors / top) * (H - 10);
        const x = L + i * bw;
        return (
          <g key={d.day}>
            <rect x={x + bw * 0.12} y={H - h} width={Math.max(1, bw * 0.76)} height={h} rx="2" fill="#3F5A2A">
              <title>{`${dayLabel(d.day, lang, true)}: ${d.visitors}`}</title>
            </rect>
            {i % every === 0 && <text x={x + bw / 2} y={H + 18} textAnchor="middle" fontSize="11" fill="#6B675C">{dayLabel(d.day, lang)}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function BarTable({ title, rows, label, lang, cols }: { title: string; rows: Row[]; label: (k: string) => string; lang: UILang; cols: string[] }) {
  const max = Math.max(1, ...rows.map((r) => r.visitors));
  return (
    <section className="card" style={{ padding: 24 }}>
      <h2 className="d-h" style={{ fontSize: 20, marginBottom: 16 }}>{title}</h2>
      {rows.length === 0 ? <p className="muted" style={{ margin: 0 }}>{dict(lang).st.none}</p> : (
        <table className="stats-table stats-table--bars">
          <thead><tr><th />{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td><span className="stats-bar" style={{ width: `${(r.visitors / max) * 100}%` }} /><span className="stats-bar__label" dir="auto">{label(r.key)}</span></td>
                <td>{num(r.visitors, lang)}</td>
                {cols.length > 1 && <td>{num(r.views, lang)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
