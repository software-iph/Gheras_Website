import type { Metadata } from 'next';
import { dict, initials } from '@/admin/i18n';
import { getAdminLang } from '@/admin/lang';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Users & roles' };

/** v1: one Administrator with full access. Editor, Inquiries and Reviewer roles are shown as "Later". */
export default async function UsersPage() {
  const admin = await requireAdmin();
  const lang = await getAdminLang();
  const t = dict(lang);
  return (
    <div className="set">
      <section className="card pad-24" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span className="avatar" style={{ width: 52, height: 52, background: '#3F5A2A', color: '#FAF8F2' }}>{initials(admin.name)}</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{admin.name}</div>
          <div className="muted" dir="ltr" style={{ fontSize: 14, textAlign: 'start' }}>{admin.email}</div>
        </div>
        <span className="pill" style={{ padding: '6px 12px', background: '#1F2A1C', color: '#C99A3B' }}>{t.admin}</span>
        <span className="muted" style={{ fontSize: 13 }}>{t.allPerms}</span>
      </section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <h2 className="d-h" style={{ fontSize: 22 }}>{t.futureRoles}</h2>
        <button type="button" className="b" disabled>{t.invite}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {t.roles.map((r) => (
          <div key={r.name} className="role-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{r.name}</span>
              <span className="pill pill--sm" style={{ background: '#EFE7D6', color: '#6B675C' }}>{t.later}</span>
            </div>
            <span className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{r.d}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              {r.perms.map(([yes, label]) => (
                <span key={label} style={{ display: 'flex', gap: 8 }}>
                  <span aria-hidden="true" style={{ color: yes ? '#3F5A2A' : '#CFC6AF', fontWeight: 700 }}>{yes ? '✓' : '—'}</span>{label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
