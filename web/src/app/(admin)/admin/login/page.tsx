import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { LangToggle, SignInForm, VerifyForm } from '@/admin/LoginForms';
import { dict } from '@/admin/i18n';
import { getAdminLang } from '@/admin/lang';
import { BotanicalLineArt } from '@/components/brand/Ornaments';
import { LogoHorizontal } from '@/components/brand/Logo';
import { otpauthUri } from '@/lib/auth/crypto';
import { getAdmin, getPendingMfaUser } from '@/lib/auth/session';
import { listUsers } from '@/lib/auth/users';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: PageProps<'/admin/login'>) {
  if (await getAdmin()) redirect('/admin');
  const lang = await getAdminLang();
  const t = dict(lang);
  const { step } = await searchParams;
  const pendingUser = step === 'verify' ? await getPendingMfaUser() : null;
  let enroll: { qr: string; secret: string } | undefined;
  if (pendingUser && !pendingUser.twoFactor && pendingUser.pendingTotpSecret) {
    const uri = otpauthUri(pendingUser.pendingTotpSecret, pendingUser.email);
    enroll = { qr: await QRCode.toDataURL(uri, { margin: 0, width: 400, color: { dark: '#1F2A1C', light: '#FFFFFF' } }), secret: pendingUser.pendingTotpSecret };
  }
  const configured = (await listUsers()).length > 0;

  return (
    <div className="login">
      <div className="login__brand">
        <div className="login__art" aria-hidden="true"><BotanicalLineArt stroke={0.45} /></div>
        <div style={{ position: 'relative' }}><LogoHorizontal scheme="reversed" rtl={lang === 'ar'} width={220} alt={lang === 'ar' ? 'غراس' : 'GHERAS'} /></div>
        <div style={{ position: 'relative', maxWidth: 440 }}>
          <div className="d-h" style={{ fontSize: 44, lineHeight: 1.25, marginBottom: 16 }}>{t.loginTitle}</div>
          <div style={{ fontSize: 16, lineHeight: 1.7, color: '#E8D3A0' }}>{t.loginSub}</div>
        </div>
      </div>
      <div className="login__form">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><LangToggle lang={lang} /></div>
        {pendingUser ? <VerifyForm lang={lang} enroll={enroll} /> : <SignInForm lang={lang} configured={configured} />}
      </div>
    </div>
  );
}
