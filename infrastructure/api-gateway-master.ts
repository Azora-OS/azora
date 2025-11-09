/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

interface ServiceRoute {
  path: string;
  target: string;
  port: number;
}

const AZORA_SERVICES: ServiceRoute[] = [
  { path: '/api/education', target: 'http://localhost:3001', port: 3001 },
  { path: '/api/mint', target: 'http://localhost:3002', port: 3002 },
  { path: '/api/forge', target: 'http://localhost:3003', port: 3003 },
  { path: '/api/retail-ai', target: 'http://localhost:3020', port: 3020 },
  { path: '/api/cold-chain', target: 'http://localhost:3021', port: 3021 },
  { path: '/api/safety', target: 'http://localhost:3022', port: 3022 },
  { path: '/api/arbiter', target: 'http://localhost:3025', port: 3025 },
];

export class AzoraAPIGateway {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // CORS
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // Rate limiting
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP'
    }));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  private setupRoutes() {
    AZORA_SERVICES.forEach(service => {
      this.app.use(service.path, createProxyMiddleware({
        target: service.target,
        changeOrigin: true,
        pathRewrite: { [`^${service.path}`]: '' },
        onError: (err, req, res) => {
          console.error(`Proxy error for ${service.path}:`, err);
          res.status(503).json({ error: 'Service unavailable' });
        }
      }));
    });
  }

  start(port = 8080) {
    this.app.listen(port, () => {
      console.log(`🚀 Azora API Gateway running on port ${port}`);
      console.log(`📡 Proxying ${AZORA_SERVICES.length} services`);
    });
  }
}

export const gateway = new AzoraAPIGateway();