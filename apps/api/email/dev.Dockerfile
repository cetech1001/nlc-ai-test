FROM node:20-bookworm-slim
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

RUN set -eux; pnpm install --frozen-lockfile && pnpm add -w nx;

COPY apps/api/email ./apps/api/email
COPY libs/types ./libs/types
COPY libs/api ./libs/api
COPY eslint.config.mjs tsconfig.json ./

RUN pnpm prisma generate --schema=libs/api/database/prisma/schema.prisma

ENV NODE_ENV=development \
    NX_DAEMON=false \
    NX_CACHE_DIRECTORY=/app/.nx/cache

ENV PORT=3004
EXPOSE 3004

CMD ["/bin/sh","-lc","\
  echo 'Running nx sync to align TS project references...'; \
  pnpm nx sync --no-interactive --verbose || true; \
  echo 'Starting dev server...'; \
  pnpm nx serve email-service --configuration=development --verbose \
"]
