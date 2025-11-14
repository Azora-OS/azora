"use client";

import { createContext, useContext } from 'react';
import { AzoraApiClient } from '@azora/api-client';

const ApiContext = createContext<AzoraApiClient | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const api = new AzoraApiClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  });

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) api.setAuthToken(token);
  }

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const api = useContext(ApiContext);
  if (!api) throw new Error('useApi must be used within ApiProvider');
  return api;
}
