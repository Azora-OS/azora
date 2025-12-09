import { PermissionManager } from './PermissionManager';
import { AuditLogger } from './AuditLogger';
import { InputValidator } from './InputValidator';
import { SecureErrorHandler } from './SecureErrorHandler';
import { SecurityConfig } from '../security.config';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

/**
 * Network request options
 */
export interface NetworkRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

/**
 * Network response
 */
export interface NetworkResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  duration: number;
}

/**
 * Network request metadata
 */
interface RequestMetadata {
  url: string;
  method: string;
  timestamp: Date;
  duration?: number;
  statusCode?: number;
  error?: string;
}

/**
 * NetworkSandbox provides a secure layer for all network requests made by AzStudio.
 * It enforces domain allowlisting, monitors network activity, and logs all requests
 * for audit purposes.
 * 
 * Features:
 * - Domain allowlist enforcement
 * - Permission prompts for unknown domains
 * - Request/response logging
 * - Network activity monitoring
 * - Rate limiting per domain
 * - Request timeout enforcement
 */
export class NetworkSandbox {
  private static readonly DEFAULT_TIMEOUT = SecurityConfig.timeouts.network;
  private static readonly MAX_REQUESTS_PER_MINUTE = SecurityConfig.rateLimit.network.requestsPerMinute;

  private permissionManager: PermissionManager;
  private auditLogger: AuditLogger;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private activeRequests: Map<string, RequestMetadata> = new Map();

  constructor(permissionManager: PermissionManager, auditLogger: AuditLogger) {
    this.permissionManager = permissionManager;
    this.auditLogger = auditLogger;
  }

  /**
   * Make a network request with sandboxing
   */
  async request(url: string, options: NetworkRequestOptions = {}): Promise<NetworkResponse> {
    const startTime = Date.now();
    
    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = InputValidator.validateUrl(url);
    } catch (error) {
      const errorMsg = SecureErrorHandler.handle(error as Error, {
        operation: 'network:request',
        resource: url,
        timestamp: new Date(),
      });
      throw new Error(errorMsg);
    }
    
    const domain = parsedUrl.hostname;
    const method = options.method || 'GET';

    // Check if domain is allowed
    const allowed = await this.permissionManager.isNetworkAllowed(domain);
    if (!allowed) {
      await this.auditLogger.logNetworkRequest(url, method, {
        success: false,
        errorMessage: 'Domain not allowed',
      });
      throw new Error(`Network request to ${domain} is not allowed`);
    }

    // Check rate limiting
    if (!this.checkRateLimit(domain)) {
      await this.auditLogger.logNetworkRequest(url, method, {
        success: false,
        errorMessage: 'Rate limit exceeded',
      });
      throw new Error(`Rate limit exceeded for ${domain}`);
    }

    // Track active request
    const requestId = `${Date.now()}-${Math.random()}`;
    this.activeRequests.set(requestId, {
      url,
      method,
      timestamp: new Date(),
    });

    try {
      // Make the request
      const response = await this.makeRequest(url, options);
      
      const duration = Date.now() - startTime;

      // Update request metadata
      const metadata = this.activeRequests.get(requestId);
      if (metadata) {
        metadata.duration = duration;
        metadata.statusCode = response.statusCode;
      }

      // Log successful request
      await this.auditLogger.logNetworkRequest(url, method, {
        duration,
        statusCode: response.statusCode,
        success: true,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = (error as Error).message;

      // Update request metadata
      const metadata = this.activeRequests.get(requestId);
      if (metadata) {
        metadata.duration = duration;
        metadata.error = errorMessage;
      }

      // Log failed request
      await this.auditLogger.logNetworkRequest(url, method, {
        duration,
        success: false,
        errorMessage,
      });

      throw error;
    } finally {
      // Remove from active requests
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Make a GET request
   */
  async get(url: string, options: Omit<NetworkRequestOptions, 'method'> = {}): Promise<NetworkResponse> {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post(url: string, body: string, options: Omit<NetworkRequestOptions, 'method' | 'body'> = {}): Promise<NetworkResponse> {
    return this.request(url, { ...options, method: 'POST', body });
  }

  /**
   * Make a PUT request
   */
  async put(url: string, body: string, options: Omit<NetworkRequestOptions, 'method' | 'body'> = {}): Promise<NetworkResponse> {
    return this.request(url, { ...options, method: 'PUT', body });
  }

  /**
   * Make a DELETE request
   */
  async delete(url: string, options: Omit<NetworkRequestOptions, 'method'> = {}): Promise<NetworkResponse> {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Get active network requests
   */
  getActiveRequests(): RequestMetadata[] {
    return Array.from(this.activeRequests.values());
  }

  /**
   * Get network activity statistics
   */
  getStatistics(): {
    activeRequests: number;
    requestsByDomain: Record<string, number>;
  } {
    const requestsByDomain: Record<string, number> = {};

    for (const metadata of this.activeRequests.values()) {
      try {
        const domain = new URL(metadata.url).hostname;
        requestsByDomain[domain] = (requestsByDomain[domain] || 0) + 1;
      } catch {
        // Invalid URL, skip
      }
    }

    return {
      activeRequests: this.activeRequests.size,
      requestsByDomain,
    };
  }

  /**
   * Block a domain
   */
  async blockDomain(domain: string, reason?: string): Promise<void> {
    await this.permissionManager.addToNetworkAllowlist(domain, false, reason);
    await this.auditLogger.log('network:request', 'Domain blocked', domain, {
      severity: 'warning',
      details: { reason },
    });
  }

  /**
   * Unblock a domain
   */
  async unblockDomain(domain: string, reason?: string): Promise<void> {
    await this.permissionManager.addToNetworkAllowlist(domain, true, reason);
    await this.auditLogger.log('network:request', 'Domain unblocked', domain, {
      severity: 'info',
      details: { reason },
    });
  }

  /**
   * Check rate limit for domain
   */
  private checkRateLimit(domain: string): boolean {
    const now = Date.now();
    const entry = this.requestCounts.get(domain);

    if (!entry || now >= entry.resetTime) {
      // Reset counter
      this.requestCounts.set(domain, {
        count: 1,
        resetTime: now + 60000, // Reset after 1 minute
      });
      return true;
    }

    if (entry.count >= NetworkSandbox.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Make the actual HTTP/HTTPS request
   */
  private makeRequest(url: string, options: NetworkRequestOptions): Promise<NetworkResponse> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || NetworkSandbox.DEFAULT_TIMEOUT,
      };

      const startTime = Date.now();

      const req = client.request(requestOptions, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk.toString();
        });

        res.on('end', () => {
          const duration = Date.now() - startTime;
          
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body,
            duration,
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }
}
