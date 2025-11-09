'use client';
import { useEffect, useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';
import { AzoraLogo } from '@/apps/azora-ui/components/branding';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <AzoraLogo 
              variant="primaryPro" 
              size="xl" 
              glassmorphic 
              glow="sapphire"
              animated
            />
          </div>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-premium-sapphire-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading Azora OS...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}
