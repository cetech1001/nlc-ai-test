FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

RUN set -eux; \
    pnpm install --frozen-lockfile && \
    pnpm store prune

COPY apps/api/gateway ./apps/api/gateway
COPY libs/api/auth ./libs/api/auth
COPY libs/api/types ./libs/api/types
COPY libs/types ./libs/types
COPY libs/api/validation ./libs/api/validation
COPY libs/api/database/prisma/schema.prisma ./libs/api/database/prisma/schema.prisma
COPY eslint.config.mjs tsconfig.json ./

ENV NODE_ENV=development \
    NX_DAEMON=false \
    NX_CACHE_DIRECTORY=/tmp/.nx/cache \
    PORT=3000

EXPOSE 3000

CMD ["/bin/sh", "-c", "\
  echo 'Running nx sync...'; \
  pnpm nx sync --no-interactive || true; \
  echo 'Starting dev server...'; \
  pnpm nx serve gateway-service --configuration=development \
"]
