import { ApiClient } from '@azora/api-client/client';

export const api = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:4000');

export default api;
