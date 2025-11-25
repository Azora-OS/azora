import { AzoraApiClient } from '../../../packages/api-client';

export const api = new AzoraApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.azora.world',
  timeout: 30000
});
