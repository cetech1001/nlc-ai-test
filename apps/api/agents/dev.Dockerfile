FROM node:20-bookworm-slim
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./

RUN set -eux; pnpm install --frozen-lockfile

COPY apps/api/agents ./apps/api/agents
COPY libs/types ./libs/types
COPY libs/api ./libs/api
COPY eslint.config.mjs tsconfig.json ./


ENV NODE_ENV=development \
    NX_DAEMON=false \
    NX_CACHE_DIRECTORY=/app/.nx/cache

ENV PORT=3011
EXPOSE 3011

CMD ["/bin/sh","-lc","\
  echo 'Running nx sync to align TS project references...'; \
  pnpm nx sync --no-interactive --verbose || true; \
  echo 'Starting dev server...'; \
  pnpm nx serve agents-service --configuration=development --verbose \
"]
