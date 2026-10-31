import type { Metadata } from 'next';
import { Editor, type EditorField, type SectionMeta } from '@/admin/Editor';
import { getAdminLang } from '@/admin/lang';
import { requireAdmin } from '@/lib/auth/session';
import { checkContent, imageIssues, mediaUsage } from '@/lib/cms/checks';
import { getPath } from '@/lib/cms/diff';
import { FIXED_POSITION, LOCKED, SECTION_DEFS, sectionDef } from '@/lib/cms/schema';
import { getDraft, listRevisions } from '@/lib/cms/store';

export const metadata: Metadata = { title: 'Page editor' };

export default async function EditorPage({ searchParams }: PageProps<'/admin/editor'>) {
  await requireAdmin();
  const lang = await getAdminLang();
  const { section: wanted } = await searchParams;
  const [draft, revs] = await Promise.all([getDraft(), listRevisions()]);
  const report = checkContent(draft);

  // Sections needing attention get a gold dot.
  const warn = new Set<string>([...report.emptyAr, ...report.emptyEn, ...report.overLimit].map((p) => p.sectionId).filter(Boolean) as string[]);
  for (const u of mediaUsage(draft)) {
    const m = draft.media.find((x) => x.id === u.mediaId);
    if (m && u.sectionId && imageIssues(m, u.preset).length) warn.add(u.sectionId);
  }
  const fig = draft.sections.find((s) => s.id === 'figures') as { items?: { value: number | null }[] } | undefined;
  if (fig?.items?.some((i) => i.value == null)) warn.add('figures');
  const c = draft.site.contact;
  if (!c.email || !c.phone || c.replyTimeDays == null) warn.add('contact');

  const ordered = [...draft.sections].sort((a, b) => a.order - b.order);
  const sections: SectionMeta[] = ordered.flatMap((s) => {
    const def = sectionDef(s.id);
    return def ? [{ id: s.id, name: def.name, visible: s.visible, locked: LOCKED.includes(s.id), warn: warn.has(s.id), fixed: FIXED_POSITION.includes(s.id) }] : [];
  });
  const current = draft.sections.find((s) => s.id === wanted) ?? ordered[0];
  const def = sectionDef(current.id) ?? SECTION_DEFS[0];
  const fields: EditorField[] = def.fields(current).map((f) => ({ ...f, value: getPath(current, f.path) ?? null }));

  return (
    <Editor
      lang={lang}
      stamp={revs.length}
      sections={sections}
      current={{ id: current.id, name: def.name, desc: def.desc, anchor: def.anchor, locked: LOCKED.includes(current.id), section: current }}
      fields={fields}
      media={draft.media}
    />
  );
}
