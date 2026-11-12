import 'server-only';
import { blocking, checkContent } from '@/lib/cms/checks';
import { pendingChanges } from '@/lib/cms/store';
import { careersStore } from '@/lib/careers/store';
import { inquiryStore } from '@/lib/inquiries/store';
import type { PublishSummary } from './Shell';

/** Counts shown in the shell (draft chip, inbox badge, publish dialog) and on the overview. */
export async function dashboardState() {
  const [{ draft, published, diffs }, inquiries, newApps] = await Promise.all([pendingChanges(), inquiryStore.list(), careersStore.unreadApplications()]);
  const report = checkContent(draft);
  const summary: PublishSummary = {
    pending: diffs.length,
    overLimit: report.overLimit.length,
    emptyEn: report.emptyEn.length,
    badUrls: report.badUrls.length,
    imageProblems: report.imageProblems.length,
    emptyAr: report.emptyAr.length,
    placeholders: report.placeholders.length,
    blockers: blocking(report).slice(0, 6).map(({ where, lang, detail }) => ({ where, lang, detail })),
  };
  const unread = inquiries.filter((q) => !q.read && q.status !== 'archived');
  return { draft, published, diffs, report, summary, inquiries, unread, newApps, blocked: blocking(report).length > 0 };
}
