/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

INFRASTRUCTURE MIDDLEWARE
Express middleware for CDN routing and infrastructure integration
*/

import { Request, Response, NextFunction } from 'express';
import { africaCDN } from '@azora/shared-infrastructure/africa-cdn';
import { riverFlows } from '@azora/shared-infrastructure/river-flows';

/**
 * CDN Routing Middleware
 * Routes static assets through Africa-First CDN
 */
export function cdnRoutingMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check if request is for static assets
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2'];
  const isStaticAsset = staticExtensions.some(ext => req.path.endsWith(ext));

  if (isStaticAsset) {
    const region = req.headers['x-region'] as string || req.query.region as string;
    const cdnUrl = africaCDN.getAssetURL(req.path, region);
    
    // Set CDN headers
    res.setHeader('X-CDN-Node', cdnUrl);
    res.setHeader('X-CDN-Region', region || 'auto');
    
    // Optionally redirect to CDN
    if (process.env.CDN_REDIRECT === 'true') {
      return res.redirect(302, cdnUrl);
    }
  }

  next();
}

/**
 * River Flow Middleware
 * Tracks data flows through rivers
 */
export function riverFlowMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Determine flow type based on route
  let flowId = 'system-events-river';
  if (req.path.includes('/api/user') || req.path.includes('/api/activity')) {
    flowId = 'user-activity-river';
  } else if (req.path.includes('/api/lms') || req.path.includes('/api/learning')) {
    flowId = 'learning-progress-river';
  } else if (req.path.includes('/api/wallet') || req.path.includes('/api/transaction')) {
    flowId = 'financial-transactions-river';
  } else if (req.path.includes('/api/ai') || req.path.includes('/api/insight')) {
    flowId = 'ai-insights-river';
  }

  // Track request
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    riverFlows.emit('river-flow', {
      flowId,
      data: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
      },
      timestamp: new Date(),
      priority: 'medium',
    });
  });

  next();
}

/**
 * Infrastructure Health Middleware
 * Adds infrastructure status to response headers
 */
export async function infrastructureHealthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cdnStatus = africaCDN.getNetworkStatus();
    const riverStatus = riverFlows.getNetworkStatus();
    
    res.setHeader('X-Infrastructure-CDN-Healthy', cdnStatus.healthyNodes.toString());
    res.setHeader('X-Infrastructure-Rivers-Flowing', riverStatus.flowingFlows.toString());
  } catch (error) {
    // Fail silently - don't break request
  }

  next();
}

export default {
  cdnRoutingMiddleware,
  riverFlowMiddleware,
  infrastructureHealthMiddleware,
};
