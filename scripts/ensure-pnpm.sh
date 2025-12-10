#!/usr/bin/env bash
# Exit on error
set -euo pipefail

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Attempting to enable via corepack or install pnpm globally."
  if command -v corepack >/dev/null 2>&1; then
    echo "Enabling pnpm via corepack..."
    corepack enable pnpm || true
  fi

  if ! command -v pnpm >/dev/null 2>&1; then
    echo "Please install pnpm (e.g. 'npm install -g pnpm@9') and re-run this script."
    exit 1
  fi
fi

PNPM_VERSION=$(pnpm --version)
echo "Using pnpm version: $PNPM_VERSION"

echo "Running pnpm install at repository root to sync workspace lockfile"
pnpm install

echo "Done: pnpm alignment check completed."
