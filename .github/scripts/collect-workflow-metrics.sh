#!/bin/bash
# Collect workflow metrics for monitoring and reporting
# Usage: ./collect-workflow-metrics.sh [output-file]

set -e

OUTPUT_FILE="${1:-.github/metrics/workflow-metrics-$(date +%Y-%m-%d).json}"
REPO="${GITHUB_REPOSITORY:-azora/azora-os}"
METRICS_DIR=$(dirname "$OUTPUT_FILE")

# Create metrics directory if it doesn't exist
mkdir -p "$METRICS_DIR"

echo "Collecting workflow metrics for $REPO..."
echo "Output: $OUTPUT_FILE"

# Initialize metrics JSON
cat > "$OUTPUT_FILE" << 'EOF'
{
  "timestamp": "TIMESTAMP_PLACEHOLDER",
  "repository": "REPO_PLACEHOLDER",
  "workflows": []
}
EOF

# Replace placeholders
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
sed -i "s|TIMESTAMP_PLACEHOLDER|$TIMESTAMP|g" "$OUTPUT_FILE"
sed -i "s|REPO_PLACEHOLDER|$REPO|g" "$OUTPUT_FILE"

# Get list of workflows
echo "Fetching workflow list..."
WORKFLOWS=$(gh workflow list --repo "$REPO" --json name,path | jq -r '.[] | .name')

# Collect metrics for each workflow
WORKFLOW_COUNT=0
for workflow in $WORKFLOWS; do
  echo "Processing workflow: $workflow"
  
  # Get recent runs (limit to 50 for performance)
  RUNS=$(gh run list --repo "$REPO" --workflow "$workflow" --limit 50 --json durationMinutes,conclusion,createdAt,status 2>/dev/null || echo "[]")
  
  if [ "$RUNS" = "[]" ]; then
    echo "  ⚠️  No runs found for $workflow"
    continue
  fi
  
  # Calculate metrics
  TOTAL_RUNS=$(echo "$RUNS" | jq 'length')
  SUCCESSFUL=$(echo "$RUNS" | jq '[.[] | select(.conclusion == "success")] | length')
  FAILED=$(echo "$RUNS" | jq '[.[] | select(.conclusion == "failure")] | length')
  SKIPPED=$(echo "$RUNS" | jq '[.[] | select(.conclusion == "skipped")] | length')
  
  # Calculate success rate
  if [ "$TOTAL_RUNS" -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=2; $SUCCESSFUL * 100 / $TOTAL_RUNS" | bc)
  else
    SUCCESS_RATE=0
  fi
  
  # Calculate average duration
  AVG_DURATION=$(echo "$RUNS" | jq '[.[].durationMinutes | select(. != null)] | if length > 0 then add / length else 0 end')
  
  # Get latest run info
  LATEST_RUN=$(echo "$RUNS" | jq '.[0]')
  LATEST_STATUS=$(echo "$LATEST_RUN" | jq -r '.conclusion // .status')
  LATEST_DURATION=$(echo "$LATEST_RUN" | jq '.durationMinutes')
  
  # Create workflow metrics object
  WORKFLOW_METRICS=$(cat <<WORKFLOW_JSON
{
  "name": "$workflow",
  "total_runs": $TOTAL_RUNS,
  "successful": $SUCCESSFUL,
  "failed": $FAILED,
  "skipped": $SKIPPED,
  "success_rate": $SUCCESS_RATE,
  "avg_duration_minutes": $AVG_DURATION,
  "latest_status": "$LATEST_STATUS",
  "latest_duration_minutes": $LATEST_DURATION
}
WORKFLOW_JSON
)
  
  # Append to metrics file
  TEMP_FILE=$(mktemp)
  jq ".workflows += [$WORKFLOW_METRICS]" "$OUTPUT_FILE" > "$TEMP_FILE"
  mv "$TEMP_FILE" "$OUTPUT_FILE"
  
  WORKFLOW_COUNT=$((WORKFLOW_COUNT + 1))
  echo "  ✓ Metrics collected: $TOTAL_RUNS runs, $SUCCESS_RATE% success rate, ${AVG_DURATION}min avg"
done

echo ""
echo "✅ Metrics collection complete"
echo "   Workflows processed: $WORKFLOW_COUNT"
echo "   Output file: $OUTPUT_FILE"
echo ""
echo "Metrics summary:"
jq '.workflows[] | "\(.name): \(.success_rate)% success, \(.avg_duration_minutes)min avg"' "$OUTPUT_FILE"
