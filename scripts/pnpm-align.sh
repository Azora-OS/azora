#!/usr/bin/env bash
set -euo pipefail

# pnpm-align.sh
# Usage: scripts/pnpm-align.sh [--delete-lockfiles] [--install]
# - --delete-lockfiles: list or delete package-lock.json across active folders (apps, packages, services) but NOT archvies
# - --install: runs `pnpm install` after alignment.

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
ACTIVE_DIRS=("apps" "packages" "services")
DELETE_LOCKFILES=0
DO_INSTALL=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --delete-lockfiles) DELETE_LOCKFILES=1; shift ;;
    --install) DO_INSTALL=1; shift ;;
    -h|--help) echo "Usage: $0 [--delete-lockfiles] [--install]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

echo "Running pnpm alignment script..."
echo "Root: $ROOT_DIR"

declare -a lockfiles

for d in "${ACTIVE_DIRS[@]}"; do
  if [[ -d "$ROOT_DIR/$d" ]]; then
    while IFS= read -r -d $'\0' file; do
      lockfiles+=("$file")
    done < <(find "$ROOT_DIR/$d" -name 'package-lock.json' -not -path '*/.archive/*' -print0)
  fi
done

if [[ ${#lockfiles[@]} -eq 0 ]]; then
  echo "No active package-lock.json files found in active directories.";
else
  echo "Found package-lock.json files:";
  for f in "${lockfiles[@]}"; do
    echo " - $f"
  done
  if [[ $DELETE_LOCKFILES -eq 1 ]]; then
    echo "Deleting package-lock.json files..."
    for f in "${lockfiles[@]}"; do
      rm -f "$f" && echo "Deleted $f"
    done
  else
    echo "Pass --delete-lockfiles to delete these files if desired.";
  fi
fi

if [[ $DO_INSTALL -eq 1 ]]; then
  echo "Ensuring pnpm installation via corepack..."
  if command -v corepack >/dev/null 2>&1; then
    corepack enable || true
  fi
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm not found; attempting to enable via corepack or recommend to install pnpm. Exiting.";
    exit 1
  fi
  echo "Running pnpm install in root..."
  (cd "$ROOT_DIR" && pnpm install --frozen-lockfile=false)
fi

echo "pnpm alignment script finished. If you deleted lockfiles, commit the changes before running pnpm install.";
