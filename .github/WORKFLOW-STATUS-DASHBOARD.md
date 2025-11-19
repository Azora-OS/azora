# Workflow Status Dashboard & Reporting Guide

## Overview

This guide explains how to access, interpret, and use the workflow status dashboard and reporting system for Azora OS CI/CD pipelines. The dashboard provides real-time visibility into workflow health, performance metrics, and historical trends.

---

## Table of Contents

1. [Dashboard Access](#dashboard-access)
2. [Status Badges](#status-badges)
3. [Metrics Interpretation](#metrics-interpretation)
4. [Performance Reports](#performance-reports)
5. [Trend Analysis](#trend-analysis)
6. [Troubleshooting](#troubleshooting)

---

## Dashboard Access

### GitHub Actions Dashboard

**Primary Location:** https://github.com/Sizwe780/azora-os/actions

**What You'll Find:**
- All workflow runs with status
- Execution times and logs
- Artifact downloads
- Workflow history

**How to Use:**
1. Click on a workflow name to see recent runs
2. Click on a specific run to view logs
3. Download artifacts (test reports, coverage, metrics)
4. Re-run failed workflows

### Metrics Reports

**Location:** `.github/metrics/` directory in repository

**Files Generated Daily:**
- `workflow-metrics-YYYY-MM-DD.json` - Raw metrics data
- `METRICS-REPORT-YYYY-MM-DD.md` - Formatted report
- `performance-trends-YYYY-MM-DD.json` - Trend analysis

**How to Access:**
1. Go to GitHub Actions tab
2. Find "Workflow Monitoring & Notifications" workflow
3. Click latest run
4. Download artifacts section
5. Extract and view reports

### Slack Notifications

**Channels:**
- `#deployments` - Deployment status
- `#ci-cd` - Build and test status
- `#incidents` - Production issues
- `#metrics` - Daily digest

**Daily Digest Time:** 9 AM UTC

---

## Status Badges

### Badge Locations

**README.md Status Section:**
```markdown
### CI/CD Status

[![Tests](https://github.com/Sizwe780/azora-os/workflows/Test%20Suite/badge.svg?branch=main)](https://github.com/Sizwe780/azora-os/actions/workflows/test.yml)
[![Linting & Type Check](https://github.com/Sizwe780/azora-os/workflows/CI%20-%20Linting%20%26%20Type%20Checking/badge.svg?branch=main)](https://github.com/Sizwe780/azora-os/actions/workflows/ci-lint-and-type-check.yml)
[![Security Scan](https://github.com/Sizwe780/azora-os/workflows/Security%20Scanning/badge.svg?branch=main)](https://github.com/Sizwe780/azora-os/actions/workflows/security.yml)
[![E2E Tests](https://github.com/Sizwe780/azora-os/workflows/E2E%20Tests/badge.svg?branch=main)](https://github.com/Sizwe780/azora-os/actions/workflows/e2e-tests.yml)
```

### Badge Meanings

| Badge | Meaning | Action |
|-------|---------|--------|
| 🟢 Passing | Workflow succeeded | No action needed |
| 🔴 Failing | Workflow failed | Click badge to view logs |
| 🟡 In Progress | Workflow running | Wait for completion |
| ⚪ No Status | Never run | Trigger manually if needed |

### Interpreting Badge Status

**Green (Passing):**
- All checks passed
- Code is ready to merge
- No issues detected

**Red (Failing):**
- One or more checks failed
- Cannot merge PR
- Review logs for details
- Fix issues and push new commit

**Yellow (In Progress):**
- Workflow is currently running
- Check back in a few minutes
- Don't merge until complete

---

## Metrics Interpretation

### Key Metrics Explained

#### 1. Success Rate

**Definition:** Percentage of workflow runs that completed successfully

**Formula:** `(Successful Runs / Total Runs) × 100`

**Interpretation:**
- **> 95%** - Excellent, very reliable
- **90-95%** - Good, acceptable
- **80-90%** - Fair, needs attention
- **< 80%** - Poor, needs investigation

**Example:**
```
Test Suite: 98% success rate
- 49 successful runs out of 50
- 1 failed run
- Status: Excellent ✅
```

#### 2. Average Duration

**Definition:** Mean execution time across all runs

**Interpretation:**
- **< 5 min** - Very fast
- **5-10 min** - Fast
- **10-15 min** - Acceptable
- **> 15 min** - Slow, consider optimization

**Example:**
```
Linting: 3 minutes average
- Fastest: 2.5 minutes
- Slowest: 4.2 minutes
- Status: Very fast ✅
```

#### 3. Failure Count

**Definition:** Number of failed runs in the period

**Interpretation:**
- **0 failures** - Perfect
- **1-2 failures** - Minor issues
- **3+ failures** - Significant problems

**Example:**
```
Security Scan: 2 failures out of 50 runs
- Failure rate: 4%
- Status: Good, investigate failures
```

#### 4. Latest Status

**Definition:** Result of the most recent workflow run

**Interpretation:**
- **Success** - Latest run passed
- **Failed** - Latest run failed, needs attention
- **In Progress** - Currently running
- **Skipped** - Workflow was skipped

**Example:**
```
E2E Tests: Latest status = Failed
- Previous run: Success
- Action: Review latest logs
```

### Metrics Table Example

```
| Workflow | Runs | Success | Failed | Success Rate | Avg Duration | Latest Status |
|----------|------|---------|--------|--------------|--------------|---------------|
| Test Suite | 50 | 49 | 1 | 98% | 10min | Success |
| Linting | 50 | 50 | 0 | 100% | 3min | Success |
| Security | 50 | 48 | 2 | 96% | 5min | Failed |
| E2E Tests | 50 | 45 | 5 | 90% | 15min | Success |
```

**How to Read:**
- Test Suite is very reliable (98% success)
- Linting is perfect (100% success)
- Security has some issues (96% success, latest failed)
- E2E Tests are acceptable (90% success)

---

## Performance Reports

### Daily Report Contents

**Generated:** 9 AM UTC daily

**File:** `.github/metrics/METRICS-REPORT-YYYY-MM-DD.md`

### Report Sections

#### 1. Summary Statistics

```markdown
## Summary

| Metric | Value |
|--------|-------|
| Total Workflows | 12 |
| Total Runs (Last 50 per workflow) | 450 |
| Successful Runs | 441 |
| Failed Runs | 9 |
| Overall Success Rate | 98% |
| Average Workflow Duration | 8.5min |
```

**What It Means:**
- 12 different workflows are being tracked
- 450 total runs analyzed (50 per workflow)
- 441 succeeded, 9 failed
- Overall system is 98% reliable
- Average workflow takes 8.5 minutes

#### 2. Workflow Details Table

```markdown
| Workflow | Runs | Success | Failed | Success Rate | Avg Duration | Latest Status |
|----------|------|---------|--------|--------------|--------------|---------------|
| Test Suite | 50 | 49 | 1 | 98% | 10min | Success |
| Linting | 50 | 50 | 0 | 100% | 3min | Success |
```

**How to Use:**
- Identify workflows with low success rates
- Find slow workflows for optimization
- Check latest status for current issues

#### 3. Performance Analysis

**Fastest Workflows:**
```
- Linting: 3min average
- Type Check: 4min average
- Dependency Update: 5min average
```

**Slowest Workflows:**
```
- E2E Tests: 15min average
- Integration Tests: 12min average
- Security Scan: 8min average
```

**Most Reliable:**
```
- Linting: 100% success rate
- Type Check: 100% success rate
- Dependency Update: 98% success rate
```

**Least Reliable:**
```
- E2E Tests: 90% success rate
- Integration Tests: 92% success rate
- Security Scan: 96% success rate
```

#### 4. Recommendations

**Low Success Rate Workflows:**
```
⚠️ Workflows with Low Success Rates (< 90%)

- E2E Tests: 90% - Review failures and address root causes
- Integration Tests: 92% - Investigate flaky tests
```

**Slow Workflows:**
```
🐢 Slow Workflows (> 15 minutes)

- E2E Tests: 15min - Consider optimization (caching, parallelization)
- Integration Tests: 12min - Review test suite for unnecessary tests
```

---

## Trend Analysis

### Understanding Trends

**Trend Indicators:**
- 📈 **Improving** - Success rate up, duration down
- 📉 **Degrading** - Success rate down, duration up
- → **Stable** - No significant change

### Trend Data

**File:** `.github/metrics/performance-trends-YYYY-MM-DD.json`

**Example:**
```json
{
  "Test Suite": {
    "success_trend": "📈",
    "duration_trend": "📉",
    "current_success_rate": 98,
    "current_duration": 10
  },
  "E2E Tests": {
    "success_trend": "📉",
    "duration_trend": "📈",
    "current_success_rate": 88,
    "current_duration": 16
  }
}
```

**Interpretation:**
- Test Suite: Improving (success up, duration down) ✅
- E2E Tests: Degrading (success down, duration up) ⚠️

### Degradation Alerts

**Triggered When:**
- Success rate drops > 5%
- Duration increases > 2 minutes

**Example Alert:**
```
⚠️ Performance Degradation Detected

The following workflows have shown performance degradation:
- E2E Tests: Success rate dropped 5%
- Integration Tests: Duration increased 2 minutes
```

**Action Items:**
1. Review recent changes
2. Check for new test failures
3. Investigate performance issues
4. Implement fixes

---

## Accessing Metrics Programmatically

### GitHub API

**Get Latest Workflow Run:**
```bash
gh run list --repo azora/azora-os --workflow test.yml --limit 1 --json status,conclusion,durationMinutes
```

**Get Workflow Run Logs:**
```bash
gh run view <run-id> --repo azora/azora-os --log
```

**Download Artifacts:**
```bash
gh run download <run-id> --repo azora/azora-os --dir ./artifacts
```

### Metrics Files

**List Available Metrics:**
```bash
ls -la .github/metrics/
```

**View Latest Report:**
```bash
cat .github/metrics/METRICS-REPORT-$(date +%Y-%m-%d).md
```

**Parse Metrics JSON:**
```bash
jq '.workflows[] | {name, success_rate, avg_duration_minutes}' .github/metrics/workflow-metrics-*.json
```

---

## Workflow Status Reference

### Status Meanings

| Status | Meaning | Next Steps |
|--------|---------|-----------|
| **Success** | Workflow completed successfully | No action needed |
| **Failure** | Workflow failed | Review logs, fix issues |
| **In Progress** | Workflow is running | Wait for completion |
| **Skipped** | Workflow was skipped | Check skip conditions |
| **Cancelled** | Workflow was cancelled | Check cancellation reason |
| **Timed Out** | Workflow exceeded time limit | Optimize or increase timeout |

### Common Failure Reasons

**Linting Failures:**
- Code style violations
- Unused imports
- Undefined variables
- Fix: Run `npm run lint:fix`

**Type Check Failures:**
- Type mismatches
- Missing type definitions
- Implicit any types
- Fix: Review TypeScript errors and fix types

**Test Failures:**
- Failing test cases
- Assertion errors
- Timeout errors
- Fix: Review test logs and fix code

**Security Failures:**
- Vulnerable dependencies
- Hardcoded secrets
- Security issues
- Fix: Update dependencies or fix code

**E2E Test Failures:**
- UI element not found
- Navigation issues
- Assertion failures
- Fix: Review test logs and screenshots

---

## Troubleshooting

### Dashboard Not Updating

**Check 1: Verify Workflows Are Running**
1. Go to GitHub Actions tab
2. Check if workflows are triggered
3. Look for recent runs

**Check 2: Check Workflow Permissions**
- Workflows need `actions: read` permission
- Verify in workflow YAML files

**Check 3: Manual Trigger**
```bash
gh workflow run workflow-monitoring.yml --repo azora/azora-os
```

### Metrics Not Generating

**Check 1: Verify Script Permissions**
```bash
chmod +x .github/scripts/collect-workflow-metrics.sh
chmod +x .github/scripts/generate-metrics-report.sh
```

**Check 2: Check GitHub CLI**
```bash
gh --version
gh auth status
```

**Check 3: Manual Collection**
```bash
bash .github/scripts/collect-workflow-metrics.sh
bash .github/scripts/generate-metrics-report.sh
```

### Slack Notifications Not Appearing

**Check 1: Verify Webhook**
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test"}' \
  $SLACK_WEBHOOK_URL
```

**Check 2: Check Secret Configuration**
- Go to GitHub Settings → Secrets
- Verify `SLACK_WEBHOOK_URL` exists
- Verify URL is correct

**Check 3: Check Workflow Logs**
- Go to Actions tab
- Click workflow run
- Check for error messages

---

## Best Practices

### 1. Monitor Daily Digest

- Review metrics every morning
- Identify trends early
- Address issues promptly

### 2. Investigate Failures

- Click on failed workflow
- Review logs carefully
- Understand root cause
- Implement fix

### 3. Track Performance

- Monitor average durations
- Identify slow workflows
- Implement optimizations
- Measure improvements

### 4. Maintain Reliability

- Keep success rates > 95%
- Address flaky tests
- Update dependencies
- Review security alerts

### 5. Use Badges

- Display status in README
- Share with team
- Link to detailed reports
- Keep stakeholders informed

---

## Quick Reference

### Key Files

| File | Purpose | Location |
|------|---------|----------|
| Metrics Data | Raw workflow metrics | `.github/metrics/workflow-metrics-*.json` |
| Daily Report | Formatted metrics report | `.github/metrics/METRICS-REPORT-*.md` |
| Trends | Performance trends | `.github/metrics/performance-trends-*.json` |

### Key URLs

| Resource | URL |
|----------|-----|
| GitHub Actions | https://github.com/Sizwe780/azora-os/actions |
| Workflow Runs | https://github.com/Sizwe780/azora-os/actions/workflows |
| Artifacts | https://github.com/Sizwe780/azora-os/actions (in run details) |

### Key Commands

| Command | Purpose |
|---------|---------|
| `gh run list --repo azora/azora-os` | List recent runs |
| `gh run view <id> --repo azora/azora-os --log` | View run logs |
| `gh run download <id> --repo azora/azora-os` | Download artifacts |
| `bash .github/scripts/collect-workflow-metrics.sh` | Collect metrics |
| `bash .github/scripts/generate-metrics-report.sh` | Generate report |

---

## Support & Documentation

- **CI/CD Documentation:** [.github/workflows/README.md](.github/workflows/README.md)
- **Monitoring Guide:** [.github/WORKFLOW-MONITORING-AND-NOTIFICATIONS.md](.github/WORKFLOW-MONITORING-AND-NOTIFICATIONS.md)
- **Troubleshooting:** [.github/WORKFLOW-TROUBLESHOOTING-GUIDE.md](.github/WORKFLOW-TROUBLESHOOTING-GUIDE.md)
- **GitHub Actions Docs:** https://docs.github.com/en/actions

---

**Last Updated:** 2024-11-19  
**Version:** 1.0
