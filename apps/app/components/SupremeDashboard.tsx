'use client';
import { useEffect, useState } from 'react';
import './supreme-neural.css';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeServices: number;
  securityLevel: number;
}

interface SecurityStatus {
  level: 'secure' | 'warning' | 'critical';
  threats: number;
  lastScan: string;
}

export function SupremeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    activeServices: 187,
    securityLevel: 98
  });
  const [security, setSecurity] = useState<SecurityStatus>({
    level: 'secure',
    threats: 0,
    lastScan: '2 minutes ago'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ email: payload.email });
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="supreme-dashboard">
      {/* Quantum Header */}
      <header className="quantum-glass border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="holo-text text-3xl font-bold">AZORA OS</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`security-indicator ${security.level}`}>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <span>Security: {security.level.toUpperCase()}</span>
            </div>
            <span className="text-white/80">Welcome, {user.email}</span>
            <button 
              onClick={logout}
              className="quantum-btn bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 relative z-10">
        {/* System Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="crystalline-card text-center">
            <div className="text-3xl font-bold holo-text mb-2">{metrics.cpuUsage}%</div>
            <div className="text-sm text-white/60 uppercase tracking-wide">CPU Usage</div>
          </div>
          
          <div className="crystalline-card text-center">
            <div className="text-3xl font-bold holo-text mb-2">{metrics.memoryUsage}%</div>
            <div className="text-sm text-white/60 uppercase tracking-wide">Memory</div>
          </div>
          
          <div className="crystalline-card text-center">
            <div className="text-3xl font-bold holo-text mb-2">{metrics.activeServices}</div>
            <div className="text-sm text-white/60 uppercase tracking-wide">Services</div>
          </div>
          
          <div className="crystalline-card text-center">
            <div className="text-3xl font-bold holo-text mb-2">{metrics.securityLevel}%</div>
            <div className="text-sm text-white/60 uppercase tracking-wide">Security</div>
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Education Service */}
          <div className="crystalline-card neural-pulse">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Education</h3>
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            </div>
            <p className="text-white/70 mb-4">Access courses and learning materials</p>
            <button className="quantum-btn w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30">
              View Courses
            </button>
          </div>

          {/* Mint Service */}
          <div className="crystalline-card neural-pulse">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Mint</h3>
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            </div>
            <p className="text-white/70 mb-4">Financial services and payments</p>
            <button className="quantum-btn w-full bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30">
              Open Wallet
            </button>
          </div>

          {/* Forge Service */}
          <div className="crystalline-card neural-pulse">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Forge</h3>
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            </div>
            <p className="text-white/70 mb-4">Marketplace and services</p>
            <button className="quantum-btn w-full bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30">
              Browse Market
            </button>
          </div>
        </div>

        {/* Security Panel */}
        <div className="mt-8">
          <div className="crystalline-card">
            <h3 className="text-xl font-semibold text-white mb-4">Security Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">{security.threats}</div>
                <div className="text-sm text-white/60">Active Threats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">100%</div>
                <div className="text-sm text-white/60">Encryption</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{security.lastScan}</div>
                <div className="text-sm text-white/60">Last Scan</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}