import { AxiosInstance } from 'axios';
import { ApiResponse, SafetyIncident } from '../types';

export class SafetyService {
  constructor(private axios: AxiosInstance) {}

  async reportIncident(incident: Omit<SafetyIncident, 'id' | 'timestamp'>): Promise<ApiResponse<SafetyIncident>> {
    try {
      const response = await this.axios.post('/safety/incidents', incident);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getIncidents(filters?: {
    type?: string;
    severity?: string;
    status?: string;
    limit?: number;
  }): Promise<ApiResponse<SafetyIncident[]>> {
    try {
      const response = await this.axios.get('/safety/incidents', { params: filters });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getIncident(incidentId: string): Promise<ApiResponse<SafetyIncident>> {
    try {
      const response = await this.axios.get(`/safety/incidents/${incidentId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async updateIncident(
    incidentId: string, 
    updates: Partial<SafetyIncident>
  ): Promise<ApiResponse<SafetyIncident>> {
    try {
      const response = await this.axios.patch(`/safety/incidents/${incidentId}`, updates);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async getNearbyIncidents(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<ApiResponse<SafetyIncident[]>> {
    try {
      const response = await this.axios.get('/safety/incidents/nearby', {
        params: { latitude, longitude, radius: radiusKm }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}
