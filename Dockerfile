FROM docker.io/node:lts-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

ARG SERVICE_NAME
ENV NX_DAEMON=false

WORKDIR /app

COPY tsconfig.base.json tsconfig.json nx.json eslint.config.mjs ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY apps/api/${SERVICE_NAME} ./apps/api/${SERVICE_NAME}

RUN pnpm install --frozen-lockfile
RUN pnpm nx sync

RUN npx prisma generate --schema=./libs/api/database/prisma/schema.prisma

RUN pnpm nx build ${SERVICE_NAME}-service

FROM docker.io/node:lts-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate

ARG SERVICE_NAME
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/${SERVICE_NAME}/dist/package.json ./
COPY --from=builder /app/apps/api/${SERVICE_NAME}/dist ./dist
COPY --from=builder /app/libs/api ./libs/api
COPY --from=builder /app/libs/types ./libs/types
COPY --from=builder /app/libs/api/database/prisma ./

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN pnpm install

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
