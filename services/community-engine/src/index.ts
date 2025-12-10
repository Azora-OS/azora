/**
 * Community Engine Service
 * Manages:
 * - Token economy (AZR minting, transfers)
 * - Leaderboards and reputation
 * - OctoCanvas NFT card generation
 * - Gamification (achievements, badges)
 */

import express from 'express';
import { CardGenerator } from './card-generator';
import { LeaderboardService } from './leaderboard-service';
import { TokenService } from './token-service';

const app = express();
const port = process.env.PORT || 3013;

app.use(express.json());

const cardGen = new CardGenerator();
const leaderboard = new LeaderboardService();
const tokens = new TokenService();

/**
 * POST /card/generate
 * Generate OctoCanvas NFT card for user achievement
 */
app.post('/card/generate', async (req, res) => {
  const { userId, title, description, rarity, imageUrl } = req.body;

  if (!userId || !title) {
    res.status(400).json({ error: 'userId and title are required' });
    return;
  }

  try {
    const card = await cardGen.generateCard({
      userId,
      title,
      description,
      rarity: rarity || 'common',
      imageUrl
    });

    res.json({
      success: true,
      card: {
        id: card.id,
        dataUrl: card.dataUrl,
        metadata: card.metadata
      }
    });
  } catch (error) {
    console.error('Card generation error:', error);
    res.status(500).json({ error: 'Card generation failed' });
  }
});

/**
 * GET /leaderboard
 * Get current leaderboard standings
 */
app.get('/leaderboard', async (req, res) => {
  const { period = 'all', limit = 100 } = req.query;

  try {
    const standings = await leaderboard.getStandings(
      (period as string) || 'all',
      parseInt((limit as string) || '100')
    );

    res.json({ standings });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /user/:id/stats
 * Get user reputation and stats
 */
app.get('/user/:id/stats', async (req, res) => {
  try {
    const stats = await leaderboard.getUserStats(req.params.id);

    res.json({
      userId: req.params.id,
      stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

/**
 * POST /token/mint
 * Mint AZR tokens (admin only)
 */
app.post('/token/mint', async (req, res) => {
  const { recipient, amount, reason } = req.body;

  if (!recipient || !amount || !reason) {
    res.status(400).json({ error: 'recipient, amount, and reason are required' });
    return;
  }

  // TODO: Verify admin permission

  try {
    const result = await tokens.mint({
      recipient,
      amount,
      reason
    });

    res.json({
      success: true,
      transaction: result
    });
  } catch (error) {
    console.error('Mint error:', error);
    res.status(500).json({ error: 'Minting failed' });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'community-engine' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`🎮 Community Engine listening on port ${port}`);
  });
}

export default app;
