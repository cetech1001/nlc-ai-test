#!/bin/sh
set -e

npx prisma generate --schema=./schema.prisma
npx prisma migrate deploy --schema=./schema.prisma

exec node dist/main.js
