#!/usr/bin/env bash
set -euo pipefail

msg="${1:-chore: run npm scripts & commit}"
mode="${2:-normal}" # --verify-only om alleen te valideren

has_script () {
  node -e "try{const s=require('./package.json').scripts||{}; process.exit(s['$1']?0:1)}catch(e){process.exit(1)}"
}

run_if () {
  local s="$1"
  if has_script "$s"; then
    echo "→ npm run -s $s"
    npm run -s "$s"
  else
    echo "↷ overslaan (geen script): $s"
  fi
}

echo "▶ npm scripts uitvoeren (indien aanwezig)"
run_if format
run_if lint
run_if typecheck
run_if test
# build is verplicht; faalt = geen commit
echo "→ npm run -s build (verplicht)"
npm run -s build

if [ "$mode" = "--verify-only" ]; then
  echo "✔ Verify-only geslaagd (geen commit uitgevoerd)."
  exit 0
fi

echo "▶ Git commit uitvoeren"
git add -A
if ! git diff --cached --quiet; then
  git commit -m "$msg"
  # push alleen als upstream bestaat
  if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    echo "→ git push"
    git push
  else
    echo "↷ geen upstream geconfigureerd — push overgeslagen"
  fi
else
  echo "↷ niets te committen (geen veranderingen in index)"
fi

echo "✔ Klaar."
