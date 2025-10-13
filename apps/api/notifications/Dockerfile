FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY nx.json ./
COPY tsconfig.base.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/api ./libs/api
COPY libs/types ./libs/types

RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

COPY eslint.config.mjs ./
COPY nx.json ./
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY apps/api/notifications ./apps/api/notifications

RUN pnpm nx sync
RUN NX_DAEMON=false pnpm nx build notifications-service

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/notifications/dist ./apps/api/notifications/dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/libs/api/database ./libs/api/database

COPY --from=deps /app/node_modules ./node_modules

RUN pnpm prisma generate --schema=libs/api/database/prisma/schema.prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3007
ENV PORT=3007

CMD ["node", "apps/api/notifications/dist/main.js"]
