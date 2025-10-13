FROM node:20-bookworm-slim
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

RUN set -eux; pnpm install --frozen-lockfile

COPY apps/api/billing ./apps/api/billing
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY eslint.config.mjs tsconfig.json ./


ENV NODE_ENV=development \
    NX_CACHE_DIRECTORY=/app/.nx/cache

ENV PORT=3005
EXPOSE 3005

CMD ["/bin/sh","-lc","\
  echo 'Running nx sync to align TS project references...'; \
  pnpm nx sync --no-interactive --verbose || true; \
  echo 'Starting dev server...'; \
  pnpm nx serve billing-service --configuration=development --verbose \
"]
