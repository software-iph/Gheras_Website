'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { Localized, Media, Section } from '@/content/types';
import { reorderSections, saveSection, setSectionVisible } from '@/lib/cms/actions';
import { imageIssues } from '@/lib/cms/checks';
import { setPath } from '@/lib/cms/diff';
import { IMAGE_RULES, type FieldDef, type L2 } from '@/lib/cms/schema';
import { dict, type UILang } from './i18n';
import { ACCEPT, uploadImage } from './upload';

export type SectionMeta = { id: string; name: L2; visible: boolean; locked: boolean; warn: boolean; fixed: boolean };
export type EditorField = FieldDef & { value: unknown };
type Current = { id: string; name: L2; desc: L2; anchor: string; locked: boolean; section: Section };

export function Editor({ lang, stamp, sections, current, fields, media }: {
  lang: UILang; stamp: number; sections: SectionMeta[]; current: Current; fields: EditorField[]; media: Media[];
}) {
  const t = dict(lang);
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);
  const [pvLang, setPvLang] = useState<'en' | 'ar'>(lang);
  const [pvDev, setPvDev] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);

  return (
    <div className="ed">
      <SectionList lang={lang} sections={sections} currentId={current.id} dirty={dirty} />
      <Fields
        key={`${current.id}:${stamp}`}
        lang={lang} current={current} fields={fields} media={media}
        unlocked={!current.locked || !!unlocked[current.id]}
        onUnlock={() => setUnlocked((u) => ({ ...u, [current.id]: true }))}
        onDirty={setDirty}
      />
      <Preview lang={lang} anchor={current.anchor} stamp={stamp} pvLang={pvLang} setPvLang={setPvLang} pvDev={pvDev} setPvDev={setPvDev} />
    </div>
  );
}

/* ---------- Section list: drag to reorder, keyboard move buttons, show/hide switch ---------- */
function SectionList({ lang, sections, currentId, dirty }: { lang: UILang; sections: SectionMeta[]; currentId: string; dirty: boolean }) {
  const t = dict(lang);
  const router = useRouter();
  const [list, setList] = useState(sections);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [, start] = useTransition();
  useEffect(() => setList(sections), [sections]);

  const movable = list.filter((s) => !s.fixed);
  const commit = (next: SectionMeta[]) => {
    setList(next);
    start(async () => { await reorderSections(next.filter((s) => !s.fixed).map((s) => s.id)); router.refresh(); });
  };
  const move = (id: string, delta: number) => {
    const ids = movable.map((s) => s.id);
    const i = ids.indexOf(id), j = i + delta;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    commit(reorder(list, ids));
  };
  const drop = (target: string) => {
    if (!drag || drag === target) return;
    const ids = movable.map((s) => s.id).filter((x) => x !== drag);
    ids.splice(ids.indexOf(target), 0, drag);
    commit(reorder(list, ids));
  };
  const toggle = (s: SectionMeta) => {
    setList((l) => l.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)));
    start(async () => { await setSectionVisible(s.id, !s.visible); router.refresh(); });
  };

  return (
    <nav className="card seclist" aria-label={t.sections}>
      <div className="seclist__head">
        <span style={{ fontWeight: 700, fontSize: 13 }}>{t.sections}</span>
        <span className="muted" style={{ fontSize: 11 }}>{t.dragHint}</span>
      </div>
      {list.map((s) => {
        const idx = movable.findIndex((m) => m.id === s.id);
        return (
          <div
            key={s.id} className="secrow"
            data-current={s.id === currentId} data-hidden={!s.visible} data-dragging={drag === s.id} data-over={over === s.id && drag !== s.id}
            draggable={!s.fixed}
            onDragStart={(e) => { setDrag(s.id); e.dataTransfer.effectAllowed = 'move'; }}
            onDragEnd={() => { setDrag(null); setOver(null); }}
            onDragOver={(e) => { if (drag && !s.fixed) { e.preventDefault(); setOver(s.id); } }}
            onDrop={(e) => { e.preventDefault(); drop(s.id); setOver(null); }}
          >
            <span className={s.fixed ? 'secrow__grip secrow__grip--off' : 'secrow__grip'} aria-hidden="true">⋮⋮</span>
            <Link
              href={`/admin/editor?section=${s.id}`} className="secrow__name" aria-current={s.id === currentId ? 'page' : undefined}
              onClick={(e) => { if (dirty && s.id !== currentId && !confirm(t.unsaved + ' — ' + t.discard + '?')) e.preventDefault(); }}
            >
              <span>{s.name[lang]}</span>
              {s.locked && <span title={t.lockedLabel} aria-label={t.lockedLabel} style={{ fontSize: 12 }}>🔒</span>}
              {s.warn && <span className="dot" title={t.warnLabel} aria-label={t.warnLabel} />}
            </Link>
            {!s.fixed && (
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <button type="button" className="mv-btn" aria-label={`${t.moveUp}: ${s.name[lang]}`} disabled={idx <= 0} onClick={() => move(s.id, -1)}>▲</button>
                <button type="button" className="mv-btn" aria-label={`${t.moveDown}: ${s.name[lang]}`} disabled={idx >= movable.length - 1} onClick={() => move(s.id, 1)}>▼</button>
              </span>
            )}
            <button type="button" className="sw" role="switch" aria-checked={s.visible} aria-label={t.showHide(s.name[lang])} onClick={() => toggle(s)} />
          </div>
        );
      })}
    </nav>
  );
}

function reorder(list: SectionMeta[], movableIds: string[]): SectionMeta[] {
  const byId = new Map(list.map((s) => [s.id, s]));
  const first = list.filter((s) => s.fixed && s.id === 'hero');
  const last = list.filter((s) => s.fixed && s.id !== 'hero');
  return [...first, ...movableIds.map((id) => byId.get(id)!), ...last];
}

/* ---------- Field column ---------- */
function Fields({ lang, current, fields, media, unlocked, onUnlock, onDirty }: {
  lang: UILang; current: Current; fields: EditorField[]; media: Media[];
  unlocked: boolean; onUnlock: () => void; onDirty: (d: boolean) => void;
}) {
  const t = dict(lang);
  const router = useRouter();
  const [sec, setSec] = useState<Section>(current.section);
  const [alts, setAlts] = useState<Record<string, Localized>>({});
  const [dirty, setDirtyState] = useState(false);
  const [saving, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const ro = !unlocked;

  const setDirty = (d: boolean) => { setDirtyState(d); onDirty(d); };
  useEffect(() => () => onDirty(false), [onDirty]);
  const change = (path: string, value: unknown) => { setSec((s) => setPath(s, path, value)); setDirty(true); };
  const changeAlt = (id: string, value: Localized) => { setAlts((a) => ({ ...a, [id]: value })); setDirty(true); };

  const save = () => start(async () => {
    const r = await saveSection(current.id, sec, { unlocked, alts });
    if (r.ok) { setDirty(false); setMsg(t.saved); router.refresh(); }
    else setMsg(r.error);
  });
  const discard = () => { setSec(current.section); setAlts({}); setDirty(false); };

  return (
    <div className="fields">
      <div className="fields__head">
        <div style={{ minWidth: 0 }}>
          <h2 className="d-h" style={{ fontSize: 28 }}>{current.name[lang]}</h2>
          <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{current.desc[lang]}</div>
        </div>
        <div className="lang-pills"><span className="en-text">EN · {t.left}</span><span className="ar-text">العربية · {t.right}</span></div>
      </div>

      {current.locked && ro && (
        <div className="locked-banner" role="note">
          <span aria-hidden="true" style={{ fontSize: 20 }}>🔒</span>
          <span style={{ flex: 1, fontSize: 14, lineHeight: 1.6 }}><strong>{t.lockedTitle}</strong> {t.lockedBody}</span>
          <button type="button" className="b b--md b--warn" onClick={() => { if (confirm(t.unlockConfirm)) onUnlock(); }}>{t.unlock}</button>
        </div>
      )}

      {fields.map((f) => {
        const key = f.path;
        const value = getLocal(sec, f.path);
        if (f.kind === 'text' || f.kind === 'area') {
          return <TextField key={key} lang={lang} def={f} value={(value ?? { en: '', ar: '' }) as Localized} readOnly={ro} onChange={(v) => change(f.path, v)} />;
        }
        if (f.kind === 'figure') {
          const v = (value ?? { value: null, label: { en: '', ar: '' } }) as { value: number | null; label: Localized };
          return <FigureField key={key} lang={lang} def={f} value={v} readOnly={ro} onChange={(nv) => change(f.path, nv)} />;
        }
        if (f.kind !== 'image') return null;
        const id = typeof value === 'string' ? value : '';
        const m = media.find((x) => x.id === id);
        return (
          <ImageField key={key} lang={lang} def={f} media={m} library={media} alt={alts[id] ?? m?.alt ?? { en: '', ar: '' }} readOnly={ro}
            onPick={(mid) => change(f.path, mid)} onAlt={(v) => id && changeAlt(id, v)} onUploaded={() => router.refresh()} />
        );
      })}

      {(dirty || msg) && (
        <div className="savebar" role="region" aria-label={t.saveDraft}>
          <span style={{ fontSize: 14, fontWeight: 600 }} role="status">{dirty ? t.unsaved : msg}</span>
          {dirty && (
            <span style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="b b--md b--ghost-dark" onClick={discard} disabled={saving}>{t.discard}</button>
              <button type="button" className="b b--md b--gold" onClick={save} disabled={saving}>{saving ? t.saving : t.saveDraft}</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const getLocal = (obj: unknown, path: string) =>
  path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);

function counterColor(len: number, limit?: number) {
  if (!limit) return '#6B675C';
  return len > limit ? '#8E3B24' : len > limit * 0.9 ? '#86621E' : '#6B675C';
}

function TextField({ lang, def, value, readOnly, onChange }: {
  lang: UILang; def: Extract<FieldDef, { kind: 'text' | 'area' }>; value: Localized; readOnly: boolean; onChange: (v: Localized) => void;
}) {
  const t = dict(lang);
  const en = value.en ?? '', ar = value.ar ?? '';
  const lim = def.limit;
  const overEn = !!lim && en.length > lim, overAr = !!lim && ar.length > lim, emptyAr = !ar.trim();
  const id = def.path.replace(/\W/g, '-');
  const rows = def.kind === 'area' ? 4 : 2;
  return (
    <div className="card fcard" data-locked={readOnly}>
      <div className="fcard__head">
        <span style={{ fontWeight: 700, fontSize: 14 }} id={`${id}-l`}>{def.label[lang]}</span>
        <span className="muted" style={{ fontSize: 12 }}>{lim ? t.maxChars(lim) : ''}</span>
      </div>
      <div className="bi">
        <div dir="ltr" lang="en">
          <textarea className={`in in--en${overEn ? ' in--bad' : ''}`} rows={rows} value={en} readOnly={readOnly}
            aria-labelledby={`${id}-l`} aria-describedby={`${id}-en-m`} aria-invalid={overEn}
            onChange={(e) => onChange({ ...value, en: e.target.value })} />
          <span className="count-row en-text" id={`${id}-en-m`}>
            <span className="err" role={overEn ? 'alert' : undefined}>{overEn ? t.tooLong : ''}</span>
            {lim ? <span className="count" style={{ color: counterColor(en.length, lim) }}>{en.length} / {lim}</span> : <span />}
          </span>
        </div>
        <div dir="rtl" lang="ar">
          <textarea className={`in in--ar${emptyAr ? ' ar-missing' : overAr ? ' in--bad' : ''}`} rows={rows} value={ar} readOnly={readOnly}
            placeholder="أضف النص العربي" aria-labelledby={`${id}-l`} aria-describedby={`${id}-ar-m`} aria-invalid={overAr}
            onChange={(e) => onChange({ ...value, ar: e.target.value })} />
          <span className="count-row ar-text" id={`${id}-ar-m`}>
            <span style={{ color: emptyAr ? '#86621E' : '#8E3B24' }}>{emptyAr ? t.arMissing : overAr ? t.arTooLong : ''}</span>
            {lim ? <span className="count" style={{ color: counterColor(ar.length, lim) }}>{ar.length} / {lim}</span> : <span />}
          </span>
        </div>
      </div>
    </div>
  );
}

function FigureField({ lang, def, value, readOnly, onChange }: {
  lang: UILang; def: FieldDef; value: { value: number | null; label: Localized }; readOnly: boolean;
  onChange: (v: { value: number | null; label: Localized }) => void;
}) {
  const t = dict(lang);
  const [num, setNum] = useState(value.value == null ? '' : new Intl.NumberFormat('en-US').format(value.value));
  return (
    <div className="card fcard" data-locked={readOnly}>
      <div className="fcard__head">
        <span style={{ fontWeight: 700, fontSize: 14 }}>{def.label[lang]}</span>
        <span className="muted" style={{ fontSize: 12 }}>{t.figureHint}</span>
      </div>
      <div className="fig-row">
        <input className="in fig-num" inputMode="numeric" dir="ltr" value={num} placeholder={t.figurePh} readOnly={readOnly}
          aria-label={`${def.label[lang]} — number`}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d]/g, '');
            setNum(raw ? new Intl.NumberFormat('en-US').format(Number(raw)) : '');
            onChange({ ...value, value: raw ? Number(raw) : null });
          }} />
        <input className="in in--en" dir="ltr" lang="en" value={value.label.en ?? ''} readOnly={readOnly} aria-label={`${def.label[lang]} — EN`}
          onChange={(e) => onChange({ ...value, label: { ...value.label, en: e.target.value } })} />
        <input className={`in in--ar${!value.label.ar?.trim() ? ' ar-missing' : ''}`} dir="rtl" lang="ar" value={value.label.ar ?? ''} readOnly={readOnly}
          aria-label={`${def.label[lang]} — AR`} onChange={(e) => onChange({ ...value, label: { ...value.label, ar: e.target.value } })} />
      </div>
    </div>
  );
}

function ImageField({ lang, def, media, library, alt, readOnly, onPick, onAlt, onUploaded }: {
  lang: UILang; def: Extract<FieldDef, { kind: 'image' }>; media?: Media; library: Media[]; alt: Localized; readOnly: boolean;
  onPick: (id: string) => void; onAlt: (v: Localized) => void; onUploaded: () => void;
}) {
  const t = dict(lang);
  const rule = IMAGE_RULES[def.preset];
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const issues = media ? imageIssues(media, def.preset) : ['missing'];
  const status = issues.includes('missing') ? t.imgMissing : issues.includes('small') ? t.imgSmall(media?.width ?? 0, rule.minWidth) : t.imgOk;
  const ok = issues.length === 0;

  const onFile = async (file?: File) => {
    if (!file || !media) return;
    setBusy(true); setErr(false);
    const r = await uploadImage(file, media.id);
    setBusy(false);
    if (r) onUploaded(); else setErr(true);
  };

  return (
    <div className="card fcard" data-locked={readOnly}>
      <div className="fcard__head">
        <span style={{ fontWeight: 700, fontSize: 14 }}>{def.label[lang]}</span>
        <span className="muted" style={{ fontSize: 12 }}>{t.ratioReq(rule.ratioLabel, rule.minWidth)}</span>
      </div>
      <div className="img-field">
        <div className={media?.url ? 'slot slot--photo' : 'slot'} style={{ aspectRatio: def.preset === 'hero' ? '16 / 9' : '1', borderRadius: def.preset === 'circle' ? '50%' : 8 }}>
          {media?.url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={media.url} alt="" style={{ objectPosition: `${media.focal.x * 100}% ${media.focal.y * 100}%` }} />
            : <span lang="en">{media?.brief}</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="b b--sm b--secondary" disabled={readOnly || busy} onClick={() => fileRef.current?.click()}>{busy ? t.uploading : t.replace}</button>
            <input ref={fileRef} type="file" accept={ACCEPT} hidden onChange={(e) => onFile(e.target.files?.[0])} />
            <span className="pill" style={{ height: 36, background: ok ? '#E6EBDA' : '#F6EBD2', color: ok ? '#3F5A2A' : '#86621E' }}>{ok ? '✓ ' : '⚠ '}{status}</span>
          </div>
          <label className="muted" style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {t.chooseLibrary}
            <select className="in" style={{ height: 36, fontSize: 13 }} value={media?.id ?? ''} disabled={readOnly} onChange={(e) => onPick(e.target.value)}>
              {library.map((m) => <option key={m.id} value={m.id}>{m.file ?? m.brief}</option>)}
            </select>
          </label>
          <div className="bi" style={{ gap: 10 }}>
            <input className="in in--en" dir="ltr" lang="en" value={alt.en ?? ''} placeholder={t.altEnPh} readOnly={readOnly}
              aria-label={t.altEn} style={{ height: 40, fontSize: 14 }} onChange={(e) => onAlt({ ...alt, en: e.target.value })} />
            <input className={`in in--ar${!alt.ar?.trim() ? ' ar-missing' : ''}`} dir="rtl" lang="ar" value={alt.ar ?? ''} placeholder={t.altArPh}
              readOnly={readOnly} aria-label={t.altAr} style={{ height: 40, fontSize: 14 }} onChange={(e) => onAlt({ ...alt, ar: e.target.value })} />
          </div>
          {err && <span className="err" role="alert">{t.uploadFailed}</span>}
          <span className="muted" style={{ fontSize: 12 }}>{def.preset === 'hero' ? t.heroNote : t.circleNote}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Live preview: the real draft page in a scaled iframe ---------- */
function Preview({ lang, anchor, stamp, pvLang, setPvLang, pvDev, setPvDev }: {
  lang: UILang; anchor: string; stamp: number; pvLang: 'en' | 'ar'; setPvLang: (l: 'en' | 'ar') => void;
  pvDev: 'desktop' | 'mobile'; setPvDev: (d: 'desktop' | 'mobile') => void;
}) {
  const t = dict(lang);
  const desk = pvDev === 'desktop';
  const w = desk ? 1440 : 390, scale = desk ? 452 / 1440 : 360 / 390, ih = desk ? 2300 : 780;
  return (
    <div className="ed__preview">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, width: 452, maxWidth: '100%' }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{t.livePreview}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="seg en-text" aria-pressed={pvLang === 'en'} onClick={() => setPvLang('en')}>EN</button>
          <button type="button" className="seg ar-text" aria-pressed={pvLang === 'ar'} onClick={() => setPvLang('ar')}>عربي</button>
          <button type="button" className="seg" aria-pressed={desk} onClick={() => setPvDev('desktop')}>{t.desktop}</button>
          <button type="button" className="seg" aria-pressed={!desk} onClick={() => setPvDev('mobile')}>{t.mobile}</button>
        </div>
      </div>
      <div className="pv-frame">
        <div style={{ width: desk ? 452 : 360, height: '100%', overflow: 'hidden' }}>
          <iframe
            key={`${pvLang}:${stamp}:${anchor}`}
            src={`/${pvLang}/preview?embed=1${anchor}`}
            title={t.livePreview}
            style={{ width: w, height: ih, transform: `scale(${scale})` }}
          />
        </div>
      </div>
      <span className="muted" style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 452 }}>{t.pvNote}</span>
    </div>
  );
}
