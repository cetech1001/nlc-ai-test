FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

RUN set -eux; \
    pnpm install --frozen-lockfile && \
    pnpm store prune

COPY apps/api/content ./apps/api/content
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY eslint.config.mjs tsconfig.json ./

RUN rm -rf /app/libs/api/database/prisma/migrations

RUN pnpm prisma generate --schema=libs/api/database/prisma/schema.prisma && \
    find /app/node_modules/.pnpm -name 'libquery_engine-*' ! -name '*linux-musl*' -delete || true && \
    find /app/node_modules/@prisma -name 'libquery_engine-*' ! -name '*linux-musl*' -delete || true

ENV NODE_ENV=development \
    NX_DAEMON=false \
    NX_CACHE_DIRECTORY=/tmp/.nx/cache \
    PORT=3014

EXPOSE 3014

CMD ["/bin/sh", "-c", "\
  echo 'Running nx sync...'; \
  pnpm nx sync --no-interactive || true; \
  echo 'Starting dev server...'; \
  pnpm nx serve content-service --configuration=development \
"]
