import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { z } from 'zod';
import { LANGS } from '@/content/types';
import { deleteCv, detectCv, saveCv } from '@/lib/careers/cv';
import { notifyApplication } from '@/lib/careers/notify';
import { careersStore } from '@/lib/careers/store';
import { CV_MAX_BYTES, type Application, type ApplyResult } from '@/lib/careers/types';
import { allow } from '@/lib/inquiries/rate-limit';
import { EMAIL_RE } from '@/lib/inquiries/shared';

const input = z.object({
  jobId: z.string().default(''),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().max(320).regex(EMAIL_RE),
  phone: z.string().trim().max(60).default(''),
  link: z.string().trim().max(500).default(''),
  message: z.string().trim().max(5000).default(''),
  pageLang: z.enum(LANGS),
  // Honeypot: humans never see or fill this.
  website: z.string().default(''),
});

const reply = (r: ApplyResult, status = 200) => Response.json(r, { status });

/** Job application from the careers page: form fields + a CV file (multipart/form-data). */
export async function POST(req: Request) {
  let form: FormData;
  try { form = await req.formData(); } catch { return reply({ ok: false, error: 'invalid' }, 400); }
  const field = (k: string) => (typeof form.get(k) === 'string' ? String(form.get(k)) : undefined);
  const parsed = input.safeParse({
    jobId: field('jobId'), name: field('name'), email: field('email'), phone: field('phone'), link: field('link'),
    message: field('message'), pageLang: field('pageLang'), website: field('website'),
  });
  if (!parsed.success) return reply({ ok: false, error: 'invalid' }, 400);
  const d = parsed.data;
  if (d.website) return reply({ ok: true }); // bot: pretend it worked, store nothing

  // The job must be open and take applications on the site; no job = general application (if enabled).
  const settings = await careersStore.settings();
  if (!settings.enabled) return reply({ ok: false, error: 'closed' }, 409);
  let jobTitle: string | null = null;
  if (d.jobId) {
    const job = await careersStore.job(d.jobId);
    if (!job || job.status !== 'open' || job.applyMode !== 'form') return reply({ ok: false, error: 'closed' }, 409);
    jobTitle = job.title.en || job.title.ar;
  } else if (!settings.general) {
    return reply({ ok: false, error: 'closed' }, 409);
  }

  const file = form.get('cv');
  if (!(file instanceof File) || file.size === 0) return reply({ ok: false, error: 'cv' }, 400);
  if (file.size > CV_MAX_BYTES) return reply({ ok: false, error: 'cv-size' }, 413);
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = detectCv(buf, file.name);
  if (!kind) return reply({ ok: false, error: 'cv' }, 415);

  // Limit applications per connection; only complete, valid ones count (a wrong file can be retried).
  const h = await headers();
  // X-Real-IP is set by the proxy; the first X-Forwarded-For entry can be forged by the client.
  const ip = h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',').pop()?.trim() || 'unknown';
  if (!allow(`apply:${ip}`)) return reply({ ok: false, error: 'rate' }, 429);

  const id = randomUUID();
  const cvName = `${randomUUID()}.${kind.ext}`;
  const app: Application = {
    id,
    jobId: d.jobId || null,
    jobTitle,
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    link: d.link || null,
    message: d.message,
    // Keep letters in any language (e.g. Arabic file names), digits and a few safe symbols.
    cv: { name: cvName, original: file.name.replace(/[^\p{L}\p{N}._\- ()]+/gu, '').slice(0, 120) || cvName, type: kind.type, size: buf.length },
    pageLang: d.pageLang,
    status: 'new',
    read: false,
    notes: '',
    createdAt: new Date().toISOString(),
  };
  try {
    await saveCv(cvName, buf);
    await careersStore.createApplication(app);
  } catch (e) {
    console.error('[careers] application store failed', e);
    await deleteCv(cvName);
    return reply({ ok: false, error: 'server' }, 500);
  }
  // Stored; a failed email must not lose it or fail the applicant's submission.
  try { await notifyApplication(app); } catch (e) { console.error(`[careers] ${id} email failed`, e); }
  return reply({ ok: true });
}
