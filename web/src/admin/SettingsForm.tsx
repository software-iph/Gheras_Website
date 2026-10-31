'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Localized, SiteContent, SocialKey } from '@/content/types';
import { saveSettings } from '@/lib/cms/actions';
import { validUrl } from '@/lib/cms/checks';
import { dict, type UILang } from './i18n';

type Site = SiteContent['site'];
const SOCIAL: [SocialKey, string, string][] = [
  ['linkedin', 'LinkedIn', 'https://linkedin.com/company/…'], ['instagram', 'Instagram', 'https://instagram.com/…'],
  ['x', 'X', 'https://x.com/…'], ['facebook', 'Facebook', 'https://facebook.com/…'], ['youtube', 'YouTube', 'https://youtube.com/@…'],
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export function SettingsForm({ lang, site: initial, host, images }: {
  lang: UILang; site: Site; host: string; images: { id: string; name: string; width: number | null; height: number | null }[];
}) {
  const t = dict(lang);
  const router = useRouter();
  const [s, setS] = useState<Site>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const up = (fn: (x: Site) => Site) => { setS(fn); setDirty(true); setSaved(false); };

  const emailBad = !!s.contact.email && !EMAIL_RE.test(s.contact.email.trim());
  const badSocial = SOCIAL.filter(([k]) => s.social[k] && !validUrl(s.social[k]!)).map(([k]) => k);
  const invalid = emailBad || badSocial.length > 0;

  const save = () => start(async () => {
    const r = await saveSettings(s);
    if (r.ok) { setDirty(false); setSaved(true); router.refresh(); }
  });

  // Placeholder values (client still to supply) get a dashed Gold Ink border.
  const ph = (v: string | null | undefined) => (!v?.trim() ? ' in--ph' : '');
  const bi = (label: string, v: Localized, on: (v: Localized) => void, o: { phEn?: string; phAr?: string; limit?: number; placeholder?: boolean; area?: boolean } = {}) => (
    <div className="set__row">
      <span className="field-name">{label}</span>
      {(['en', 'ar'] as const).map((l) => {
        const val = v[l] ?? '';
        const over = !!o.limit && val.length > o.limit;
        const Tag = o.area ? 'textarea' : 'input';
        return (
          <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4 }} dir={l === 'ar' ? 'rtl' : 'ltr'} lang={l}>
            <Tag className={`in ${l === 'ar' ? 'in--ar' : 'in--en'}${o.placeholder ? ph(val) : ''}${over ? ' in--bad' : ''}`} value={val}
              placeholder={l === 'ar' ? o.phAr : o.phEn} aria-label={`${label} — ${l.toUpperCase()}`} rows={o.area ? 3 : undefined}
              style={o.area ? undefined : { fontSize: l === 'ar' ? 15 : 14 }}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => on({ ...v, [l]: e.target.value })} />
            {o.limit && <span className="count" style={{ fontSize: 12, color: over ? '#8E3B24' : val.length > o.limit * 0.9 ? '#86621E' : '#6B675C' }}>{val.length} / {o.limit}</span>}
          </div>
        );
      })}
    </div>
  );
  const single = (label: string, value: string, on: (v: string) => void, o: { ph?: string; type?: string; bad?: string | false; placeholder?: boolean } = {}) => (
    <div className="set__row">
      <span className="field-name">{label}</span>
      <div className="set__span" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <input className={`in in--en${o.placeholder ? ph(value) : ''}${o.bad ? ' in--bad' : ''}`} dir="ltr" type={o.type ?? 'text'} value={value}
          placeholder={o.ph} aria-label={label} aria-invalid={!!o.bad} style={{ fontSize: 14, textAlign: 'start' }} onChange={(e) => on(e.target.value)} />
        {o.bad && <span className="err" role="alert">{o.bad}</span>}
      </div>
    </div>
  );
  const group = (title: string, hint: string, children: React.ReactNode) => (
    <section className="card pad-24" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 className="d-h" style={{ fontSize: 22 }}>{title}</h2>
        <span className="muted" style={{ fontSize: 12 }}>{hint}</span>
      </div>
      {children}
    </section>
  );

  return (
    <div className="set">
      {group(t.contactTitle, t.contactHint, <>
        {single(t.email, s.contact.email ?? '', (v) => up((x) => ({ ...x, contact: { ...x.contact, email: v } })), { ph: 'info@…', type: 'email', placeholder: true, bad: emailBad && t.invalidEmail })}
        {single(t.phone, s.contact.phone ?? '', (v) => up((x) => ({ ...x, contact: { ...x.contact, phone: v } })), { ph: '+218 …', type: 'tel', placeholder: true })}
        {bi(t.address, s.contact.address, (v) => up((x) => ({ ...x, contact: { ...x.contact, address: v } })), { phEn: 'Street, Tripoli, Libya', phAr: 'الشارع، طرابلس، ليبيا', placeholder: true })}
        <div className="set__row">
          <span className="field-name">{t.replyTime}</span>
          <div className="set__span" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input className={`in in--en${s.contact.replyTimeDays == null ? ' in--ph' : ''}`} dir="ltr" inputMode="numeric" style={{ width: 120, fontSize: 14 }}
              value={s.contact.replyTimeDays ?? ''} placeholder="3" aria-label={t.replyTime}
              onChange={(e) => { const n = e.target.value.replace(/\D/g, '').slice(0, 2); up((x) => ({ ...x, contact: { ...x.contact, replyTimeDays: n ? Number(n) : null } })); }} />
            <span className="muted" style={{ fontSize: 14 }}>{t.replyDays}</span>
          </div>
        </div>
      </>)}

      {group(t.socialTitle, t.socialHint, SOCIAL.map(([k, label, phv]) => (
        <div key={k}>{single(label, s.social[k] ?? '', (v) => up((x) => ({ ...x, social: { ...x.social, [k]: v } })), { ph: phv, type: 'url', bad: badSocial.includes(k) && t.invalidUrl })}</div>
      )))}

      {group(t.seoTitle, t.seoHint, <>
        {bi(t.pageTitle, s.seo.title, (v) => up((x) => ({ ...x, seo: { ...x.seo, title: v } })), { limit: 60 })}
        {bi(t.description, s.seo.description, (v) => up((x) => ({ ...x, seo: { ...x.seo, description: v } })), { limit: 155, area: true })}
        <div className="set__row">
          <span className="field-name">{t.shareImage}</span>
          <select className="in set__span" value={s.seo.shareImage ?? ''} aria-label={t.shareImage}
            onChange={(e) => up((x) => ({ ...x, seo: { ...x.seo, shareImage: e.target.value || null } }))}>
            <option value="">{t.shareNone}</option>
            {images.map((m) => <option key={m.id} value={m.id}>{m.name}{m.width ? ` · ${m.width} × ${m.height}` : ''}</option>)}
          </select>
        </div>
        <div className="set__row">
          <span className="muted" style={{ fontSize: 12, paddingTop: 12 }}>{t.searchPreview}</span>
          <div className="serp" dir="ltr" style={{ textAlign: 'left' }}>
            <div className="serp__url">{host} › en</div>
            <div className="serp__title">{cut(s.seo.title.en ?? '', 60)}</div>
            <div className="serp__desc">{cut(s.seo.description.en ?? '', 155)}</div>
          </div>
          <div className="serp" dir="rtl" style={{ textAlign: 'right' }}>
            <div className="serp__url">{host} › ar</div>
            <div className="serp__title">{cut(s.seo.title.ar ?? '', 60)}</div>
            <div className="serp__desc" style={{ lineHeight: 1.6 }}>{cut(s.seo.description.ar ?? '', 155)}</div>
          </div>
        </div>
      </>)}

      {group(t.endorseTitle, t.endorseHint, <>
        {bi(t.text, s.endorsement.text, (v) => up((x) => ({ ...x, endorsement: { ...x.endorsement, text: v } })), { phAr: '[الصيغة العربية من IPH]', placeholder: true })}
        <div className="set__row">
          <span className="field-name">{t.showOnSite}</span>
          <div className="set__span" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12 }}>
            <button type="button" className="sw" role="switch" aria-checked={s.endorsement.visible} aria-label={t.showOnSite}
              onClick={() => up((x) => ({ ...x, endorsement: { ...x.endorsement, visible: !x.endorsement.visible } }))} />
            <span style={{ fontSize: 14 }}>{s.endorsement.visible ? t.on : t.off}</span>
          </div>
        </div>
      </>)}

      {(dirty || saved) && (
        <div className="savebar">
          <span role="status" style={{ fontSize: 14, fontWeight: 600 }}>{dirty ? (emailBad ? t.invalidEmail : badSocial.length ? t.invalidUrl : t.unsaved) : `✓ ${t.saved}`}</span>
          {dirty && (
            <span style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="b b--md b--ghost-dark" onClick={() => { setS(initial); setDirty(false); }}>{t.discard}</button>
              <button type="button" className="b b--md b--gold" onClick={save} disabled={saving || invalid}>{saving ? t.saving : t.saveSettings}</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
