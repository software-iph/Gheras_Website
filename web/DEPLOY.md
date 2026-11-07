# Deploying GHERAS on the VPS (Docker)

Two containers: `gheras-web` (the Next.js app, on `127.0.0.1:3001` — server-only; the public reaches it through Nginx Proxy Manager) and `gheras-db` (PostgreSQL 17, not exposed). Data lives in the Docker volumes `gheras-db` (database) and `gheras-uploads` (uploaded images). The other site and Nginx Proxy Manager on the server are not touched.

## First deploy

```bash
# 1. Get the code (the repository is private, so use a GitHub token or deploy key)
git clone https://github.com/software-iph/Gheras_Website.git /opt/gheras
cd /opt/gheras/web

# 2. Settings
cp .env.production.example .env.production
nano .env.production      # fill POSTGRES_PASSWORD, SITE_URL=https://your-domain, ADMIN_*, SESSION_SECRET
openssl rand -hex 32      # handy for SESSION_SECRET and POSTGRES_PASSWORD (hex: no characters that break the database URL)
ln -s .env.production .env   # required: every `docker compose ...` command reads the settings from .env

# 3. Build and start (migrations run automatically when the app starts)
docker compose up -d --build
```

Check on the server: `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/en` (expect `200`). Port 3001 is bound to `127.0.0.1`, so it is not reachable from the internet — connect the domain (below) to open the site publicly.

Logs: `docker compose logs -f gheras-web`

## Updating

```bash
cd /opt/gheras && git pull
cd web && docker compose up -d --build
```

The public pages are pre-rendered during the build and re-read the published content from the database every 5 minutes (publishing from the dashboard updates them immediately).

## Connecting the domain (Nginx Proxy Manager)

1. Point the domain's DNS (A record) at the server.
2. Put Nginx Proxy Manager on the GHERAS network (once): `docker network connect web_default nginx-proxy-manager`. If `web_default` is ever recreated (e.g. after `docker compose down`), run it again.
3. In Nginx Proxy Manager → **Add Proxy Host**: domain name(s); scheme `http`; forward hostname `gheras-web`; forward port `3000`. SSL tab: request a Let's Encrypt certificate, Force SSL, HTTP/2.
4. Sign in at `https://your-domain/admin`. The admin cookie is HTTPS-only, so sign-in only works through the domain.

## Admin recovery

```bash
docker compose exec gheras-web node scripts/admin-reset.mjs --password 'NewStrongPassword'
```

## Backups

```bash
docker compose exec -T gheras-db pg_dump -U gheras gheras > gheras-$(date +%F).sql
docker run --rm -v web_gheras-uploads:/data -v "$PWD":/backup alpine tar czf /backup/uploads-$(date +%F).tgz -C /data .
```

(The volume name is prefixed with the compose project name, `web_` by default; check with `docker volume ls`.)
