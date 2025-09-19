FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY nx.json ./
COPY tsconfig.base.json ./
COPY package*.json ./
COPY libs/api ./libs/api
COPY libs/types ./libs/types

RUN npm ci --only=production
RUN npm install nx@latest
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --no-save

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

COPY nx.json ./
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY package*.json ./
COPY libs/api ./libs/api
COPY libs/types ./libs/types
COPY apps/api/courses ./apps/api/courses

RUN npx nx sync
RUN npx prisma generate --schema=libs/api/database/prisma/schema.prisma
RUN NX_DAEMON=false npx nx build courses-service

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/courses/dist ./apps/api/courses/dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/libs/api/database ./libs/api/database

COPY --from=deps /app/node_modules ./node_modules

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3013
ENV PORT=3013

CMD ["node", "apps/api/courses/dist/main.js"]
