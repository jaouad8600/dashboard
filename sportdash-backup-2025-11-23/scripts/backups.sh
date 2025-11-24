#!/usr/bin/env bash
set -euo pipefail

DATA_DIR="data"
BACKUP_GLOB="${DATA_DIR}/app-data.backup-*.json"
MAIN_JSON="${DATA_DIR}/app-data.json"

usage() {
  cat <<'USG'
Gebruik: ./scripts/backups.sh <commando> [args]

Commando's:
  list                    - Toon alle backups (nieuwste eerst)
  latest                  - Toon pad van de nieuwste backup
  show [index]            - Print volledige JSON van backup (default index=1 is nieuwste)
  groups [index]          - Toon groepen + kleur + #notities uit backup
  counts [index]          - Tel groepen/indicaties/mutaties/overdrachten/planning
  diff [i1] [i2]          - Tekstuele diff tussen twee backups (standaard 1 vs 2)
  open [index]            - Bekijk backup in "less"
  restore [index]         - (LET OP) Zet backup terug naar data/app-data.json (maakt eerst een backup)

Voorbeelden:
  ./scripts/backups.sh list
  ./scripts/backups.sh show 1
  ./scripts/backups.sh groups 1
  ./scripts/backups.sh counts 1
  ./scripts/backups.sh diff 1 2
  ./scripts/backups.sh open 1
  ./scripts/backups.sh restore 1   # OVERSCHRIJFT data/app-data.json
USG
}

ensure_backups_exist() {
  shopt -s nullglob
  local arr=($BACKUP_GLOB)
  shopt -u nullglob
  if [ ${#arr[@]} -eq 0 ]; then
    echo "⚠️  Geen backups gevonden in ${DATA_DIR}/"
    exit 0
  fi
}

get_by_index() {
  local idx="${1:-1}"
  local file
  file="$(ls -1t ${BACKUP_GLOB} 2>/dev/null | sed -n "${idx}p" || true)"
  if [ -z "${file}" ]; then
    echo "❌ Geen backup op index ${idx}."
    exit 1
  fi
  echo "${file}"
}

cmd="${1:-help}"

case "$cmd" in
  list)
    ensure_backups_exist
    echo "📦 Backups (nieuwste eerst):"
    ls -1t ${BACKUP_GLOB} 2>/dev/null | nl -w2 -s'. '
    ;;
  latest)
    ensure_backups_exist
    ls -1t ${BACKUP_GLOB} 2>/dev/null | head -n1
    ;;
  show)
    ensure_backups_exist
    file="$(get_by_index "${2:-1}")"
    BACKUP_FILE="$file" node -e '
      const fs=require("fs");
      const p=process.env.BACKUP_FILE;
      const j=JSON.parse(fs.readFileSync(p,"utf8"));
      console.log(JSON.stringify(j,null,2));
    '
    ;;
  groups)
    ensure_backups_exist
    file="$(get_by_index "${2:-1}")"
    BACKUP_FILE="$file" node -e '
      const fs=require("fs");
      const p=process.env.BACKUP_FILE;
      const j=JSON.parse(fs.readFileSync(p,"utf8"));
      const list=((j.groepen&&j.groepen.list)||[]);
      console.log(`👥 Groepen (${list.length}) uit: ${p}\n`);
      for (const g of list) {
        const kleur = g.kleur || "ONBEKEND";
        const notes = Array.isArray(g.notities)? g.notities.length : 0;
        console.log(`- ${g.naam} [${kleur}] ${notes? "(" + notes + " notities)" : ""}`);
      }
    '
    ;;
  counts)
    ensure_backups_exist
    file="$(get_by_index "${2:-1}")"
    BACKUP_FILE="$file" node -e '
      const fs=require("fs");
      const p=process.env.BACKUP_FILE;
      const j=JSON.parse(fs.readFileSync(p,"utf8"));
      const groepen=(j.groepen&&Array.isArray(j.groepen.list)?j.groepen.list:[]);
      const indicaties=Array.isArray(j.indicaties)?j.indicaties:[];
      const mutaties=Array.isArray(j.mutaties)?j.mutaties:[];
      const overdrachten=Array.isArray(j.overdrachten)?j.overdrachten:[];
      const planning=(j.planning&&Array.isArray(j.planning.items)?j.planning.items:[]);
      console.log(`📊 Tellingen uit: ${p}\n`+
        `- Groepen:        ${groepen.length}\n`+
        `- Indicaties:     ${indicaties.length}\n`+
        `- Mutaties:       ${mutaties.length}\n`+
        `- Overdrachten:   ${overdrachten.length}\n`+
        `- Planning items: ${planning.length}`);
    '
    ;;
  diff)
    ensure_backups_exist
    a="$(get_by_index "${2:-1}")"
    b="$(get_by_index "${3:-2}")"
    echo "🔍 Diff (nieuwste index 1):"
    echo "A: $a"
    echo "B: $b"
    diff -u "$b" "$a" || true
    ;;
  open)
    ensure_backups_exist
    file="$(get_by_index "${2:-1}")"
    less "$file"
    ;;
  restore)
    ensure_backups_exist
    file="$(get_by_index "${2:-1}")"
    ts=$(date +%Y%m%d-%H%M%S)
    if [ -f "$MAIN_JSON" ]; then
      cp "$MAIN_JSON" "${MAIN_JSON}.backup-before-restore-${ts}.json"
      echo "🛟 Huidige data geback-upt naar: ${MAIN_JSON}.backup-before-restore-${ts}.json"
    fi
    cp "$file" "$MAIN_JSON"
    echo "✅ Hersteld: $file  ->  $MAIN_JSON"
    ;;
  help|*)
    usage
    ;;
esac
