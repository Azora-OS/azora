#!/usr/bin/env bash
set -euo pipefail

# Purge sensitive files and tokens from repository history using git-filter-repo.
# WARNING: This rewrites repository history; coordinate with your team and backups.
# Usage (recommended):
# 1. Ensure you have a fresh clone and you have admin permissions on the remote
# 2. Run this script with your remote URL: ./scripts/purge-git-history.sh https://github.com/ORG/REPO.git

REPO_URL=${1:-}
if [[ -z "$REPO_URL" ]]; then
  echo "Usage: $0 <remote-repo-url>"
  exit 1
fi

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "git-filter-repo not found. Install it with 'pip install git-filter-repo'" >&2
  exit 1
fi

WORKDIR=$(mktemp -d)
echo "Cloning mirror into $WORKDIR"
git clone --mirror "$REPO_URL" "$WORKDIR/repo.git"
cd "$WORKDIR/repo.git"

echo "Creating backups (tags/branches preserved)"
# Backups already created by cloning mirror; we will still save a copy
mkdir -p /tmp/azora-git-repo-backups
cp -r "$WORKDIR/repo.git" /tmp/azora-git-repo-backups/repo.git-$(date +%s)

echo "Removing known sensitive files from history: .env, .env.*"
git filter-repo --invert-paths --paths .env
git filter-repo --invert-paths --paths .env.test
git filter-repo --invert-paths --paths .env.production

echo "Replacing sensitive patterns..."
git filter-repo --replace-text ../SECURITY/PATTERNS_TO_REDACT.txt || true

echo "Cleaning up refs and garbage collection"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "Pushing the cleaned history (FORCE) to the remote - proceed only if you have coordinated && backed up"
read -p "Proceed with force pushing to remote? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborting push. PRUNE COMPLETE locally at $WORKDIR/repo.git"; exit 1
fi

# Force-push branches and tags
git push --force --all
git push --force --tags

echo "Purge complete. Inform all contributors to re-clone the repository to avoid confusion."
echo "Backup of original mirror: /tmp/azora-git-repo-backups"

