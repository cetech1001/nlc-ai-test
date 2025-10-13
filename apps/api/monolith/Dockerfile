FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma/schema.prisma ./apps/api/prisma/
COPY libs ./libs

# Install ALL dependencies (including devDependencies for building)
RUN pnpm install --frozen-lockfile

# Pre-install platform-specific packages to avoid build issues

# Build stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy source code (do this after deps for better caching)
COPY . .

# Generate Prisma client and build
RUN pnpm prisma generate --schema=apps/api/prisma/schema.prisma
RUN pnpm nx build api --prod

# Runtime stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma schema and generated client if needed
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/api/dist/main.js"]
