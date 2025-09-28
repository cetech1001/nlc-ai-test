FROM node:20-bookworm-slim

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY nx.json tsconfig.base.json ./

RUN set -eux; npm ci --ignore-scripts && npm install nx;

COPY apps/api/leads ./apps/api/leads
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY eslint.config.mjs tsconfig.json ./

RUN npx prisma generate --schema=libs/api/database/prisma/schema.prisma

ENV NODE_ENV=development \
    NX_DAEMON=false \
    NX_CACHE_DIRECTORY=/app/.nx/cache

ENV PORT=3006
EXPOSE 3006

CMD ["/bin/sh","-lc","\
  echo 'Running nx sync to align TS project references...'; \
  npx nx sync --no-interactive --verbose || true; \
  echo 'Starting dev server...'; \
  npx nx serve leads-service --configuration=development --verbose \
"]
