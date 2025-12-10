/**
 * Constitutional Validator Service
 * Pre/post-execution validation against constitutional rules
 * 
 * Rules defined in:
 * - /workspaces/azora/AZORA_CONSTITUTION.md
 * - /workspaces/azora/CONSTITUTION.md
 * - Individual room-specific policies
 */

import express from 'express';
import { ConstitutionalValidator } from './validator';

const app = express();
const port = process.env.PORT || 3011;

app.use(express.json());

const validator = new ConstitutionalValidator();

/**
 * POST /validate/pre
 * Pre-execution validation (before agent acts)
 */
app.post('/validate/pre', async (req, res) => {
  const { action, context, userId } = req.body;

  if (!action) {
    res.status(400).json({ error: 'action is required' });
    return;
  }

  try {
    const result = await validator.validatePre({
      action,
      context,
      userId
    });

    res.json({
      valid: result.valid,
      violations: result.violations,
      warnings: result.warnings
    });
  } catch (error) {
    console.error('Pre-validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

/**
 * POST /validate/post
 * Post-execution validation (audit trail)
 */
app.post('/validate/post', async (req, res) => {
  const { action, result, userId } = req.body;

  if (!action || !result) {
    res.status(400).json({ error: 'action and result are required' });
    return;
  }

  try {
    const validation = await validator.validatePost({
      action,
      result,
      userId
    });

    res.json({
      compliant: validation.compliant,
      violations: validation.violations,
      auditRecord: validation.auditRecord
    });
  } catch (error) {
    console.error('Post-validation error:', error);
    res.status(500).json({ error: 'Validation failed' });
  }
});

/**
 * GET /rules
 * List all active constitutional rules
 */
app.get('/rules', (req, res) => {
  const rules = validator.getRules();
  res.json({ rules });
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'constitutional-validator' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`⚖️  Constitutional Validator listening on port ${port}`);
  });
}

export default app;
