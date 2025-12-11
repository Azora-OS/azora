#!/usr/bin/env bash
set -euo pipefail

# This script lists candidate workflow files in .github/workflows that contain 'v0' in their name
# and prints suggested rename commands. It does not execute renaming automatically.
ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
WORKFLOWS_DIR="$ROOT_DIR/.github/workflows"
if [[ ! -d "$WORKFLOWS_DIR" ]]; then
  echo "No workflows found at $WORKFLOWS_DIR"; exit 0
fi

echo "Searching for workflows with 'v0' in their filename..."
shopt -s nullglob
found=0
for f in "$WORKFLOWS_DIR"/*v0*.*; do
  found=1
  basename=$(basename "$f")
  suggested=$(echo "$basename" | sed -E 's/v0//g; s/--/-/g; s/-{2,}/-/g; s/_/-/g')
  suggested=${suggested:-"workflow-renamed.yml"}
  echo 
  echo "Candidate: $f"
  echo "Suggested rename: $WORKFLOWS_DIR/$suggested"
  echo "Suggestion command: git mv '$f' '$WORKFLOWS_DIR/$suggested'"
done
if [[ $found -eq 0 ]]; then
  echo "No candidate workflows found with 'v0' in filename."
fi
