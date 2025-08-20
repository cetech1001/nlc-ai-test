FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm install --omit=dev
RUN npm install nx@latest

# Copy source code (will be overridden by volume mount in dev)
COPY . .

# Generate Prisma client
RUN npx nx sync
RUN npx prisma generate --schema=libs/api/database/prisma/schema.prisma

EXPOSE 3001
ENV PORT=3001

# Development command with hot reload
CMD ["npx", "nx", "serve", "auth-service", "--host", "0.0.0.0"]
