#!/bin/bash
# Generate workflow metrics report for daily digest
# Usage: ./generate-metrics-report.sh [metrics-file]

set -e

METRICS_FILE="${1:-.github/metrics/workflow-metrics-$(date +%Y-%m-%d).json}"
REPORT_FILE=".github/metrics/METRICS-REPORT-$(date +%Y-%m-%d).md"

if [ ! -f "$METRICS_FILE" ]; then
  echo "❌ Metrics file not found: $METRICS_FILE"
  exit 1
fi

echo "Generating metrics report from $METRICS_FILE..."

# Extract data from metrics
TIMESTAMP=$(jq -r '.timestamp' "$METRICS_FILE")
REPO=$(jq -r '.repository' "$METRICS_FILE")

# Calculate overall statistics
TOTAL_WORKFLOWS=$(jq '.workflows | length' "$METRICS_FILE")
TOTAL_RUNS=$(jq '[.workflows[].total_runs] | add' "$METRICS_FILE")
TOTAL_SUCCESSFUL=$(jq '[.workflows[].successful] | add' "$METRICS_FILE")
TOTAL_FAILED=$(jq '[.workflows[].failed] | add' "$METRICS_FILE")
OVERALL_SUCCESS_RATE=$(echo "scale=2; $TOTAL_SUCCESSFUL * 100 / $TOTAL_RUNS" | bc)
AVG_WORKFLOW_DURATION=$(jq '[.workflows[].avg_duration_minutes] | add / length' "$METRICS_FILE")

# Generate report
cat > "$REPORT_FILE" << EOF
# Workflow Metrics Report

**Generated:** $TIMESTAMP  
**Repository:** $REPO

---

## Summary

| Metric | Value |
|--------|-------|
| Total Workflows | $TOTAL_WORKFLOWS |
| Total Runs (Last 50 per workflow) | $TOTAL_RUNS |
| Successful Runs | $TOTAL_SUCCESSFUL |
| Failed Runs | $TOTAL_FAILED |
| Overall Success Rate | $OVERALL_SUCCESS_RATE% |
| Average Workflow Duration | ${AVG_WORKFLOW_DURATION}min |

---

## Workflow Details

EOF

# Add workflow details table
cat >> "$REPORT_FILE" << 'EOF'
| Workflow | Runs | Success | Failed | Success Rate | Avg Duration | Latest Status |
|----------|------|---------|--------|--------------|--------------|---------------|
EOF

jq -r '.workflows[] | "| \(.name) | \(.total_runs) | \(.successful) | \(.failed) | \(.success_rate)% | \(.avg_duration_minutes)min | \(.latest_status) |"' "$METRICS_FILE" >> "$REPORT_FILE"

# Add performance analysis
cat >> "$REPORT_FILE" << 'EOF'

---

## Performance Analysis

### Fastest Workflows
EOF

jq -r '.workflows | sort_by(.avg_duration_minutes) | .[0:3] | .[] | "- **\(.name)**: \(.avg_duration_minutes)min average"' "$METRICS_FILE" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOF'

### Slowest Workflows
EOF

jq -r '.workflows | sort_by(.avg_duration_minutes) | reverse | .[0:3] | .[] | "- **\(.name)**: \(.avg_duration_minutes)min average"' "$METRICS_FILE" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOF'

### Most Reliable Workflows
EOF

jq -r '.workflows | sort_by(.success_rate) | reverse | .[0:3] | .[] | "- **\(.name)**: \(.success_rate)% success rate"' "$METRICS_FILE" >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << 'EOF'

### Least Reliable Workflows
EOF

jq -r '.workflows | sort_by(.success_rate) | .[0:3] | .[] | "- **\(.name)**: \(.success_rate)% success rate"' "$METRICS_FILE" >> "$REPORT_FILE"

# Add recommendations
cat >> "$REPORT_FILE" << 'EOF'

---

## Recommendations

EOF

# Check for workflows with low success rates
LOW_SUCCESS=$(jq '.workflows[] | select(.success_rate < 90) | .name' "$METRICS_FILE" | wc -l)
if [ "$LOW_SUCCESS" -gt 0 ]; then
  cat >> "$REPORT_FILE" << EOF
### ⚠️ Workflows with Low Success Rates (< 90%)

EOF
  jq -r '.workflows[] | select(.success_rate < 90) | "- **\(.name)**: \(.success_rate)% - Review failures and address root causes"' "$METRICS_FILE" >> "$REPORT_FILE"
fi

# Check for slow workflows
SLOW_WORKFLOWS=$(jq '.workflows[] | select(.avg_duration_minutes > 15) | .name' "$METRICS_FILE" | wc -l)
if [ "$SLOW_WORKFLOWS" -gt 0 ]; then
  cat >> "$REPORT_FILE" << EOF

### 🐢 Slow Workflows (> 15 minutes)

EOF
  jq -r '.workflows[] | select(.avg_duration_minutes > 15) | "- **\(.name)**: \(.avg_duration_minutes)min - Consider optimization (caching, parallelization)"' "$METRICS_FILE" >> "$REPORT_FILE"
fi

# Add footer
cat >> "$REPORT_FILE" << 'EOF'

---

**Report Generated:** $(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)

For detailed workflow information, visit: https://github.com/azora/azora-os/actions
EOF

echo "✅ Report generated: $REPORT_FILE"
echo ""
echo "Report preview:"
head -30 "$REPORT_FILE"
