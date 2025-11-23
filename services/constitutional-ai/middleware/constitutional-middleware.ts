/**
 * Constitutional AI Middleware
 * Express middleware for API Gateway integration
 */

import { Request, Response, NextFunction } from 'express';
import { ConstitutionalOrchestrator } from '../orchestrator';
import { ConstitutionalAIConfig } from '../types';

/**
 * Middleware configuration
 */
export interface ConstitutionalMiddlewareConfig {
  enabled: boolean;
  skipPaths?: string[]; // Paths to skip validation
  skipMethods?: string[]; // HTTP methods to skip
  onViolation?: 'block' | 'warn' | 'log'; // Action on violation
  includeMetadata?: boolean; // Include validation metadata in response
}

/**
 * Default middleware configuration
 */
const DEFAULT_MIDDLEWARE_CONFIG: ConstitutionalMiddlewareConfig = {
  enabled: true,
  skipPaths: ['/health', '/metrics', '/status'],
  skipMethods: ['OPTIONS', 'HEAD'],
  onViolation: 'block',
  includeMetadata: false
};

/**
 * Extended request interface with constitutional validation
 */
export interface ConstitutionalRequest extends Request {
  constitutional?: {
    validated: boolean;
    complianceScore: number;
    violations: any[];
    originalOutput?: string;
    validatedOutput?: string;
  };
}

/**
 * Create constitutional validation middleware
 */
export function createConstitutionalMiddleware(
  orchestrator: ConstitutionalOrchestrator,
  config: Partial<ConstitutionalMiddlewareConfig> = {}
) {
  const middlewareConfig = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config };

  return async (req: ConstitutionalRequest, res: Response, next: NextFunction) => {
    // Skip if middleware is disabled
    if (!middlewareConfig.enabled) {
      return next();
    }

    // Skip certain paths
    if (middlewareConfig.skipPaths?.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Skip certain methods
    if (middlewareConfig.skipMethods?.includes(req.method)) {
      return next();
    }

    // Store original res.json to intercept AI responses
    const originalJson = res.json.bind(res);

    // Override res.json to validate AI outputs
    res.json = function (body: any) {
      // Only validate if response contains AI output
      if (shouldValidateResponse(body)) {
        validateAndRespond(body, req, res, originalJson, orchestrator, middlewareConfig);
      } else {
        return originalJson(body);
      }
    } as any;

    next();
  };
}

/**
 * Determine if response should be validated
 */
function shouldValidateResponse(body: any): boolean {
  // Check if response contains AI-generated content
  return (
    body &&
    typeof body === 'object' &&
    (body.response || body.output || body.message || body.content)
  );
}

/**
 * Validate response and send
 */
async function validateAndRespond(
  body: any,
  req: ConstitutionalRequest,
  res: Response,
  originalJson: Function,
  orchestrator: ConstitutionalOrchestrator,
  config: ConstitutionalMiddlewareConfig
): Promise<any> {
  try {
    // Extract AI output from response
    const output = body.response || body.output || body.message || body.content;
    const query = extractQuery(req);
    const userId = extractUserId(req);
    const tier = body.tier || 'unknown';

    // Validate output
    const startTime = Date.now();
    const result = await orchestrator.validateOutput(query, output);
    const processingTime = Date.now() - startTime;

    // Log validation
    await orchestrator.logValidation(
      result,
      userId,
      query,
      output,
      tier,
      processingTime
    );

    // Attach validation info to request for downstream use
    req.constitutional = {
      validated: true,
      complianceScore: result.complianceScore,
      violations: result.violations,
      originalOutput: output,
      validatedOutput: result.validatedOutput
    };

    // Handle based on validation result and config
    if (!result.isValid) {
      return handleViolation(result, body, req, res, originalJson, config);
    }

    // Replace output with validated version
    if (body.response) {body.response = result.validatedOutput;}
    if (body.output) {body.output = result.validatedOutput;}
    if (body.message) {body.message = result.validatedOutput;}
    if (body.content) {body.content = result.validatedOutput;}

    // Add metadata if configured
    if (config.includeMetadata) {
      body.constitutional = {
        validated: true,
        complianceScore: result.complianceScore,
        violations: result.violations.length,
        processingTime
      };
    }

    return originalJson(body);
  } catch (error) {
    console.error('Constitutional validation error:', error);
    // On error, pass through original response
    return originalJson(body);
  }
}

/**
 * Handle validation violations
 */
function handleViolation(
  result: any,
  body: any,
  req: ConstitutionalRequest,
  res: Response,
  originalJson: Function,
  config: ConstitutionalMiddlewareConfig
) {
  switch (config.onViolation) {
    case 'block':
      // Block the response and return error
      return res.status(400).json({
        error: 'Content validation failed',
        message: 'The generated content does not meet constitutional standards',
        complianceScore: result.complianceScore,
        violations: result.violations.map((v: any) => ({
          type: v.type,
          severity: v.severity,
          description: v.description
        }))
      });

    case 'warn':
      // Send validated output with warning
      if (body.response) {body.response = result.validatedOutput;}
      if (body.output) {body.output = result.validatedOutput;}
      if (body.message) {body.message = result.validatedOutput;}
      if (body.content) {body.content = result.validatedOutput;}

      body.warning = {
        message: 'Content was modified to meet constitutional standards',
        complianceScore: result.complianceScore,
        violationCount: result.violations.length
      };

      return originalJson(body);

    case 'log':
      // Just log and pass through validated output
      console.warn('Constitutional violation detected:', {
        complianceScore: result.complianceScore,
        violations: result.violations.length
      });

      if (body.response) {body.response = result.validatedOutput;}
      if (body.output) {body.output = result.validatedOutput;}
      if (body.message) {body.message = result.validatedOutput;}
      if (body.content) {body.content = result.validatedOutput;}

      return originalJson(body);

    default:
      return originalJson(body);
  }
}

/**
 * Extract query from request
 */
function extractQuery(req: Request): string {
  return (
    req.body?.query ||
    req.body?.prompt ||
    req.body?.message ||
    req.query?.q ||
    ''
  );
}

/**
 * Extract user ID from request
 */
function extractUserId(req: Request): string {
  // Try to get from auth token
  const user = (req as any).user;
  if (user?.id) {return user.id;}
  if (user?.userId) {return user.userId;}

  // Try to get from headers
  const userId = req.headers['x-user-id'] as string;
  if (userId) {return userId;}

  // Fallback to IP address
  return req.ip || 'anonymous';
}

/**
 * Create validation rules configuration middleware
 */
export function createValidationRulesMiddleware(
  orchestrator: ConstitutionalOrchestrator
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Allow dynamic configuration via headers
    const ubuntuThreshold = req.headers['x-ubuntu-threshold'];
    const strictMode = req.headers['x-strict-mode'];

    if (ubuntuThreshold || strictMode) {
      const config: Partial<ConstitutionalAIConfig> = {};

      if (ubuntuThreshold) {
        config.ubuntuThreshold = parseInt(ubuntuThreshold as string, 10);
      }

      if (strictMode) {
        config.strictMode = strictMode === 'true';
      }

      orchestrator.updateConfig(config);
    }

    next();
  };
}

/**
 * Create compliance metrics endpoint middleware
 */
export function createComplianceMetricsMiddleware(
  orchestrator: ConstitutionalOrchestrator
) {
  return async (req: Request, res: Response) => {
    try {
      const metrics = await orchestrator.getComplianceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Failed to get compliance metrics:', error);
      res.status(500).json({
        error: 'Failed to retrieve compliance metrics'
      });
    }
  };
}

/**
 * Create health check middleware for constitutional AI
 */
export function createConstitutionalHealthCheck(
  orchestrator: ConstitutionalOrchestrator
) {
  return async (req: Request, res: Response) => {
    try {
      // Test validation with simple input
      const testResult = await orchestrator.validateOutput(
        'test query',
        'This is a test output for health check'
      );

      res.json({
        status: 'healthy',
        constitutional: {
          enabled: true,
          complianceScore: testResult.complianceScore,
          timestamp: new Date()
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        constitutional: {
          enabled: false,
          error: (error as Error).message,
          timestamp: new Date()
        }
      });
    }
  };
}

/**
 * Export middleware factory
 */
export default createConstitutionalMiddleware;
