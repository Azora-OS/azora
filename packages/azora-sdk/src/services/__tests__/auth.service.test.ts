import { AuthService } from '../auth.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  let authService: AuthService;
  let axiosInstance: any;

  beforeEach(() => {
    axiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      patch: jest.fn(),
    };
    authService = new AuthService(axiosInstance);
  });

  describe('login', () => {
    test('should login successfully', async () => {
      const mockResponse = {
        data: {
          accessToken: 'token',
          user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'student' }
        }
      };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(result.data?.accessToken).toBe('token');
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
    });

    test('should handle login error', async () => {
      axiosInstance.post.mockRejectedValue(new Error('Invalid credentials'));

      const result = await authService.login('test@example.com', 'wrong');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('register', () => {
    test('should register successfully', async () => {
      const mockResponse = {
        data: {
          accessToken: 'token',
          user: { id: '1', email: 'new@example.com', name: 'New User', role: 'student' }
        }
      };
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await authService.register('new@example.com', 'password', 'New User');

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('new@example.com');
    });
  });

  describe('profile', () => {
    test('should get profile successfully', async () => {
      const mockResponse = {
        data: { id: '1', email: 'test@example.com', name: 'Test User', role: 'student' }
      };
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await authService.profile();

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
    });
  });
});
