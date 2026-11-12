import 'server-only';
import { createHash } from 'node:crypto';

/** Public pages that are counted (anything else is ignored). */
export const TRACKED_PATHS = ['/en', '/ar', '/en/careers', '/ar/careers'] as const;

export const PAGE_LABELS: Record<string, { en: string; ar: string }> = {
  '/en': { en: 'Home (English)', ar: 'الرئيسية (إنجليزي)' },
  '/ar': { en: 'Home (Arabic)', ar: 'الرئيسية (عربي)' },
  '/en/careers': { en: 'Careers (English)', ar: 'الوظائف (إنجليزي)' },
  '/ar/careers': { en: 'Careers (Arabic)', ar: 'الوظائف (عربي)' },
};

const BOTS = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pagespeed|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|httpclient|scrapy|semrush|ahrefs|bingpreview/i;
export const isBot = (ua: string) => !ua || BOTS.test(ua);

export function deviceOf(ua: string, width: number): 'desktop' | 'mobile' | 'tablet' {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return 'mobile';
  if (width > 0 && width < 600) return 'mobile';
  return 'desktop';
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, 'Google'], [/(^|\.)bing\.com$/, 'Bing'], [/(^|\.)yahoo\./, 'Yahoo'], [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
  [/(^|\.)yandex\./, 'Yandex'], [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'Facebook'], [/(^|\.)instagram\.com$/, 'Instagram'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'LinkedIn'], [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'X'], [/(^|\.)whatsapp\.(com|net)$/, 'WhatsApp'],
  [/(^|\.)(telegram\.org|t\.me)$/, 'Telegram'], [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'], [/(^|\.)tiktok\.com$/, 'TikTok'],
];

/** Where the visit came from: Direct, Internal (another page of this site), a known site, or the referring host. */
export function sourceOf(referrer: string, ownHost: string): { source: string; host: string | null } {
  if (!referrer) return { source: 'Direct', host: null };
  let host: string;
  try { host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, ''); } catch { return { source: 'Direct', host: null }; }
  if (!host) return { source: 'Direct', host: null };
  if (host === ownHost.toLowerCase().replace(/^www\./, '').split(':')[0]) return { source: 'Internal', host };
  for (const [re, name] of SOURCES) if (re.test(host)) return { source: name, host };
  return { source: host, host };
}

/** Calendar day in Libya (UTC+2), so "today" matches the team's clock. */
export const libyaDay = (d = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Tripoli', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

/**
 * Anonymous visitor id: a hash of (secret, day, IP, browser). It changes every day and cannot be
 * turned back into an IP, so the same person counts once per day and nothing personal is stored.
 */
export function visitorId(day: string, ip: string, ua: string) {
  const secret = process.env.SESSION_SECRET ?? 'gheras';
  return createHash('sha256').update(`${secret}|${day}|${ip}|${ua}`).digest('hex').slice(0, 24);
}
