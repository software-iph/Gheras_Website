'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { INQUIRY_TYPES, type InquiryType, type Lang } from '@/content/types';
import { ui } from '@/i18n/ui';
import { Arrow } from '@/components/brand/Icon';
import { submitInquiry } from '@/lib/inquiries/actions';
import { EMAIL_RE, type SubmitResult } from '@/lib/inquiries/shared';
import { INQUIRY_EVENT } from './InquiryLink';

const EASE = 'cubic-bezier(.22,.61,.36,1)';
type Fields = { name: string; org: string; email: string; phone: string; type: InquiryType; message: string; website: string };
const EMPTY: Fields = { name: '', org: '', email: '', phone: '', type: 'Investment', message: '', website: '' };
type Key = 'name' | 'email' | 'msg';

export function ContactForm({ lang, replyTimeDays }: { lang: Lang; replyTimeDays: number | null }) {
  const t = ui[lang].form;
  const [f, setF] = useState<Fields>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<null | 'rate' | 'server'>(null);
  const [pending, startTransition] = useTransition();
  const statusRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasSent = useRef(false);

  const bad: Record<Key, boolean> = {
    name: !f.name.trim(),
    email: !EMAIL_RE.test(f.email.trim()),
    msg: !f.message.trim(),
  };
  const show = (k: Key) => !!touched[k] && bad[k];
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));
  const touch = (k: Key) => () => setTouched((s) => ({ ...s, [k]: true }));

  // "Who we work with" links pre-select the inquiry type.
  useEffect(() => {
    const onPick = (e: Event) => {
      const type = (e as CustomEvent<InquiryType>).detail;
      if (!INQUIRY_TYPES.includes(type)) return;
      setSent(false);
      setF((s) => ({ ...s, type }));
    };
    window.addEventListener(INQUIRY_EVENT, onPick);
    return () => window.removeEventListener(INQUIRY_EVENT, onPick);
  }, []);

  // Success: panel rises, check draws in, focus moves to the confirmation.
  useEffect(() => {
    if (sent && !wasSent.current) {
      const box = statusRef.current;
      box?.focus();
      if (box && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        box.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: EASE });
        box.querySelector('[data-m=check]')?.animate(
          [{ strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDasharray: '1 1', strokeDashoffset: 0 }],
          { duration: 600, delay: 300, easing: EASE, fill: 'backwards' },
        );
      }
    }
    if (!sent && wasSent.current) nameRef.current?.focus();
    wasSent.current = sent;
  }, [sent]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (bad.name || bad.email || bad.msg) {
      setTouched({ name: true, email: true, msg: true });
      const first = bad.name ? 'name' : bad.email ? 'email' : 'message';
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    startTransition(async () => {
      let res: SubmitResult;
      try {
        res = await submitInquiry({
          name: f.name, organisation: f.org, email: f.email, phone: f.phone,
          type: f.type, message: f.message, pageLang: lang, website: f.website,
        });
      } catch {
        res = { ok: false, error: 'server' };
      }
      if (res.ok) setSent(true);
      else if (res.error === 'invalid') setTouched({ name: true, email: true, msg: true });
      else setServerError(res.error);
    });
  };

  const reset = () => {
    setF(EMPTY);
    setTouched({});
    setServerError(null);
    setSent(false);
  };

  if (sent) {
    const first = f.name.trim().split(/\s+/)[0] ?? '';
    return (
      <div className="sent" role="status" ref={statusRef} tabIndex={-1}>
        <div className="sent__icon">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <path data-m="check" d="M8 16.5l5.5 5.5L24 10.5" fill="none" stroke="#3F5A2A" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
          </svg>
        </div>
        <h3>{t.thanks(first)}</h3>
        <p>
          {t.replyBefore(f.email.trim())}
          {replyTimeDays != null ? <bdi>{replyTimeDays}</bdi> : <span className="ph ph--inline">[X]</span>}
          {t.replyAfter}
        </p>
        <button type="button" className="sent__again" onClick={reset}>{t.another}</button>
      </div>
    );
  }

  const err = (k: Key, msg: string, id: string) =>
    show(k) ? <span className="field__err" role="alert" id={id}><span aria-hidden="true">✕</span> {msg}</span> : null;

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
      <label className="field">
        {t.name}
        <input ref={nameRef} className="input" name="name" autoComplete="name" required value={f.name}
          onChange={set('name')} onBlur={touch('name')} aria-invalid={show('name')}
          aria-describedby={show('name') ? 'err-name' : undefined} />
        {err('name', t.errName, 'err-name')}
      </label>
      <label className="field">
        {t.org}
        <input className="input" name="organisation" autoComplete="organization" value={f.org} onChange={set('org')} />
      </label>
      <label className="field">
        {t.email}
        <input className="input" name="email" type="email" dir={lang === 'ar' ? 'ltr' : undefined} autoComplete="email" required
          value={f.email} onChange={set('email')} onBlur={touch('email')} aria-invalid={show('email')}
          aria-describedby={show('email') ? 'err-email' : undefined} />
        {err('email', t.errEmail, 'err-email')}
      </label>
      <label className="field">
        <span>{t.phone} <span className="field__opt">{t.optional}</span></span>
        <input className="input" name="phone" type="tel" dir={lang === 'ar' ? 'ltr' : undefined} autoComplete="tel"
          value={f.phone} onChange={set('phone')} />
      </label>
      <label className="field field--full">
        {t.type}
        <select className="input" name="type" value={f.type} onChange={set('type')}>
          {INQUIRY_TYPES.map((k) => <option key={k} value={k}>{t.types[k]}</option>)}
        </select>
      </label>
      <label className="field field--full">
        {t.message}
        <textarea className="input" name="message" rows={5} required value={f.message}
          onChange={set('message')} onBlur={touch('msg')} aria-invalid={show('msg')}
          aria-describedby={show('msg') ? 'err-msg' : undefined} />
        {err('msg', t.errMsg, 'err-msg')}
      </label>
      <div className="hp" aria-hidden="true">
        <label>
          {t.honeypot}
          <input name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} />
        </label>
      </div>
      {serverError && (
        <p className="form__alert" role="alert">
          <span aria-hidden="true">✕</span> {serverError === 'rate' ? t.errRate : t.errServer}
        </p>
      )}
      <div className="form__foot">
        <span className="form__note">{t.required}</span>
        <button type="submit" className="btn btn--lg btn--primary" disabled={pending} aria-busy={pending}>
          {pending ? t.sending : t.submit}<Arrow color="#FAF8F2" />
        </button>
      </div>
    </form>
  );
}
