#!/usr/bin/env bash
set -euo pipefail

# Find occurrences of 'v0' across active repository paths (apps, packages, services, .github)
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
ACTIVE_DIRS=("apps" "packages" "services" ".github")
OUT_CSV="$ROOT_DIR/tmp/v0-active-$(date +%s).csv"
mkdir -p "$(dirname "$OUT_CSV")"
echo "file,line,excerpt" > "$OUT_CSV"

for d in "${ACTIVE_DIRS[@]}"; do
  if [[ -d "$ROOT_DIR/$d" ]]; then
    grep -RIn --exclude-dir='.archive' --exclude='*node_modules*' --line-number --binary-files=without-match -E "\bv0\b|\bv0\.\d|deploy-v0-ui" "$ROOT_DIR/$d" || true
  fi
done | while IFS= read -r line; do
  # sanitize commas in excerpt
  file=$(echo "$line" | cut -d: -f1)
  lnum=$(echo "$line" | cut -d: -f2)
  excerpt=$(echo "$line" | cut -d: -f3- | sed 's/,/ /g')
  echo "\"$file\",$lnum,\"$excerpt\"" >> "$OUT_CSV"
done

if [[ -s "$OUT_CSV" ]]; then
  echo "Wrote v0 active occurrences to $OUT_CSV"
  echo "Preview:"
  head -n 20 "$OUT_CSV"
else
  echo "No occurrences in active directories found."
fi
