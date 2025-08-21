FROM node:20-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace configuration
COPY nx.json ./
COPY eslint.config.mjs ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY package*.json ./
COPY libs/api ./libs/api
COPY apps/api/users ./apps/api/users

# Install all dependencies (including dev deps for development)
RUN npm ci --ignore-scripts
RUN npm install nx@latest
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --no-save

# Setup workspace and generate Prisma client
RUN npx nx sync
RUN npx prisma generate --schema=libs/api/database/prisma/schema.prisma

RUN npx nx sync --verbose || echo "Sync completed with warnings"

EXPOSE 3002
ENV PORT=3002
ENV NODE_ENV=development

# Development command with hot reload
CMD ["npx", "nx", "serve", "users-service", "--host", "0.0.0.0", "--port", "3002", "--skip-nx-cache"]
