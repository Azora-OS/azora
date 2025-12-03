import React, { useState } from 'react';
import {
    Cloud, Server, Database, Activity, Cpu, HardDrive,
    Globe, Shield, Zap, RefreshCw, Power, Terminal
} from 'lucide-react';
import { useServiceStatusQuery, useHealthCheckQuery } from '@azora/api-client/react-query-hooks';

export const CloudManager: React.FC = () => {
    const [activeRegion, setActiveRegion] = useState('us-east');
    const { data: serviceStatusData, isLoading: isServiceLoading } = useServiceStatusQuery();
    const { data: healthData } = useHealthCheckQuery();

    const isSystemHealthy = healthData?.status === 'ok';

    const instances = serviceStatusData?.data || [
        { name: 'web-server-01', type: 't3.xlarge', ip: '10.0.1.24', status: 'running', uptime: '14d 2h' },
        { name: 'db-primary', type: 'r5.2xlarge', ip: '10.0.2.15', status: 'running', uptime: '45d 12h' },
        { name: 'worker-node-04', type: 'c5.large', ip: '10.0.1.88', status: 'stopped', uptime: '-' },
        { name: 'cache-redis', type: 'm5.large', ip: '10.0.3.12', status: 'running', uptime: '2d 5h' },
    ];

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Cloud className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">Cloud</h2>
                        <p className="text-xs text-white/40">Infrastructure</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Regions</p>
                    <div className="space-y-1">
                        {[
                            { id: 'us-east', label: 'US East (N. Virginia)', status: isSystemHealthy ? 'healthy' : 'warning' },
                            { id: 'eu-west', label: 'EU West (Ireland)', status: 'healthy' },
                            { id: 'ap-south', label: 'AP South (Mumbai)', status: 'warning' },
                        ].map((region) => (
                            <button
                                key={region.id}
                                onClick={() => setActiveRegion(region.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${activeRegion === region.id
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-sm">{region.label}</span>
                                <div className={`w-2 h-2 rounded-full ${region.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                                    }`} />
                            </button>
                        ))}
                    </div>
                </div>

                <nav className="space-y-1">
                    {[
                        { icon: Server, label: 'Instances' },
                        { icon: Database, label: 'Databases' },
                        { icon: Globe, label: 'Networking' },
                        { icon: Shield, label: 'Security Groups' },
                        { icon: HardDrive, label: 'Storage' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <item.icon size={18} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white">Dashboard</h1>
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/60 font-mono">
                            {activeRegion}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                            <RefreshCw size={14} />
                            <span>Refresh</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cyan-900/20">
                            <PlusIcon />
                            <span>Launch Resource</span>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* Resource Usage */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'CPU Usage', value: '42%', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                            { label: 'Memory', value: '64GB', sub: '/ 128GB', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                            { label: 'Storage', value: '2.4TB', sub: 'used', icon: HardDrive, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                            { label: 'Network', value: '1.2GB/s', icon: Globe, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <Activity size={16} className="text-white/20" />
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                    {stat.sub && <span className="text-xs text-white/40">{stat.sub}</span>}
                                </div>
                                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Active Instances */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white">Active Instances</h3>
                            <div className="flex gap-2">
                                <button className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white">
                                    <Terminal size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-white/40 font-medium border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">IP Address</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Uptime</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isServiceLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="h-6 bg-white/5 rounded animate-pulse" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        instances.map((row: any, i: number) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                                    <Server size={14} className="text-white/40" />
                                                    {row.name}
                                                </td>
                                                <td className="px-6 py-4 text-white/60 font-mono text-xs">{row.type || 't2.micro'}</td>
                                                <td className="px-6 py-4 text-white/60 font-mono text-xs">{row.ip || '10.0.0.1'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full w-fit ${row.status === 'running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                                                            }`} />
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-white/60">{row.uptime || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors">
                                                        <Power size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
