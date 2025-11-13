/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

🛡️ AEGIS PREMIUM - Constitutional Security System
*/

import express from 'express';
import cors from 'cors';
import aegisPremium from './aegis-premium';
import threatIntelligence from './threat-intelligence';
import constitutionalGuardian from './constitutional-guardian';
import incidentResponse from './incident-response';

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ACTIVE', 
    service: 'Aegis Premium Security', 
    version: '3.0.0',
    motto: 'My security ensures our freedom'
  });
});

// Security Scans
app.post('/api/security/scan', async (req, res) => {
  try {
    const result = await aegisPremium.performSecurityScan(req.body.target);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Threat Intelligence
app.post('/api/threats/detect', async (req, res) => {
  try {
    const result = threatIntelligence.detectThreats(req.body.input);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/threats/analyze-pattern', async (req, res) => {
  try {
    const result = await threatIntelligence.analyzePattern(req.body.data);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Constitutional Compliance
app.post('/api/constitutional/validate', async (req, res) => {
  try {
    const { action, context } = req.body;
    const result = constitutionalGuardian.validateAction(action, context);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/constitutional/enforce', async (req, res) => {
  try {
    const { action, context } = req.body;
    const result = constitutionalGuardian.enforceConstitution(action, context);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/constitutional/principles', (req, res) => {
  const principles = constitutionalGuardian.getConstitutionalPrinciples();
  res.json({ success: true, data: principles });
});

app.post('/api/constitutional/audit', async (req, res) => {
  try {
    const result = await constitutionalGuardian.auditCompliance(req.body.actions);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Incident Response
app.post('/api/incidents/detect', async (req, res) => {
  try {
    const { type, data } = req.body;
    const result = await incidentResponse.detectIncident(type, data);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/incidents/:id/investigate', async (req, res) => {
  try {
    const result = await incidentResponse.investigate(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/incidents/:id/contain', async (req, res) => {
  try {
    const result = await incidentResponse.contain(req.params.id, req.body.actions);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/incidents/:id/resolve', async (req, res) => {
  try {
    const result = await incidentResponse.resolve(req.params.id, req.body.resolution);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/incidents/active', (req, res) => {
  const incidents = incidentResponse.getActiveIncidents();
  res.json({ success: true, data: incidents });
});

app.get('/api/incidents/stats', async (req, res) => {
  try {
    const stats = await incidentResponse.getIncidentStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Monitoring
app.get('/api/monitor/:userId', async (req, res) => {
  try {
    const result = await aegisPremium.monitorRealtime(req.params.userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Penetration Testing
app.post('/api/pentest', async (req, res) => {
  try {
    const result = await aegisPremium.performPenetrationTest(req.body.endpoint);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await aegisPremium.getSecurityMetrics();
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Encryption
app.post('/api/encrypt', async (req, res) => {
  try {
    const encrypted = await aegisPremium.encryptSensitiveData(req.body.data);
    res.json({ success: true, encrypted });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => {
  console.log(`
🛡️  AEGIS PREMIUM SECURITY SYSTEM ACTIVATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${PORT}
Status: ACTIVE
Version: 3.0.0
Motto: "My security ensures our freedom"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
