import { createContext, useContext, ReactNode } from 'react';
import { AzoraApiClient } from '@azora/api-client';

const ApiContext = createContext<AzoraApiClient | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const api = new AzoraApiClient({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    onAuthError: () => {
      window.location.href = '/login';
    }
  });

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('azora_token');
    if (token) api.setAuthToken(token);
  }

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApi must be used within ApiProvider');
  return api;
}
