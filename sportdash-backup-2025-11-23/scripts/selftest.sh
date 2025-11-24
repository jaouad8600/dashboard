#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== Kill oude servers =="
pkill -f "next start" >/dev/null 2>&1 || true
pkill -f "next dev" >/dev/null 2>&1 || true

echo "== Versies =="
node -v || true
npm -v || true
node -e "try{const p=require('./package.json');console.log('next:',p.dependencies.next||p.devDependencies?.next,'react:',p.dependencies.react)}catch(e){console.log('package.json?')}" || true

echo "== Typecheck =="
if [ -f tsconfig.json ]; then
  npx tsc --noEmit || { echo 'Typecheck faalde'; exit 1; }
else
  echo "tsconfig.json ontbreekt, sla typecheck over"
fi

echo "== Build =="
rm -rf .next
npm run build

echo "== Start =="
npm run start -- -p 3000 >/tmp/next-selftest.log 2>&1 &
PID=$!
trap 'kill -TERM $PID >/dev/null 2>&1 || true' EXIT

echo "== Wachten op /health =="
for i in {1..30}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || true)
  if [ "$code" = "200" ]; then echo "Health 200"; break; fi
  sleep 1
done
[ "$code" = "200" ] || { echo "Health faalt"; tail -n 80 /tmp/next-selftest.log || true; exit 1; }

echo "== Routes checken =="
for p in / /admin /diagnose /back-up /sportmutaties /indicatie-sport /overdrachten; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$p" || true)
  echo "$p -> $c"
done

echo "== Bestand checks =="
test -s src/components/ChartBars.tsx && echo "ChartBars.tsx aanwezig" || { echo "ChartBars.tsx mist"; exit 1; }

echo "== Klaar =="
exit 0
