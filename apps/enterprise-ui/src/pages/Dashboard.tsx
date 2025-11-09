import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    revenue: 0,
    growth: 0
  });

  const [realTimeData, setRealTimeData] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    networkActivity: 78,
    activeConnections: 1247
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        cpuUsage: Math.max(20, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        networkActivity: Math.max(40, Math.min(95, prev.networkActivity + (Math.random() - 0.5) * 15)),
        activeConnections: Math.max(800, Math.min(2000, prev.activeConnections + Math.floor((Math.random() - 0.5) * 100)))
      }));
    }, 2000);

    // Simulate loading stats
    setTimeout(() => {
      setStats({
        totalUsers: 15847,
        activeUsers: 3291,
        revenue: 284750,
        growth: 23.5
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, change, icon, color }: any) => (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          <p className={`text-sm mt-2 flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '↗️' : '↘️'} {Math.abs(change)}%
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const MetricCard = ({ title, value, max, color, unit }: any) => (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}{unit}</span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
        <div 
          className={`h-3 rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
        {value}/{max} {unit}
      </p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Enterprise Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Constitutional AI Operating System Overview</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium">
            📊 Generate Report
          </button>
          <button className="px-6 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-slate-900 dark:text-white">
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={12.5}
          icon="👥"
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change={8.2}
          icon="🟢"
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Revenue"
          value={`$${(stats.revenue / 1000).toFixed(0)}K`}
          change={stats.growth}
          icon="💰"
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="AI Efficiency"
          value="98.7%"
          change={2.1}
          icon="🤖"
          color="bg-gradient-to-r from-orange-500 to-red-500"
        />
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Performance</h2>
          <div className="space-y-4">
            <MetricCard
              title="CPU Usage"
              value={Math.round(realTimeData.cpuUsage)}
              max={100}
              unit="%"
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
            <MetricCard
              title="Memory Usage"
              value={Math.round(realTimeData.memoryUsage)}
              max={100}
              unit="%"
              color="bg-gradient-to-r from-green-500 to-emerald-500"
            />
            <MetricCard
              title="Network Activity"
              value={Math.round(realTimeData.networkActivity)}
              max={100}
              unit="%"
              color="bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Constitutional AI Status</h2>
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-slate-900 dark:text-white">🧠 AI Brain Status</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                  Operational
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-slate-900 dark:text-white">🫀 Financial Heart</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-slate-900 dark:text-white">💪 Marketplace Muscles</span>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm font-medium">
                  Enhancing
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-slate-900 dark:text-white">🛡️ Security Shield</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                  Protected
                </span>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Active Connections</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {realTimeData.activeConnections.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">🚀 Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium text-slate-900 dark:text-white">
                📈 Analytics
              </button>
              <button className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium text-slate-900 dark:text-white">
                👥 Users
              </button>
              <button className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium text-slate-900 dark:text-white">
                💰 Finance
              </button>
              <button className="p-3 bg-white/70 dark:bg-slate-800/70 rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium text-slate-900 dark:text-white">
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;