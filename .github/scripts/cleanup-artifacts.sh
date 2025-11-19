#!/bin/bash

# Artifact Cleanup Script
# This script manages GitHub Actions artifact cleanup based on retention policies
# Usage: ./cleanup-artifacts.sh [--dry-run] [--retention-days N]

set -e

# Configuration
RETENTION_DAYS=${RETENTION_DAYS:-30}
DRY_RUN=false
VERBOSE=false
REPO="${GITHUB_REPOSITORY:-azora/azora-os}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --retention-days)
      RETENTION_DAYS="$2"
      shift 2
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      print_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      print_help
      exit 1
      ;;
  esac
done

# Print help message
print_help() {
  cat << EOF
Artifact Cleanup Script

Usage: ./cleanup-artifacts.sh [OPTIONS]

Options:
  --dry-run              Show what would be deleted without actually deleting
  --retention-days N     Retention period in days (default: 30)
  --verbose              Enable verbose output
  --help                 Show this help message

Examples:
  # Show artifacts that would be deleted (30 days old)
  ./cleanup-artifacts.sh --dry-run

  # Delete artifacts older than 90 days
  ./cleanup-artifacts.sh --retention-days 90

  # Verbose dry-run for 60 days
  ./cleanup-artifacts.sh --dry-run --retention-days 60 --verbose

Environment Variables:
  GITHUB_TOKEN           GitHub API token (required)
  GITHUB_REPOSITORY      Repository in format owner/repo (default: azora/azora-os)
  RETENTION_DAYS         Default retention period in days (default: 30)

EOF
}

# Verify GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}ERROR: GITHUB_TOKEN environment variable not set${NC}"
  echo "Please set GITHUB_TOKEN to your GitHub personal access token"
  exit 1
fi

# Verify gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo -e "${RED}ERROR: GitHub CLI (gh) is not installed${NC}"
  echo "Please install it from https://cli.github.com/"
  exit 1
fi

# Calculate cutoff date
CUTOFF_TIMESTAMP=$(date -d "$RETENTION_DAYS days ago" +%s 2>/dev/null || date -v-${RETENTION_DAYS}d +%s)
CUTOFF_DATE=$(date -d @$CUTOFF_TIMESTAMP +%Y-%m-%d 2>/dev/null || date -r $CUTOFF_TIMESTAMP +%Y-%m-%d)

echo -e "${BLUE}=== GitHub Actions Artifact Cleanup ===${NC}"
echo "Repository: $REPO"
echo "Retention Period: $RETENTION_DAYS days"
echo "Cutoff Date: $CUTOFF_DATE"
echo "Dry Run: $DRY_RUN"
echo ""

# Get list of artifacts
echo -e "${BLUE}Fetching artifacts...${NC}"

ARTIFACTS=$(gh api repos/$REPO/actions/artifacts \
  --paginate \
  --jq '.artifacts[] | select(.created_at < "'$CUTOFF_DATE'T00:00:00Z") | {id: .id, name: .name, created_at: .created_at, size_in_bytes: .size_in_bytes}' \
  2>/dev/null || echo "")

if [ -z "$ARTIFACTS" ]; then
  echo -e "${GREEN}No artifacts found older than $RETENTION_DAYS days${NC}"
  exit 0
fi

# Process artifacts
TOTAL_SIZE=0
ARTIFACT_COUNT=0
DELETED_COUNT=0

while IFS= read -r artifact; do
  if [ -z "$artifact" ]; then
    continue
  fi

  ARTIFACT_ID=$(echo "$artifact" | jq -r '.id')
  ARTIFACT_NAME=$(echo "$artifact" | jq -r '.name')
  ARTIFACT_DATE=$(echo "$artifact" | jq -r '.created_at')
  ARTIFACT_SIZE=$(echo "$artifact" | jq -r '.size_in_bytes')
  ARTIFACT_SIZE_MB=$((ARTIFACT_SIZE / 1024 / 1024))

  ARTIFACT_COUNT=$((ARTIFACT_COUNT + 1))
  TOTAL_SIZE=$((TOTAL_SIZE + ARTIFACT_SIZE))

  if [ "$VERBOSE" = true ]; then
    echo -e "${YELLOW}Artifact:${NC} $ARTIFACT_NAME"
    echo "  ID: $ARTIFACT_ID"
    echo "  Created: $ARTIFACT_DATE"
    echo "  Size: ${ARTIFACT_SIZE_MB}MB"
  else
    echo -e "${YELLOW}$ARTIFACT_NAME${NC} (${ARTIFACT_SIZE_MB}MB, created: $ARTIFACT_DATE)"
  fi

  if [ "$DRY_RUN" = false ]; then
    echo -n "  Deleting... "
    if gh api repos/$REPO/actions/artifacts/$ARTIFACT_ID -X DELETE > /dev/null 2>&1; then
      echo -e "${GREEN}✓${NC}"
      DELETED_COUNT=$((DELETED_COUNT + 1))
    else
      echo -e "${RED}✗ Failed${NC}"
    fi
  else
    echo "  [DRY RUN] Would delete"
  fi

done <<< "$(echo "$ARTIFACTS" | jq -s '.[]')"

# Print summary
echo ""
echo -e "${BLUE}=== Summary ===${NC}"
echo "Total artifacts found: $ARTIFACT_COUNT"
if [ "$DRY_RUN" = false ]; then
  echo "Artifacts deleted: $DELETED_COUNT"
else
  echo "Artifacts to delete: $ARTIFACT_COUNT"
fi

TOTAL_SIZE_MB=$((TOTAL_SIZE / 1024 / 1024))
TOTAL_SIZE_GB=$(echo "scale=2; $TOTAL_SIZE_MB / 1024" | bc)

echo "Total size: ${TOTAL_SIZE_MB}MB (${TOTAL_SIZE_GB}GB)"

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}This was a dry run. No artifacts were deleted.${NC}"
  echo "Run without --dry-run to actually delete artifacts."
else
  echo -e "${GREEN}Cleanup completed successfully!${NC}"
fi

exit 0
