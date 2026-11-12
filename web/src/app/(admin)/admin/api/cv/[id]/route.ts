import { getAdmin } from '@/lib/auth/session';
import { cvContentType, readCv } from '@/lib/careers/cv';
import { careersStore } from '@/lib/careers/store';

/** Admin-only download of an applicant's CV. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin())) return new Response('Unauthorized', { status: 401 });
  const { id } = await params;
  const app = await careersStore.application(id);
  if (!app?.cv) return new Response('Not found', { status: 404 });
  const buf = await readCv(app.cv.name);
  if (!buf) return new Response('Not found', { status: 404 });
  const ext = app.cv.name.split('.').pop();
  // Original name (any language) for modern browsers, plus a plain-ASCII fallback.
  const base = (app.cv.original.replace(/\.[^.]+$/, '') || app.name).replace(/[^\p{L}\p{N}_\- ]+/gu, '').trim() || 'cv';
  const ascii = base.replace(/[^\w\- ]+/g, '').trim() || 'cv';
  return new Response(new Uint8Array(buf), {
    headers: {
      'Content-Type': cvContentType(app.cv.name),
      'Content-Length': String(buf.length),
      'Content-Disposition': `attachment; filename="${ascii}.${ext}"; filename*=UTF-8''${encodeURIComponent(`${base}.${ext}`)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
