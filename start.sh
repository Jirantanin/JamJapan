#!/bin/sh

echo "=== Applying DB schema ==="
timeout 60 npx prisma db push || echo "Warning: db push failed, continuing"

echo "=== Seeding DB ==="
timeout 60 npx tsx prisma/seed.pg.ts || echo "Warning: seed failed (may already have data)"

echo "=== Starting Nitro on port ${PORT:-3000} ==="
exec node .output/server/index.mjs
