FROM --platform=linux/amd64 node:18-alpine AS base

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY apps/coach/package.json ./apps/coach/
COPY libs ./libs

# Install ALL dependencies (including devDependencies for building)
RUN npm ci --only=production && npm cache clean --force

# Pre-install platform-specific packages
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --no-save

# Build stage
FROM base AS builder
WORKDIR /app

# Build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENV
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy source code
COPY . .

# Build the application
RUN npx nx build coach --prod

# Production dependencies stage
FROM base AS prod-deps
WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY apps/coach/package.json ./apps/coach/

# Only install production dependencies for runtime
RUN npm ci --only=production && npm cache clean --force

# Runtime stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/coach/.next/standalone ./
COPY --from=builder /app/apps/coach/.next/static ./apps/coach/.next/static
COPY --from=builder /app/apps/coach/public ./apps/coach/public

# Copy only production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/coach/server.js"]
