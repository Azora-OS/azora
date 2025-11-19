# Workflow Monitoring & Notifications - Quick Start

Get workflow monitoring and notifications running in 5 minutes.

---

## Step 1: Create Slack Webhook (2 minutes)

1. Go to your Slack workspace
2. Click **Apps** in the sidebar
3. Search for **Incoming Webhooks**
4. Click **Add to Slack**
5. Select a channel (e.g., #deployments)
6. Click **Add Incoming Webhooks Integration**
7. Copy the **Webhook URL** (looks like: `https://hooks.slack.com/services/...`)

---

## Step 2: Add GitHub Secret (1 minute)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Paste the webhook URL from Step 1
6. Click **Add secret**

---

## Step 3: Verify Workflows Are Enabled (1 minute)

1. Go to **Actions** tab
2. Look for these workflows:
   - ✅ Workflow Monitoring & Notifications
   - ✅ PR Notifications & Feedback
   - ✅ Deployment Notifications

If they're not visible, they're already enabled (they only show when triggered).

---

## Step 4: Test the Setup (1 minute)

### Option A: Create a Test PR
1. Create a new branch
2. Make a small change
3. Create a pull request
4. Watch for notifications in Slack

### Option B: Manual Trigger
1. Go to **Actions** tab
2. Click **Workflow Monitoring & Notifications**
3. Click **Run workflow**
4. Select **main** branch
5. Click **Run workflow**
6. Check Slack for metrics digest

---

## What You'll Get

### ✅ Workflow Failure Alerts
- Instant Slack notification when workflows fail
- GitHub issue created for tracking
- PR comment with fix guidance

### ✅ Deployment Notifications
- Success/failure alerts for staging and production
- Critical alerts for production failures
- Rollback procedure links

### ✅ PR Feedback
- Welcome comment on new PRs
- Check status updates
- Failure guidance with solutions
- Success celebration when all checks pass

### ✅ Daily Metrics Digest
- Daily summary at 9 AM UTC
- Performance trends
- Recommendations for optimization

### ✅ Performance Tracking
- Automatic metrics collection
- Trend analysis
- Degradation alerts

---

## Customization

### Change Notification Channel

Edit `.github/workflows/workflow-monitoring.yml`:

```yaml
- name: Send Slack notification
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}  # Change this
```

### Change Daily Digest Time

Edit `.github/workflows/workflow-monitoring.yml`:

```yaml
schedule:
  - cron: '0 9 * * *'  # Change 9 to your preferred hour (UTC)
```

### Disable Specific Notifications

Comment out the notification step in the workflow file:

```yaml
# - name: Send Slack notification
#   uses: slackapi/slack-github-action@v1.24.0
```

---

## Troubleshooting

### No Slack Notifications?

1. **Check secret exists:**
   - Settings → Secrets → Look for `SLACK_WEBHOOK_URL`

2. **Test webhook manually:**
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test"}' \
     YOUR_WEBHOOK_URL
   ```

3. **Check workflow logs:**
   - Actions → Workflow run → View logs
   - Look for error messages

### Metrics Not Collecting?

1. **Check GitHub CLI is available:**
   - Workflows use `gh` command
   - Should be pre-installed on GitHub runners

2. **Check permissions:**
   - Workflow needs `actions: read` permission
   - Verify in workflow file

3. **Manual collection:**
   ```bash
   bash .github/scripts/collect-workflow-metrics.sh
   ```

### Too Many Notifications?

1. **Disable PR notifications:**
   - Comment out steps in `pr-notifications.yml`

2. **Disable deployment notifications:**
   - Comment out steps in `deployment-notifications.yml`

3. **Change digest frequency:**
   - Edit cron schedule in `workflow-monitoring.yml`

---

## Next Steps

1. **Review Full Documentation:**
   - Read [WORKFLOW-MONITORING-AND-NOTIFICATIONS.md](WORKFLOW-MONITORING-AND-NOTIFICATIONS.md)

2. **Set Up Additional Channels:**
   - Create separate webhooks for different channels
   - Add secrets for each

3. **Configure Alerts:**
   - Set up PagerDuty integration (optional)
   - Configure email notifications (optional)

4. **Monitor Performance:**
   - Review daily digest
   - Track trends over time
   - Optimize slow workflows

---

## Quick Commands

### Collect Metrics Manually
```bash
bash .github/scripts/collect-workflow-metrics.sh
```

### Generate Report
```bash
bash .github/scripts/generate-metrics-report.sh
```

### View Workflow Runs
```bash
gh run list --limit 50
```

### View Specific Workflow
```bash
gh run list --workflow workflow-monitoring.yml --limit 10
```

---

## Support

- **Full Documentation:** [WORKFLOW-MONITORING-AND-NOTIFICATIONS.md](WORKFLOW-MONITORING-AND-NOTIFICATIONS.md)
- **Troubleshooting:** [WORKFLOW-TROUBLESHOOTING-GUIDE.md](WORKFLOW-TROUBLESHOOTING-GUIDE.md)
- **CI/CD Guide:** [workflows/README.md](workflows/README.md)

---

**Setup Complete!** 🎉

Your workflow monitoring and notifications are now active. Check Slack for your first notifications!
