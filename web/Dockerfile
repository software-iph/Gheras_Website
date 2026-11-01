# GHERAS web — production image (Next.js standalone server).
# Build:  docker compose build      Run: docker compose up -d   (see DEPLOY.md)

FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No DATABASE_URL at build time: /en and /ar are pre-rendered from the bundled seed,
# then served from the database once content is published from the dashboard.
RUN npm run build

FROM node:24-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000 UPLOADS_DIR=/app/image-uploads
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/db ./db
COPY --from=build --chown=node:node /app/scripts/db-migrate.mjs /app/scripts/admin-reset.mjs ./scripts/
# The app bundles its database driver; the migrate/reset scripts need it as a package.
COPY --from=deps --chown=node:node /app/node_modules/postgres ./node_modules/postgres
RUN mkdir -p /app/image-uploads && chown node:node /app/image-uploads
USER node
EXPOSE 3000
# Apply pending migrations, then start the server.
CMD ["sh", "-c", "node scripts/db-migrate.mjs && exec node server.js"]
