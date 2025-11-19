# Workflow Dashboard - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Step 1: View Status Badges (30 seconds)

Open the [README.md](../README.md) and look for the **CI/CD Status** section:

```
✅ Tests | ✅ Linting | ✅ Security | ✅ E2E | ✅ Staging | ✅ Production
```

- **Green** = Passing ✅
- **Red** = Failing ❌
- Click any badge to see details

---

### Step 2: Open the Dashboard (1 minute)

**Option A: Visual Dashboard**
- Open [.github/dashboard.html](.github/dashboard.html) in your browser
- See real-time metrics and performance analysis
- Auto-refreshes every 5 minutes

**Option B: GitHub Actions**
- Go to https://github.com/Sizwe780/azora-os/actions
- Click on any workflow to see runs
- View logs and artifacts

**Option C: Slack**
- Check `#metrics` channel for daily digest
- Appears at 9 AM UTC daily
- Contains summary and recommendations

---

### Step 3: Understand the Metrics (30 seconds)

**Key Numbers to Watch:**

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| Success Rate | > 95% | 90-95% | < 90% |
| Duration | < 10 min | 10-15 min | > 15 min |
| Failures | 0 | 1-2 | > 2 |

---

## 📊 Dashboard Overview

### Status Cards (Top)

```
┌─────────────────────────────────────────────────────────┐
│ Total Workflows: 12  │  Success Rate: 98%  │  Duration: 8.5m  │
└─────────────────────────────────────────────────────────┘
```

**What It Means:**
- 12 workflows being monitored
- 98% of runs succeed (excellent!)
- Average run takes 8.5 minutes

### Workflow Table (Middle)

Shows each workflow with:
- Number of runs
- Success/failure counts
- Success rate percentage
- Average duration
- Latest status

### Performance Analysis (Bottom)

**Fastest Workflows** - No optimization needed
**Slowest Workflows** - Consider optimization
**Most Reliable** - Keep doing what you're doing
**Recommendations** - Action items

---

## 🔍 Common Tasks

### Task 1: Check if Everything is OK

1. Look at status badges in README
2. All green? ✅ You're good!
3. Any red? ❌ Click to see what failed

**Time:** < 1 minute

---

### Task 2: Review Daily Metrics

1. Check Slack `#metrics` at 9 AM UTC
2. Click "View Metrics Report"
3. Read summary section
4. Check recommendations

**Time:** 5 minutes

---

### Task 3: Investigate a Failure

1. Click on red status badge
2. View latest workflow run
3. Click on failed job
4. Read error message
5. Fix code and push

**Time:** 10-30 minutes

---

### Task 4: Optimize a Slow Workflow

1. Open dashboard
2. Find workflow in "Slowest Workflows"
3. Review workflow YAML
4. Add caching or parallelization
5. Measure improvement

**Time:** 30-60 minutes

---

## 📈 Reading the Metrics

### Success Rate

```
Test Suite: 98% success rate
├─ 49 successful runs
├─ 1 failed run
└─ Status: Excellent ✅
```

**What to do:**
- 95-100% → No action needed
- 90-95% → Monitor closely
- 80-90% → Investigate failures
- < 80% → Critical, fix immediately

### Average Duration

```
E2E Tests: 15 minutes average
├─ Fastest: 12 minutes
├─ Slowest: 18 minutes
└─ Status: Acceptable ⚠️
```

**What to do:**
- < 5 min → Very fast, no action
- 5-10 min → Fast, maintain
- 10-15 min → Acceptable, monitor
- > 15 min → Slow, optimize

### Latest Status

```
Security Scan: Latest = Failed
├─ Previous: Success
├─ Action: Review logs
└─ Status: Needs attention ⚠️
```

**What to do:**
- Success → No action
- Failed → Review logs immediately
- In Progress → Wait for completion
- Skipped → Check skip conditions

---

## 🎯 Key Metrics Explained

### Success Rate
**What:** Percentage of successful runs
**Target:** > 95%
**If Low:** Review failure logs, fix issues

### Average Duration
**What:** Mean execution time
**Target:** < 10 minutes
**If High:** Enable caching, parallelize

### Failure Count
**What:** Number of failed runs
**Target:** 0-2
**If High:** Investigate root causes

### Latest Status
**What:** Most recent run result
**Target:** Success
**If Failed:** Review logs, fix code

---

## 🚨 When Something is Wrong

### Red Badge (Workflow Failed)

1. Click the red badge
2. View the latest run
3. Click on the failed job
4. Read the error message
5. Fix the issue
6. Push new commit

**Example:**
```
❌ Test Suite Failed
→ Click badge
→ View run logs
→ See: "TypeError: Cannot read property 'map' of undefined"
→ Fix the code
→ Push and re-run
```

### Low Success Rate (< 90%)

1. Open dashboard
2. Find workflow in table
3. Click on workflow name
4. Review recent failures
5. Identify pattern
6. Fix root cause

**Example:**
```
E2E Tests: 85% success rate
→ Review failures
→ See: "Element not found"
→ Update selectors
→ Re-run tests
```

### Slow Workflow (> 15 min)

1. Open dashboard
2. Find in "Slowest Workflows"
3. Review workflow YAML
4. Add caching or parallelization
5. Measure improvement

**Example:**
```
Integration Tests: 18 minutes
→ Review workflow
→ Add npm caching
→ Parallelize test suites
→ New duration: 12 minutes ✅
```

---

## 📚 Learn More

### Quick References
- **Status Guide:** [.github/WORKFLOW-STATUS-DASHBOARD.md](.github/WORKFLOW-STATUS-DASHBOARD.md)
- **Metrics Guide:** [.github/METRICS-INTERPRETATION-GUIDE.md](.github/METRICS-INTERPRETATION-GUIDE.md)
- **Status Index:** [.github/WORKFLOW-STATUS-INDEX.md](.github/WORKFLOW-STATUS-INDEX.md)

### Detailed Guides
- **Monitoring:** [.github/WORKFLOW-MONITORING-AND-NOTIFICATIONS.md](.github/WORKFLOW-MONITORING-AND-NOTIFICATIONS.md)
- **Troubleshooting:** [.github/WORKFLOW-TROUBLESHOOTING-GUIDE.md](.github/WORKFLOW-TROUBLESHOOTING-GUIDE.md)
- **Performance:** [.github/WORKFLOW-PERFORMANCE-MONITORING.md](.github/WORKFLOW-PERFORMANCE-MONITORING.md)

### External Resources
- **GitHub Actions:** https://docs.github.com/en/actions
- **Workflow Runs:** https://github.com/Sizwe780/azora-os/actions

---

## 💡 Pro Tips

### Tip 1: Bookmark the Dashboard
Save [.github/dashboard.html](.github/dashboard.html) to your bookmarks for quick access.

### Tip 2: Check Daily Digest
Subscribe to Slack `#metrics` for daily updates at 9 AM UTC.

### Tip 3: Set Alerts
Configure Slack notifications for failures in `#ci-cd` channel.

### Tip 4: Track Trends
Review weekly metrics to identify patterns and improvements.

### Tip 5: Share Results
Share dashboard with team to celebrate improvements and discuss issues.

---

## ❓ FAQ

### Q: What does a green badge mean?
**A:** The workflow passed. Your code is good to merge!

### Q: What does a red badge mean?
**A:** The workflow failed. Click it to see what went wrong.

### Q: How often are metrics updated?
**A:** Daily at 9 AM UTC. Slack digest appears then.

### Q: Where are the detailed reports?
**A:** In `.github/metrics/` directory. Download from GitHub Actions artifacts.

### Q: How long are metrics kept?
**A:** 90 days for reports, 1 year for security reports.

### Q: Can I access metrics programmatically?
**A:** Yes! Use GitHub CLI: `gh run list --repo azora/azora-os`

### Q: What if I don't see my workflow?
**A:** It might be skipped or disabled. Check workflow YAML file.

### Q: How do I optimize a slow workflow?
**A:** Enable caching, parallelize jobs, remove unnecessary steps.

### Q: What's a good success rate?
**A:** > 95% is excellent. 90-95% is good. < 90% needs attention.

### Q: What's a good average duration?
**A:** < 10 minutes is fast. 10-15 minutes is acceptable. > 15 minutes is slow.

---

## 🎓 Next Steps

1. **Today:** Check status badges in README
2. **Tomorrow:** Review daily digest in Slack
3. **This Week:** Open dashboard and explore metrics
4. **This Month:** Optimize a slow workflow
5. **Ongoing:** Monitor trends and celebrate improvements

---

## 📞 Need Help?

- **Questions?** Check [.github/WORKFLOW-TROUBLESHOOTING-GUIDE.md](.github/WORKFLOW-TROUBLESHOOTING-GUIDE.md)
- **More Info?** Read [.github/WORKFLOW-STATUS-DASHBOARD.md](.github/WORKFLOW-STATUS-DASHBOARD.md)
- **GitHub Docs?** https://docs.github.com/en/actions

---

**Happy monitoring! 🚀**

Last Updated: 2024-11-19
