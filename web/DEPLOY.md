# Deploying GHERAS on the VPS (Docker)

Two containers: `gheras-web` (the Next.js app, published on host port **3001**) and `gheras-db` (PostgreSQL 17, not exposed). Data lives in the Docker volumes `gheras-db` (database) and `gheras-uploads` (uploaded images). The other site and Nginx Proxy Manager on the server are not touched.

## First deploy (public on port 3001)

```bash
# 1. Get the code (the repository is private, so use a GitHub token or deploy key)
git clone https://github.com/software-iph/Gheras_Website.git /opt/gheras
cd /opt/gheras/web

# 2. Settings
cp .env.production.example .env.production
nano .env.production      # fill POSTGRES_PASSWORD, SITE_URL=http://SERVER_IP:3001, ADMIN_*, SESSION_SECRET
openssl rand -base64 48   # handy for SESSION_SECRET and POSTGRES_PASSWORD

# 3. Build and start (migrations run automatically when the app starts)
docker compose --env-file .env.production up -d --build

```

Port 3001 must also be open in the VPS provider's firewall panel, if it has one. (Ports published by Docker bypass `ufw`.)

Check: `http://SERVER_IP:3001/en`, `/ar`, and `/admin` (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

Logs: `docker compose logs -f gheras-web`

## Updating

```bash
cd /opt/gheras && git pull
cd web && docker compose --env-file .env.production up -d --build
```

The public pages are pre-rendered during the build and re-read the published content from the database every 5 minutes (publishing from the dashboard updates them immediately).

## Connecting the domain later (Nginx Proxy Manager)

1. Point the domain's DNS (A record) at the server.
2. In Nginx Proxy Manager → **Add Proxy Host**: domain name(s); scheme `http`; forward hostname = the server's IP (or `gheras-web` if NPM shares a Docker network with it); forward port `3001` (or `3000` when using `gheras-web`). SSL tab: request a Let's Encrypt certificate, force SSL.
3. In `.env.production`: set `SITE_URL=https://your-domain` and **remove `SESSION_COOKIE_SECURE=false`** (admin cookies must be HTTPS-only once the domain works). Then `docker compose --env-file .env.production up -d`.
4. Stop exposing port 3001 publicly: change the port mapping to `"127.0.0.1:3001:3000"` in `docker-compose.yml` (Docker ports bypass `ufw`), then `docker compose --env-file .env.production up -d`. If NPM runs in Docker and forwards to the server IP, instead connect NPM and `gheras-web` to one Docker network and forward to `gheras-web:3000`.

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
