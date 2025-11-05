#!/bin/sh
set -e

pnpm prisma generate --schema=./schema.prisma
pnpm prisma migrate deploy --schema=./schema.prisma

exec node dist/main.js
