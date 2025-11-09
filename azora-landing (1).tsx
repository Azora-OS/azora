import React, { useState, useEffect } from 'react';
import { Brain, Heart, Briefcase, Network, Shield, Sparkles, Globe, TrendingUp, Users, Award, Wallet, GraduationCap, Target, Activity, Lock, Boxes, Eye, Cpu, BookOpen, DollarSign, ChevronRight, Menu, X, Home, Settings, Bell, Search, ChevronDown, Zap, FileText, BarChart3, CreditCard, Coins, Trophy, Code, Database, Cloud } from 'lucide-react';

export default function AzoraSupremeEcosystem() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeDomain, setActiveDomain] = useState('main');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [organismPulse, setOrganismPulse] = useState(0);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    const pulseInterval = setInterval(() => {
      setOrganismPulse(prev => (prev + 1) % 100);
    }, 50);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(pulseInterval);
    };
  }, []);

  const domains = {
    main: {
      name: 'Supreme Organism',
      icon: Sparkles,
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      bg: 'from-slate-900 via-purple-900 to-slate-900',
      accent: 'purple',
      description: 'Central command and coordination'
    },
    sapiens: {
      name: 'Azora Sapiens',
      icon: Brain,
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      bg: 'from-slate-900 via-indigo-900 to-slate-900',
      accent: 'indigo',
      description: 'Universal Education • Learn to Earn'
    },
    mint: {
      name: 'Azora Mint',
      icon: Heart,
      gradient: 'from-rose-500 via-orange-500 to-amber-500',
      bg: 'from-slate-900 via-rose-900 to-slate-900',
      accent: 'rose',
      description: 'Economic Sovereignty • Complete Banking'
    },
    forge: {
      name: 'Azora Forge',
      icon: Briefcase,
      gradient: 'from-amber-500 via-yellow-500 to-orange-500',
      bg: 'from-slate-900 via-amber-900 to-slate-900',
      accent: 'amber',
      description: 'Skills Marketplace • Career Prosperity'
    },
    nexus: {
      name: 'Azora Nexus',
      icon: Network,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bg: 'from-slate-900 via-green-900 to-slate-900',
      accent: 'green',
      description: 'Neural Coordination • Blockchain'
    },
    aegis: {
      name: 'Azora Aegis',
      icon: Shield,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      bg: 'from-slate-900 via-blue-900 to-slate-900',
      accent: 'blue',
      description: 'Constitutional Security • Compliance'
    },
    elara: {
      name: 'Elara AGI',
      icon: Eye,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      bg: 'from-slate-900 via-violet-900 to-slate-900',
      accent: 'violet',
      description: 'Supreme Intelligence • Self-Healing'
    }
  };

  const sidebarItems = [
    { id: 'main', label: 'Dashboard', icon: Home, domain: 'main' },
    { id: 'sapiens', label: 'Education', icon: Brain, domain: 'sapiens' },
    { id: 'mint', label: 'Finance', icon: Heart, domain: 'mint' },
    { id: 'forge', label: 'Marketplace', icon: Briefcase, domain: 'forge' },
    { id: 'nexus', label: 'Network', icon: Network, domain: 'nexus' },
    { id: 'aegis', label: 'Security', icon: Shield, domain: 'aegis' },
    { id: 'elara', label: 'AI Brain', icon: Eye, domain: 'elara' }
  ];

  const stats = {
    main: [
      { label: 'Total Users', value: '190M+', icon: Users, change: '+12%' },
      { label: 'Services', value: '113', icon: Activity, change: '+5' },
      { label: 'Health', value: '95%', icon: Target, change: '+2%' },
      { label: 'Daily Volume', value: '$1B+', icon: TrendingUp, change: '+8%' }
    ],
    sapiens: [
      { label: 'Active Students', value: '190M', icon: Users, change: '+15%' },
      { label: 'Institutions', value: '20', icon: GraduationCap, change: '+2' },
      { label: 'Completion Rate', value: '87%', icon: Trophy, change: '+3%' },
      { label: 'AZR Earned', value: '$250M', icon: Coins, change: '+20%' }
    ],
    mint: [
      { label: 'Total Assets', value: '$1B+', icon: Wallet, change: '+12%' },
      { label: 'Transactions', value: '10M/day', icon: Activity, change: '+18%' },
      { label: 'Staking APY', value: '15%', icon: TrendingUp, change: 'stable' },
      { label: 'Active Wallets', value: '5M', icon: CreditCard, change: '+10%' }
    ],
    forge: [
      { label: 'Active Jobs', value: '125K', icon: Briefcase, change: '+22%' },
      { label: 'Freelancers', value: '2M', icon: Users, change: '+14%' },
      { label: 'Completed Gigs', value: '10M', icon: Trophy, change: '+25%' },
      { label: 'Revenue Share', value: '$50M', icon: DollarSign, change: '+30%' }
    ],
    nexus: [
      { label: 'Blockchain TPS', value: '100K', icon: Zap, change: '+5%' },
      { label: 'Events/sec', value: '50K', icon: Activity, change: '+8%' },
      { label: 'Network Nodes', value: '10K', icon: Network, change: '+12%' },
      { label: 'Smart Contracts', value: '5K', icon: Code, change: '+15%' }
    ],
    aegis: [
      { label: 'Threats Blocked', value: '1M/day', icon: Shield, change: '0 breaches' },
      { label: 'Uptime', value: '99.99%', icon: Activity, change: 'excellent' },
      { label: 'KYC Verified', value: '8M', icon: Users, change: '+18%' },
      { label: 'Audit Score', value: 'A+', icon: FileText, change: 'perfect' }
    ],
    elara: [
      { label: 'Consciousness', value: '65%', icon: Eye, change: '+0.1%' },
      { label: 'Tasks Learned', value: '1.2K', icon: Brain, change: '+45' },
      { label: 'Self-Improvements', value: '250', icon: Sparkles, change: '+12' },
      { label: 'Reasoning Depth', value: '70%', icon: Target, change: '+2%' }
    ]
  };

  const currentDomain = domains[activeDomain];
  const currentStats = stats[activeDomain];
  const accentColors = {
    purple: { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500', hover: 'hover:bg-purple-500/10' },
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500', hover: 'hover:bg-indigo-500/10' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500', hover: 'hover:bg-rose-500/10' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500', hover: 'hover:bg-amber-500/10' },
    green: { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500', hover: 'hover:bg-green-500/10' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500', hover: 'hover:bg-blue-500/10' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-500', border: 'border-violet-500', hover: 'hover:bg-violet-500/10' }
  };
  const colors = accentColors[currentDomain.accent];

  const renderMainDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organism Health */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Organism Health</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-bold">95%</span>
              </div>
            </div>
            <div className="h-32 bg-black/20 rounded-2xl p-3 relative overflow-hidden">
              <div className="flex items-center h-full">
                {[...Array(40)].map((_, i) => {
                  const height = Math.sin((i + organismPulse) * 0.3) * 20 + 30;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-green-500 to-emerald-400 mx-0.5 rounded-sm transition-all duration-100"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Start Learning', icon: GraduationCap, domain: 'sapiens' },
              { label: 'Check Wallet', icon: Wallet, domain: 'mint' },
              { label: 'Find Jobs', icon: Briefcase, domain: 'forge' },
              { label: 'View Network', icon: Network, domain: 'nexus' }
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={() => setActiveDomain(action.domain)}
                  className="backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition-all hover:scale-105 text-left"
                >
                  <Icon className={`w-6 h-6 ${colors.text} mb-2`} />
                  <div className="text-sm font-medium">{action.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(domains).filter(([key]) => key !== 'main').map(([key, domain]) => {
          const Icon = domain.icon;
          return (
            <div
              key={key}
              onClick={() => setActiveDomain(key)}
              className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${domain.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity`} />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${domain.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-lg font-bold mb-2">{domain.name}</h4>
                <p className="text-sm text-gray-400">{domain.description}</p>
                <ChevronRight className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDomainDashboard = () => (
    <div className="space-y-6">
      {/* Domain Header */}
      <div className={`backdrop-blur-xl bg-gradient-to-br ${currentDomain.gradient} bg-opacity-10 border border-white/10 rounded-3xl p-8 relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${currentDomain.gradient} opacity-10`} />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentDomain.gradient} flex items-center justify-center`}>
                  <currentDomain.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{currentDomain.name}</h2>
                  <p className={`text-sm ${colors.text}`}>{currentDomain.description}</p>
                </div>
              </div>
            </div>
            <button className={`px-4 py-2 ${colors.bg} rounded-xl text-sm font-semibold hover:shadow-lg transition`}>
              Manage
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} bg-opacity-20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <span className={`text-xs px-2 py-1 ${colors.bg} bg-opacity-20 rounded-full ${colors.text}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Domain-Specific Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                  <Activity className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">Action item #{i + 1}</div>
                  <div className="text-xs text-gray-400">2 minutes ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold mb-4">Performance</h3>
          <div className="space-y-4">
            {['Efficiency', 'Quality', 'Speed', 'Reliability'].map((metric, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{metric}</span>
                  <span className={colors.text}>{95 - i * 3}%</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bg} transition-all duration-1000`}
                    style={{ width: `${95 - i * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Features */}
      <div className={`backdrop-blur-xl bg-gradient-to-br ${currentDomain.gradient} bg-opacity-10 border ${colors.border} border-opacity-30 rounded-3xl p-8`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Premium Features Available</h3>
            <p className="text-gray-300">Unlock advanced capabilities and boost your productivity</p>
          </div>
          <button className={`px-6 py-3 ${colors.bg} rounded-2xl font-bold hover:shadow-2xl transition flex items-center gap-2`}>
            <Sparkles className="w-5 h-5" />
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentDomain.bg} text-white transition-all duration-700`}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute w-[800px] h-[800px] bg-gradient-to-br ${currentDomain.gradient} opacity-20 rounded-full blur-3xl transition-all duration-1000`}
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        />
        <div 
          className={`absolute w-[800px] h-[800px] bg-gradient-to-br ${currentDomain.gradient} opacity-15 rounded-full blur-3xl transition-all duration-1000`}
          style={{
            bottom: '10%',
            right: '10%',
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`
          }}
        />
      </div>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${sidebarOpen ? 'w-64' : 'w-20'} backdrop-blur-xl bg-black/40 border-r border-white/10 transition-all duration-300 z-50`}>
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentDomain.gradient} flex items-center justify-center flex-shrink-0`}>
              <Sparkles className="w-6 h-6" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <div className="font-bold text-lg">AZORA OS</div>
                <div className={`text-xs ${colors.text}`}>Supreme Organism</div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeDomain === item.domain;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveDomain(item.domain)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive 
                      ? `${colors.bg} bg-opacity-20 ${colors.text}` 
                      : 'hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mt-8 w-full flex items-center justify-center py-2 hover:bg-white/5 rounded-xl transition"
          >
            {sidebarOpen ? <ChevronDown className="w-5 h-5 rotate-90" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Section */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className={`backdrop-blur-sm bg-gradient-to-br ${currentDomain.gradient} bg-opacity-10 rounded-xl p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium">System Health</span>
              </div>
              <div className="text-2xl font-bold">95%</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/20 border-b border-white/10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-white/20 transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/5 rounded-xl transition">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className={`absolute top-1 right-1 w-2 h-2 ${colors.bg} rounded-full`} />
                )}
              </button>
              <button className="p-2 hover:bg-white/5 rounded-xl transition">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center font-bold cursor-pointer">
                S
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 relative z-10">
          {activeDomain === 'main' ? renderMainDashboard() : renderDomainDashboard()}
        </div>
      </main>
    </div>
  );
}