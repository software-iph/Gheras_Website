# GHERAS — website and content dashboard

| Folder | What it is |
|---|---|
| [`web/`](web/) | The app: bilingual public site (`/en`, `/ar`) and the admin dashboard (`/admin`). Next.js 16 + local PostgreSQL. Setup and details in [`web/README.md`](web/README.md) |
| [`design_handoff_gheras_website_dashboard/`](design_handoff_gheras_website_dashboard/) | The design handoff (spec, prototypes, tokens, seed content, brand assets) the app is built from |

Quick start:

```bash
cd web
npm install
cp .env.example .env.local   # fill in DATABASE_URL, ADMIN_*, SESSION_SECRET
npm run db:migrate
npm run dev                  # http://localhost:3000
```
