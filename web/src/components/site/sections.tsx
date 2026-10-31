import Image from 'next/image';
import { getMedia, pick } from '@/content';
import type {
  AboutSection, ContactSection, FiguresSection, HeroSection, Lang, Localized, Media, MissionVisionSection,
  SiteContent, TwoHorizonsSection, ValuesSection, WhatWeDoSection, WhoSection, WhySection,
} from '@/content/types';
import { ui } from '@/i18n/ui';
import { Arrow, Icon } from '@/components/brand/Icon';
import { Emblem } from '@/components/brand/Logo';
import { BotanicalLineArt, BrandPattern, ContourLines } from '@/components/brand/Ornaments';
import { Eyebrow } from './Eyebrow';
import { ContactForm } from './ContactForm';
import { InquiryLink } from './InquiryLink';

export type Ctx = { lang: Lang; content: SiteContent };

const tx = (v: Localized | undefined, lang: Lang) => pick(v, lang) ?? '';
const pad = (n: number) => String(n).padStart(2, '0');
const words = (s: string) => s.split(/\s+/).filter(Boolean);

/** Photo with focal point, or the striped placeholder with its brief when the client has not supplied it yet. */
function focalPosition(m: Media) {
  return `${Math.round(m.focal.x * 100)}% ${Math.round(m.focal.y * 100)}%`;
}

/* 1 ---------------------------------------------------------------- */
export function Hero({ s, ctx }: { s: HeroSection; ctx: Ctx }) {
  const { lang, content } = ctx;
  const t = ui[lang];
  const f = s.fields;
  const media = getMedia(content, f.image.mediaId);
  const alt = pick(media?.alt, lang) ?? pick(f.image.alt, lang) ?? '';
  return (
    <section aria-label={t.heroLabel} data-section="hero" className="hero">
      {media?.url ? (
        <div className="hero__photo" data-m="hero-photo">
          <Image src={media.url} alt={alt} fill sizes="100vw" preload style={{ objectFit: 'cover', objectPosition: focalPosition(media) }} />
        </div>
      ) : (
        <>
          <div className="hero__photo" data-m="hero-photo" role="img" aria-label={alt} />
          <span className="ph ph--dark hero__photo-label" lang="en">{media?.brief ?? 'PHOTO 01'}</span>
        </>
      )}
      <div className="hero__overlay" />
      <div className="hero__dim" data-m="hero-dim" />
      <div className="hero__art" data-m="draw" aria-hidden="true"><BotanicalLineArt stroke={0.45} /></div>
      <div className="hero__inner">
        <Eyebrow dark motion="hero-in">{tx(f.eyebrow, lang)}</Eyebrow>
        <h1 className="hero__title">
          {words(tx(f.headline, lang)).map((w, i, all) => (
            <span key={i}><span className="hero__word" data-m="word">{w}</span>{i < all.length - 1 ? ' ' : ''}</span>
          ))}
        </h1>
        <p className="hero__sub" data-m="hero-in">{tx(f.sub, lang)}</p>
        <div className="hero__ctas" data-m="hero-in">
          <a href="#contact" className="btn btn--lg btn--gold">{tx(f.primaryCta, lang)}<Arrow color="#1F2A1C" /></a>
          <a href="#what-we-do" className="btn btn--lg btn--outline">{tx(f.secondaryCta, lang)}</a>
        </div>
      </div>
      <a href="#belief" className="hero__scroll" aria-label={t.scrollLabel}>{t.scroll}<span /></a>
    </section>
  );
}

/* 2 ---------------------------------------------------------------- */
export function Belief({ s, ctx }: { s: AboutSection; ctx: Ctx }) {
  const { lang } = ctx;
  const f = s.fields;
  return (
    <section id="about" aria-labelledby="belief" data-section="about" className="section belief">
      <div className="belief__ring" aria-hidden="true" />
      <div className="belief__ring belief__ring--2" aria-hidden="true" />
      <div className="wrap">
        <Eyebrow>{tx(f.eyebrow, lang)}</Eyebrow>
        <h2 id="belief" className="belief__statement">
          {words(tx(f.statement, lang)).map((w, i, all) => (
            <span key={i}><span data-m="lit">{w}</span>{i < all.length - 1 ? ' ' : ''}</span>
          ))}
        </h2>
        <div className="belief__cols">
          <p>{tx(f.p1, lang)}</p>
          <p>{tx(f.p2, lang)}</p>
        </div>
      </div>
    </section>
  );
}

/* 3 ---------------------------------------------------------------- */
/** Shown only when the section is switched on and all four numbers are real. */
export const figuresReady = (s: FiguresSection) =>
  s.visible && s.items.length === 4 && s.items.every((i) => typeof i.value === 'number');

export function Figures({ s, ctx }: { s: FiguresSection; ctx: Ctx }) {
  const { lang } = ctx;
  const t = ui[lang];
  return (
    <section aria-label={t.figuresLabel} data-section="figures" className="figures">
      <div className="wrap">
        <Eyebrow dark>{t.figuresLabel}</Eyebrow>
        <div className="figures__grid">
          {s.items.map((it, i) => (
            <div className="figure" data-rv key={i}>
              <div className="figure__ring">
                <svg aria-hidden="true" viewBox="0 0 180 180" style={{ transform: `rotate(${-120 + i * 25}deg)` }}>
                  <circle cx="90" cy="90" r="89" fill="none" stroke="rgba(201,154,59,.3)" strokeWidth="1" />
                  <circle data-m="ring" cx="90" cy="90" r="89" fill="none" stroke="#C99A3B" strokeWidth="2"
                    strokeLinecap="round" pathLength={100} strokeDasharray="25 75" />
                </svg>
                <span className="figure__num">{new Intl.NumberFormat('en-US').format(it.value ?? 0)}</span>
              </div>
              <span className="figure__label">{tx(it.label, lang)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 4 ---------------------------------------------------------------- */
export function WhatWeDo({ s, ctx }: { s: WhatWeDoSection; ctx: Ctx }) {
  const { lang } = ctx;
  const f = s.fields;
  const cta = ctx.content.sections.find((x) => x.id === 'hero') as HeroSection | undefined;
  return (
    <section id="what-we-do" aria-labelledby="wwd-h" data-section="what-we-do" className="section wwd">
      <div className="wrap">
        <div className="split-head">
          <div>
            <Eyebrow>{tx(f.eyebrow, lang)}</Eyebrow>
            <h2 id="wwd-h" className="h2">{tx(f.heading, lang)}</h2>
          </div>
          <p className="wwd__intro">{tx(f.intro, lang)}</p>
        </div>
        <div className="cards">
          {s.items.map((it, i) => (
            <article className="card" key={i}>
              <div className="card__top">
                <Icon glyph={it.icon} size={40} />
                <span className="card__idx">{pad(i + 1)}</span>
              </div>
              <h3>{tx(it.title, lang)}</h3>
              <p>{tx(it.text, lang)}</p>
            </article>
          ))}
        </div>
        <div className="wwd__close">
          <p className="wwd__closing">{tx(f.closing, lang)}</p>
          <a href="#contact" className="btn btn--primary">{tx(cta?.fields.primaryCta, lang)}<Arrow color="#FAF8F2" /></a>
        </div>
      </div>
    </section>
  );
}

/* 5 ---------------------------------------------------------------- */
export function TwoHorizons({ s, ctx }: { s: TwoHorizonsSection; ctx: Ctx }) {
  const { lang } = ctx;
  const t = ui[lang];
  const f = s.fields;
  const col = (kind: 'today' | 'tomorrow') => {
    const items = s[kind];
    const offset = kind === 'today' ? 1 : s.today.length + 1;
    return (
      <div className={`hz__col hz__col--${kind}`} data-m={kind === 'today' ? 'hz-l' : 'hz-r'}>
        <div className="hz__col-head">
          <h3>{tx(kind === 'today' ? f.todayTitle : f.tomorrowTitle, lang)}</h3>
          <span className="hz__tag">{kind === 'today' ? t.wheat : t.olive}</span>
        </div>
        <p className="hz__sub">{tx(kind === 'today' ? f.todaySub : f.tomorrowSub, lang)}</p>
        <ol className="hz__list">
          {items.map((o, i) => (
            <li className="hz__item" data-m="hz-i" key={i}>
              <span className="hz__n">{pad(offset + i)}</span>
              <span className="hz__txt">
                <span className="hz__t">{tx(o.title, lang)}</span>
                <span className="hz__d">{tx(o.text, lang)}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  };
  return (
    <section aria-labelledby="hz-h" data-section="two-horizons" className="hz">
      <div className="hz__head">
        <Eyebrow ruleAfter>{tx(f.eyebrow, lang)}</Eyebrow>
        <h2 id="hz-h" className="hz__title">{tx(f.heading, lang)}</h2>
      </div>
      <div className="hz__body">
        <div className="wrap hz__grid">
          {col('today')}
          <div className="hz__center" data-m="hz-c">
            <div className="hz__disc">
              <div className="hz__halo" aria-hidden="true" />
              <div className="hz__plate" aria-hidden="true" />
              <div className="hz__emblem"><Emblem sizes="210px" /></div>
            </div>
            <span className="hz__caption">{tx(f.caption, lang)}</span>
          </div>
          {col('tomorrow')}
        </div>
      </div>
    </section>
  );
}

/* 6 ---------------------------------------------------------------- */
export function MissionVision({ s, ctx }: { s: MissionVisionSection; ctx: Ctx }) {
  const { lang } = ctx;
  const t = ui[lang];
  return (
    <section aria-label={t.missionVisionLabel} data-section="mission-vision" className="mv">
      <div className="mv__pattern" data-m="drift" aria-hidden="true"><BrandPattern rtl={lang === 'ar'} /></div>
      <div className="mv__grid">
        <div>
          <Eyebrow dark>{t.mission}</Eyebrow>
          <p className="mv__quote">{tx(s.fields.mission, lang)}</p>
        </div>
        <div>
          <Eyebrow dark>{t.vision}</Eyebrow>
          <p className="mv__quote">{tx(s.fields.vision, lang)}</p>
        </div>
      </div>
    </section>
  );
}

/* 7 ---------------------------------------------------------------- */
export function Values({ s, ctx }: { s: ValuesSection; ctx: Ctx }) {
  const { lang } = ctx;
  const f = s.fields;
  return (
    <section id="values" aria-labelledby="values-h" data-section="values" className="values" style={{ scrollMarginTop: 80 }}>
      <div className="values__in">
        <div className="split-head">
          <div>
            <Eyebrow dark>{tx(f.eyebrow, lang)}</Eyebrow>
            <h2 id="values-h" className="h2">{tx(f.heading, lang)}</h2>
          </div>
          <p className="values__intro">{tx(f.intro, lang)}</p>
        </div>
        <div className="values__grid">
          {s.items.map((v) => (
            <div className="value" data-rv key={v.letter}>
              <span className="value__letter" aria-hidden="true">{v.letter}</span>
              <Icon glyph={v.icon} size={28} color="#E8D3A0" accent="#C99A3B" />
              <h3>{tx(v.name, lang)}</h3>
              <p>{tx(v.text, lang)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 8 ---------------------------------------------------------------- */
export function Why({ s, ctx }: { s: WhySection; ctx: Ctx }) {
  const { lang, content } = ctx;
  const f = s.fields;
  const total = pad(s.items.length);
  return (
    <section id="why" aria-labelledby="why-h" data-section="why" className="section why">
      <div className="why__contour" aria-hidden="true"><ContourLines /></div>
      <div className="wrap">
        <div className="why__head">
          <Eyebrow>{tx(f.eyebrow, lang)}</Eyebrow>
          <h2 id="why-h" className="h2">{tx(f.heading, lang)}</h2>
          <p>{tx(f.intro, lang)}</p>
        </div>
        <div className="why__rows">
          {s.items.map((w, i) => {
            const m = getMedia(content, w.mediaId);
            const alt = pick(m?.alt, lang) ?? '';
            return (
              <div className={i % 2 ? 'why__row why__row--rev' : 'why__row'} key={i}>
                <div className="why__photo">
                  <div className="why__ring" aria-hidden="true" />
                  {m?.url ? (
                    <div className="why__img why__img--photo" data-m="iris">
                      <Image src={m.url} alt={alt} fill sizes="(max-width: 767px) 80vw, 400px"
                        style={{ objectFit: 'cover', objectPosition: focalPosition(m) }} />
                    </div>
                  ) : (
                    <div className="why__img" data-m="iris" role="img" aria-label={alt}>
                      <span className="why__img-label" lang="en" aria-hidden="true">{m?.brief}</span>
                    </div>
                  )}
                </div>
                <div className="why__text">
                  <span className="why__n">{pad(i + 1)} / {total}</span>
                  <h3>{tx(w.title, lang)}</h3>
                  <p>{tx(w.text, lang)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* 9 ---------------------------------------------------------------- */
export function Who({ s, ctx }: { s: WhoSection; ctx: Ctx }) {
  const { lang } = ctx;
  const f = s.fields;
  const hero = ctx.content.sections.find((x) => x.id === 'hero') as HeroSection | undefined;
  return (
    <section aria-labelledby="who-h" data-section="who" className="section who">
      <div className="wrap">
        <div className="who__head">
          <div>
            <Eyebrow>{tx(f.eyebrow, lang)}</Eyebrow>
            <h2 id="who-h" className="h2">{tx(f.heading, lang)}</h2>
          </div>
          <a href="#contact" className="btn btn--primary">{tx(hero?.fields.primaryCta, lang)}<Arrow color="#FAF8F2" /></a>
        </div>
        <div className="panels">
          {s.items.map((p, i) => (
            <div className="panel" data-rv key={i}>
              <Icon glyph={p.icon} size={36} />
              <h3>{tx(p.title, lang)}</h3>
              <p>{tx(p.text, lang)}</p>
              <InquiryLink type={p.inquiryType} className="panel__cta">
                {tx(p.cta, lang)}<Arrow size={16} color="#3F5A2A" />
              </InquiryLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 10 --------------------------------------------------------------- */
export function Contact({ s, ctx }: { s: ContactSection; ctx: Ctx }) {
  const { lang, content } = ctx;
  const t = ui[lang];
  const f = s.fields;
  const c = content.site.contact;
  const address = pick(c.address, lang);
  return (
    <section id="contact" aria-labelledby="contact-h" data-section="contact" className="section contact">
      <div className="wrap contact__grid">
        <div className="contact__info">
          <Eyebrow>{tx(f.eyebrow, lang)}</Eyebrow>
          <h2 id="contact-h" className="contact__title">{tx(f.heading, lang)}</h2>
          <p className="contact__intro">{tx(f.intro, lang)}</p>
          <dl className="contact__dl">
            <dt><Icon glyph="mail" size={22} /><span className="visually-hidden">{t.form.email}</span></dt>
            <dd>{c.email ? <a href={`mailto:${c.email}`} dir="ltr">{c.email}</a> : <span className="ph">{t.contactPlaceholders.email}</span>}</dd>
            <dt><Icon glyph="phone" size={22} /><span className="visually-hidden">{t.form.phone}</span></dt>
            <dd>{c.phone ? <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`} dir="ltr">{c.phone}</a> : <span className="ph">{t.contactPlaceholders.phone}</span>}</dd>
            <dt><Icon glyph="pin" size={22} /><span className="visually-hidden">{t.contactPlaceholders.address.replace(/[[\]]/g, '')}</span></dt>
            <dd>{address ?? <span className="ph">{t.contactPlaceholders.address}</span>}</dd>
          </dl>
          <div className="contact__slogan">{tx(f.slogan, lang)}</div>
        </div>
        <div className="form-card">
          <ContactForm lang={lang} replyTimeDays={c.replyTimeDays} />
        </div>
      </div>
    </section>
  );
}
