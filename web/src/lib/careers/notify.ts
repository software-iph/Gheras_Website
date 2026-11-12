import 'server-only';
import type { Application } from './types';

/**
 * Emails the team about a new job application through Resend (same settings as inquiries).
 * The CV itself is not attached: it is downloaded from the dashboard.
 */
export async function notifyApplication(a: Application): Promise<void> {
  const { RESEND_API_KEY: key, INQUIRY_EMAIL_TO: to, INQUIRY_EMAIL_FROM: from } = process.env;
  if (!key || !to || !from) {
    console.info(`[careers] application ${a.id} stored; email not configured, skipping notification.`);
    return;
  }
  const lines = [
    `Job: ${a.jobTitle ?? 'General application'}`,
    `Name: ${a.name}`,
    `Email: ${a.email}`,
    `Phone: ${a.phone ?? '—'}`,
    `Link: ${a.link ?? '—'}`,
    `CV: ${a.cv ? `${a.cv.original} (open the dashboard to download)` : '—'}`,
    `Page language: ${a.pageLang.toUpperCase()}`,
    `Received: ${a.createdAt}`,
    '',
    a.message || '(no message)',
  ];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((s) => s.trim()),
      reply_to: a.email,
      subject: `New job application — ${a.jobTitle ?? 'General'} — ${a.name}`,
      text: lines.join('\n'),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}
