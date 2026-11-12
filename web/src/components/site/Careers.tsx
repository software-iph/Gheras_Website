'use client';

import { useEffect, useRef, useState } from 'react';
import type { Lang, Localized } from '@/content/types';
import { Arrow } from '@/components/brand/Icon';
import { careersUi } from '@/i18n/careers';
import { CV_ACCEPT, CV_MAX_BYTES, type ApplyResult, type Job } from '@/lib/careers/types';
import { EMAIL_RE } from '@/lib/inquiries/shared';

/** Text in the page language, falling back to the other one. */
const tx = (v: Localized, lang: Lang) => (lang === 'ar' ? v.ar || v.en : v.en || v.ar) ?? '';

/** Open positions with details, apply buttons and the application form (plus an optional general application). */
export function CareersList({ lang, jobs, general }: { lang: Lang; jobs: Job[]; general: boolean }) {
  const t = careersUi[lang];
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [applyFor, setApplyFor] = useState<string | null>(null); // job id, 'general' or null

  return (
    <div className="jobs">
      <h2 className="h2 jobs__title">{t.openRoles}</h2>
      {jobs.length === 0 && <p className="jobs__empty">{t.noRoles}</p>}
      <ul className="jobs__list">
        {jobs.map((j) => {
          const title = tx(j.title, lang);
          const meta = [tx(j.department, lang), tx(j.location, lang), t.employment[j.employment]].filter(Boolean);
          const desc = tx(j.description, lang);
          const isOpen = !!open[j.id];
          return (
            <li key={j.id} className="job" data-rv>
              <div className="job__head">
                <div className="job__info">
                  <h3 className="job__title">{title}</h3>
                  <p className="job__meta">{meta.map((m, i) => <span key={i}>{m}</span>)}</p>
                </div>
                <div className="job__actions">
                  {desc && (
                    <button type="button" className="job__toggle" aria-expanded={isOpen} aria-controls={`job-${j.id}`}
                      onClick={() => setOpen((o) => ({ ...o, [j.id]: !o[j.id] }))}>
                      {isOpen ? t.hideDetails : t.details}
                    </button>
                  )}
                  {j.applyMode === 'link' && j.applyUrl
                    ? <a className="btn btn--primary" href={j.applyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t.applyExternal}: ${title}`}>{t.apply}<Arrow color="#FAF8F2" /></a>
                    : <button type="button" className="btn btn--primary" aria-expanded={applyFor === j.id} onClick={() => setApplyFor(applyFor === j.id ? null : j.id)}>{t.apply}<Arrow color="#FAF8F2" /></button>}
                </div>
              </div>
              {desc && isOpen && <div id={`job-${j.id}`} className="job__desc">{desc}</div>}
              {applyFor === j.id && <ApplyForm lang={lang} jobId={j.id} jobTitle={title} onClose={() => setApplyFor(null)} />}
            </li>
          );
        })}
      </ul>
      {general && (
        <div className="jobs__general" data-rv>
          <div>
            <h3 className="job__title">{t.generalTitle}</h3>
            <p className="jobs__general-text">{t.generalText}</p>
          </div>
          {applyFor === 'general'
            ? <ApplyForm lang={lang} jobId="" jobTitle={null} onClose={() => setApplyFor(null)} />
            : <button type="button" className="btn btn--gold" onClick={() => setApplyFor('general')}>{t.generalApply}<Arrow color="#1F2A1C" /></button>}
        </div>
      )}
    </div>
  );
}

type Key = 'name' | 'email' | 'cv';

function ApplyForm({ lang, jobId, jobTitle, onClose }: { lang: Lang; jobId: string; jobTitle: string | null; onClose: () => void }) {
  const t = careersUi[lang];
  const [f, setF] = useState({ name: '', email: '', phone: '', link: '', message: '', website: '' });
  const [cv, setCv] = useState<File | null>(null);
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Exclude<ApplyResult, { ok: true }>['error'] | null>(null);
  const [sent, setSent] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.querySelector<HTMLElement>('input[name="name"]')?.focus(); }, []);
  useEffect(() => { if (sent) doneRef.current?.focus(); }, [sent]);

  const cvBad = !cv || !/\.(pdf|docx?)$/i.test(cv.name);
  const bad: Record<Key, boolean> = { name: !f.name.trim(), email: !EMAIL_RE.test(f.email.trim()), cv: cvBad || (cv?.size ?? 0) > CV_MAX_BYTES };
  const show = (k: Key) => !!touched[k] && bad[k];
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (bad.name || bad.email || bad.cv) {
      setTouched({ name: true, email: true, cv: true });
      const first = bad.name ? 'name' : bad.email ? 'email' : 'cv';
      ref.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const body = new FormData();
    body.set('jobId', jobId);
    for (const [k, v] of Object.entries(f)) body.set(k, v);
    body.set('pageLang', lang);
    body.set('cv', cv!);
    setBusy(true);
    let r: ApplyResult;
    try { r = await (await fetch('/api/apply', { method: 'POST', body })).json(); } catch { r = { ok: false, error: 'server' }; }
    setBusy(false);
    if (r.ok) setSent(true);
    else if (r.error === 'invalid') setTouched({ name: true, email: true, cv: true });
    else setError(r.error);
  };

  if (sent) {
    const first = f.name.trim().split(/\s+/)[0] ?? '';
    return (
      <div className="apply apply--sent" role="status" tabIndex={-1} ref={doneRef}>
        <h4 className="apply__title">{t.thanks(first)}</h4>
        <p>{t.thanksText}</p>
        <button type="button" className="sent__again" onClick={onClose}>{t.close}</button>
      </div>
    );
  }

  const err = (k: Key, msg: string) => (show(k) ? <span className="field__err" role="alert" id={`ap-err-${k}`}><span aria-hidden="true">✕</span> {msg}</span> : null);
  const serverMsg = error === 'cv' ? t.errCv : error === 'cv-size' ? t.errCvSize : error === 'closed' ? t.errClosed : error === 'rate' ? t.errRate : error ? t.errServer : null;

  return (
    <form ref={ref} className="apply form" onSubmit={submit} noValidate aria-label={t.formTitle(jobTitle)}>
      <h4 className="apply__title field--full">{t.formTitle(jobTitle)}</h4>
      <label className="field">
        {t.name}
        <input className="input" name="name" autoComplete="name" required value={f.name} onChange={set('name')}
          onBlur={() => setTouched((s) => ({ ...s, name: true }))} aria-invalid={show('name')} aria-describedby={show('name') ? 'ap-err-name' : undefined} />
        {err('name', t.errName)}
      </label>
      <label className="field">
        {t.email}
        <input className="input" name="email" type="email" dir={lang === 'ar' ? 'ltr' : undefined} autoComplete="email" required value={f.email}
          onChange={set('email')} onBlur={() => setTouched((s) => ({ ...s, email: true }))} aria-invalid={show('email')}
          aria-describedby={show('email') ? 'ap-err-email' : undefined} />
        {err('email', t.errEmail)}
      </label>
      <label className="field">
        <span>{t.phone} <span className="field__opt">{t.optional}</span></span>
        <input className="input" name="phone" type="tel" dir={lang === 'ar' ? 'ltr' : undefined} autoComplete="tel" value={f.phone} onChange={set('phone')} />
      </label>
      <label className="field">
        <span>{t.link} <span className="field__opt">{t.optional}</span></span>
        <input className="input" name="link" type="url" dir="ltr" placeholder="https://" value={f.link} onChange={set('link')} />
      </label>
      <label className="field field--full">
        <span>{t.message} <span className="field__opt">{t.optional}</span></span>
        <textarea className="input" name="message" rows={4} value={f.message} onChange={set('message')} />
      </label>
      <label className="field field--full">
        <span>{t.cv} <span className="field__opt">· {t.cvHint}</span></span>
        <input className="input apply__file" name="cv" type="file" accept={CV_ACCEPT} required
          onChange={(e) => { setCv(e.target.files?.[0] ?? null); setTouched((s) => ({ ...s, cv: true })); }}
          aria-invalid={show('cv')} aria-describedby={show('cv') ? 'ap-err-cv' : undefined} />
        {err('cv', cv && cv.size > CV_MAX_BYTES ? t.errCvSize : t.errCv)}
      </label>
      <div className="hp" aria-hidden="true">
        <label>{t.honeypot}<input name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label>
      </div>
      {serverMsg && <p className="form__alert field--full" role="alert"><span aria-hidden="true">✕</span> {serverMsg}</p>}
      <div className="form__foot">
        <span className="form__note">{t.required}</span>
        <span style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="sent__again" onClick={onClose}>{t.cancel}</button>
          <button type="submit" className="btn btn--primary" disabled={busy} aria-busy={busy}>{busy ? t.sending : t.submit}<Arrow color="#FAF8F2" /></button>
        </span>
      </div>
    </form>
  );
}
