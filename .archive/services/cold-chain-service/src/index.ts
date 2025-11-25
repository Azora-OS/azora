/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Application } from 'express';
import cors from 'cors';
import { monitoringEngine } from './services/monitoring-engine';

const app: Application = express();
const PORT = process.env.COLD_CHAIN_PORT || 3021;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'cold-chain-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.post('/api/v1/shipments/:id/monitor', async (req, res) => {
  try {
    const { id } = req.params;
    await monitoringEngine.startShipmentMonitoring(req.body);
    res.json({ success: true, message: 'Monitoring started' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/shipments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await monitoringEngine.getMonitoringStatus(id);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`❄️  Cold Chain Service running on port ${PORT}`);
  });
}

export { app, monitoringEngine };
