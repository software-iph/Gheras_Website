'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { markInquiryRead, saveInquiryNotes, setInquiryStatus } from '@/lib/cms/actions';
import type { Inquiry } from '@/lib/inquiries/types';
import { dict, type UILang } from './i18n';

export function InquiryActions({ lang, inquiry: q }: { lang: UILang; inquiry: Inquiry }) {
  const t = dict(lang);
  const router = useRouter();
  const [notes, setNotes] = useState(q.notes);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  // Opening a message marks it read.
  useEffect(() => {
    if (!q.read) markInquiryRead(q.id).then(() => router.refresh());
  }, [q.id, q.read, router]);

  const status = (s: Inquiry['status']) => start(async () => { await setInquiryStatus(q.id, s); router.refresh(); });
  const subject = encodeURIComponent(lang === 'ar' && q.pageLang === 'ar' ? 'ردّ من غراس' : `Re: your ${q.type.toLowerCase()} inquiry — GHERAS`);

  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href={`mailto:${q.email}?subject=${subject}`} className="b b--primary">{t.replyEmail}</a>
        {q.status !== 'replied'
          ? <button type="button" className="b b--secondary" disabled={pending} onClick={() => status('replied')}>{t.markReplied}</button>
          : <span className="pill" style={{ height: 44, padding: '0 16px', background: '#E6EBDA', color: '#3F5A2A' }}>✓ {t.replied}</span>}
        {q.status !== 'archived'
          ? <button type="button" className="b b--quiet" disabled={pending} onClick={() => status('archived')}>{t.archive}</button>
          : <button type="button" className="b b--quiet" disabled={pending} onClick={() => status('new')}>{t.unarchive}</button>}
      </div>
      <label className="field-label" style={{ fontSize: 13 }}>
        {t.notes}
        <textarea className="in" rows={3} value={notes} placeholder={t.notesPh} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} />
      </label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button type="button" className="b b--md b--secondary" disabled={pending || notes === q.notes}
          onClick={() => start(async () => { await saveInquiryNotes(q.id, notes); setSaved(true); router.refresh(); })}>{t.saveNotes}</button>
        {saved && <span role="status" style={{ fontSize: 13, color: '#3F5A2A', fontWeight: 600 }}>✓ {t.saved.split(' ')[0]}</span>}
      </div>
    </>
  );
}
