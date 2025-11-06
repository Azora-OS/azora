/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Swagger/OpenAPI Configuration
 * 
 * Centralized OpenAPI configuration for API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { readFileSync } from 'fs';
import { join } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let version = '1.0.0';
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
  version = packageJson.version || '1.0.0';
} catch (e) {
  // Fallback if package.json can't be read
}

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Azora OS API',
      version: version || '1.0.0',
      description: 'Azora OS - Quantum-Secure Intelligence Ecosystem API Documentation',
      contact: {
        name: 'Azora ES Support',
        email: 'support@azora.world',
        url: 'https://azora.world',
      },
      license: {
        name: 'AZORA PROPRIETARY LICENSE',
        url: 'https://azora.world/license',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.azora.world',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for service authentication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            code: {
              type: 'string',
              description: 'Error code',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
          required: ['error'],
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
          required: ['success'],
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints',
      },
      {
        name: 'Education',
        description: 'Azora Sapiens education platform',
      },
      {
        name: 'Economics',
        description: 'Azora Mint economic engine',
      },
      {
        name: 'Oracle',
        description: 'Azora Oracle intelligence service',
      },
      {
        name: 'Aegis',
        description: 'Aegis Citadel governance',
      },
      {
        name: 'Health',
        description: 'System health and status',
      },
    ],
  },
  apis: [
    './routes/**/*.js',
    './api/**/*.ts',
    './services/**/routes/**/*.ts',
    './services/**/src/routes/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;


