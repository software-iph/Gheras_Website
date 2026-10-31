import type { Metadata } from 'next';
import { MediaLibrary, type MediaItem } from '@/admin/MediaLibrary';
import { getAdminLang } from '@/admin/lang';
import { requireAdmin } from '@/lib/auth/session';
import { imageIssues, mediaUsage } from '@/lib/cms/checks';
import { getDraft } from '@/lib/cms/store';

export const metadata: Metadata = { title: 'Media library' };

export default async function MediaPage({ searchParams }: PageProps<'/admin/media'>) {
  await requireAdmin();
  const lang = await getAdminLang();
  const { filter, id } = await searchParams;
  const draft = await getDraft();
  const usage = mediaUsage(draft);
  const items: MediaItem[] = draft.media.map((m) => {
    const uses = usage.filter((u) => u.mediaId === m.id);
    const issues = uses.flatMap((u) => imageIssues(m, u.preset));
    return { media: m, used: uses.map((u) => u.where), issues: [...new Set(issues)], preset: uses[0]?.preset ?? null };
  });
  return (
    <MediaLibrary
      lang={lang}
      items={items}
      initialFilter={filter === 'alt' ? 'alt' : filter === 'unused' ? 'unused' : 'all'}
      initialId={typeof id === 'string' ? id : items[0]?.media.id}
    />
  );
}
