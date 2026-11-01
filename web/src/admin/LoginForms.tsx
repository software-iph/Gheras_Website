'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/brand/Icon';
import { setAdminLang, signIn, type AuthState } from '@/lib/auth/actions';
import { dict, type UILang } from './i18n';

const errText = (t: ReturnType<typeof dict>, e?: AuthState['error']) =>
  e === 'credentials' ? t.errCredentials : e === 'rate' ? t.errRate : null;

export function LangToggle({ lang }: { lang: UILang }) {
  const router = useRouter();
  return (
    <button type="button" className="lang-toggle" lang={lang === 'ar' ? 'en' : 'ar'}
      onClick={async () => { await setAdminLang(lang === 'ar' ? 'en' : 'ar'); router.refresh(); }}>
      <Icon glyph="globe" size={16} />{dict(lang).otherLang}
    </button>
  );
}

export function SignInForm({ lang, configured }: { lang: UILang; configured: boolean }) {
  const t = dict(lang);
  const [state, action, pending] = useActionState(signIn, {});
  const [forgot, setForgot] = useState(false);
  const err = errText(t, state.error);
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 className="d-h" style={{ fontSize: 34 }}>{t.signIn}</h1>
      {!configured && <p role="alert" className="check" style={{ background: '#F6EBD2', color: '#86621E', margin: 0 }}>{t.noAdmin}</p>}
      <label className="field-label">{t.email}
        <input key={state.email ?? ''} className="in in--en" name="email" type="email" dir="ltr" autoComplete="username" required defaultValue={state.email} style={{ height: 48, fontSize: 16, textAlign: 'start' }} />
      </label>
      <label className="field-label">
        <span style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{t.password}</span>
          <button type="button" className="link-btn" style={{ fontSize: 13, fontWeight: 600 }} onClick={() => setForgot((v) => !v)} aria-expanded={forgot}>{t.forgot}</button>
        </span>
        <input className="in" name="password" type="password" autoComplete="current-password" required style={{ height: 48, fontSize: 16 }} />
      </label>
      {forgot && <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{t.forgotNote}</p>}
      {err && <p role="alert" className="err" style={{ fontSize: 14, margin: 0 }}>{err}</p>}
      <button type="submit" className="b b--primary" style={{ height: 52, fontSize: 16 }} disabled={pending}>{t.signIn}</button>
      <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{t.loginNote}</p>
    </form>
  );
}
