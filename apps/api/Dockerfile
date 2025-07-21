FROM node:18-alpine AS base

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma/schema.prisma ./apps/api/prisma/
COPY libs ./libs

# Install ALL dependencies (including devDependencies for building)
RUN npm ci --only=production && npm cache clean --force
RUN npm install nx@latest

# Pre-install platform-specific packages to avoid build issues
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --no-save

# Build stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy source code (do this after deps for better caching)
COPY . .

# Generate Prisma client and build
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN npx nx build api --prod

# Production dependencies stage (separate for better caching)
FROM base AS prod-deps
WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY libs ./libs

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Runtime stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy only production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy Prisma schema and generated client if needed
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/api/dist/main.js"]
