import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sign, unsign } from './crypto';
import { findUser, publicUser, type PublicUser } from './users';

const COOKIE = 'gheras_admin';
const FULL_TTL = 12 * 60 * 60 * 1000; // 12 h

type Stage = 'full';
type Payload = { uid: string; stage: Stage; exp: number; v: number };

/** SESSION_SECRET (≥ 32 random characters) signs the session cookie. */
async function secret(): Promise<string> {
  const env = process.env.SESSION_SECRET;
  if (!env || env.length < 32) throw new Error('SESSION_SECRET (at least 32 characters) must be set — see .env.example.');
  return env;
}

export async function startSession(uid: string, version: number) {
  const exp = Date.now() + FULL_TTL;
  (await cookies()).set(COOKIE, sign({ uid, stage: 'full', exp, v: version } satisfies Payload, await secret()), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', expires: new Date(exp),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

async function read(): Promise<{ payload: Payload; user: NonNullable<Awaited<ReturnType<typeof findUser>>> } | null> {
  const payload = unsign<Payload>((await cookies()).get(COOKIE)?.value, await secret());
  if (!payload || payload.exp < Date.now()) return null;
  const user = await findUser(payload.uid);
  if (!user || user.sessionVersion !== payload.v) return null;
  return { payload, user };
}

/** The signed-in admin, or null. */
export async function getAdmin(): Promise<PublicUser | null> {
  const s = await read();
  return s && s.payload.stage === 'full' ? publicUser(s.user) : null;
}

/** Use at the top of every dashboard page, route handler and server action. */
export async function requireAdmin(): Promise<PublicUser> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
