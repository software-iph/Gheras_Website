'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { inquiryInput, type Inquiry, type InquiryInput } from './types';
import type { SubmitResult } from './shared';
import { inquiryStore } from './store';
import { notifyTeam } from './notify';
import { allow } from './rate-limit';

export async function submitInquiry(input: InquiryInput): Promise<SubmitResult> {
  const parsed = inquiryInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  const d = parsed.data;

  // Honeypot filled: report success to the bot, store nothing.
  if (d.website) return { ok: true };

  const h = await headers();
  // X-Real-IP is set by the proxy; the first X-Forwarded-For entry can be forged by the client.
  const ip = h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',').pop()?.trim() || 'unknown';
  if (!allow(ip)) return { ok: false, error: 'rate' };

  const inquiry: Inquiry = {
    id: randomUUID(),
    name: d.name,
    organisation: d.organisation,
    email: d.email,
    phone: d.phone || null,
    type: d.type,
    message: d.message,
    pageLang: d.pageLang,
    status: 'new',
    read: false,
    notes: '',
    createdAt: new Date().toISOString(),
  };

  try {
    await inquiryStore.create(inquiry);
  } catch (e) {
    console.error('[inquiry] store failed', e);
    return { ok: false, error: 'server' };
  }
  // The inquiry is saved; a failed email must not lose it or fail the visitor's submission.
  try {
    await notifyTeam(inquiry);
  } catch (e) {
    console.error(`[inquiry] ${inquiry.id} email failed`, e);
  }
  return { ok: true };
}
