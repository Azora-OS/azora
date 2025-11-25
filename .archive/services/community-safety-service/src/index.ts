/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Application } from 'express';
import cors from 'cors';
import { incidentReporting } from './services/incident-reporting';

const app: Application = express();
const PORT = process.env.COMMUNITY_SAFETY_PORT || 3022;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'community-safety-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.post('/api/v1/incidents', async (req, res) => {
  try {
    const incident = await incidentReporting.reportIncident(req.body);
    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/incidents/area', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const incidents = await incidentReporting.getIncidentsByArea(
      { latitude: Number(latitude), longitude: Number(longitude) },
      Number(radius) || 5
    );
    res.json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.patch('/api/v1/incidents/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await incidentReporting.updateIncidentStatus(id, status);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🛡️  Community Safety Service running on port ${PORT}`);
  });
}

export { app, incidentReporting };
