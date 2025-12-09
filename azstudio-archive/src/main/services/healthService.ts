import express from 'express';
import { getMetricsService } from '../../vs/workbench/services/azora/metricsService';

export class HealthService {
  private app = express();
  private server: any;
  constructor() {
    this.app.get('/health', (req, res) => res.json({ status: 'ok' }));
    this.app.get('/metrics', (req, res) => res.json(getMetricsService().snapshot()));
  }
  listen(port = 5222) {
    if (this.server) return; this.server = this.app.listen(port);
  }
  close() { if (this.server) { this.server.close(); this.server = null; } }
}

// Start server in dev only if env var set
let hs: HealthService | null = null;
export function startHealthServer(port?: number) {
  if (!hs) { hs = new HealthService(); hs.listen(port || Number(process.env.AZORA_HEALTH_PORT || 5222)); }
  return hs;
}
export function stopHealthServer() { if (hs) { hs.close(); hs = null; } }

export default HealthService;
