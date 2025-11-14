import React, { createContext, useContext, useEffect, useState } from 'react';
import { getApiClient } from './react-query-hooks';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const client = getApiClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response: any = await client.auth.profile();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response: any = await client.auth.login(email, password);
    if (response.success && response.data) {
      client.setAuthToken(response.data.token);
      setUser(response.data.user);
    }
  };

  const logout = () => {
    client.clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
