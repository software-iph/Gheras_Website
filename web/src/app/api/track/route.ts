import { headers } from 'next/headers';
import { getAdmin } from '@/lib/auth/session';
import { db } from '@/lib/db/sql';
import { TRACKED_PATHS, deviceOf, isBot, libyaDay, sourceOf, visitorId } from '@/lib/stats/track';

/** Receives one page view from the site (see components/site/Track.tsx). Always answers 204. */
export async function POST(req: Request) {
  const done = new Response(null, { status: 204 });
  try {
    const h = await headers();
    const ua = h.get('user-agent') ?? '';
    if (isBot(ua)) return done;
    if (await getAdmin()) return done; // the team's own visits are not counted
    const body = JSON.parse((await req.text()).slice(0, 4000)) as { p?: unknown; r?: unknown; w?: unknown };
    const path = typeof body.p === 'string' ? body.p.replace(/\/+$/, '') : '';
    if (!(TRACKED_PATHS as readonly string[]).includes(path)) return done;
    const referrer = typeof body.r === 'string' ? body.r.slice(0, 1000) : '';
    const width = typeof body.w === 'number' ? body.w : 0;
    const ip = h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',').pop()?.trim() || '0.0.0.0';
    const day = libyaDay();
    const { source, host } = sourceOf(referrer, h.get('host') ?? '');
    await db()`
      insert into page_views (day, visitor, path, lang, source, referrer_host, device)
      values (${day}, ${visitorId(day, ip, ua)}, ${path}, ${path.slice(1, 3)}, ${source}, ${host}, ${deviceOf(ua, width)})`;
  } catch (e) {
    console.error('[track] failed', e);
  }
  return done;
}
