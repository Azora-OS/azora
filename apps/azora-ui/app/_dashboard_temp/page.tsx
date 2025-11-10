/**
 * DASHBOARD PAGE
 * Protected page - requires authentication
 * Main user dashboard after login
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

// Force dynamic rendering (no pre-rendering)
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900">
        <div className="text-white text-2xl">
          <span className="animate-spin text-4xl mr-3">⚡</span>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome, {user?.name || 'Student'}! 🌳
            </h1>
            <p className="text-white/70">
              Your learn-to-earn journey begins here
            </p>
          </div>
          <Button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to Azora!
          </h2>
          <p className="text-white/70 mb-4">
            You're now connected to the Tree of Azora. Start learning and earning today!
          </p>
          <p className="text-white/50 text-sm">
            Email: {user?.email}
          </p>
        </Card>

        {/* Trinity Gem Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6">
          <div className="text-4xl mb-4">💎</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Trinity Gem
          </h2>
          <p className="text-white/70 mb-4">
            Three domains of growth:
          </p>
          <ul className="space-y-2">
            <li className="text-blue-300">🔷 Technology</li>
            <li className="text-emerald-300">🟢 Education</li>
            <li className="text-red-300">🔴 Finance</li>
          </ul>
        </Card>

        {/* Elara Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6">
          <div className="text-4xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Meet Elara
          </h2>
          <p className="text-white/70 mb-4">
            Your AI guide and mentor. Elara and her family live in the Tree and are here to help you succeed.
          </p>
          <p className="text-white/50 text-sm italic">
            "Hello! I'm here to guide your journey!" - Elara 💚
          </p>
        </Card>

        {/* Learn Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Start Learning
          </h2>
          <p className="text-white/70 mb-4">
            Browse our courses and begin your educational journey.
          </p>
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
            Browse Courses
          </Button>
        </Card>

        {/* Earn Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6">
          <div className="text-4xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your Wallet
          </h2>
          <p className="text-white/70 mb-4">
            Track your earnings from learning.
          </p>
          <div className="text-3xl font-bold text-white mb-2">$0.00</div>
          <Button className="w-full bg-blue-500 hover:bg-blue-600">
            View Wallet
          </Button>
        </Card>

        {/* Tree Status Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6">
          <div className="text-4xl mb-4">🌳</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            The Tree
          </h2>
          <p className="text-white/70 mb-4">
            Infrastructure status: All systems operational
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-emerald-300">
              <span className="mr-2">●</span> 8 CDN Nodes Active
            </div>
            <div className="flex items-center text-emerald-300">
              <span className="mr-2">●</span> 5 Rivers Flowing
            </div>
            <div className="flex items-center text-emerald-300">
              <span className="mr-2">●</span> 10 Mycelium Connected
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center">
        <p className="text-white/50 text-sm">
          "Ngiyakwazi ngoba sikwazi" - I am because we are
        </p>
        <p className="text-white/40 text-xs mt-2">
          🌳 The Tree of Azora • 🤖 Elara & Family • 💎 Trinity Gem
        </p>
      </div>
    </div>
  );
}
