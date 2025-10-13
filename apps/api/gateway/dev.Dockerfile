FROM node:20-bookworm-slim
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

RUN set -eux; pnpm install --frozen-lockfile && pnpm add -w nx;

COPY apps/api/gateway ./apps/api/gateway
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY eslint.config.mjs tsconfig.json ./

RUN pnpm prisma generate --schema=libs/api/database/prisma/schema.prisma

ENV NODE_ENV=development \
    NX_DAEMON=false \
    NX_CACHE_DIRECTORY=/tmp/nx-cache

ENV PORT=3000
EXPOSE 3000

CMD ["/bin/sh","-lc","\
  echo 'Resetting Nx state...'; \
  pnpm nx reset || true; \
  rm -rf /tmp/nx || true; \
  echo 'Running nx sync to align TS project references...'; \
  pnpm nx sync --no-interactive --verbose || true; \
  echo 'Starting dev server...'; \
  npm run db:deploy --no-interactive --verbose || true; \
  pnpm nx serve gateway-service --configuration=development --verbose \
"]
