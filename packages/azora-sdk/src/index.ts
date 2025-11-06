/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA SDK - Main Entry Point
 * 
 * The official TypeScript/JavaScript SDK for Azora OS platform
 * 
 * @example
 * ```typescript
 * import { AzoraClient } from '@azora/sdk';
 * 
 * const client = new AzoraClient({
 *   apiKey: 'your-api-key',
 *   environment: 'production'
 * });
 * 
 * // Use the client
 * const courses = await client.education.listCourses();
 * ```
 */

export * from './api';
export * from './auth';
export * from './types';
export * from './utils';

import { AzoraAPIClient } from './api/client';
import type { AzoraSDKConfig } from './types';

/**
 * Main Azora SDK Client
 */
export class AzoraClient {
  private config: AzoraSDKConfig;
  public api: AzoraAPIClient;

  constructor(config: AzoraSDKConfig) {
    this.config = {
      environment: 'production',
      ...config
    };

    this.api = new AzoraAPIClient(this.config);
  }

  /**
   * Education APIs
   */
  get education() {
    return this.api.education;
  }

  /**
   * Payment APIs
   */
  get payments() {
    return this.api.payments;
  }

  /**
   * Auth APIs
   */
  get auth() {
    return this.api.auth;
  }

  /**
   * Retail AI APIs
   */
  get retailAI() {
    return this.api.retailAI;
  }

  /**
   * Cold Chain APIs
   */
  get coldChain() {
    return this.api.coldChain;
  }

  /**
   * Community Safety APIs
   */
  get safety() {
    return this.api.safety;
  }

  /**
   * Arbiter System APIs
   */
  get arbiter() {
    return this.api.arbiter;
  }

  /**
   * Update SDK configuration
   */
  updateConfig(newConfig: Partial<AzoraSDKConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.api.updateConfig(this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AzoraSDKConfig {
    return { ...this.config };
  }
}

/**
 * Create a new Azora SDK client instance
 */
export function createClient(config: AzoraSDKConfig): AzoraClient {
  return new AzoraClient(config);
}

// Default export
export default AzoraClient;
