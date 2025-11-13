import { AzoraApiClient } from './index';

describe('AzoraApiClient', () => {
  let client: AzoraApiClient;

  beforeEach(() => {
    client = new AzoraApiClient({ baseUrl: 'http://localhost:4000' });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should initialize with default config', () => {
    expect(client).toBeDefined();
  });

  it('should set auth token', () => {
    client.setAuthToken('test-token');
    expect(client['headers']['Authorization']).toBe('Bearer test-token');
  });

  describe('Education API', () => {
    it('should get students', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ students: [] })
      });

      await client.education.getStudents();
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/students',
        expect.any(Object)
      );
    });
  });

  describe('Billing API', () => {
    it('should get subscription plans', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ plans: [] })
      });

      await client.billing.getPlans();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Earnings API', () => {
    it('should get student earnings', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ earnings: [] })
      });

      await client.earnings.getEarnings('student-123');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/earnings/student-123',
        expect.any(Object)
      );
    });

    it('should request withdrawal', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      await client.earnings.requestWithdrawal('student-123', 100, 'bank');
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
