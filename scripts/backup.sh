#!/usr/bin/env bash
set -e
STAMP=$(date +%F-%H%M)

# Code snapshot
tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=.turbo \
    -czf backups/sportdash-$STAMP.tar.gz .

# .env veilig meenemen
[ -f .env ] && cp .env backups/.env-$STAMP

# Prisma DB (SQLite voorbeeld)
[ -f prisma/dev.db ] && cp prisma/dev.db backups/dev-$STAMP.db

# Postgres voorbeeld (uncomment als nodig)
# [ -n "$DATABASE_URL" ] && pg_dump -Fc "$DATABASE_URL" -f backups/pg-$STAMP.dump

# Git bundle snapshot
git rev-parse --git-dir >/dev/null 2>&1 && git bundle create backups/sportdash-$STAMP.bundle --all || true

echo "Klaar: backups/*-$STAMP*"
