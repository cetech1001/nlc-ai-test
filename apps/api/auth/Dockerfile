FROM node:20-alpine AS base

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency files first (better layer caching)
COPY apps/api/auth/package.json ./
#COPY nx.json ./
COPY tsconfig.base.json ./
#COPY apps/api/package.json ./apps/api/
#COPY libs/api/database/prisma/schema.prisma ./apps/api/auth/prisma/
COPY libs/api ./libs/api

# Install ALL dependencies (including devDependencies for building)
RUN npm i --omit-dev=true
RUN #npm install nx@latest

# Pre-install platform-specific packages to avoid build issues
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --no-save

# Build stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

# Copy source code (do this after deps for better caching)
#COPY . .
COPY tsconfig.base.json ./
COPY libs/api ./libs/api
COPY apps/api/auth ./apps/api/auth

# Generate Prisma client and build
RUN npx prisma generate --schema=libs/api/database/prisma/schema.prisma

RUN npm install --no-save typescript
WORKDIR /app/apps/api/auth

RUN npm run build

# Runtime stage
FROM base AS runner
WORKDIR /app

#ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder /app/apps/api/auth/dist ./apps/api/auth/dist

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma schema and generated client if needed
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/api/auth/dist/main.js"]
