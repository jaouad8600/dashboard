#!/usr/bin/env bash
set -euo pipefail

# Config
KEEP=${KEEP:-12}          # hoeveel backups bewaren
OUTDIR=${OUTDIR:-backups} # map voor backups
DB=data/app-data.json     # je "DB" bestand

mkdir -p "$OUTDIR"

ts=$(date +%Y%m%d-%H%M%S)
hash=$(git rev-parse --short HEAD 2>/dev/null || echo "nogit")
dirty=""
git diff --quiet || dirty="-dirty"

name="sportdash-$ts-$hash$dirty"
tarball="$OUTDIR/$name.tgz"
dbcopy="$OUTDIR/db-$ts.json"

echo "📦 Maak backup: $tarball"

# DB snapshot (handig om snel te bekijken)
if [ -f "$DB" ]; then
  cp "$DB" "$dbcopy"
  echo "↳ DB snapshot: $dbcopy"
fi

# Tarball maken (zonder zware/volatiele mappen)
tar -czf "$tarball" \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./.git' \
  --exclude='./backups' \
  --exclude='./.cache' \
  data \
  src \
  prisma \
  public \
  scripts \
  package.json \
  package-lock.json \
  pnpm-lock.yaml \
  bun.lockb \
  next.config.mjs \
  tailwind.config.ts \
  tsconfig.json \
  postcss.config.mjs \
  README.md \
  .env 2>/dev/null || true

# Verifiëren
tar -tzf "$tarball" >/dev/null
echo "✅ Backup klaar: $tarball"

# Optionele checksum
( command -v shasum >/dev/null && shasum -a 256 "$tarball" ) || ( command -v sha256sum >/dev/null && sha256sum "$tarball" ) || true

# Oude backups opruimen
count=$(ls -1t "$OUTDIR"/*.tgz 2>/dev/null | wc -l | tr -d ' ')
if [ "$count" -gt "$KEEP" ]; then
  echo "🧹 Verwijder oude backups (bewaar $KEEP):"
  ls -1t "$OUTDIR"/*.tgz | tail -n +"$((KEEP+1))" | while read -r f; do
    echo "  - $f"; rm -f "$f"
  done
fi

# Optioneel: automatisch committen van je werkdir (zet COMMIT=1)
if [ "${COMMIT:-0}" = "1" ]; then
  git add -A
  git commit -m "backup: snapshot $ts" || true
  echo "📝 Git commit gedaan."
fi

# Tip: herstellen (restore) uit een backup:
#   tar -xzf backups/<bestand>.tgz -C . --strip-components=1
