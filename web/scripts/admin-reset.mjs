// Reset the administrator's password and/or two-step verification, and sign out all sessions.
// Usage: npm run admin:reset -- [--password <new>] [--reset-2fa] [--email <admin email>]
// Without --password a random one is generated and printed. Reads DATABASE_URL from .env.local.
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import postgres from 'postgres';

const scrypt = promisify(scryptCb);
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is not set (add it to .env.local).'); process.exit(1); }

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  const email = opt('--email')?.toLowerCase();
  const [user] = email
    ? await sql`select id, email from admin_users where email = ${email}`
    : await sql`select id, email from admin_users order by created_at limit 1`;
  if (!user) { console.error('No administrator found. Sign in once with ADMIN_EMAIL/ADMIN_PASSWORD to create it.'); process.exitCode = 1; }
  else {
    const password = opt('--password') ?? randomBytes(9).toString('base64url');
    const salt = randomBytes(16);
    const hash = `scrypt$${salt.toString('base64')}$${(await scrypt(password, salt, 64)).toString('base64')}`;
    const reset2fa = args.includes('--reset-2fa');
    await sql`
      update admin_users set
        password_hash = ${hash},
        session_version = session_version + 1,
        two_factor = case when ${reset2fa} then false else two_factor end,
        totp_secret = case when ${reset2fa} then null else totp_secret end,
        pending_totp_secret = case when ${reset2fa} then null else pending_totp_secret end,
        last_totp_step = case when ${reset2fa} then -1 else last_totp_step end
      where id = ${user.id}`;
    console.log(`Updated ${user.email}. New password: ${password}${reset2fa ? ' · two-step verification will be set up again on next sign-in' : ''}`);
  }
} finally {
  await sql.end();
}
