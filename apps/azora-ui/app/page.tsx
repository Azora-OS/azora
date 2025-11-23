'use client';

import { GlassCard } from './components/GlassCard';
import { PremiumButton } from './components/PremiumButton';

export default function DashboardPage() {
  const stats = {
    students: '125K+',
    revenue: 'R54.1M',
    ceos: '2,500',
    projects: '8,500',
  };

  const apps = [
    {
      id: 'learn',
      name: 'Learn',
      description: 'AI-Powered Learning Platform',
      icon: '🎓',
      href: 'http://localhost:5174',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'pay',
      name: 'Pay',
      description: 'Financial Dashboard & Wallet',
      icon: '💰',
      href: 'http://localhost:3003',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'marketplace',
      name: 'Marketplace',
      description: 'Jobs & Freelance Platform',
      icon: '🌍',
      href: 'http://localhost:3002',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'student',
      name: 'Student Portal',
      description: 'Your Learning Dashboard',
      icon: '📚',
      href: 'http://localhost:3001',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'incubator',
      name: 'Business Incubator',
      description: 'Launch Your Business',
      icon: '🚀',
      href: '/incubator',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Business Management',
      icon: '🏢',
      href: '/enterprise',
      color: 'from-gray-500 to-slate-500',
    },
    {
      id: 'cloud',
      name: 'Cloud',
      description: 'Storage & Backup',
      icon: '☁️',
      href: 'http://localhost:5175',
      color: 'from-sky-500 to-blue-500',
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'System Management',
      icon: '⚙️',
      href: '/admin',
      color: 'from-red-500 to-rose-500',
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AZORA</span>
        </h1>
        <p className="text-xl text-blue-200 max-w-2xl mx-auto">
          Your central hub for learning, earning, and building
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold text-blue-400 mb-2">{stats.students}</div>
          <div className="text-sm text-gray-300">Active Students</div>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-2">💵</div>
          <div className="text-3xl font-bold text-green-400 mb-2">{stats.revenue}</div>
          <div className="text-sm text-gray-300">Monthly Revenue</div>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-2">👔</div>
          <div className="text-3xl font-bold text-purple-400 mb-2">{stats.ceos}</div>
          <div className="text-sm text-gray-300">Student CEOs</div>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <div className="text-4xl mb-2">🚀</div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.projects}</div>
          <div className="text-sm text-gray-300">Projects Launched</div>
        </GlassCard>
      </div>

      {/* Apps Grid */}
      <div id="apps" className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Your Apps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apps.map((app) => (
            <a key={app.id} href={app.href} className="block">
              <GlassCard className="p-6 h-full hover:bg-white/20 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-3xl mb-4`}>
                  {app.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{app.name}</h3>
                <p className="text-sm text-blue-200">{app.description}</p>
              </GlassCard>
            </a>
          ))}
        </div>
      </div>

      {/* Ubuntu Impact Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Community Impact</h2>
        <GlassCard className="p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-2">🎓</div>
              <div className="text-2xl font-bold text-purple-400 mb-2">Ubuntu Philosophy</div>
              <p className="text-sm text-blue-200">
                &quot;I am because we are&quot; - Collective success
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💝</div>
              <div className="text-2xl font-bold text-green-400 mb-2">Citadel Fund</div>
              <p className="text-sm text-blue-200">
                10% of all revenue goes to community scholarships
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🌟</div>
              <div className="text-2xl font-bold text-yellow-400 mb-2">Your Impact</div>
              <p className="text-sm text-blue-200">
                You&apos;ve contributed R5,410 to the Citadel Fund
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Quick Start</h3>
          <div className="space-y-3">
            <PremiumButton variant="primary" className="w-full">
              🎓 Continue Learning
            </PremiumButton>
            <PremiumButton variant="secondary" className="w-full">
              💰 View Wallet
            </PremiumButton>
            <PremiumButton variant="outline" className="w-full">
              🚀 Launch Business
            </PremiumButton>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <span>🎓</span>
              <span className="flex-1">Completed Python Basics</span>
              <span className="text-blue-300">2h ago</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <span>💰</span>
              <span className="flex-1">Received R500 payment</span>
              <span className="text-green-300">5h ago</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
              <span>🌍</span>
              <span className="flex-1">Applied to Web Dev job</span>
              <span className="text-purple-300">1d ago</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
