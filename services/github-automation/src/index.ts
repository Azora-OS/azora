/**
 * GitHub Automation Service
 * Integrates with GitHub API to:
 * - Parse issues and route to appropriate agents
 * - Execute agent actions (comments, PRs, labels)
 * - Distribute rewards (AZR tokens) for completed tasks
 */

import express from 'express';
import { Probot } from 'probot';
import { IssueParser } from './issue-parser';
import { RewardDistributor } from './reward-distributor';

const app = express();
const port = process.env.PORT || 3012;

app.use(express.json());

const issueParser = new IssueParser();
const rewardDistributor = new RewardDistributor();

/**
 * POST /webhook/github
 * GitHub webhook handler (routed through Probot)
 */
app.post('/webhook/github', async (req, res) => {
  const { action, issue, pull_request } = req.body;

  if (!issue && !pull_request) {
    res.status(400).json({ error: 'No issue or PR data' });
    return;
  }

  try {
    const parsed = issueParser.parse(issue || pull_request);

    console.log(`Parsed issue: ${parsed.id}`, {
      title: parsed.title,
      agent: parsed.suggestedAgent,
      priority: parsed.priority
    });

    // Route to agent (via Elara orchestrator)
    // TODO: Make HTTP call to elara-orchestrator service
    // const agentResponse = await routeToAgent(parsed);

    // If issue completed, distribute rewards
    if (action === 'closed') {
      const reward = rewardDistributor.calculateReward(parsed);
      console.log(`Issue resolved - distributing ${reward.amount} AZR to ${reward.recipient}`);
      // TODO: Execute token distribution
    }

    res.json({ success: true, parsed });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

/**
 * POST /task/:id/claim
 * Claim a task (issue) for solving
 */
app.post('/task/:id/claim', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    // TODO: Get task from GitHub by ID
    // TODO: Assign to user
    // TODO: Update UI with claim status

    res.json({ success: true, taskId: req.params.id, claimedBy: userId });
  } catch (error) {
    console.error('Claim error:', error);
    res.status(500).json({ error: 'Claim failed' });
  }
});

/**
 * POST /task/:id/complete
 * Mark task as complete and distribute rewards
 */
app.post('/task/:id/complete', async (req, res) => {
  const { userId, evidenceUrl } = req.body;

  if (!userId || !evidenceUrl) {
    res.status(400).json({ error: 'userId and evidenceUrl are required' });
    return;
  }

  try {
    // TODO: Get task from GitHub
    // TODO: Verify evidence (PR merged, test passing, etc.)
    // TODO: Calculate and distribute rewards

    res.json({
      success: true,
      taskId: req.params.id,
      rewardDistributed: true
    });
  } catch (error) {
    console.error('Completion error:', error);
    res.status(500).json({ error: 'Completion failed' });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'github-automation' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`🤖 GitHub Automation listening on port ${port}`);
  });
}

export default app;
