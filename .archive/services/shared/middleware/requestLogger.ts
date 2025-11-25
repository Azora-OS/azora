/**
 * Shared Request Logger Middleware
 * 
 * PRODUCTION-GRADE request logging
 * Use in all Express services
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const logger = new Logger('RequestLogger');

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate request ID
  const requestId = uuidv4();
  (req as any).requestId = requestId;

  // Log incoming request
  const startTime = Date.now();
  
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    const logMethod = level === 'warn' ? logger.warn.bind(logger) : logger.info.bind(logger);
    
    logMethod('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
