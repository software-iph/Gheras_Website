import 'server-only';
import type postgres from 'postgres';
import { db } from '@/lib/db/sql';
import { libyaDay } from './track';

export type StatsFilter = {
  from: string; // YYYY-MM-DD (inclusive)
  to: string;   // YYYY-MM-DD (inclusive)
  page?: string;
  device?: string;
  lang?: string;
  source?: string;
};
export const PERIODS = ['7', '30', '90', '365', 'custom'] as const;
export type Period = (typeof PERIODS)[number];

const isDay = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Read the filters from the page's search params (defaults: last 30 days, everything). */
export function parseFilter(sp: Record<string, string | string[] | undefined>): { period: Period; filter: StatsFilter } {
  const one = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined);
  const period = (PERIODS as readonly string[]).includes(one('period') ?? '') ? (one('period') as Period) : '30';
  const today = libyaDay();
  let from = addDays(today, -(Number(period === 'custom' ? 30 : period) - 1));
  let to = today;
  if (period === 'custom') {
    const f = one('from'), t = one('to');
    if (isDay(f)) from = f;
    if (isDay(t)) to = t;
    if (from > to) [from, to] = [to, from];
    if (Date.parse(to) - Date.parse(from) > 3 * 366 * 864e5) from = addDays(to, -3 * 366); // keep queries bounded
  }
  const opt = (k: string, max = 200) => { const v = one(k)?.trim(); return v && v !== 'all' ? v.slice(0, max) : undefined; };
  return { period, filter: { from, to, page: opt('page'), device: opt('device'), lang: opt('lang'), source: opt('source') } };
}

function where(sql: postgres.Sql, f: StatsFilter) {
  return sql`
    day between ${f.from} and ${f.to}
    ${f.page ? sql`and path = ${f.page}` : sql``}
    ${f.device ? sql`and device = ${f.device}` : sql``}
    ${f.lang ? sql`and lang = ${f.lang}` : sql``}
    ${f.source ? sql`and source = ${f.source}` : sql``}`;
}

export type Row = { key: string; visitors: number; views: number };

export async function statsFor(f: StatsFilter) {
  const sql = db();
  // A fresh clause per query (postgres.js fragments are not shared between parallel queries).
  const w = () => where(sql, f);
  const [totals, perDay, pages, sources, devices, langs] = await Promise.all([
    sql<{ visitors: number; views: number }[]>`
      select count(distinct (day, visitor))::int as visitors, count(*)::int as views from page_views where ${w()}`,
    sql<{ day: string; visitors: number; views: number }[]>`
      select to_char(d, 'YYYY-MM-DD') as day, coalesce(v.visitors, 0)::int as visitors, coalesce(v.views, 0)::int as views
      from generate_series(${f.from}::date, ${f.to}::date, interval '1 day') d
      left join (
        select day, count(distinct visitor) as visitors, count(*) as views from page_views where ${w()} group by day
      ) v on v.day = d::date
      order by d`,
    sql<Row[]>`
      select path as key, count(distinct (day, visitor))::int as visitors, count(*)::int as views
      from page_views where ${w()} group by path order by visitors desc, views desc`,
    sql<Row[]>`
      select source as key, count(distinct (day, visitor))::int as visitors, count(*)::int as views
      from page_views where ${w()} and source <> 'Internal' group by source order by visitors desc limit 20`,
    sql<Row[]>`
      select device as key, count(distinct (day, visitor))::int as visitors, count(*)::int as views
      from page_views where ${w()} group by device order by visitors desc`,
    sql<Row[]>`
      select lang as key, count(distinct (day, visitor))::int as visitors, count(*)::int as views
      from page_views where ${w()} group by lang order by visitors desc`,
  ]);
  const t = totals[0] ?? { visitors: 0, views: 0 };
  const busiest = perDay.reduce<{ day: string; visitors: number } | null>((b, d) => (d.visitors > (b?.visitors ?? 0) ? d : b), null);
  return {
    visitors: t.visitors,
    views: t.views,
    days: perDay.length,
    // One decimal while small (e.g. 0.4 a day), whole numbers once it is 10 or more.
    perDayVisitors: (() => {
      const avg = perDay.length ? perDay.reduce((s, d) => s + d.visitors, 0) / perDay.length : 0;
      return avg >= 10 ? Math.round(avg) : Math.round(avg * 10) / 10;
    })(),
    pagesPerVisitor: t.visitors ? Math.round((t.views / t.visitors) * 10) / 10 : 0,
    busiest,
    perDay,
    pages, sources, devices, langs,
  };
}

/** Values for the filter menus (everything ever recorded). */
export async function filterOptions() {
  const sql = db();
  const [sources] = await Promise.all([
    sql<{ source: string }[]>`select distinct source from page_views where source <> 'Internal' order by source`,
  ]);
  return { sources: sources.map((s) => s.source) };
}
