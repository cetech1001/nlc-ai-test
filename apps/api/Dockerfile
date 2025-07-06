FROM --platform=linux/amd64 node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

COPY apps/api/package.json ./apps/api/
COPY libs ./libs

RUN npm ci --only=production && npm cache clean --force

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

COPY . .

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npm list nx || npm install nx@latest
RUN npm install @rollup/rollup-linux-x64-musl --save-optional
RUN npx nx build api --prod

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/api/dist/main.js"]
