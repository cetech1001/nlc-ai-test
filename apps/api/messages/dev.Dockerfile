FROM node:20-bookworm-slim
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

RUN set -eux; pnpm install --frozen-lockfile

COPY apps/api/messages ./apps/api/messages
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY eslint.config.mjs tsconfig.json ./

RUN pnpm prisma generate --schema=libs/api/database/prisma/schema.prisma

ENV NODE_ENV=development \
    NX_DAEMON=false \
    NX_CACHE_DIRECTORY=/app/.nx/cache

ENV PORT=3012
EXPOSE 3012

CMD ["/bin/sh","-lc","\
  echo 'Running nx sync to align TS project references...'; \
  pnpm nx sync --no-interactive --verbose || true; \
  echo 'Starting dev server...'; \
  pnpm nx serve messages-service --configuration=development --verbose \
"]
