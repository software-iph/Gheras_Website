'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import {
  deleteApplication, deleteJob, markApplicationRead, saveApplicationNotes, saveCareersSettings, saveJob, setApplicationStatus,
} from '@/lib/careers/actions';
import { APP_STATUSES, EMPLOYMENT, type Application, type AppStatus, type CareersSettings, type Job } from '@/lib/careers/types';
import { dict, type UILang } from './i18n';

/* ---------- Application: status, notes, delete ---------- */
export function ApplicationActions({ lang, app }: { lang: UILang; app: Application }) {
  const t = dict(lang).cr;
  const router = useRouter();
  const [notes, setNotes] = useState(app.notes);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  // Opening an application marks it read.
  useEffect(() => {
    if (!app.read) markApplicationRead(app.id).then(() => router.refresh());
  }, [app.id, app.read, router]);

  const status = (s: AppStatus) => start(async () => { await setApplicationStatus(app.id, s); router.refresh(); });
  const remove = () => {
    if (!window.confirm(t.delConfirm)) return;
    start(async () => { await deleteApplication(app.id); router.push('/admin/careers'); router.refresh(); });
  };
  const subject = encodeURIComponent(app.pageLang === 'ar' ? `طلبك لدى غراس${app.jobTitle ? ` — ${app.jobTitle}` : ''}` : `Your application to GHERAS${app.jobTitle ? ` — ${app.jobTitle}` : ''}`);

  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {app.cv && <a href={`/admin/api/cv/${app.id}`} className="b b--primary">{t.downloadCv}</a>}
        <a href={`mailto:${app.email}?subject=${subject}`} className="b b--secondary">{t.replyEmail}</a>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{t.setStatus}</span>
        <div className="chips" role="group" aria-label={t.setStatus}>
          {APP_STATUSES.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={app.status === s} disabled={pending} onClick={() => status(s)} style={{ height: 34 }}>
              {t.status[s]}
            </button>
          ))}
        </div>
      </div>
      <label className="field-label" style={{ fontSize: 13 }}>
        {t.notes}
        <textarea className="in" rows={3} value={notes} placeholder={t.notesPh} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} />
      </label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="b b--md b--secondary" disabled={pending || notes === app.notes}
          onClick={() => start(async () => { await saveApplicationNotes(app.id, notes); setSaved(true); router.refresh(); })}>{t.saveNotes}</button>
        {saved && <span role="status" style={{ fontSize: 13, color: '#3F5A2A', fontWeight: 600 }}>✓ {t.saved}</span>}
        <button type="button" className="b b--md b--danger" style={{ marginInlineStart: 'auto' }} disabled={pending} onClick={remove}>{t.del}</button>
      </div>
    </>
  );
}

/* ---------- Job editor ---------- */

export function JobForm({ lang, job }: { lang: UILang; job: Omit<Job, 'createdAt' | 'updatedAt'> }) {
  const t = dict(lang).cr;
  const router = useRouter();
  const [j, setJ] = useState(job);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const up = (patch: Partial<typeof j>) => { setJ((x) => ({ ...x, ...patch })); setSaved(false); };
  const bi = (label: string, key: 'title' | 'department' | 'location' | 'description', area = false, hint?: string) => {
    const Tag = area ? 'textarea' : 'input';
    return (
      <div className="field-label" style={{ fontSize: 13 }}>
        <span>{label}{hint && <span className="muted" style={{ fontWeight: 400 }}> · {hint}</span>}</span>
        <div className="bi">
          {(['en', 'ar'] as const).map((l) => (
            <Tag key={l} className={`in ${l === 'ar' ? 'in--ar' : 'in--en'}`} dir={l === 'ar' ? 'rtl' : 'ltr'} lang={l}
              rows={area ? 8 : undefined} value={j[key][l] ?? ''} aria-label={`${label} (${l.toUpperCase()})`}
              placeholder={l === 'ar' ? 'بالعربية' : 'In English'}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => up({ [key]: { ...j[key], [l]: e.target.value } } as Partial<typeof j>)} />
          ))}
        </div>
      </div>
    );
  };

  const save = () => start(async () => {
    setErr(null);
    const r = await saveJob({ ...j, id: j.id || undefined });
    if (!r.ok) { setErr(r.error === 'url' ? t.errUrl : t.errTitle); return; }
    setSaved(true);
    if (!j.id && r.id) router.push(`/admin/careers?tab=jobs&job=${r.id}`);
    router.refresh();
  });
  const remove = () => {
    if (!j.id || !window.confirm(t.deleteJobConfirm)) return;
    start(async () => { await deleteJob(j.id); router.push('/admin/careers?tab=jobs'); router.refresh(); });
  };

  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h2 className="d-h" style={{ fontSize: 24 }}>{j.id ? t.editJob : t.newJob}</h2>
      {bi(t.titleF, 'title')}
      {bi(t.department, 'department')}
      {bi(t.location, 'location')}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <label className="field-label" style={{ fontSize: 13, minWidth: 200 }}>
          {t.employment}
          <select className="in" value={j.employment} onChange={(e) => up({ employment: e.target.value as Job['employment'] })}>
            {EMPLOYMENT.map((k) => <option key={k} value={k}>{t.employmentTypes[k]}</option>)}
          </select>
        </label>
        <label className="field-label" style={{ fontSize: 13, minWidth: 160 }}>
          {t.jobStatus}
          <select className="in" value={j.status} onChange={(e) => up({ status: e.target.value as Job['status'] })}>
            <option value="open">{t.open}</option>
            <option value="closed">{t.closed}</option>
          </select>
        </label>
        <label className="field-label" style={{ fontSize: 13, width: 160 }}>
          <span>{t.order}</span>
          <input className="in" type="number" min={0} max={9999} value={j.sort} onChange={(e) => up({ sort: Number(e.target.value) || 0 })} />
          <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>{t.orderHint}</span>
        </label>
      </div>
      {bi(t.description, 'description', true, t.descHint)}
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <legend className="field-label" style={{ fontSize: 13, marginBottom: 8 }}>{t.applyHow}</legend>
        {(['form', 'link'] as const).map((m) => (
          <label key={m} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
            <input type="radio" name="applyMode" checked={j.applyMode === m} onChange={() => up({ applyMode: m })} />
            {m === 'form' ? t.applyForm : t.applyLink}
          </label>
        ))}
        {j.applyMode === 'link' && (
          <label className="field-label" style={{ fontSize: 13 }}>
            {t.applyUrl}
            <input className="in in--en" dir="ltr" type="url" placeholder="https://" value={j.applyUrl ?? ''} onChange={(e) => up({ applyUrl: e.target.value })} />
          </label>
        )}
      </fieldset>
      {err && <p className="err" role="alert" style={{ margin: 0, fontSize: 14 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="b b--primary" disabled={pending} onClick={save}>{pending ? t.saving : t.save}</button>
        {saved && <span role="status" style={{ fontSize: 13, color: '#3F5A2A', fontWeight: 600 }}>✓ {t.saved}</span>}
        {j.id && <button type="button" className="b b--md b--danger" style={{ marginInlineStart: 'auto' }} disabled={pending} onClick={remove}>{t.deleteJob}</button>}
      </div>
    </div>
  );
}

/* ---------- Careers settings ---------- */
export function CareersSettingsForm({ lang, settings }: { lang: UILang; settings: CareersSettings }) {
  const t = dict(lang).cr;
  const router = useRouter();
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const up = (patch: Partial<CareersSettings>) => { setS((x) => ({ ...x, ...patch })); setSaved(false); };
  const row = (label: string, desc: string, on: boolean, set: (v: boolean) => void) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div><div style={{ fontWeight: 700, fontSize: 15 }}>{label}</div><div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{desc}</div></div>
      <button type="button" className="sw" role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} />
    </div>
  );
  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 820 }}>
      {row(t.sEnabled, t.sEnabledD, s.enabled, (v) => up({ enabled: v }))}
      {row(t.sGeneral, t.sGeneralD, s.general, (v) => up({ general: v }))}
      <div className="field-label" style={{ fontSize: 13 }}>
        {t.sIntro}
        <div className="bi">
          {(['en', 'ar'] as const).map((l) => (
            <textarea key={l} className={`in ${l === 'ar' ? 'in--ar' : 'in--en'}`} dir={l === 'ar' ? 'rtl' : 'ltr'} lang={l} rows={3}
              value={s.intro[l] ?? ''} aria-label={`${t.sIntro} (${l.toUpperCase()})`} onChange={(e) => up({ intro: { ...s.intro, [l]: e.target.value } })} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button type="button" className="b b--primary" disabled={pending}
          onClick={() => start(async () => { await saveCareersSettings(s); setSaved(true); router.refresh(); })}>{t.sSave}</button>
        {saved && <span role="status" style={{ fontSize: 13, color: '#3F5A2A', fontWeight: 600 }}>✓ {t.saved}</span>}
      </div>
    </div>
  );
}
