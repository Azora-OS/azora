import { AzoraApiClient } from '../index';

describe('AzoraApiClient', () => {
  let client: AzoraApiClient;

  beforeEach(() => {
    client = new AzoraApiClient({ baseUrl: 'http://localhost:4000' });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = { success: true, token: 'test-token', user: { id: '1', email: 'test@test.com' } };
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

      const result = await client.auth.login('test@test.com', 'password');
      expect(result).toEqual(mockResponse);
    });

    it('should set auth token', () => {
      client.setAuthToken('test-token');
      expect((client as any).headers['Authorization']).toBe('Bearer test-token');
    });
  });

  describe('Courses', () => {
    it('should fetch courses', async () => {
      const mockCourses = { success: true, data: [{ id: '1', title: 'Test Course' }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockCourses });

      const result = await client.lms.getCourses();
      expect(result).toEqual(mockCourses);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(client.lms.getCourses()).rejects.toThrow('API Error: 404');
    });
  });
});
