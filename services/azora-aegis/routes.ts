import { Router } from 'express';
import { detectThreat, isIPBlocked, unblockIP, getBlockedIPs } from './src/threat-detection';
import { securityMonitor } from './src/security-monitoring';

const router = Router();

// Security metrics endpoint
router.get('/metrics', (req, res) => {
  res.json(securityMonitor.getMetrics());
});

// Blocked IPs endpoint
router.get('/blocked-ips', (req, res) => {
  res.json({ blockedIPs: getBlockedIPs() });
});

// Unblock IP endpoint
router.post('/unblock-ip', (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ error: 'IP address required' });
  }
  unblockIP(ip);
  res.json({ success: true, message: `IP ${ip} unblocked` });
});

// Report threat endpoint
router.post('/report-threat', async (req, res) => {
  const { ip, type, severity, details } = req.body;
  
  if (!ip || !type || !severity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const blocked = await detectThreat({ ip, type, severity, details });
  
  res.json({ 
    success: true, 
    blocked,
    message: blocked ? 'Threat blocked' : 'Threat logged'
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-aegis' });
});

export default router;
