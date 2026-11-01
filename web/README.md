# GHERAS — website and content dashboard

Next.js 16 (App Router) app built from `../design_handoff_gheras_website_dashboard`. The handoff README is the spec; the `design/*.dc.html` prototypes are the visual reference.

## Run

```bash
npm install
npm run db:migrate   # create/upgrade the tables in DATABASE_URL
npm run dev          # http://localhost:3000 → /en · /ar · dashboard at /admin
npm run build && npm start
npm run typecheck
npm run admin:reset -- [--password <new>] [--reset-2fa]   # recover the admin account
```

Copy `.env.example` to `.env.local` and fill it in. `DATABASE_URL` points at the local PostgreSQL database (create an empty database first, e.g. `gheras`). The first administrator is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` on first use.

## Layout

| Path | What it is |
|---|---|
| `src/app/(site)/[lang]/` | Public site: root layout (`<html lang dir>`, fonts, SEO with hreflang) and the one page, static for `/en` and `/ar`. `preview/` renders the draft (admin only) |
| `src/app/(admin)/admin/` | Dashboard: `login/`, and the signed-in screens under `(shell)/` (overview, editor, media, inquiries, history, settings, users). `api/media` handles uploads |
| `src/app/image-uploads/[name]` | Serves uploaded images from the `image-uploads` folder |
| `src/admin/` | Dashboard UI components and its EN/AR strings (`i18n.ts`) |
| `src/lib/cms/` | Content model logic: editor schema and limits (`schema.ts`), diffs and the publish merge (`diff.ts`), guardrails and health (`checks.ts`), draft/revision store (`store.ts`), server actions (`actions.ts`) |
| `src/lib/auth/` | scrypt passwords, signed session cookies, login actions |
| `src/lib/inquiries/` | Contact form: validation, honeypot, rate limit, storage, team email |
| `src/lib/db/sql.ts` | PostgreSQL connection pool (`DATABASE_URL`) |
| `db/migrations/` | SQL schema, applied in order by `npm run db:migrate` |
| `src/content/` | Content types, the seed (`published.json`) and the public read API |
| `src/components/brand/`, `src/components/site/` | Logo, icons, ornaments; site sections, header, motion |

## How content flows

- **Draft and publish.** The dashboard edits one working **draft**. **Publish** runs the guardrails, writes an immutable **published revision**, and revalidates `/en` and `/ar`. Each draft save is also logged with a field-level diff, so Change history shows every edit. **Restore** copies a published revision back into the draft.
- **Guardrails.** These block publishing:
  - text over its character limit;
  - an empty English field;
  - an invalid social link or email.

  An empty Arabic field only warns: it keeps the last published Arabic text. Locked sections (Mission & vision, ICARE values) need an explicit unlock.
- **Character limits.** They come from the dashboard prototype where it gives one. Fields it doesn't cover have limits set from the layout, in `schema.ts`.
- **Seed SEO descriptions.** In both languages they are longer than the 155-character SEO limit. They must be shortened in Site settings before the first publish.

## Data: one local PostgreSQL database

Everything is stored in PostgreSQL, except the image files themselves: those are saved in the `image-uploads` folder (`UPLOADS_DIR`) and the database stores their URL. No external services are used at runtime.

| Table | Holds |
|---|---|
| `cms_draft` | The working draft (full content JSON, one row). Saves lock the row and are logged in the same transaction |
| `cms_revisions` | Change history: draft saves (field diffs) and published versions (diff + snapshot). Publishes are serialised with an advisory lock |
| `admin_users` | The administrator: scrypt password hash, TOTP secret, session version |
| `inquiries` | Contact-form messages, status, notes |
| `media_files` | One row per uploaded photo: URL (`/image-uploads/<name>`), original file name, type, size, dimensions. The file is in the `image-uploads` folder; `next/image` resizes and caches it |

- **Backups.** Back up the database (`pg_dump`) and the `image-uploads` folder together.
- **Team email for new inquiries** is off unless `RESEND_API_KEY` is set. Every inquiry is in the dashboard inbox regardless.
- **Rate limits** (contact form, sign-in) are kept in memory, so they apply per server process.
- **Fonts** are downloaded from Google once, at build time, and then served by the app itself.

## Notes

- **Placeholders.** Missing client data (photos, contact details, reply time, social links) renders as a bracketed placeholder with a dashed outline. The Figures section stays hidden until it is switched on and all four numbers are filled in.
- **Motion** is progressive enhancement. Content is fully visible without JavaScript, and nothing moves with `prefers-reduced-motion`.
- **RTL** uses logical CSS properties. In AR the dashboard mirrors, but editor fields always show English on the left and Arabic on the right.
