import express from 'express';
import { ConstitutionalFilter } from '../src/index';
import ConstitutionalAuditController from '../src/audit-controller';

const app = express();
app.use(express.json());

const filter = new ConstitutionalFilter();
const auditController = new ConstitutionalAuditController();

// Main analysis endpoint
app.post('/api/constitutional-ai/analyze', async (req, res) => {
  try {
    const { content, action, userId } = req.body;
    
    const result = await filter.validatePrinciples(content, action);
    
    // Create audit record
    await auditController.createAuditRecord({
      content,
      action,
      result,
      userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit endpoints
app.get('/api/constitutional-ai/audit', async (req, res) => {
  try {
    const query = {
      userId: req.query.userId as string,
      compliant: req.query.compliant === 'true' ? true : req.query.compliant === 'false' ? false : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };
    
    const result = await auditController.queryAuditRecords(query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { app };
