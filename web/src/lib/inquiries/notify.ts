import 'server-only';
import type { Inquiry } from './types';

/**
 * Emails the team about a new inquiry through Resend's HTTP API.
 * Skipped (with a log line) until RESEND_API_KEY, INQUIRY_EMAIL_TO and INQUIRY_EMAIL_FROM are set.
 */
export async function notifyTeam(inq: Inquiry): Promise<void> {
  const { RESEND_API_KEY: key, INQUIRY_EMAIL_TO: to, INQUIRY_EMAIL_FROM: from } = process.env;
  if (!key || !to || !from) {
    console.info(`[inquiry] ${inq.id} stored; email not configured, skipping notification.`);
    return;
  }
  const lines = [
    `Type: ${inq.type}`,
    `Name: ${inq.name}`,
    `Organisation: ${inq.organisation || '—'}`,
    `Email: ${inq.email}`,
    `Phone: ${inq.phone ?? '—'}`,
    `Page language: ${inq.pageLang.toUpperCase()}`,
    `Received: ${inq.createdAt}`,
    '',
    inq.message,
  ];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((s) => s.trim()),
      reply_to: inq.email,
      subject: `New ${inq.type} inquiry — ${inq.name}`,
      text: lines.join('\n'),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}
