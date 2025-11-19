# Workflow Performance Monitoring & Metrics Collection

## Overview

This guide explains how to monitor CI/CD workflow performance, collect metrics, and optimize execution time. Tracking workflow metrics helps identify bottlenecks and improve developer productivity.

---

## Table of Contents

1. [Key Metrics](#key-metrics)
2. [Monitoring Setup](#monitoring-setup)
3. [Metrics Collection](#metrics-collection)
4. [Performance Analysis](#performance-analysis)
5. [Optimization Strategies](#optimization-strategies)
6. [Dashboards & Reporting](#dashboards--reporting)

---

## Key Metrics

### Workflow Execution Metrics

| Metric | Description | Target | Importance |
|--------|-------------|--------|-----------|
| **Total Duration** | Time from start to finish | < 30 min | High |
| **Queue Time** | Time waiting to start | < 5 min | Medium |
| **Job Duration** | Time per job | < 15 min | High |
| **Step Duration** | Time per step | < 5 min | Medium |
| **Success Rate** | % of successful runs | > 95% | Critical |
| **Failure Rate** | % of failed runs | < 5% | Critical |
| **Retry Rate** | % of runs requiring retry | < 10% | Medium |

### Test Metrics

| Metric | Description | Target | Importance |
|--------|-------------|--------|-----------|
| **Test Count** | Number of tests | > 1000 | Medium |
| **Test Duration** | Time to run all tests | < 10 min | High |
| **Pass Rate** | % of passing tests | > 98% | Critical |
| **Flaky Tests** | Tests that fail intermittently | 0 | High |
| **Coverage** | Code coverage percentage | > 80% | High |
| **Coverage Trend** | Coverage change over time | Increasing | Medium |

### Deployment Metrics

| Metric | Description | Target | Importance |
|--------|-------------|--------|-----------|
| **Deployment Frequency** | Deployments per week | > 5 | High |
| **Lead Time** | Time from commit to production | < 1 hour | High |
| **Deployment Duration** | Time to deploy | < 15 min | High |
| **Rollback Rate** | % of deployments rolled back | < 5% | Critical |
| **MTTR** | Mean time to recovery | < 30 min | Critical |
| **Uptime** | Service availability | > 99.9% | Critical |

### Security Metrics

| Metric | Description | Target | Importance |
|--------|-------------|--------|-----------|
| **Vulnerability Count** | Known vulnerabilities | 0 critical | Critical |
| **Scan Duration** | Time to run security scan | < 5 min | Medium |
| **Secret Detection** | Secrets found in code | 0 | Critical |
| **Audit Pass Rate** | % of passing audits | 100% | Critical |

---

## Monitoring Setup

### GitHub Actions Built-in Metrics

**Access workflow metrics:**

1. Go to GitHub repository
2. Click "Actions" tab
3. Click specific workflow
4. View run history with durations

**Information available:**
- Total execution time
- Job breakdown
- Step-by-step timing
- Success/failure status
- Artifact storage

### GitHub API for Metrics

**Get workflow runs:**
```bash
# List recent runs
gh run list --limit 50

# Get specific run details
gh run view <run-id> --json status,conclusion,durationMinutes

# Get all runs for workflow
gh run list --workflow test.yml --limit 100
```

**Parse metrics:**
```bash
# Get average duration
gh run list --workflow test.yml --json durationMinutes | \
  jq '[.[].durationMinutes] | add / length'

# Get success rate
gh run list --workflow test.yml --json conclusion | \
  jq '[.[] | select(.conclusion == "success")] | length'
```

### Custom Metrics Collection

**Add to workflow:**
```yaml
- name: Collect metrics
  run: |
    cat > metrics.json << EOF
    {
      "workflow": "${{ github.workflow }}",
      "run_id": "${{ github.run_id }}",
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "branch": "${{ github.ref }}",
      "commit": "${{ github.sha }}",
      "status": "${{ job.status }}",
      "duration_seconds": $(($(date +%s) - $START_TIME))
    }
    EOF
    
    # Upload metrics
    gh run download ${{ github.run_id }} -n metrics
```

---

## Metrics Collection

### Automated Metrics Collection

**Create metrics collection script:**

```bash
#!/bin/bash
# scripts/collect-workflow-metrics.sh

REPO="azora/azora-os"
METRICS_FILE="workflow-metrics.json"
LIMIT=100

echo "Collecting workflow metrics..."

# Get all workflows
WORKFLOWS=$(gh workflow list --repo $REPO --json name,path | jq -r '.[] | .name')

for workflow in $WORKFLOWS; do
  echo "Processing: $workflow"
  
  # Get recent runs
  RUNS=$(gh run list --repo $REPO --workflow "$workflow" --limit $LIMIT --json durationMinutes,conclusion,createdAt)
  
  # Calculate metrics
  TOTAL_RUNS=$(echo $RUNS | jq 'length')
  SUCCESSFUL=$(echo $RUNS | jq '[.[] | select(.conclusion == "success")] | length')
  FAILED=$(echo $RUNS | jq '[.[] | select(.conclusion == "failure")] | length')
  AVG_DURATION=$(echo $RUNS | jq '[.[].durationMinutes] | add / length')
  
  # Store metrics
  cat >> $METRICS_FILE << EOF
{
  "workflow": "$workflow",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_runs": $TOTAL_RUNS,
  "successful": $SUCCESSFUL,
  "failed": $FAILED,
  "success_rate": $(echo "scale=2; $SUCCESSFUL * 100 / $TOTAL_RUNS" | bc),
  "avg_duration_minutes": $AVG_DURATION
}
EOF
done

echo "Metrics saved to $METRICS_FILE"
```

**Run collection:**
```bash
# Run manually
bash scripts/collect-workflow-metrics.sh

# Schedule with cron (daily at 2 AM)
0 2 * * * cd /path/to/repo && bash scripts/collect-workflow-metrics.sh
```

### Manual Metrics Collection

**Weekly metrics review:**

```bash
#!/bin/bash
# scripts/weekly-metrics-report.sh

echo "=== Weekly Workflow Metrics Report ==="
echo "Week of: $(date -u +%Y-%m-%d)"
echo ""

# Test workflow metrics
echo "## Test Suite"
gh run list --workflow test.yml --limit 50 --json durationMinutes,conclusion | \
  jq '{
    total: length,
    successful: [.[] | select(.conclusion == "success")] | length,
    failed: [.[] | select(.conclusion == "failure")] | length,
    avg_duration: ([.[].durationMinutes] | add / length)
  }'

# Security workflow metrics
echo ""
echo "## Security Scanning"
gh run list --workflow security.yml --limit 50 --json durationMinutes,conclusion | \
  jq '{
    total: length,
    successful: [.[] | select(.conclusion == "success")] | length,
    failed: [.[] | select(.conclusion == "failure")] | length,
    avg_duration: ([.[].durationMinutes] | add / length)
  }'

# Deployment metrics
echo ""
echo "## Deployments"
gh run list --workflow deploy-production.yml --limit 50 --json durationMinutes,conclusion | \
  jq '{
    total: length,
    successful: [.[] | select(.conclusion == "success")] | length,
    failed: [.[] | select(.conclusion == "failure")] | length,
    avg_duration: ([.[].durationMinutes] | add / length)
  }'
```

---

## Performance Analysis

### Identifying Bottlenecks

**Analyze job durations:**

```bash
# Get detailed job timing
gh run view <run-id> --json jobs | jq '.jobs[] | {name, durationMinutes}'

# Example output:
# {
#   "name": "unit-tests",
#   "durationMinutes": 8
# }
# {
#   "name": "integration-tests",
#   "durationMinutes": 12
# }
```

**Identify slowest jobs:**

```bash
# Get average duration per job across multiple runs
for run_id in $(gh run list --workflow test.yml --limit 10 --json databaseId | jq -r '.[] | .databaseId'); do
  gh run view $run_id --json jobs | jq '.jobs[] | {name, durationMinutes}'
done | jq -s 'group_by(.name) | map({name: .[0].name, avg_duration: (map(.durationMinutes) | add / length)})'
```

### Trend Analysis

**Track metrics over time:**

```bash
# Create trend file
cat > metrics-trend.csv << EOF
date,workflow,duration_minutes,success_rate
EOF

# Collect daily
for i in {1..30}; do
  DATE=$(date -u -d "-$i days" +%Y-%m-%d)
  # Collect metrics for date
  # Append to CSV
done

# Analyze trend
# Plot in spreadsheet or tool
```

### Comparison Analysis

**Compare workflows:**

```bash
# Compare test duration across Node versions
gh run view <run-id> --json jobs | jq '.jobs[] | select(.name | contains("unit-tests")) | {name, durationMinutes}'

# Compare staging vs production deployment time
echo "Staging deployments:"
gh run list --workflow deploy-staging.yml --limit 10 --json durationMinutes | jq '[.[].durationMinutes] | add / length'

echo "Production deployments:"
gh run list --workflow deploy-production.yml --limit 10 --json durationMinutes | jq '[.[].durationMinutes] | add / length'
```

---

## Optimization Strategies

### Caching Optimization

**Enable npm caching:**

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20.x
    cache: 'npm'  # Caches node_modules
```

**Expected improvement:** 30-50% faster dependency installation

**Verify caching:**
```bash
# Check cache hit in workflow logs
# Look for: "Cache hit for key: setup-node-..."
```

### Parallelization

**Run jobs in parallel:**

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

**Expected improvement:** 3x faster for 3 parallel jobs

**Limit parallelization:**
```yaml
strategy:
  max-parallel: 2  # Limit concurrent jobs
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

### Conditional Execution

**Skip unnecessary steps:**

```yaml
- name: Run E2E tests
  if: github.event_name == 'pull_request'
  run: npm run test:e2e
```

**Expected improvement:** 10-20% faster for non-PR runs

### Artifact Optimization

**Exclude unnecessary files:**

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: coverage
    path: coverage/
    exclude-patterns: |
      **/*.map
      **/node_modules/
```

**Expected improvement:** 50-70% faster artifact upload

### Build Optimization

**Optimize Docker builds:**

```dockerfile
# Use multi-stage builds
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
```

**Expected improvement:** 40-60% smaller image, faster deployment

---

## Dashboards & Reporting

### GitHub Actions Dashboard

**Built-in dashboard:**
1. Go to Actions tab
2. Click workflow
3. View run history
4. Click specific run for details

**Information available:**
- Execution timeline
- Job durations
- Step-by-step logs
- Artifact storage

### Custom Dashboard (GitHub Pages)

**Create metrics dashboard:**

```html
<!-- .github/pages/metrics.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Workflow Metrics Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>CI/CD Workflow Metrics</h1>
  
  <div id="duration-chart"></div>
  <div id="success-rate-chart"></div>
  <div id="test-coverage-chart"></div>
  
  <script>
    // Load metrics from JSON
    fetch('metrics.json')
      .then(r => r.json())
      .then(data => {
        // Create charts
        new Chart(document.getElementById('duration-chart'), {
          type: 'line',
          data: {
            labels: data.map(d => d.date),
            datasets: [{
              label: 'Workflow Duration (minutes)',
              data: data.map(d => d.duration),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          }
        });
      });
  </script>
</body>
</html>
```

### Weekly Metrics Report

**Generate report:**

```bash
#!/bin/bash
# scripts/generate-metrics-report.sh

cat > METRICS-REPORT.md << EOF
# Weekly Metrics Report
Generated: $(date -u +%Y-%m-%d)

## Test Suite
- Total runs: $(gh run list --workflow test.yml --limit 50 | wc -l)
- Success rate: XX%
- Average duration: XX minutes
- Trend: ↑ Improving

## Security Scanning
- Total runs: $(gh run list --workflow security.yml --limit 50 | wc -l)
- Success rate: XX%
- Average duration: XX minutes
- Vulnerabilities found: X

## Deployments
- Staging deployments: X
- Production deployments: X
- Rollback rate: X%
- Average deployment time: XX minutes

## Performance Trends
- Test duration: ↓ Decreasing (good)
- Deployment time: → Stable
- Success rate: ↑ Improving

## Recommendations
1. [Optimization opportunity]
2. [Optimization opportunity]
3. [Optimization opportunity]
EOF

# Commit and push
git add METRICS-REPORT.md
git commit -m "docs: weekly metrics report"
git push origin main
```

### Monitoring Alerts

**Set up alerts for performance degradation:**

```bash
# Check if workflow duration increased > 20%
CURRENT_AVG=$(gh run list --workflow test.yml --limit 10 --json durationMinutes | jq '[.[].durationMinutes] | add / length')
PREVIOUS_AVG=$(gh run list --workflow test.yml --limit 20 --json durationMinutes | jq '[.[20:] | .[].durationMinutes] | add / length')

INCREASE=$(echo "scale=2; ($CURRENT_AVG - $PREVIOUS_AVG) / $PREVIOUS_AVG * 100" | bc)

if (( $(echo "$INCREASE > 20" | bc -l) )); then
  echo "⚠️ Workflow duration increased by ${INCREASE}%"
  # Send alert
fi
```

---

## Performance Targets

### Workflow Duration Targets

| Workflow | Target | Current | Status |
|----------|--------|---------|--------|
| Test Suite | < 15 min | 12 min | ✅ |
| Linting | < 5 min | 3 min | ✅ |
| Security | < 10 min | 8 min | ✅ |
| E2E Tests | < 20 min | 18 min | ✅ |
| Deploy Staging | < 15 min | 12 min | ✅ |
| Deploy Production | < 20 min | 18 min | ✅ |

### Success Rate Targets

| Workflow | Target | Current | Status |
|----------|--------|---------|--------|
| Test Suite | > 98% | 99% | ✅ |
| Linting | > 99% | 100% | ✅ |
| Security | > 95% | 98% | ✅ |
| E2E Tests | > 95% | 94% | ⚠️ |
| Deployments | > 99% | 99% | ✅ |

---

## Metrics Collection Script

**Complete metrics collection:**

```bash
#!/bin/bash
# scripts/collect-all-metrics.sh

REPO="azora/azora-os"
OUTPUT_DIR="metrics"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p $OUTPUT_DIR

# Collect workflow metrics
echo "Collecting workflow metrics..."
gh run list --repo $REPO --limit 100 --json name,durationMinutes,conclusion,createdAt > \
  $OUTPUT_DIR/workflow-runs-$TIMESTAMP.json

# Collect test metrics
echo "Collecting test metrics..."
gh run list --repo $REPO --workflow test.yml --limit 50 --json durationMinutes,conclusion > \
  $OUTPUT_DIR/test-runs-$TIMESTAMP.json

# Collect deployment metrics
echo "Collecting deployment metrics..."
gh run list --repo $REPO --workflow deploy-production.yml --limit 50 --json durationMinutes,conclusion > \
  $OUTPUT_DIR/deployment-runs-$TIMESTAMP.json

# Generate summary
echo "Generating summary..."
cat > $OUTPUT_DIR/summary-$TIMESTAMP.json << EOF
{
  "timestamp": "$TIMESTAMP",
  "total_workflows": $(gh workflow list --repo $REPO | wc -l),
  "total_runs": $(gh run list --repo $REPO --limit 100 | wc -l),
  "success_rate": $(gh run list --repo $REPO --limit 100 --json conclusion | jq '[.[] | select(.conclusion == "success")] | length * 100 / length'),
  "avg_duration": $(gh run list --repo $REPO --limit 100 --json durationMinutes | jq '[.[].durationMinutes] | add / length')
}
EOF

echo "Metrics collected to $OUTPUT_DIR"
```

---

## Quick Reference

### Common Metrics Commands

```bash
# Get workflow list
gh workflow list

# Get recent runs
gh run list --limit 50

# Get specific workflow runs
gh run list --workflow test.yml --limit 50

# Get run details
gh run view <run-id> --json durationMinutes,conclusion

# Get job details
gh run view <run-id> --json jobs

# Calculate average duration
gh run list --workflow test.yml --limit 50 --json durationMinutes | \
  jq '[.[].durationMinutes] | add / length'

# Calculate success rate
gh run list --workflow test.yml --limit 50 --json conclusion | \
  jq '[.[] | select(.conclusion == "success")] | length * 100 / length'
```

### Useful Links

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **GitHub CLI Docs:** https://cli.github.com/manual/
- **Workflow Syntax:** https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- **Best Practices:** https://docs.github.com/en/actions/guides

