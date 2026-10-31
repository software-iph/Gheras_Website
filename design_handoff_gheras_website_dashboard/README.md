# Handoff: GHERAS — bilingual website + content dashboard

## Overview
GHERAS (غراس) is the agricultural investment subsidiary of Investment Portfolio Holding (IPH), Libya. This kit covers two products:

1. **Public website**: a single-page site in **English (LTR)** and **Arabic (RTL)**. Its job is to build trust with investors, state institutions, industry partners and agricultural talent, and to move them to one action: **"Partner with us" / «كن شريكنا»** (the contact form).
2. **Content dashboard (CMS)**: an admin-only back office where every changeable thing on the site is edited in both languages side by side. That covers text, images, figures, contact details, social links, SEO, the endorsement line, and section visibility and order. It also handles draft → publish with change history and the contact-form inquiries inbox.

## About the design files
Everything in `design/` is a **design reference built in HTML**. These are prototypes that show the intended look, copy and behaviour. They are **not production code to copy**. Rebuild them in a real stack using its normal patterns.

The files are "Design Component" HTML: each opens directly in a browser through the bundled `support.js` runtime. Styles are inline, and a small logic class sits at the bottom of each file. Read the markup for exact values, but don't port the runtime.

**Recommended stack (no codebase exists yet):**
- **Site:** Next.js (App Router) with `/en` and `/ar` routes, statically generated from published content and revalidated on publish.
- **Dashboard:** the same Next.js app under `/admin`, with server actions or route handlers.
- **Data:** Postgres (Supabase or Neon), using the content model below.
- **Media:** object storage (S3 or R2) plus an image CDN.
- **Auth:** email + password with 2FA, admin role only in v1.
- **Form email:** a transactional provider such as Postmark or Resend.
- **Styling:** CSS variables from `tokens/tokens.css`. Tailwind is fine if mapped to those tokens.
- **Motion:** IntersectionObserver + Web Animations or CSS.

Any equivalent stack works.

## Fidelity
**High fidelity.** Colours, type, spacing, radii, shadows, copy and motion timings are final and come from the approved brand book (`design/Gheras Brand Book.dc.html`). Recreate them pixel-accurately. Introduce no new colours, fonts or styles.

---

## Brand rules (must hold everywhere)
- **Logo:** use the **enhanced master** as supplied. The vector "refinement" from the brand book's early pages is **on hold and must not be used**.
  - Header lockup: emblem + descriptor ("للاستثمار الزراعي" over a gold rule over "Agricultural Investment"). The emblem already contains GHERAS / غراس.
  - Reversed version (wordmarks in Linen) on Deep Olive.
  - Below 32 px, use the small mark.
  - Clear space = cap height of the "G".
  - Never place the logo on a busy photo without the olive overlay.
- **Harvest Gold `#C99A3B` is never text on light backgrounds.** Use **Gold Ink `#86621E`** instead.
- **Olive Leaf `#8A9A4B`** is for illustration and icons only, never text.
- **Logo-only tones** (`#A47A26`, `#AEB874`) are never used in the UI.
- **Colour split:** 60 % light neutrals (Linen, Sand), 25 % greens, 10 % gold and wheat, 5 % soil and aquifer.
- **Arabic typography:**
  - No letter-spacing and no uppercase.
  - No kashida in body text, and never justified.
  - Western numerals in both languages.
  - Arabic runs about 10 % larger with more line height (see the type scale).
- **Placeholder content:** never invent numbers, projects, partners or testimonials. Missing data shows as a **bracketed placeholder with a dashed outline**.

## Design tokens
Full set in `tokens/tokens.css` (CSS variables) and `tokens/tokens.json`.

### Colour
| Token | Hex | Use |
|---|---|---|
| Deep Olive | `#1F2A1C` | Headings, body text, dark sections, footer, dashboard sidebar |
| Grove Green | `#3F5A2A` | Primary buttons, links, focus ring, toggles on |
| Olive Leaf | `#8A9A4B` | Illustration/icons only |
| Harvest Gold | `#C99A3B` | Gold Rule, figures and eyebrows on dark, hero primary button (on dark), accents |
| Gold Ink | `#86621E` | Gold text on light (Arabic eyebrows, warnings) |
| Wheat | `#E8D3A0` | Secondary text on dark, quiet fills |
| Libyan Soil | `#9A5B3A` | Contour lines, rare emphasis |
| Aquifer | `#2F6F73` | Water/data/info |
| Sand | `#EFE7D6` | Alternating section background |
| Linen | `#FAF8F2` | Main background (never pure white for pages) |
| Stone | `#6B675C` | Captions, secondary text |
| Surface | `#FFFFFF` | Cards and inputs only |
| Field border | `#CFC6AF` | Input borders, disabled fills |

Functional colours, always paired with an icon or words:
- Success `#3F5A2A` on `#E6EBDA`
- Warning `#86621E` on `#F6EBD2`
- Error `#8E3B24` on `#F3E2D9`
- Info `#2F6F73` on `#DDEAEA`

### Type
| Role | English | Arabic |
|---|---|---|
| Display / H1 | Fraunces 300, `clamp(48px,6.2vw,92px)` / 1.02, −0.015em | Noto Naskh Arabic 600, about 1.1× size / 1.45 |
| H2 | Fraunces 300–400, `clamp(34px,3.6vw,52px)` / 1.12 | Naskh 600, 1.1× / 1.45 |
| H3 | Fraunces 400, 24–32 px, or Manrope 600, 21 px (cards) | Naskh 600 or Plex Arabic 600 |
| Body L | Manrope 400, 18 / 1.6 | IBM Plex Sans Arabic 400, 19–20 / 1.8 |
| Body | Manrope 400, 15–17 / 1.55 | Plex Arabic 16–18 / 1.8 |
| Eyebrow | Manrope 700, 12 px, uppercase, +0.2em, Grove Green on light / Wheat on dark | Plex Arabic 700, 14 px, Gold Ink on light / Harvest Gold on dark |
| Mono (placeholders/specs) | IBM Plex Mono 400, 11–13 px | same |

Load only these weights:
- Fraunces 300/400
- Manrope 400/500/600/700
- Noto Naskh Arabic 600
- IBM Plex Sans Arabic 400/500/600/700
- IBM Plex Mono 400

### Spacing, radius, shadow
- **Spacing scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- **Section padding:** `clamp(64px, 9vw, 128px)` top/bottom. Page side padding `clamp(20px, 5.5vw, 80px)`.
- **Grid:** 12 columns, max 1280, gutter 24. Mobile: 4 columns, 16 px margins. Body text ≤ 680 px.
- **Radius:** 4 (buttons, inputs) · 12 (cards) · 24 (large panels, form card) · full (circles, pills).
- **Shadows:** always tinted Deep Olive, never grey.
  - `sm` = `0 1px 2px rgba(31,42,28,.08), 0 2px 8px rgba(31,42,28,.06)`
  - `md` = `0 2px 4px rgba(31,42,28,.06), 0 12px 32px rgba(31,42,28,.12)`
- **Focus:** `outline: 2px solid #3F5A2A; outline-offset: 2px`. Inputs on focus: border `#3F5A2A` + `box-shadow: 0 0 0 3px rgba(201,154,59,.35)`.

### Graphic language
- **Gold Rule:** a 48 × 1 px Harvest Gold line before every eyebrow. It opens every section.
- **Pivot Circle:**
  - circular photo crops with a 1 px gold ring at −18 px;
  - faint 1 px arcs at `rgba(63,90,42,.12–.2)`;
  - figure rings: an SVG circle with `pathLength=100` and a 25/75 gold dash.
- **Furrow Lines:** `repeating-linear-gradient(0deg, transparent 0 13px, rgba(201,154,59,.07) 13px 14px)`, used in the footer.
- **Contour Lines:** Libyan Soil, ≤ 1.2 px, in the Why section background.
- **Botanical line art:** single-weight gold stroke drawing of the wheat and olive, large and cropped, in the hero and on the login screen.
- **Brand pattern:** grain and leaf lenses on concentric rings centred off-canvas. Use it only on Mission/Vision, at 16 % opacity.
- **Icons:** 24 px grid, 1.5 px stroke, round caps and joins, one colour plus an optional gold accent. The set is in `design/Gheras Icon.dc.html` and the SVG path data can be copied directly. It has 24 glyphs: 14 services, 5 values, plus arrow, globe, mail, phone and pin. Mirror the arrow in RTL only.

---

## WEBSITE

### Routes and SEO
- `/en` uses `<html lang="en" dir="ltr">`. `/ar` uses `<html lang="ar" dir="rtl">`.
- Each language has its own `<title>` and meta description, taken from CMS `site.seo`.
- Add `hreflang` alternates.
- The language switch keeps the current section: `/en#values` ⇄ `/ar#values`.
- **Section anchors:** `#about`, `#what-we-do`, `#values`, `#why`, `#contact`. Use `scroll-margin-top: 80px`.

### Sections (in order)
Reference: `design/Gheras Website.dc.html` (EN) and `design/Gheras Website AR.dc.html` (AR). All copy is in `content/content.seed.json`.

| # | Section | Background | Key layout |
|---|---|---|---|
| — | **Header** (fixed) | Transparent over hero → `rgba(250,248,242,.97)` + shadow `sm` after 80 px scroll | Logo 200 px (156 px mobile). Nav links 14/600 with a 2 px gold underline (scaleX) on the active section. Language pill. Primary button 48 px. Below 1180 px the links collapse into a menu button (44×44). Below 768 px the pill and button move into the menu. |
| 1 | **Hero** | Deep Olive | `min-height: max(100vh, 640px)`. PHOTO 01, then the overlay `linear-gradient(90deg, rgba(31,42,28,.94) 0, .78 48%, .35 100%)` + `linear-gradient(0deg, .85 0, 0 40%)`. Botanical line art 820 px, bottom-right at 55 % opacity. Eyebrow, H1 (max 12ch), sub (19 px Wheat, max 52ch), gold primary + outline secondary (52 px). Scroll cue at the bottom. AR: gradient 270deg, art bottom-left. |
| 2 | **Belief** `#about` | Linen | Two faint circles at the top-start. H2 statement (Fraunces 300, max 20ch). Two paragraphs in auto-fit columns pushed to the end side (`margin-inline-start:auto; max-width:840px`). |
| 3 | **Figures** | Deep Olive | 4 figure blocks in auto-fit (min 220). Each is a 180 px ring with a gold number and a Wheat label. **Hidden by default.** Show only when all four numbers are real. |
| 4 | **What we do** `#what-we-do` | Linen | Header grid (heading + intro). 6 white service cards (auto-fit, min 300; radius 12; padding 32; icon 40; index in mono; title Manrope 600 21; text Stone 15). Closing line + primary button. |
| 5 | **Two horizons** | Sand | Centred eyebrow + H2 "One season, many generations." Three columns: Today (wheat, gold rule) · 300 px Linen circle with the emblem · Tomorrow (olive, green rule). Four numbered objectives each side. Below 900 px it stacks. **Not pinned.** |
| 6 | **Mission & vision** | Deep Olive + brand pattern 16 % | Two columns, each Gold Rule + eyebrow + Fraunces 300 quote `clamp(26px,2.5vw,36px)`. Word for word. |
| 7 | **ICARE values** `#values` | Deep Olive (continues; top gold line) | Header. 5 columns (auto-fit min 150, column-gap 24, right border `rgba(201,154,59,.18)`). EN: huge Fraunces 300 Harvest Gold letter `clamp(80px,9vw,148px)`, icon, name, text. AR: name leads (Naskh 30–42 px) and the letter is a small 13 px Latin detail. 1 column on mobile. |
| 8 | **Why GHERAS** `#why` | Sand + contour lines | Five rows alternating image/text (row / row-reverse; column on mobile). Circle photo `min(400px,38vw)` with a gold ring. Number "01 / 05", H3, paragraph. |
| 9 | **Who we work with** | Linen | Heading + primary button. 4 panels (auto-fit min 240, 2 px separators, radius 24). Each link **pre-selects the inquiry type** in the form (Investment, Partnership, Supply, Careers) and scrolls to `#contact`. |
| 10 | **Contact** `#contact` | Sand | Left: eyebrow "Partner with us", H2 "Let's grow something lasting together.", intro, email/phone/address (CMS), slogan above a gold rule. Right: Linen form card (radius 24, padding 48, shadow md). |
| — | **Footer** | Deep Olive + furrow lines | Reversed logo 240. "An IPH Company" (CMS toggle, pending approval). Nav. Social links (CMS; empty ones hidden). © line and language switch. |

Additional controls:
- **Growing stem** (≥ 1024 px): fixed at `inset-inline-start: clamp(10px,1.6vw,28px)`, top 104, bottom 40. A 1 px track plus a 2 px gold line scaled to scroll progress. A 14 px grain/leaf node appears at each section's position.
- **Progress bar** (< 1024 px): 2 px gold, at the bottom of the header.
- **Back to top:** a 48 px Grove Green circle at the bottom end, shown after 1.5 viewports.

### Contact form
Fields:
- Full name *(required)*
- Organisation
- Email *(required, validated)*
- Phone *(optional, marked)*
- Inquiry type (Investment / Partnership / Supply / Careers / Other)
- Message *(required)*

Layout and states:
- Labels sit above the fields. Inputs are 48 px high with a 1 px `#CFC6AF` border and radius 4.
- Each field is validated **on blur**. Errors show a red `#8E3B24` border plus a "✕ message" line with `role="alert"`.
- Submitting with errors marks every field as touched.
- **Success:** the form is replaced by a status panel. It shows a check icon that draws in, "Thank you, {first name}.", a reply-time sentence using `site.contact.replyTimeDays`, and a "Send another message" link.

Backend:
- Store each submission as an `Inquiry` (see the data model below).
- Email the team.
- Rate-limit submissions and add a honeypot field.

### Responsive
- **Breakpoints:** 390 / 768 / 1024 / 1440.
- **Mobile is its own layout:** single columns, 64 px section padding, full-screen menu (Deep Olive, 64 px link rows, language switch and gold primary button at the bottom), no hero depth effect.
- **Tap targets** are at least 44 px.

### Motion
Easing everywhere: `cubic-bezier(.22,.61,.36,1)`.

| Element | Trigger | Animation | Duration · delay |
|---|---|---|---|
| Header | scroll > 80 px | background + shadow fade; logo swaps reversed → full | 400 ms |
| Hero photo | load | scale 1.06 → 1 | 1600 ms |
| H1 words | load | translateY 16 → 0, opacity 0 → 1, per word | 600 ms · 220 + 80 ms/word |
| Eyebrow / sub / buttons | load | translateY 12 → 0 + fade | 600 ms · 80 / 640 / 860 ms |
| Line art | load | stroke-dashoffset draw | 1200 ms · 400 ms |
| Hero depth (≥ 1024) | scroll | photo translateY = scroll × 0.25; overlay to +55 % | scroll-linked |
| Belief words | scroll through line | opacity .18 → 1 as reading progresses | 350 ms each |
| Gold Rule | enters view | scaleX 0 → 1 toward its label | 600 ms · 80 ms |
| Figure rings | enters view | dash 0 → 25 | 1200 ms · 200 + 80 ms |
| Headings, text, cards, panels, fields | enters view | rise 16 px + fade; stagger within a parent | 560 ms · 70 ms steps, max 6 |
| Card hover | hover | translateY −4 px, shadow sm → md | 300 ms |
| Two horizons | enters view | columns slide 64 px from centre, circle .92 → 1, objectives rise | 800 ms · items 320 + 90 ms |
| Mission pattern | scroll | drift ±20 px | scroll-linked |
| Why photos | enters view | clip-path circle(0%) → circle(50%) | 900 ms |
| Arrows in CTAs | hover | translateX 4 px (−4 px in AR) | 300 ms |
| Contact success | submit | panel rises; check draws | 500 ms; check 600 ms after 300 ms |

Rules:
- Each reveal plays **once**.
- **No pinning and no scroll hijacking.** An earlier pinned version was rejected.
- Animate only transform, opacity, clip-path and stroke.
- Content must be fully visible without JS.
- With `prefers-reduced-motion: reduce`: no movement. The stem and progress bar still track position, without easing.

---

## DASHBOARD
Reference: `design/Gheras Dashboard.dc.html`. Use the `startScreen` prop or the sidebar to see each screen.

**Shell:**
- 248 px Deep Olive sidebar, holding:
  - reversed logo;
  - nav items: 44 px rows, icon 20, active background `rgba(201,154,59,.18)`, gold count badge on Inquiries;
  - user block;
  - language switch and sign out.
- A 72 px top bar on Linen with:
  - page title (Fraunces 26, truncates);
  - "Draft · N unpublished changes" chip (Warning colours);
  - "Preview site" (secondary);
  - "Publish" (primary).
- Content padding 32. Cards are white, radius 12, shadow sm.

**Interface language:** EN or AR switch. In AR the whole UI mirrors (sidebar on the right), with headings in Naskh 600, UI in Plex Arabic, and no uppercase or letter-spacing.

### Screens
1. **Login.** Split screen: Deep Olive panel with the logo and line art, and a form with email, password, "Forgot password?", Sign in (52 px) and a language switch. Note: admin-only, 2FA on first sign-in.
2. **Overview.**
   - Greeting.
   - **Draft status** card (Deep Olive): count, three latest pending changes, "Review & publish", "See history".
   - **Content health:** counts that link to fixes (missing Arabic, placeholders left, images missing Arabic alt text, unread inquiries).
   - **New inquiries** (3).
   - **Recent changes** (4).
3. **Page editor** (core).
   - **Section list** (232 px): drag-to-reorder handles, name, 🔒 for locked sections, gold dot for warnings, and a show/hide switch (34×20).
   - **Field column:** every field is a white card with **English on the left and Arabic on the right** (`dir` set per field).
   - **Live preview** (452 px, sticky): the real page in an iframe, scaled. It switches EN/AR and desktop/mobile, and jumps to the anchor of the section being edited. Below about 1430 px of window width it moves under the fields.
   - **Field types:**
     - text and area, with a character limit and counter (Stone → Gold Ink at 90 % → Error over the limit);
     - image (slot, ratio badge, "Replace image", alt EN/AR);
     - figure (number + EN label + AR label);
     - toggle;
     - repeaters (services, objectives, why items, audience panels).
   - **Guardrails (strict):**
     - text over the limit blocks publish;
     - an **empty Arabic field** gets a Wheat background, a gold border and "⚠ النص العربي مفقود — لن يُنشر هذا الحقل", and the published value is kept;
     - images below the minimum width or the wrong ratio are flagged;
     - **Mission & vision** and **ICARE values** are **locked**. A banner explains why, and "Unlock to edit" needs a confirmation.
4. **Media library.**
   - Search, filter chips (All / Missing alt text / Unused), Upload, and a drop zone.
   - Rules: JPG/WebP, hero ≥ 2400 px wide, circles ≥ 1200 px.
   - Grid of tiles showing usage and status.
   - Detail panel: crop presets (Pivot circle 1:1 · Hero 16:9 · Card 4:3), a draggable focal point, alt text EN/AR, and the photo rules.
5. **Inquiries.**
   - Filter chips by type.
   - List: unread dot and bold, name, org, time, snippet in its own direction, type pill.
   - Detail: contact boxes, message with a gold side rule, "Reply by email" (mailto), "Mark as replied", "Archive", internal notes.
6. **Change history.**
   - Timeline of drafts (gold) and published versions (green, "Published · vN").
   - Detail: before/after per field and language (Error-tinted before with strikethrough, Success-tinted after) and "Restore this version".
7. **Site settings.** Rows show label · EN · AR:
   - **Contact:** email, phone, address EN/AR, reply time.
   - **Social links:** LinkedIn, Instagram, X, Facebook, YouTube. URLs are validated and empty ones are hidden on the site.
   - **SEO:** title ≤ 60, description ≤ 155, share image 1200×630, with a live search-result preview in each language.
   - **Endorsement line:** EN/AR text and a show toggle, off until approved.
   - Placeholder values use a dashed Gold Ink border.
8. **Users & roles.** v1 has a single Administrator with full access. Editor, Inquiries and Reviewer are shown as "Later" cards. The invite button is disabled.
- **Publish dialog** (modal, radius 24): summary, pre-publish checks (✓ passed or ⚠ warnings), optional history note, Cancel / Publish now.

### Data model (suggested)
```
Localized = { en: string|null, ar: string|null }

Section   { id, order:int, visible:bool, locked:bool, fields: Record<key, Localized|Media|number>, items?: Item[] }
Media     { id, url, width, height, ratio, focal:{x,y}, alt: Localized, brief, usedIn: string[] }
Settings  { seo:{title,description:Localized, shareImage:Media}, contact:{email, phone, address:Localized, replyTimeDays},
            social:{linkedin,instagram,x,facebook,youtube}, endorsement:{visible, text:Localized} }
Revision  { id, version:int|null, status:'draft'|'published', author, createdAt, note, snapshot: JSON, diff: FieldDiff[] }
Inquiry   { id, name, organisation, email, phone?, type:'Investment'|'Partnership'|'Supply'|'Careers'|'Other',
            message, pageLang:'en'|'ar', status:'new'|'replied'|'archived', notes, createdAt }
User      { id, name, email, role:'admin', twoFactor:bool }     // roles 'editor'|'inquiries'|'reviewer' later
```
- **Draft vs published:** keep one working draft (the full content JSON) and immutable published revisions. **Publish** validates the guardrails, writes a new revision and triggers site revalidation. **Restore** copies a revision into the draft.
- **Per-field publishing:** an empty Arabic field keeps the last published Arabic value.
- **Seed data:** `content/content.seed.json` holds every current EN/AR string, the section order and the media slots (all `url: null`).

---

## Placeholders (client to supply)
- **Photos:** 01 hero aerial pivots · 02 olive grove · 04 soil in hands · 05 drip lines · 07 engineer with tablet · 09 hands sorting harvest.
- **Figures:** hectares, active projects, tonnes per year, engineers/specialists. The section stays hidden until all four are real.
- **Contact and company:** email, phone, address (EN/AR), reply time, social links, IPH endorsement wording (EN + AR).
- **Copy:** all Arabic copy needs native copy-editor approval, including the Arabic mission and vision.

## Accessibility (WCAG 2.2 AA)
- **Contrast:** use only passing pairings. Text over photos always sits on the olive overlay.
- **Structure:** one H1 per page and a strict heading order.
- **Images:** bilingual alt text; decorative art has `aria-hidden`.
- **Menu dialog:** traps focus and locks scroll.
- **Form:** errors in words plus an icon; never colour alone.
- **Keyboard:** full keyboard operation with a visible focus ring.
- **Dashboard:** toggles get `role="switch"` and `aria-checked`. Drag-reorder needs a keyboard alternative (move up/down buttons).

## Performance
- Preload the hero image (AVIF/WebP, responsive `srcset`) and lazy-load the rest with explicit dimensions.
- Subset fonts and use `font-display: swap`.
- Targets: LCP < 2.5 s on mid-range mobile, CLS < 0.05.

## Assets
- `design/assets/gheras-logo.png`: the original client logo (master).
- `design/assets/gheras-logo-fill-hd.jpg` + `gheras-logo-paths.json`: the enhanced master (artwork clipped by traced vector edges, wordmarks as vector paths). See `design/Gheras Logo.dc.html` for how they combine. For production, export it once to a high-resolution transparent PNG and an SVG with an embedded image, in full, reversed and small versions.
- `design/assets/gheras-emblem-olive.svg` / `-gold.svg` / `-white.svg`: one-colour vector emblems (foil, favicon base, embroidery).
- **Icons:** path data in `design/Gheras Icon.dc.html` (`static I`).

## Files
| File | What it is |
|---|---|
| `design/Gheras Website.dc.html` | English site, complete (layout, copy, motion, form, mobile menu) |
| `design/Gheras Website AR.dc.html` | Arabic site, full RTL mirror |
| `design/Gheras Dashboard.dc.html` | Dashboard, all 8 screens + publish dialog, EN/AR UI |
| `design/Gheras Website Handoff.dc.html` | Breakpoint frames, states sheet, motion sheet, placeholder list, design notes |
| `design/Gheras Brand Book.dc.html` | Approved brand identity system (the law) |
| `design/Gheras Logo.dc.html`, `design/Gheras Icon.dc.html` | Logo lockups and icon set |
| `tokens/tokens.css`, `tokens/tokens.json` | Design tokens |
| `content/content.seed.json` | All current bilingual content + structure for seeding the CMS |

Open any `design/*.dc.html` file in a browser. Keep the folder structure intact so `support.js` and `assets/` resolve.

## Suggested build order
1. Tokens, fonts, Logo and Icon components.
2. Content schema + seed, and a read API for published content.
3. Website EN, then AR, as static pages from content. Then the form and inquiry storage.
4. Motion layer, with progressive enhancement.
5. Dashboard: auth, then Page editor + preview, then Settings, Media, Inquiries, then History/publish.
6. QA: the brand checklist (contrast, Arabic rules, placeholders), Lighthouse, keyboard and screen-reader passes in both languages.
