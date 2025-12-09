/**
 * InputValidator - Centralized input validation and sanitization
 * Prevents injection attacks, path traversal, and other input-based vulnerabilities
 */

import * as path from 'path';

export class InputValidator {
  private static readonly MAX_STRING_LENGTH = 10000;
  private static readonly MAX_PATH_LENGTH = 4096;
  private static readonly MAX_URL_LENGTH = 2048;

  /**
   * Validate and sanitize file path
   */
  static validatePath(inputPath: string, allowedBase?: string): string {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Invalid path: must be a non-empty string');
    }

    if (inputPath.length > this.MAX_PATH_LENGTH) {
      throw new Error(`Path too long: maximum ${this.MAX_PATH_LENGTH} characters`);
    }

    // Normalize path to prevent traversal
    const normalized = path.normalize(inputPath);

    // Check for path traversal attempts
    if (normalized.includes('..')) {
      throw new Error('Path traversal detected');
    }

    // If allowedBase specified, ensure path is within it
    if (allowedBase) {
      const resolvedPath = path.resolve(normalized);
      const resolvedBase = path.resolve(allowedBase);
      
      if (!resolvedPath.startsWith(resolvedBase)) {
        throw new Error('Path outside allowed directory');
      }
    }

    return normalized;
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string): URL {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL: must be a non-empty string');
    }

    if (url.length > this.MAX_URL_LENGTH) {
      throw new Error(`URL too long: maximum ${this.MAX_URL_LENGTH} characters`);
    }

    try {
      const parsed = new URL(url);
      
      // Only allow http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol: only HTTP and HTTPS allowed');
      }

      return parsed;
    } catch (error) {
      throw new Error(`Invalid URL format: ${(error as Error).message}`);
    }
  }

  /**
   * Validate string input
   */
  static validateString(input: string, maxLength: number = this.MAX_STRING_LENGTH): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    if (input.length > maxLength) {
      throw new Error(`String too long: maximum ${maxLength} characters`);
    }

    return input;
  }

  /**
   * Sanitize for SQL (basic - use parameterized queries instead)
   */
  static sanitizeSql(input: string): string {
    return input.replace(/['";\\]/g, '');
  }

  /**
   * Sanitize for shell commands
   */
  static sanitizeShell(input: string): string {
    // Remove dangerous characters
    return input.replace(/[;&|`$(){}[\]<>]/g, '');
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate domain name
   */
  static validateDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
    return domainRegex.test(domain) && domain.length <= 253;
  }

  /**
   * Validate JSON string
   */
  static validateJson(input: string): any {
    try {
      return JSON.parse(input);
    } catch {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Validate integer within range
   */
  static validateInteger(input: any, min?: number, max?: number): number {
    const num = parseInt(input, 10);
    
    if (isNaN(num)) {
      throw new Error('Invalid integer');
    }

    if (min !== undefined && num < min) {
      throw new Error(`Value must be at least ${min}`);
    }

    if (max !== undefined && num > max) {
      throw new Error(`Value must be at most ${max}`);
    }

    return num;
  }

  /**
   * Validate file size
   */
  static validateFileSize(size: number, maxSize: number): void {
    if (size > maxSize) {
      throw new Error(`File too large: maximum ${maxSize} bytes`);
    }
  }
}
