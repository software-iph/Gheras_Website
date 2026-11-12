'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { dict, type UILang } from './i18n';

type Opt = [string, string];

/** Filter bar for the statistics page: every change updates the URL (and so the page) right away. */
export function StatsFilters({ lang, period, from, to, page, device, language, source, pages, sources, csvHref }: {
  lang: UILang; period: string; from: string; to: string; page?: string; device?: string; language?: string; source?: string;
  pages: Opt[]; sources: Opt[]; csvHref: string;
}) {
  const t = dict(lang).st;
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const set = (patch: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) { if (v && v !== 'all') p.set(k, v); else p.delete(k); }
    router.push(`${path}?${p.toString()}`);
  };
  const sel = (label: string, value: string, opts: Opt[], key: string, width = 200) => (
    <label className="field-label" style={{ fontSize: 13, minWidth: width }}>
      {label}
      <select className="in" value={value} onChange={(e) => set({ [key]: e.target.value })}>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
  return (
    <div className="card stats-filters">
      {sel(t.period, period, [['7', t.p7], ['30', t.p30], ['90', t.p90], ['365', t.p365], ['custom', t.pCustom]], 'period', 160)}
      <label className="field-label" style={{ fontSize: 13 }}>
        {t.from}
        <input className="in" type="date" value={from} max={to} onChange={(e) => set({ period: 'custom', from: e.target.value, to })} />
      </label>
      <label className="field-label" style={{ fontSize: 13 }}>
        {t.to}
        <input className="in" type="date" value={to} min={from} onChange={(e) => set({ period: 'custom', from, to: e.target.value })} />
      </label>
      {sel(t.page, page ?? 'all', [['all', t.allPages], ...pages], 'page')}
      {sel(t.device, device ?? 'all', [['all', t.allDevices], ...(['desktop', 'mobile', 'tablet'].map((d) => [d, t.devices[d]]) as Opt[])], 'device', 150)}
      {sel(t.language, language ?? 'all', [['all', t.both], ['en', t.langs.en], ['ar', t.langs.ar]], 'lang', 130)}
      {sel(t.source, source ?? 'all', [['all', t.allSources], ...sources], 'source', 220)}
      <a href={csvHref} className="b b--md b--secondary" style={{ alignSelf: 'flex-end', marginInlineStart: 'auto' }} download>⤓ {t.csv}</a>
    </div>
  );
}
