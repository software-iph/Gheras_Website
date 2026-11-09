'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import type { Localized, Media } from '@/content/types';
import { deleteMedia, saveMediaDetails } from '@/lib/cms/actions';
import type { ImageIssue, Usage } from '@/lib/cms/checks';
import type { L2 } from '@/lib/cms/schema';
import { dict, type UILang } from './i18n';
import { ACCEPT, preview, uploadImage } from './upload';

export type MediaItem = { media: Media; used: L2[]; issues: ImageIssue[]; preset: Usage['preset'] | null };
type Filter = 'all' | 'alt' | 'unused';
type Crop = 'circle' | 'wide' | 'square';

const missingAlt = (m: Media) => !m.alt.en?.trim() || !m.alt.ar?.trim();

export function MediaLibrary({ lang, items, initialFilter, initialId }: { lang: UILang; items: MediaItem[]; initialFilter: Filter; initialId?: string }) {
  const t = dict(lang);
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(initialId);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const shown = items.filter((it) => {
    if (filter === 'alt' && !missingAlt(it.media)) return false;
    if (filter === 'unused' && it.used.length) return false;
    const hay = `${it.media.brief} ${it.media.file ?? ''} ${it.media.alt.en ?? ''} ${it.media.alt.ar ?? ''}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });
  const current = items.find((it) => it.media.id === sel) ?? shown[0];

  const upload = async (files: FileList | null | undefined) => {
    if (!files?.length) return;
    setBusy(true); setErr(false);
    let lastId: string | undefined;
    for (const f of [...files]) {
      const r = await uploadImage(f);
      // Show each photo as soon as it is in, instead of after the whole batch.
      if (r) { lastId = r.id; setSel(r.id); setFilter('all'); router.refresh(); }
      else setErr(true);
    }
    setBusy(false);
    if (lastId) router.refresh();
  };

  return (
    <div className="ml">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <div className="ml__bar">
          <input className="in" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchMedia} aria-label={t.searchMedia} style={{ flex: 1, minWidth: 220 }} />
          <div className="chips" role="group">
            {([['all', t.all], ['alt', t.missingAlt], ['unused', t.unused]] as [Filter, string][]).map(([k, label]) => (
              <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)} style={{ height: 36 }}>{label}</button>
            ))}
          </div>
          <button type="button" className="b b--primary" onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? t.uploading : t.upload}</button>
          <input ref={fileRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => upload(e.target.files)} />
        </div>
        <div
          className="drop" data-over={over}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files); }}
        >
          {t.dropHint}
        </div>
        {err && <p className="err" role="alert" style={{ margin: 0, fontSize: 13 }}>{t.uploadFailed}</p>}
        {shown.length === 0 && <p className="muted" style={{ margin: 0 }}>{t.noMedia}</p>}
        <div className="tiles">
          {shown.map((it) => {
            const m = it.media;
            const ok = m.url && !it.issues.length;
            const status = !m.url ? t.placeholderSlot : it.issues.includes('small') ? t.imgSmall(m.width ?? 0, 0).split(':')[0] : `${m.width}×${m.height} ✓`;
            return (
              <button key={m.id} type="button" className="tile" aria-pressed={current?.media.id === m.id} onClick={() => setSel(m.id)}>
                <div className={m.url ? 'slot slot--photo' : 'slot'} style={{ aspectRatio: '4 / 3', border: m.url ? undefined : 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.url ? <img src={preview(m.url, 384)} alt="" loading="lazy" decoding="async" /> : <span lang="en">{m.brief}</span>}
                </div>
                <span className="ellipsis" style={{ fontSize: 13, fontWeight: 600, maxWidth: '100%' }}>{m.file ?? m.brief.split(' — ')[0]}</span>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="pill pill--sm" style={{ background: ok ? '#E6EBDA' : '#F6EBD2', color: ok ? '#3F5A2A' : '#86621E' }}>{status}</span>
                  {missingAlt(m) && <span className="pill pill--sm" style={{ background: '#F3E2D9', color: '#8E3B24' }}>{t.missingAlt}</span>}
                  <span className="muted" style={{ fontSize: 11, padding: '3px 0' }}>{it.used.length ? t.usedIn + it.used.map((u) => u[lang]).join(', ') : t.notUsed}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {current && <Detail key={current.media.id} lang={lang} item={current} onUploaded={() => router.refresh()} />}
    </div>
  );
}

function Detail({ lang, item, onUploaded }: { lang: UILang; item: MediaItem; onUploaded: () => void }) {
  const t = dict(lang);
  const router = useRouter();
  const m = item.media;
  const [crop, setCrop] = useState<Crop>(item.preset === 'hero' ? 'wide' : 'circle');
  const [focal, setFocal] = useState(m.focal);
  const [alt, setAlt] = useState<Localized>(m.alt);
  const [saving, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [upErr, setUpErr] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = focal.x !== m.focal.x || focal.y !== m.focal.y || alt.en !== m.alt.en || alt.ar !== m.alt.ar;

  // Crop frame inside the square preview, centred on the focal point.
  const frame = crop === 'circle' ? { w: 84, h: 84 } : crop === 'wide' ? { w: 92, h: 92 * 9 / 16 } : { w: 92, h: 92 * 3 / 4 };
  const fx = Math.min(100 - frame.w / 2, Math.max(frame.w / 2, focal.x * 100));
  const fy = Math.min(100 - frame.h / 2, Math.max(frame.h / 2, focal.y * 100));

  const setFromPointer = (e: React.PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setFocal({ x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 });
    setSaved(false);
  };
  const nudge = (e: React.KeyboardEvent) => {
    const d = e.shiftKey ? 0.1 : 0.02;
    const k = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
    if (!k) return;
    e.preventDefault();
    setFocal((f) => ({ x: Math.min(1, Math.max(0, f.x + k[0])), y: Math.min(1, Math.max(0, f.y + k[1])) }));
    setSaved(false);
  };
  const save = () => start(async () => { await saveMediaDetails(m.id, { alt, focal }); setSaved(true); router.refresh(); });
  const replace = async (file?: File) => {
    if (!file) return;
    setBusy(true); setUpErr(false);
    const r = await uploadImage(file, m.id);
    setBusy(false);
    if (r) onUploaded(); else setUpErr(true);
  };

  const remove = async () => {
    if (!window.confirm(t.deleteConfirm(m.file ?? m.brief))) return;
    setDeleting(true); setDelErr(null);
    const r = await deleteMedia(m.id);
    setDeleting(false);
    if (r.ok) router.refresh();
    else setDelErr(r.error === 'in-use' ? t.deleteInUse : t.deleteFailed);
  };

  return (
    <aside className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 104 }} aria-label={m.file ?? m.brief}>
      <span style={{ fontWeight: 700, fontSize: 15, wordBreak: 'break-word' }}>{m.file ?? m.brief}</span>
      <div
        ref={boxRef} className={m.url ? 'crop' : 'crop slot'} style={{ padding: 0, border: 0 }}
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); setFromPointer(e); }}
        onPointerMove={(e) => { if (e.buttons) setFromPointer(e); }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {m.url && <img src={preview(m.url, 828)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />}
        <div className="crop__mask" style={{
          left: `${fx - frame.w / 2}%`, top: `${fy - frame.h / 2}%`, width: `${frame.w}%`, height: `${frame.h}%`,
          borderRadius: crop === 'circle' ? '50%' : 4,
        }} />
        <div
          className="crop__dot" role="slider" tabIndex={0} aria-label={t.focal}
          aria-valuetext={`${Math.round(focal.x * 100)}%, ${Math.round(focal.y * 100)}%`}
          aria-valuenow={Math.round(focal.x * 100)} aria-valuemin={0} aria-valuemax={100}
          onKeyDown={nudge} style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
        />
      </div>
      <div className="chips">
        {([['circle', t.cropCircle], ['wide', t.cropWide], ['square', t.cropSquare]] as [Crop, string][]).map(([k, label]) => (
          <button key={k} type="button" className="seg" style={{ height: 32, padding: '0 12px' }} aria-pressed={crop === k} onClick={() => setCrop(k)}>{label}</button>
        ))}
      </div>
      <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{t.focal}</span>
      {m.url && <span className="muted mono" style={{ fontSize: 12 }}>{m.width} × {m.height} px</span>}
      <label className="field-label" style={{ fontSize: 13, gap: 6 }}>{t.altEn}
        <input className="in in--en" dir="ltr" lang="en" value={alt.en ?? ''} style={{ height: 40, fontSize: 14 }} onChange={(e) => { setAlt({ ...alt, en: e.target.value }); setSaved(false); }} />
      </label>
      <label className="field-label" style={{ fontSize: 13, gap: 6 }}>{t.altAr}
        <input className={`in in--ar${!alt.ar?.trim() ? ' ar-missing' : ''}`} dir="rtl" lang="ar" value={alt.ar ?? ''} style={{ height: 40 }} onChange={(e) => { setAlt({ ...alt, ar: e.target.value }); setSaved(false); }} />
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" className="b b--primary b--md" onClick={save} disabled={!dirty || saving}>{saving ? t.saving : t.saveDetails}</button>
        <button type="button" className="b b--secondary b--md" onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? t.uploading : t.replace}</button>
        <input ref={fileRef} type="file" accept={ACCEPT} hidden onChange={(e) => replace(e.target.files?.[0])} />
        {saved && !dirty && <span role="status" style={{ fontSize: 13, color: '#3F5A2A', fontWeight: 600 }}>✓ {t.saved}</span>}
        <button type="button" className="b b--secondary b--md" onClick={remove} disabled={deleting || item.used.length > 0}
          title={item.used.length ? t.deleteInUse : undefined} style={{ marginInlineStart: 'auto', color: '#8E3B24' }}>
          {deleting ? t.deleting : t.deleteImage}
        </button>
      </div>
      {item.used.length > 0 && <span className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{t.deleteInUse}</span>}
      {upErr && <p className="err" role="alert" style={{ margin: 0, fontSize: 13 }}>{t.uploadFailed}</p>}
      {delErr && <p className="err" role="alert" style={{ margin: 0, fontSize: 13 }}>{delErr}</p>}
      <div className="rules">{t.imgRules}</div>
    </aside>
  );
}
