import { api, apiClient } from '@azora/shared-design';

console.log('API Base URL:', apiClient.defaults.baseURL);

// Simple health check (if endpoint exists)
api.get('/health')
    .then(res => console.log('Health:', res.data))
    .catch(err => console.error('Health check failed:', err.message));
