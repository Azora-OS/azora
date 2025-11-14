import { AzoraApiClient } from '@azora/api-client';

export const api = new AzoraApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
});

// Set auth token from localStorage on initialization
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('auth_token');
  if (token) {
    api.setAuthToken(token);
  }
}