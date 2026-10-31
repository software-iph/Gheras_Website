import type { Metadata } from 'next';
import { SettingsForm } from '@/admin/SettingsForm';
import { getAdminLang } from '@/admin/lang';
import { requireAdmin } from '@/lib/auth/session';
import { getDraft } from '@/lib/cms/store';

export const metadata: Metadata = { title: 'Site settings' };

export default async function SettingsPage() {
  await requireAdmin();
  const lang = await getAdminLang();
  const draft = await getDraft();
  let host = 'gheras.ly';
  try { if (process.env.SITE_URL) host = new URL(process.env.SITE_URL).host; } catch { /* keep default */ }
  return (
    <SettingsForm
      lang={lang}
      site={draft.site}
      host={host}
      images={draft.media.filter((m) => m.url).map((m) => ({ id: m.id, name: m.file ?? m.brief, width: m.width, height: m.height }))}
    />
  );
}
