import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { OfflineSyncService } from './offlineSync';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle offline scenarios
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Check if offline
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      // Queue the operation for later sync if it's a mutation
      if (config.method && ['post', 'put', 'delete'].includes(config.method)) {
        await OfflineSyncService.queueOperation(
          config.method.toUpperCase() as 'POST' | 'PUT' | 'DELETE',
          config.url,
          config.data ? JSON.parse(config.data) : null
        );
        // Return a successful response to allow the app to continue
        return Promise.resolve({
          data: { queued: true, message: 'Operation queued for sync' },
          status: 202,
          statusText: 'Accepted',
          headers: {},
          config,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
