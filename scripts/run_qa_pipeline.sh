#!/usr/bin/env bash

# run_qa_pipeline.sh - Executes the Azora QA checklist
# ---------------------------------------------------
# 1. Unit tests for all services
# 2. Integration tests (Finance ↔ Master ↔ Cloud)
# 3. ChaosMonkey simulations (7 failure types) and PhoenixServer recovery validation
# 4. ResilienceAdapter offline‑first validation (bandwidth drop simulation)
# 5. Collect results into qa_report.json

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_FILE="$ROOT_DIR/qa_report.json"

# Helper to run a command and capture success/failure
run_step() {
  local description="$1"
  local cmd="$2"
  echo "[STEP] $description"
  if eval "$cmd"; then
    echo "[PASS] $description"
    echo "{\"step\": \"$description\", \"status\": \"pass\"}," >> "$REPORT_FILE.tmp"
  else
    echo "[FAIL] $description"
    echo "{\"step\": \"$description\", \"status\": \"fail\"}," >> "$REPORT_FILE.tmp"
  fi
}

# Initialize report
echo "[" > "$REPORT_FILE.tmp"

# 1. Unit tests
for service in "$ROOT_DIR"/services/*; do
  if [ -d "$service" ]; then
    name=$(basename "$service")
    run_step "Unit tests for $name" "cd \"$service\" && npm test --silent"
  fi
done

# 2. Integration tests (placeholder command)
run_step "Integration tests (Finance ↔ Master ↔ Cloud)" "npm run test:integration --silent"

# 3. ChaosMonkey simulations (placeholder)
run_step "ChaosMonkey simulation" "npm run chaos:test --silent"

# 4. ResilienceAdapter offline‑first validation (placeholder)
run_step "ResilienceAdapter offline‑first test" "npm run offline:test --silent"

# Finish JSON array (remove trailing comma)
sed -i '$ s/,$//' "$REPORT_FILE.tmp"
echo "]" >> "$REPORT_FILE.tmp"
mv "$REPORT_FILE.tmp" "$REPORT_FILE"

echo "QA pipeline completed. Report saved to $REPORT_FILE"
