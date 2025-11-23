import React, { useState } from 'react';
import {
    BarChart2, PieChart, LineChart, TrendingUp, Filter,
    Download, Share2, Calendar, MoreHorizontal, ArrowUpRight
} from 'lucide-react';
import { useDashboardMetricsQuery, useDashboardOverviewQuery } from '@azora/api-client/react-query-hooks';

export const Analytics: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { data: overviewData, isLoading: isOverviewLoading } = useDashboardOverviewQuery();
    const { data: metricsData, isLoading: isMetricsLoading } = useDashboardMetricsQuery('30d');

    const activeUsers = overviewData?.activeUsers || 0;
    const formattedActiveUsers = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(activeUsers);

    const kpis = metricsData?.metrics?.map((m: any) => ({
        label: m.label,
        value: m.value,
        change: m.change,
        color: m.trend === 'up' ? 'text-emerald-400' : 'text-amber-400'
    })) || [
            { label: 'Total Sessions', value: '1.2M', change: '+8.2%', color: 'text-blue-400' },
            { label: 'Avg. Duration', value: '4m 32s', change: '+1.5%', color: 'text-emerald-400' },
            { label: 'Bounce Rate', value: '42.3%', change: '-2.1%', color: 'text-amber-400' },
            { label: 'Conversion', value: '3.8%', change: '+0.4%', color: 'text-purple-400' },
        ];

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <BarChart2 className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Analytics</h2>
                            <p className="text-xs text-white/40">Intelligence</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'overview', icon: BarChart2, label: 'Overview' },
                            { id: 'user-behavior', icon: UsersIcon, label: 'User Behavior' },
                            { id: 'revenue', icon: TrendingUp, label: 'Revenue' },
                            { id: 'acquisition', icon: PieChart, label: 'Acquisition' },
                            { id: 'retention', icon: LineChart, label: 'Retention' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-900/20'
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
                    <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 p-4 rounded-xl border border-white/10">
                        <p className="text-xs font-medium text-purple-300 mb-1">Active Users</p>
                        <h3 className="text-xl font-bold text-white">{isOverviewLoading ? '...' : formattedActiveUsers}</h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                            <ArrowUpRight size={12} />
                            <span>+12% vs last week</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-colors">
                            <Calendar size={14} />
                            <span>Last 30 Days</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors">
                            <Filter size={18} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors">
                            <Share2 size={18} />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-purple-900/20">
                            <Download size={14} />
                            <span>Export</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        {isMetricsLoading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 animate-pulse h-24" />
                            ))
                        ) : (
                            kpis.map((kpi: any, i: number) => (
                                <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                    <p className="text-sm text-white/40 mb-1">{kpi.label}</p>
                                    <h3 className="text-2xl font-bold text-white mb-2">{kpi.value}</h3>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${kpi.color}`}>
                                        {kpi.change}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {/* Main Chart */}
                        <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white">Traffic Overview</h3>
                                <button className="text-white/40 hover:text-white">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                            <div className="h-64 flex items-end gap-2 opacity-80">
                                {[35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 100].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-sm hover:opacity-80 transition-opacity"
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Pie Chart Placeholder */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-6">Device Distribution</h3>
                            <div className="flex items-center justify-center h-48 relative">
                                <div className="w-40 h-40 rounded-full border-8 border-white/10 relative">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="60 40" />
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="30 70" strokeDashoffset="-60" />
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="10 90" strokeDashoffset="-90" />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2 text-white/60">
                                        <div className="w-2 h-2 rounded-full bg-purple-500" /> Desktop
                                    </span>
                                    <span className="font-medium text-white">60%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2 text-white/60">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Mobile
                                    </span>
                                    <span className="font-medium text-white">30%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2 text-white/60">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" /> Tablet
                                    </span>
                                    <span className="font-medium text-white">10%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Pages Table */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <h3 className="font-bold text-white">Top Performing Pages</h3>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="text-white/40 font-medium border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-3">Page Path</th>
                                    <th className="px-6 py-3">Views</th>
                                    <th className="px-6 py-3">Unique</th>
                                    <th className="px-6 py-3">Avg. Time</th>
                                    <th className="px-6 py-3">Bounce Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { path: '/dashboard', views: '452k', unique: '320k', time: '5m 12s', bounce: '24%' },
                                    { path: '/marketplace', views: '210k', unique: '180k', time: '3m 45s', bounce: '35%' },
                                    { path: '/settings/profile', views: '125k', unique: '95k', time: '1m 20s', bounce: '15%' },
                                    { path: '/docs/api', views: '85k', unique: '60k', time: '8m 30s', bounce: '42%' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{row.path}</td>
                                        <td className="px-6 py-4 text-white/60">{row.views}</td>
                                        <td className="px-6 py-4 text-white/60">{row.unique}</td>
                                        <td className="px-6 py-4 text-white/60">{row.time}</td>
                                        <td className="px-6 py-4 text-white/60">{row.bounce}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

const UsersIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);
