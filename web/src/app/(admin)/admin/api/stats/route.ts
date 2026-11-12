import { getAdmin } from '@/lib/auth/session';
import { parseFilter, statsFor } from '@/lib/stats/query';
import { PAGE_LABELS } from '@/lib/stats/track';

const cell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV export of the statistics page, with the same filters. Admin only. */
export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response('Unauthorized', { status: 401 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const { filter } = parseFilter(sp);
  const s = await statsFor(filter);
  const lines: (string | number)[][] = [
    ['GHERAS website statistics', `${filter.from} to ${filter.to}`],
    [],
    ['Date', 'Visitors', 'Page views'],
    ...s.perDay.map((d) => [d.day, d.visitors, d.views]),
    [],
    ['Page', 'Visitors', 'Page views'],
    ...s.pages.map((r) => [PAGE_LABELS[r.key]?.en ?? r.key, r.visitors, r.views]),
    [],
    ['Came from', 'Visitors'],
    ...s.sources.map((r) => [r.key, r.visitors]),
    [],
    ['Device', 'Visitors'],
    ...s.devices.map((r) => [r.key, r.visitors]),
    [],
    ['Language', 'Visitors'],
    ...s.langs.map((r) => [r.key, r.visitors]),
  ];
  const csv = '﻿' + lines.map((l) => l.map(cell).join(',')).join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="gheras-stats-${filter.from}-to-${filter.to}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
