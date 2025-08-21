FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY nx.json ./
COPY tsconfig.base.json ./
COPY package*.json ./
COPY libs/api ./libs/api

RUN npm ci --only=production
RUN npm install nx@latest
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --no-save

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

COPY eslint.config.mjs ./
COPY nx.json ./
COPY tsconfig.json ./
COPY tsconfig.base.json ./
COPY package*.json ./
COPY libs/api ./libs/api
COPY apps/api/users ./apps/api/users

RUN npx nx sync
RUN npx prisma generate --schema=libs/api/database/prisma/schema.prisma
RUN NX_DAEMON=false npx nx build users-service

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/users/dist ./apps/api/users/dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/libs/api/database ./libs/api/database

COPY --from=deps /app/node_modules ./node_modules

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3002
ENV PORT=3002

CMD ["node", "apps/api/users/dist/main.js"]
