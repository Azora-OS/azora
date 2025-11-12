import { AzoraClient } from '../client';

describe('AzoraClient', () => {
  let client: AzoraClient;

  beforeEach(() => {
    client = new AzoraClient({
      apiKey: 'test-api-key',
      environment: 'development',
      debug: false
    });
  });

  test('should initialize with config', () => {
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.education).toBeDefined();
    expect(client.payment).toBeDefined();
    expect(client.safety).toBeDefined();
  });

  test('should have all services', () => {
    expect(typeof client.auth.login).toBe('function');
    expect(typeof client.education.getCourses).toBe('function');
    expect(typeof client.payment.getBalance).toBe('function');
    expect(typeof client.safety.getIncidents).toBe('function');
  });

  test('should set auth tokens', () => {
    expect(() => {
      client.setAuthToken('access-token', 'refresh-token');
    }).not.toThrow();
  });

  test('should clear auth', () => {
    expect(() => {
      client.clearAuth();
    }).not.toThrow();
  });
});
