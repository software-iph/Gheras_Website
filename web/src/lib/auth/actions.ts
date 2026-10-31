'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { blocked, fail } from '@/lib/inquiries/rate-limit';
import { newTotpSecret, verifyPassword, verifyTotp } from './crypto';
import { endSession, getPendingMfaUser, startSession } from './session';
import { findUserByEmail, updateUser } from './users';

export type AuthState = { error?: 'credentials' | 'rate' | 'code' | 'expired'; email?: string };

const clientKey = async () => {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'local';
};

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');
  const key = `login:${await clientKey()}`;
  if (blocked(key)) return { error: 'rate', email };
  const user = await findUserByEmail(email);
  // Always run the hash so response time does not reveal whether the email exists.
  const ok = await verifyPassword(password, user?.passwordHash ?? 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAA');
  if (!user || !ok) { fail(key); return { error: 'credentials', email }; }
  if (!user.twoFactor && !user.pendingTotpSecret) await updateUser(user.id, { pendingTotpSecret: newTotpSecret() });
  await startSession(user.id, 'mfa', user.sessionVersion);
  redirect('/admin/login?step=verify');
}

export async function verifyCode(_: AuthState, form: FormData): Promise<AuthState> {
  const user = await getPendingMfaUser();
  if (!user) return { error: 'expired' };
  if (blocked(`mfa:${user.id}`)) return { error: 'rate' };
  const enrolling = !user.twoFactor;
  const secret = enrolling ? user.pendingTotpSecret : user.totpSecret;
  if (!secret) return { error: 'expired' };
  const step = verifyTotp(secret, String(form.get('code') ?? ''), user.lastTotpStep);
  if (step === null) { fail(`mfa:${user.id}`); return { error: 'code' }; }
  await updateUser(user.id, enrolling
    ? { twoFactor: true, totpSecret: secret, pendingTotpSecret: null, lastTotpStep: step }
    : { lastTotpStep: step });
  await startSession(user.id, 'full', user.sessionVersion);
  redirect('/admin');
}

export async function signOut() {
  await endSession();
  redirect('/admin/login');
}

/** Dashboard interface language (EN | AR), independent of the site language being edited. */
export async function setAdminLang(lang: 'en' | 'ar') {
  (await cookies()).set('gheras_admin_lang', lang === 'ar' ? 'ar' : 'en', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
}
