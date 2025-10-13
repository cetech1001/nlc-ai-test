FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY nx.json ./
COPY tsconfig.base.json ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY libs/api ./libs/api
COPY libs/types ./libs/types

RUN pnpm install --prod --frozen-lockfile
RUN pnpm add nx@latest
RUN pnpm add @rollup/rollup-linux-x64-musl --save-optional

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

COPY eslint.config.mjs ./
COPY nx.json ./
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY apps/api/analytics ./apps/api/analytics

RUN pnpm nx sync
RUN pnpm prisma generate --schema=libs/api/database/prisma/schema.prisma
RUN NX_DAEMON=false pnpm nx build analytics-service

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/analytics/dist ./apps/api/analytics/dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/libs/api/database ./libs/api/database

COPY --from=deps /app/node_modules ./node_modules

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3010
ENV PORT=3010

CMD ["node", "apps/api/analytics/dist/main.js"]
