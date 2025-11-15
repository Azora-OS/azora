import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestTotal, activeConnections } from './metrics';
import { logger } from './logger';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  activeConnections.inc();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({ method: req.method, route, status_code: res.statusCode });
    activeConnections.dec();
    
    logger.info('HTTP Request', {
      method: req.method,
      route,
      status: res.statusCode,
      duration: `${duration}s`
    });
  });

  next();
};
