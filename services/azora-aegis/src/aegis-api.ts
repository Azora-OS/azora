/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';
import aegisPremium from './aegis-premium';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ACTIVE', service: 'Aegis Premium', version: '3.0.0' });
});

// Security scan endpoint
app.post('/api/security/scan', async (req, res) => {
  try {
    const { target } = req.body;
    const result = await aegisPremium.performSecurityScan(target);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Threat analysis
app.post('/api/security/threat-analysis', async (req, res) => {
  try {
    const { target } = req.body;
    const result = await aegisPremium.performSecurityScan(target);
    res.json({ success: true, threats: result.threats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Constitutional compliance check
app.post('/api/security/compliance', async (req, res) => {
  try {
    const { action, context } = req.body;
    const result = await aegisPremium.validateConstitutionalAdherence(action, context);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real-time monitoring
app.get('/api/security/monitor/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await aegisPremium.monitorRealtime(userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Penetration testing
app.post('/api/security/pentest', async (req, res) => {
  try {
    const { endpoint } = req.body;
    const result = await aegisPremium.performPenetrationTest(endpoint);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Security metrics
app.get('/api/security/metrics', async (req, res) => {
  try {
    const metrics = await aegisPremium.getSecurityMetrics();
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Encrypt data
app.post('/api/security/encrypt', async (req, res) => {
  try {
    const { data } = req.body;
    const encrypted = await aegisPremium.encryptSensitiveData(data);
    res.json({ success: true, encrypted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => {
  console.log(`🛡️ Aegis Premium Security Service running on port ${PORT}`);
});

export default app;
