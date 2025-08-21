FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies first for better caching
COPY . .

RUN npm ci --omit=dev
RUN npm install nx@latest

# Copy source code (will be overridden by volume mount in dev)
COPY tsconfig.json ./
COPY libs/api ./libs/api
COPY apps/api/media ./apps/api/media

# Generate Prisma client
RUN npx nx sync
RUN npx prisma generate --schema=libs/api/database/prisma/schema.prisma

EXPOSE 3003
ENV PORT=3003

# Development command with hot reload
CMD ["npx", "nx", "serve", "media-service", "--host", "0.0.0.0"]
