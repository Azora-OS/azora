'use client';
import { useState } from 'react';
import { AzoraLogo } from '@/apps/azora-ui/components/branding';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent, PremiumCardFooter } from '@/apps/azora-ui/components/ui/card-premium';
import { PremiumButton } from '@/apps/azora-ui/components/ui/button-premium';
import { PremiumInput } from '@/apps/azora-ui/components/ui/input-premium';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const body = isLogin
        ? { email, password }
        : { email, password, name: name || email.split('@')[0] };

      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* 💎 PREMIUM LOGO */}
        <div className="flex justify-center mb-8">
          <AzoraLogo 
            variant="primaryPro" 
            size="xl" 
            glassmorphic 
            glow="sapphire"
            animated
          />
        </div>

        {/* 💎 PREMIUM LOGIN CARD */}
        <PremiumCard variant="glass" glow="sapphire" className="animate-premium-fade-in">
          <PremiumCardHeader>
            <PremiumCardTitle className="text-center text-3xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </PremiumCardTitle>
            <p className="text-center text-muted-foreground mt-2">
              {isLogin 
                ? 'Sign in to your Azora OS account' 
                : 'Join the Azora OS community'}
            </p>
          </PremiumCardHeader>

          <PremiumCardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <PremiumInput
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="glass"
                    glow="sapphire"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <PremiumInput
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="glass"
                  glow="sapphire"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <PremiumInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="glass"
                  glow="sapphire"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 glass-ruby rounded-xl border border-premium-ruby-500/30">
                  <p className="text-sm text-premium-ruby-500">{error}</p>
                </div>
              )}

              <PremiumButton
                type="submit"
                variant="premium"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </PremiumButton>
            </form>
          </PremiumCardContent>

          <PremiumCardFooter className="justify-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-premium-sapphire-500 hover:text-premium-sapphire-600 transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </PremiumCardFooter>
        </PremiumCard>
      </div>
    </div>
  );
}
