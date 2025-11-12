import { AxiosInstance } from 'axios';
import { AuthResponse, ApiResponse, User } from '../types';

export class AuthService {
  constructor(private axios: AxiosInstance) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.axios.post('/auth/login', { email, password });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async register(email: string, password: string, name: string, role?: 'student' | 'educator'): Promise<AuthResponse> {
    try {
      const response = await this.axios.post('/auth/register', { 
        email, 
        password, 
        name,
        role: role || 'student'
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async profile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.axios.get('/auth/profile');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await this.axios.post('/auth/refresh', { refreshToken });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await this.axios.post('/auth/logout');
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.axios.patch('/auth/profile', updates);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
}
