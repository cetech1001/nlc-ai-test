FROM --platform=linux/amd64 node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

COPY apps/web/package.json ./apps/web/
COPY libs ./libs

RUN npm ci --only=production

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

COPY . .

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm list nx || npm install nx@latest
RUN npx nx build web --prod

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npx", "next", "start"]
