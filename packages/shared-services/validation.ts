/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

VALIDATION LAYER
Provides request/response validation for all API endpoints
*/

import { z } from 'zod';

/**
 * Validation Layer
 * Provides schema validation for API requests and responses
 */
export class ValidationLayer {
  /**
   * Validate request body
   */
  static validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Request validation failed', error.errors);
      }
      throw error;
    }
  }

  /**
   * Validate response data
   */
  static validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Response validation failed', error.errors);
      }
      throw error;
    }
  }

  /**
   * Create validation middleware
   */
  static createValidator<T>(schema: z.ZodSchema<T>) {
    return (req: any, res: any, next: any) => {
      try {
        req.validated = this.validateRequest(schema, req.body);
        next();
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: error.message,
          details: error.details,
        });
      }
    };
  }
}

/**
 * Validation Error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public details: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Common validation schemas
export const CommonSchemas = {
  userId: z.string().uuid(),
  email: z.string().email(),
  pagination: z.object({
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0),
  }),
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

export default ValidationLayer;
