import AzoraAPIClient from '../../../packages/shared-api/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = new AzoraAPIClient(API_BASE);

export const setAuthToken = (token: string) => {
  api.setToken(token);
  if (typeof window !== 'undefined') {
    localStorage.setItem('azora_token', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('azora_token');
  }
  return null;
};

export const clearAuthToken = () => {
  api.setToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('azora_token');
  }
};

// Initialize token on load
if (typeof window !== 'undefined') {
  const token = getAuthToken();
  if (token) api.setToken(token);
}
