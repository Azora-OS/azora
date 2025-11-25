import { NetworkSandbox } from '../NetworkSandbox';
import { PermissionManager } from '../PermissionManager';
import { AuditLogger } from '../AuditLogger';
import * as https from 'https';
import * as http from 'http';

// Mock dependencies
jest.mock('../PermissionManager');
jest.mock('../AuditLogger');
jest.mock('https');
jest.mock('http');

describe('NetworkSandbox', () => {
  let networkSandbox: NetworkSandbox;
  let mockPermissionManager: jest.Mocked<PermissionManager>;
  let mockAuditLogger: jest.Mocked<AuditLogger>;

  beforeEach(() => {
    mockPermissionManager = new PermissionManager() as jest.Mocked<PermissionManager>;
    mockAuditLogger = new AuditLogger() as jest.Mocked<AuditLogger>;
    
    networkSandbox = new NetworkSandbox(mockPermissionManager, mockAuditLogger);

    // Mock permission manager methods
    mockPermissionManager.isNetworkAllowed = jest.fn().mockResolvedValue(true);
    mockPermissionManager.addToNetworkAllowlist = jest.fn().mockResolvedValue(undefined);

    // Mock audit logger methods
    mockAuditLogger.logNetworkRequest = jest.fn().mockResolvedValue(undefined);
    mockAuditLogger.log = jest.fn().mockResolvedValue(undefined);
  });

  describe('request', () => {
    it('should check if domain is allowed before making request', async () => {
      mockPermissionManager.isNetworkAllowed.mockResolvedValue(false);

      await expect(
        networkSandbox.request('https://blocked-domain.com')
      ).rejects.toThrow('not allowed');

      expect(mockPermissionManager.isNetworkAllowed).toHaveBeenCalledWith('blocked-domain.com');
    });

    it('should log denied requests', async () => {
      mockPermissionManager.isNetworkAllowed.mockResolvedValue(false);

      try {
        await networkSandbox.request('https://blocked-domain.com');
      } catch {
        // Expected to throw
      }

      expect(mockAuditLogger.logNetworkRequest).toHaveBeenCalledWith(
        'https://blocked-domain.com',
        'GET',
        expect.objectContaining({
          success: false,
          errorMessage: 'Domain not allowed',
        })
      );
    });

    it('should enforce rate limiting', async () => {
      // Mock successful requests
      const mockRequest = jest.fn((options, callback) => {
        const mockResponse = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from('test'));
            } else if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockResponse);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
      });

      (https.request as jest.Mock).mockImplementation(mockRequest);

      // Make 61 requests (exceeds limit of 60 per minute)
      const requests = [];
      for (let i = 0; i < 61; i++) {
        requests.push(
          networkSandbox.request('https://api.example.com/test').catch(() => null)
        );
      }

      await Promise.all(requests);

      // At least one request should have been rate limited
      const rateLimitedCalls = (mockAuditLogger.logNetworkRequest as jest.Mock).mock.calls.filter(
        call => call[2]?.errorMessage === 'Rate limit exceeded'
      );
      
      expect(rateLimitedCalls.length).toBeGreaterThan(0);
    });

    it('should track active requests', async () => {
      const mockRequest = jest.fn((options, callback) => {
        // Don't call callback immediately to keep request active
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
      });

      (https.request as jest.Mock).mockImplementation(mockRequest);

      // Start a request but don't await it
      const requestPromise = networkSandbox.request('https://api.example.com/test');

      // Check active requests
      const activeRequests = networkSandbox.getActiveRequests();
      expect(activeRequests.length).toBeGreaterThan(0);
      expect(activeRequests[0].url).toBe('https://api.example.com/test');
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      const mockRequest = jest.fn((options, callback) => {
        const mockResponse = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from('test'));
            } else if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockResponse);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
      });

      (https.request as jest.Mock).mockImplementation(mockRequest);
    });

    it('should make GET request', async () => {
      const response = await networkSandbox.get('https://api.example.com/data');
      
      expect(response.statusCode).toBe(200);
      expect(mockAuditLogger.logNetworkRequest).toHaveBeenCalledWith(
        'https://api.example.com/data',
        'GET',
        expect.any(Object)
      );
    });

    it('should make POST request', async () => {
      const response = await networkSandbox.post('https://api.example.com/data', '{"test": true}');
      
      expect(response.statusCode).toBe(200);
      expect(mockAuditLogger.logNetworkRequest).toHaveBeenCalledWith(
        'https://api.example.com/data',
        'POST',
        expect.any(Object)
      );
    });

    it('should make PUT request', async () => {
      const response = await networkSandbox.put('https://api.example.com/data', '{"test": true}');
      
      expect(response.statusCode).toBe(200);
      expect(mockAuditLogger.logNetworkRequest).toHaveBeenCalledWith(
        'https://api.example.com/data',
        'PUT',
        expect.any(Object)
      );
    });

    it('should make DELETE request', async () => {
      const response = await networkSandbox.delete('https://api.example.com/data');
      
      expect(response.statusCode).toBe(200);
      expect(mockAuditLogger.logNetworkRequest).toHaveBeenCalledWith(
        'https://api.example.com/data',
        'DELETE',
        expect.any(Object)
      );
    });
  });

  describe('domain blocking', () => {
    it('should block a domain', async () => {
      await networkSandbox.blockDomain('malicious.com', 'Security threat');

      expect(mockPermissionManager.addToNetworkAllowlist).toHaveBeenCalledWith(
        'malicious.com',
        false,
        'Security threat'
      );

      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        'network:request',
        'Domain blocked',
        'malicious.com',
        expect.objectContaining({
          severity: 'warning',
        })
      );
    });

    it('should unblock a domain', async () => {
      await networkSandbox.unblockDomain('safe.com', 'Verified safe');

      expect(mockPermissionManager.addToNetworkAllowlist).toHaveBeenCalledWith(
        'safe.com',
        true,
        'Verified safe'
      );

      expect(mockAuditLogger.log).toHaveBeenCalledWith(
        'network:request',
        'Domain unblocked',
        'safe.com',
        expect.objectContaining({
          severity: 'info',
        })
      );
    });
  });

  describe('statistics', () => {
    it('should return network activity statistics', () => {
      const stats = networkSandbox.getStatistics();
      
      expect(stats).toHaveProperty('activeRequests');
      expect(stats).toHaveProperty('requestsByDomain');
      expect(typeof stats.activeRequests).toBe('number');
      expect(typeof stats.requestsByDomain).toBe('object');
    });

    it('should track requests by domain', async () => {
      const mockRequest = jest.fn((options, callback) => {
        // Keep request active
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
      });

      (https.request as jest.Mock).mockImplementation(mockRequest);

      // Start multiple requests
      networkSandbox.request('https://api1.example.com/test');
      networkSandbox.request('https://api1.example.com/test2');
      networkSandbox.request('https://api2.example.com/test');

      const stats = networkSandbox.getStatistics();
      expect(stats.activeRequests).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle request errors', async () => {
      const mockRequest = jest.fn(() => {
        const req = {
          on: jest.fn((event, handler) => {
            if (event === 'error') {
              handler(new Error('Network error'));
            }
          }),
          write: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
        return req;
      });

      (https.request as jest.Mock).mockImplementation(mockRequest);

      await expect(
        networkSandbox.request('https://api.example.com/test')
      ).rejects.toThrow('Network error');

      expect(mockAuditLogger.logNetworkRequest).toHaveBeenCalledWith(
        'https://api.example.com/test',
        'GET',
        expect.objectContaining({
          success: false,
          errorMessage: 'Network error',
        })
      );
    });

    it('should handle request timeout', async () => {
      const mockRequest = jest.fn(() => {
        const req = {
          on: jest.fn((event, handler) => {
            if (event === 'timeout') {
              handler();
            }
          }),
          write: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
        return req;
      });

      (https.request as jest.Mock).mockImplementation(mockRequest);

      await expect(
        networkSandbox.request('https://api.example.com/test')
      ).rejects.toThrow('Request timeout');
    });
  });

  describe('request logging', () => {
    beforeEach(() => {
      const mockRequest = jest.fn((options, callback) => {
        const mockResponse = {
          statusCode: 200,
          headers: {},
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from('test'));
            } else if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockResponse);
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn(),
        };
      });

      (https.request as jest.Mock).mockImplementation(mockRequest);
    });

    it('should log successful requests', async () => {
      await networkSandbox.request('https://api.example.com/test');

      expect(mockAuditLogger.logNetworkRequest).toHaveBeenCalledWith(
        'https://api.example.com/test',
        'GET',
        expect.objectContaining({
          success: true,
          statusCode: 200,
          duration: expect.any(Number),
        })
      );
    });

    it('should include request duration in logs', async () => {
      await networkSandbox.request('https://api.example.com/test');

      const logCall = (mockAuditLogger.logNetworkRequest as jest.Mock).mock.calls[0];
      expect(logCall[2].duration).toBeGreaterThanOrEqual(0);
    });
  });
});
