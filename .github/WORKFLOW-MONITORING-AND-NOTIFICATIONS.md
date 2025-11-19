# Workflow Monitoring & Notifications Guide

## Overview

This guide explains the comprehensive workflow monitoring and notification system for Azora OS CI/CD pipelines. The system provides real-time alerts, performance tracking, and daily digests to keep the team informed about build status and deployment health.

---

## Table of Contents

1. [Notification Types](#notification-types)
2. [Setup & Configuration](#setup--configuration)
3. [Slack Integration](#slack-integration)
4. [Performance Tracking](#performance-tracking)
5. [Daily Digest](#daily-digest)
6. [Troubleshooting](#troubleshooting)

---

## Notification Types

### 1. Workflow Failure Notifications

**Trigger:** When any workflow fails

**Notification Channels:**
- Slack message with failure details
- GitHub issue created for tracking
- PR comment with failure guidance

**Information Included:**
- Workflow name and status
- Branch and commit information
- Link to workflow logs
- Suggested remediation steps

**Example Slack Message:**
```
❌ Workflow Failed: Test Suite
Branch: feature/new-feature
Commit: abc1234
Status: Failed

[View Workflow]
```

### 2. Deployment Success Notifications

**Trigger:** When deployment workflows complete successfully

**Notification Channels:**
- Slack message with deployment details
- GitHub Actions summary

**Information Included:**
- Environment (Staging/Production)
- Services deployed
- Health check status
- Rollback availability window

**Example Slack Message:**
```
✅ Deployment Successful: Deploy Staging
Environment: Staging
Status: Success
Duration: 12 minutes

[View Deployment]
```

### 3. Production Deployment Failure Alerts

**Trigger:** When production deployment fails

**Notification Channels:**
- Critical Slack alert (mentions @channel)
- GitHub incident issue created
- Email notification (if configured)

**Information Included:**
- Critical alert indicator
- Immediate action items
- Rollback procedures link
- On-call team information

**Example Slack Message:**
```
🚨 CRITICAL: Production Deployment Failed
Immediate Actions:
1. Check the deployment logs
2. Assess the impact
3. Determine if rollback is needed
4. Notify the on-call team

[View Logs] [Rollback Procedures]
```

### 4. PR Check Notifications

**Trigger:** When PR checks complete

**Notification Channels:**
- PR comments with check status
- Failure guidance comments
- Success celebration comment

**Information Included:**
- Check status (passed/failed)
- Failure details and guidance
- Links to documentation
- Next steps

**Example PR Comment:**
```
✅ Code Quality Checks Passed

[View Workflow]

### How to Fix
1. Run locally: npm run lint
2. Fix errors shown in the output
3. Use npm run lint:fix to auto-fix style issues
4. Commit and push your changes
```

### 5. Daily Metrics Digest

**Trigger:** Daily at 9 AM UTC (configurable)

**Notification Channels:**
- Slack message with metrics summary
- Metrics report artifact
- Performance trends analysis

**Information Included:**
- Total workflows and runs
- Success rates
- Average execution times
- Performance trends
- Recommendations

**Example Slack Message:**
```
📊 Daily Workflow Metrics
Date: 2024-11-19
Repository: azora/azora-os

Detailed metrics report has been generated and is available in the workflow artifacts.

[View Metrics Report] [View All Workflows]
```

### 6. Performance Degradation Alerts

**Trigger:** When performance metrics degrade significantly

**Notification Channels:**
- Slack alert with degradation details
- Performance trends artifact

**Information Included:**
- Workflows with degradation
- Success rate changes
- Duration changes
- Recommendations

**Example Slack Message:**
```
⚠️ Performance Degradation Detected

The following workflows have shown performance degradation:
- Test Suite: Success rate dropped 5%
- E2E Tests: Duration increased 2 minutes

[View Metrics]
```

---

## Setup & Configuration

### Prerequisites

1. **GitHub Repository Access**
   - Admin access to repository settings
   - Ability to configure secrets and variables

2. **Slack Workspace**
   - Admin access to Slack workspace
   - Ability to create incoming webhooks

3. **GitHub CLI (Optional)**
   - For manual metrics collection
   - For testing notifications

### Step 1: Create Slack Incoming Webhook

1. Go to your Slack workspace
2. Navigate to **Apps & Integrations** → **Manage Apps**
3. Search for **Incoming Webhooks**
4. Click **Add to Slack**
5. Select the channel for notifications (e.g., #deployments)
6. Click **Add Incoming Webhooks Integration**
7. Copy the **Webhook URL**

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `SLACK_WEBHOOK_URL` | Your webhook URL | Slack incoming webhook for notifications |
| `SLACK_WEBHOOK` | Your webhook URL | Alternative name (used in some workflows) |

### Step 3: Enable Workflows

The following workflows are automatically enabled:

- `.github/workflows/workflow-monitoring.yml` - Monitors all workflows
- `.github/workflows/pr-notifications.yml` - Notifies on PR events
- `.github/workflows/deployment-notifications.yml` - Notifies on deployments

No additional configuration needed - they trigger automatically.

### Step 4: Verify Setup

1. Create a test PR
2. Check that notifications appear in Slack
3. Verify PR comments are added
4. Monitor the daily digest at 9 AM UTC

---

## Slack Integration

### Webhook Configuration

**Webhook URL Format:**
```
https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Testing the Webhook:**
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_WEBHOOK_URL
```

### Notification Channels

**Recommended Channel Setup:**

| Channel | Purpose | Notifications |
|---------|---------|---------------|
| #deployments | Deployment status | Deploy Staging, Deploy Production |
| #ci-cd | Build status | Test failures, Security issues |
| #incidents | Production issues | Deployment failures, Critical alerts |
| #metrics | Performance data | Daily digest, Degradation alerts |

### Customizing Notifications

**To change notification channel:**

1. Edit the workflow file
2. Update the `webhook_url` parameter
3. Or create a new webhook for a different channel

**Example:**
```yaml
- name: Send Slack notification
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Notification Formatting

Notifications use Slack's Block Kit format for rich formatting:

- **Headers** - Large text for main message
- **Sections** - Organized information fields
- **Actions** - Buttons for quick access
- **Dividers** - Visual separation

---

## Performance Tracking

### Metrics Collection

**Automatic Collection:**
- Runs daily at 9 AM UTC
- Collects data from last 50 runs per workflow
- Stores metrics as JSON artifacts

**Manual Collection:**
```bash
bash .github/scripts/collect-workflow-metrics.sh
```

### Metrics Tracked

| Metric | Description | Target |
|--------|-------------|--------|
| Total Runs | Number of workflow executions | N/A |
| Successful Runs | Runs that completed successfully | > 95% |
| Failed Runs | Runs that failed | < 5% |
| Success Rate | Percentage of successful runs | > 95% |
| Average Duration | Mean execution time | < 15 min |
| Latest Status | Most recent run status | Success |

### Performance Report

**Generated Daily:**
- File: `.github/metrics/METRICS-REPORT-YYYY-MM-DD.md`
- Contains: Summary, workflow details, analysis, recommendations
- Uploaded as artifact for 90 days

**Report Sections:**
1. Summary statistics
2. Workflow details table
3. Performance analysis
4. Recommendations

**Example Report:**
```markdown
# Workflow Metrics Report

Generated: 2024-11-19T09:00:00Z
Repository: azora/azora-os

## Summary

| Metric | Value |
|--------|-------|
| Total Workflows | 12 |
| Total Runs | 450 |
| Successful Runs | 441 |
| Failed Runs | 9 |
| Overall Success Rate | 98% |
| Average Workflow Duration | 8.5min |

## Workflow Details

| Workflow | Runs | Success | Failed | Success Rate | Avg Duration |
|----------|------|---------|--------|--------------|--------------|
| Test Suite | 50 | 49 | 1 | 98% | 10min |
| Linting | 50 | 50 | 0 | 100% | 3min |
| Security | 50 | 48 | 2 | 96% | 5min |
```

### Trend Analysis

**Performance Trends:**
- Tracked over 7-day rolling window
- Identifies improving/degrading workflows
- Alerts on significant changes

**Trend Indicators:**
- 📈 Improving (success rate up, duration down)
- 📉 Degrading (success rate down, duration up)
- → Stable (no significant change)

**Degradation Thresholds:**
- Success rate drop > 5%
- Duration increase > 2 minutes

---

## Daily Digest

### Schedule

**Default:** 9 AM UTC daily

**To Change Schedule:**
1. Edit `.github/workflows/workflow-monitoring.yml`
2. Update the cron expression:
   ```yaml
   schedule:
     - cron: '0 9 * * *'  # 9 AM UTC
   ```

**Cron Format:** `minute hour day month day-of-week`

### Digest Contents

1. **Summary Statistics**
   - Total workflows and runs
   - Success rates
   - Average durations

2. **Workflow Details**
   - Individual workflow metrics
   - Status and performance

3. **Performance Analysis**
   - Fastest workflows
   - Slowest workflows
   - Most reliable workflows
   - Least reliable workflows

4. **Recommendations**
   - Workflows with low success rates
   - Slow workflows needing optimization
   - Performance improvement suggestions

### Accessing Digest

**In Slack:**
- Appears in configured channel at scheduled time
- Contains link to detailed report

**In GitHub:**
- Artifacts tab of workflow run
- File: `METRICS-REPORT-YYYY-MM-DD.md`
- Retained for 90 days

---

## GitHub PR Notifications

### PR Comment Notifications

**When PR is Opened:**
- Welcome comment with checklist
- Links to contributing guidelines
- Information about automated checks

**When Checks Complete:**
- Status update comment
- Failure guidance if needed
- Success celebration if all pass

**When All Checks Pass:**
- Celebration comment
- Merge readiness confirmation

### Failure Guidance

**Automatic Guidance for:**
- Linting failures
- Type checking failures
- Test failures
- Security scan failures
- E2E test failures

**Each Includes:**
- How to fix locally
- Common issues
- Links to documentation

---

## GitHub Issues for Tracking

### Workflow Failure Issues

**Created When:**
- Workflow fails
- No existing issue for that workflow in last 24 hours

**Issue Details:**
- Title: "🔴 Workflow Failed: [Workflow Name]"
- Labels: `workflow-failure`, `automated`
- Body: Failure details and action items

### Production Incident Issues

**Created When:**
- Production deployment fails

**Issue Details:**
- Title: "🚨 Production Deployment Incident - [Date]"
- Labels: `incident`, `production`, `automated`
- Body: Impact assessment and resolution steps

---

## Troubleshooting

### Notifications Not Appearing

**Check 1: Verify Slack Webhook**
```bash
# Test webhook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test"}' \
  $SLACK_WEBHOOK_URL
```

**Check 2: Verify Secret Configuration**
1. Go to GitHub Settings → Secrets
2. Confirm `SLACK_WEBHOOK_URL` exists
3. Verify URL is correct (no extra spaces)

**Check 3: Check Workflow Logs**
1. Go to Actions tab
2. Click the workflow run
3. Check for error messages in logs

### Metrics Not Collecting

**Check 1: Verify GitHub CLI**
```bash
gh --version
```

**Check 2: Check Workflow Permissions**
- Workflow needs `actions: read` permission
- Verify in workflow file

**Check 3: Manual Collection**
```bash
bash .github/scripts/collect-workflow-metrics.sh
```

### Performance Degradation Alerts Not Triggering

**Check 1: Verify Trend Data**
- Need at least 2 days of metrics
- Check `.github/metrics/` directory

**Check 2: Check Thresholds**
- Success rate drop > 5%
- Duration increase > 2 minutes

**Check 3: Review Workflow Logs**
- Check `track-performance-trends` job
- Look for errors in trend analysis

---

## Best Practices

### 1. Monitor Notifications

- Check Slack regularly for alerts
- Address failures promptly
- Review daily digest for trends

### 2. Respond to Failures

- Click "View Workflow" to see logs
- Follow the provided guidance
- Fix issues and push new commits

### 3. Track Performance

- Review weekly metrics
- Identify slow workflows
- Implement optimizations

### 4. Maintain Reliability

- Keep success rates > 95%
- Address flaky tests
- Update dependencies regularly

### 5. Production Deployments

- Monitor critical alerts closely
- Have rollback procedures ready
- Document incidents

---

## Advanced Configuration

### Custom Notification Channels

**To send different notifications to different channels:**

1. Create multiple Slack webhooks
2. Add secrets for each: `SLACK_WEBHOOK_DEPLOYMENTS`, `SLACK_WEBHOOK_INCIDENTS`
3. Update workflows to use appropriate webhook

### Email Notifications

**To add email notifications:**

1. Use GitHub's built-in email notifications
2. Or integrate with email service via workflow

### Custom Metrics

**To track additional metrics:**

1. Edit `.github/scripts/collect-workflow-metrics.sh`
2. Add new metrics to collection
3. Update report generation script

### Integration with External Tools

**Supported Integrations:**
- PagerDuty (for incident management)
- Datadog (for monitoring)
- New Relic (for APM)
- Custom webhooks

---

## Quick Reference

### Workflow Files

| File | Purpose |
|------|---------|
| `workflow-monitoring.yml` | Monitors workflows and sends notifications |
| `pr-notifications.yml` | Sends PR-related notifications |
| `deployment-notifications.yml` | Sends deployment notifications |

### Script Files

| File | Purpose |
|------|---------|
| `collect-workflow-metrics.sh` | Collects workflow metrics |
| `generate-metrics-report.sh` | Generates metrics report |

### Secrets Required

| Secret | Purpose |
|--------|---------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook |
| `SLACK_WEBHOOK` | Alternative webhook name |

### Cron Schedules

| Schedule | Time |
|----------|------|
| `0 9 * * *` | 9 AM UTC daily |
| `0 */6 * * *` | Every 6 hours |
| `0 0 * * 0` | Weekly (Sunday midnight) |

---

## Support & Documentation

- **CI/CD Documentation:** [.github/workflows/README.md](.github/workflows/README.md)
- **Troubleshooting Guide:** [.github/WORKFLOW-TROUBLESHOOTING-GUIDE.md](.github/WORKFLOW-TROUBLESHOOTING-GUIDE.md)
- **Deployment Procedures:** [.github/PRODUCTION-ROLLBACK-PROCEDURES.md](.github/PRODUCTION-ROLLBACK-PROCEDURES.md)
- **GitHub Actions Docs:** https://docs.github.com/en/actions

---

**Last Updated:** 2024-11-19
**Version:** 1.0
