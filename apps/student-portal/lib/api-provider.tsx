'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AzoraApiClient } from '@azora/api-client';
import { api } from '@/lib/api'; // We will use the existing api instance

const ApiContext = createContext<AzoraApiClient | null>(null);

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
