import React, { useState } from 'react';
import {
    Shield, Lock, Eye, AlertTriangle, Activity, Globe,
    MapPin, UserCheck, Key, RefreshCw, Search
} from 'lucide-react';
import { useHealthCheckQuery } from '@azora/api-client/react-query-hooks';

export const SecurityApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { data: healthData, isLoading: isHealthLoading } = useHealthCheckQuery();

    const isSecure = healthData?.status === 'ok';

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Shield className="text-red-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Security</h2>
                            <p className="text-xs text-white/40">Operations Center</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'dashboard', icon: Activity, label: 'Threat Monitor' },
                            { id: 'access', icon: UserCheck, label: 'Access Logs' },
                            { id: 'firewall', icon: Lock, label: 'Firewall Rules' },
                            { id: 'audit', icon: Eye, label: 'Audit Trail' },
                            { id: 'keys', icon: Key, label: 'API Keys' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-red-600/20 text-red-400 shadow-lg shadow-red-900/20'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="bg-gradient-to-br from-red-900/50 to-slate-900 p-4 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isSecure ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="text-xs font-bold text-white">
                                {isHealthLoading ? 'Scanning...' : (isSecure ? 'System Secure' : 'Threats Detected')}
                            </span>
                        </div>
                        <p className="text-xs text-white/40">Last scan: Just now</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white">Threat Monitor</h1>
                        <span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
                            Live Monitoring
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                            <input
                                type="text"
                                placeholder="Search IP or Event ID..."
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50"
                            />
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* World Map Placeholder */}
                    <div className="h-64 bg-white/5 border border-white/10 rounded-xl mb-8 relative overflow-hidden flex items-center justify-center group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/50 to-slate-900" />
                        <Globe size={120} className="text-white/5 absolute" />
                        <div className="relative z-10 text-center">
                            <Globe size={48} className="text-blue-500/50 mx-auto mb-4 animate-pulse" />
                            <p className="text-white/60 text-sm">Global Threat Map Active</p>
                            <p className="text-white/40 text-xs mt-1">Monitoring 14 regions</p>
                        </div>

                        {/* Simulated Threat Points */}
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-amber-500 rounded-full animate-ping delay-700" />
                        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-300" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Threats Blocked', value: '14,205', change: '+12%', color: 'text-emerald-400' },
                            { label: 'Active Sessions', value: '842', change: '-5%', color: 'text-blue-400' },
                            { label: 'Failed Logins', value: '23', change: '+2%', color: 'text-amber-400' },
                            { label: 'Avg. Response', value: '45ms', change: '-12ms', color: 'text-purple-400' },
                        ].map((stat, i) => (
                            <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                <p className="text-sm text-white/40 mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${stat.color}`}>
                                    {stat.change}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Recent Alerts */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <h3 className="font-bold text-white">Recent Security Events</h3>
                        </div>
                        <div className="divide-y divide-white/5">
                            {[
                                { event: 'SQL Injection Attempt', source: '192.168.45.12', location: 'Moscow, RU', severity: 'high', time: '2m ago' },
                                { event: 'Brute Force Login', source: '10.0.0.54', location: 'Beijing, CN', severity: 'medium', time: '15m ago' },
                                { event: 'Port Scan Detected', source: '172.16.0.1', location: 'Unknown', severity: 'low', time: '1h ago' },
                                { event: 'Privilege Escalation', source: 'Internal User', location: 'Local', severity: 'critical', time: '2h ago' },
                            ].map((alert, i) => (
                                <div key={i} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                            alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            <AlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white group-hover:text-red-400 transition-colors">{alert.event}</h4>
                                            <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                                                <span className="font-mono">{alert.source}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={10} /> {alert.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${alert.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                                            alert.severity === 'high' ? 'bg-orange-500/10 text-orange-400' :
                                                alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {alert.severity}
                                        </span>
                                        <p className="text-xs text-white/40 mt-1">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
