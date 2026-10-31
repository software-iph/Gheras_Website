import 'server-only';
import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db/sql';
import { hashPassword } from './crypto';

/** v1: a single Administrator with full access. Roles 'editor' | 'inquiries' | 'reviewer' come later. */
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  passwordHash: string;
  twoFactor: boolean;
  totpSecret: string | null;
  /** Generated on first sign-in, confirmed by entering a code. */
  pendingTotpSecret: string | null;
  lastTotpStep: number;
  /** Bump to sign out every session for this user. */
  sessionVersion: number;
};

const COLUMNS = {
  id: 'id', name: 'name', email: 'email', role: 'role', passwordHash: 'password_hash', twoFactor: 'two_factor',
  totpSecret: 'totp_secret', pendingTotpSecret: 'pending_totp_secret', lastTotpStep: 'last_totp_step', sessionVersion: 'session_version',
} as const satisfies Record<keyof User, string>;

type Row = { [K in keyof typeof COLUMNS as (typeof COLUMNS)[K]]: unknown };
const fromRow = (r: Row): User => ({
  id: r.id as string, name: r.name as string, email: r.email as string, role: 'admin',
  passwordHash: r.password_hash as string, twoFactor: r.two_factor as boolean,
  totpSecret: r.totp_secret as string | null, pendingTotpSecret: r.pending_totp_secret as string | null,
  lastTotpStep: Number(r.last_totp_step), sessionVersion: Number(r.session_version),
});

/**
 * The first administrator is created on first use from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
 * Without those variables nobody can sign in (the login page says so).
 */
async function seedAdmin() {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password, ADMIN_NAME: name } = process.env;
  if (!email || !password) return;
  await db()`
    insert into admin_users (id, name, email, password_hash)
    values (${randomUUID()}, ${name || email}, ${email.trim().toLowerCase()}, ${await hashPassword(password)})
    on conflict (email) do nothing`;
}

export async function listUsers(): Promise<User[]> {
  const sql = db();
  let rows = await sql<Row[]>`select * from admin_users order by created_at`;
  if (!rows.length) {
    await seedAdmin();
    rows = await sql<Row[]>`select * from admin_users order by created_at`;
  }
  return rows.map(fromRow);
}

export async function findUserByEmail(email: string) {
  await listUsers();
  const [row] = await db()<Row[]>`select * from admin_users where email = ${email.trim().toLowerCase()}`;
  return row ? fromRow(row) : undefined;
}

export async function findUser(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  const [row] = await db()<Row[]>`select * from admin_users where id = ${id}`;
  return row ? fromRow(row) : undefined;
}

export async function updateUser(id: string, patch: Partial<Omit<User, 'id'>>) {
  const values = Object.fromEntries(Object.entries(patch).map(([k, v]) => [COLUMNS[k as keyof User], v]));
  if (!Object.keys(values).length) return;
  const sql = db();
  await sql`update admin_users set ${sql(values)} where id = ${id}`;
}

export const publicUser = (u: User) => ({ id: u.id, name: u.name, email: u.email, role: u.role, twoFactor: u.twoFactor });
export type PublicUser = ReturnType<typeof publicUser>;
