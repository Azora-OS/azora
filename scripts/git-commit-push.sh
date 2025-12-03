#!/usr/bin/env bash
set -euo pipefail

# git-commit-push.sh
# Helper script to safely commit and push changes.
# Usage: ./scripts/git-commit-push.sh "commit message" [branch-name]

MSG="${1:-"
Update"}"
BRANCH_NAME="${2:-security/cleanup-secrets-$(date +%Y%m%d%H%M%S)}"

function ensure_not_main() {
  local branch
  branch=$(git rev-parse --abbrev-ref HEAD)
  if [[ "$branch" == "main" || "$branch" == "master" ]]; then
    echo "⚠️  You're currently on branch '$branch'. Please create a feature branch to push to origin."
    echo "Try: git checkout -b $BRANCH_NAME"
    exit 1
  fi
}

function ensure_remote_origin() {
  if ! git remote get-url origin >/dev/null 2>&1; then
    echo "No 'origin' remote set — please set it first: git remote add origin <repo-url>"
    exit 1
  fi
}

function run_prechecks() {
  echo "🔧 Running optional prechecks..."
  if command -v pnpm >/dev/null 2>&1; then
    echo "🔁 Installing dependencies (pnpm install)"
    pnpm install --ignore-scripts --no-frozen-lockfile || true
  else
    npm ci || true
  fi

  # Ensure hooks installed
  if command -v npx >/dev/null 2>&1; then
    npx husky install || true
  fi

  # run secret scan if script exists
  if [[ -f scripts/prevent-secrets.js ]]; then
    echo "🔐 Running local secret scan..."
    node ./scripts/prevent-secrets.js || { echo "Secrets detected — aborting commit."; exit 1; }
  fi
}

ensure_remote_origin
ensure_not_main
run_prechecks

echo "Staging all files..."
git add -A

echo "Committing: $MSG"
git commit -m "$MSG" || { echo "No changes to commit. Exiting."; exit 0; }

# Determine branch to push
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  echo "Creating branch: $BRANCH_NAME"
  git checkout -b "$BRANCH_NAME"
fi

echo "Pushing to origin $BRANCH_NAME (or current branch if not changed)"
git push -u origin HEAD

echo "✅ Changes pushed. Create a PR on GitHub to merge into main if needed."

