FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Make installs predictable in CI/containers
ENV CI=1 \
    HUSKY=0 \
    npm_config_audit=false \
    npm_config_fund=false \
    npm_config_progress=false

# Copy lockfiles first for better caching
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install (skip lifecycle scripts to avoid hangs), include dev deps for Nx serve
RUN npm ci --ignore-scripts

# Copy the rest of the workspace
COPY . .

# Run only the scripts you actually need
RUN npx prisma generate --schema=libs/api/database/prisma/schema.prisma || true

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=development

# Development command with hot reload
CMD ["sh", "-lc", "npx nx run @nlc-ai/gateway-service:serve:development --host 0.0.0.0"]
