/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Education Services Package Dependencies
 * 
 * Unified package.json with all required dependencies
 */

export const educationServicesDependencies = {
  // Core dependencies
  express: '^4.18.2',
  cors: '^2.8.5',
  helmet: '^7.1.0',
  
  // Database
  mongoose: '^8.0.3',
  
  // Authentication
  jsonwebtoken: '^9.0.2',
  '@types/jsonwebtoken': '^9.0.5',
  
  // PDF Generation
  'pdf-lib': '^1.17.1',
  
  // File Upload
  multer: '^1.4.5-lts.1',
  '@types/multer': '^1.4.11',
  
  // WebSocket (for real-time)
  'socket.io': '^4.6.0',
  'socket.io-client': '^4.6.0',
  
  // Rate Limiting
  'express-rate-limit': '^7.1.5',
  'express-slow-down': '^2.0.1',
  
  // Logging
  winston: '^3.11.0',
  
  // Validation
  zod: '^3.22.4',
  joi: '^17.11.0',
  
  // Utilities
  uuid: '^9.0.1',
  'dotenv': '^16.3.1',
  
  // TypeScript
  typescript: '^5.3.3',
  '@types/node': '^20.10.0',
  '@types/express': '^4.17.21',
  '@types/cors': '^2.8.17',
  'tsx': '^4.7.0',
  
  // Development
  '@types/uuid': '^9.0.7',
  nodemon: '^3.0.2',
};
