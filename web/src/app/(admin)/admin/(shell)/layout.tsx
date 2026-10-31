import { Shell } from '@/admin/Shell';
import { dashboardState } from '@/admin/data';
import { getAdminLang } from '@/admin/lang';
import { requireAdmin } from '@/lib/auth/session';

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [lang, state] = await Promise.all([getAdminLang(), dashboardState()]);
  return (
    <Shell lang={lang} user={{ name: admin.name }} unread={state.unread.length} summary={state.summary}>
      {children}
    </Shell>
  );
}
