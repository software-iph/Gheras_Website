'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { restore } from '@/lib/cms/actions';
import { dict, type UILang } from './i18n';

/** Copies a published version into the draft (after confirmation). Nothing goes live until publish. */
export function RestoreButton({ lang, id }: { lang: UILang; id: string }) {
  const t = dict(lang);
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {done && <span role="status" style={{ fontSize: 13, color: '#3F5A2A', fontWeight: 600 }}>✓ {t.restored}</span>}
      <button type="button" className="b b--secondary" disabled={pending}
        onClick={() => { if (confirm(t.restoreConfirm)) start(async () => { const r = await restore(id); setDone(r.ok); router.refresh(); }); }}>
        {t.restore}
      </button>
    </span>
  );
}
