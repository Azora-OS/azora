import React, { useState } from 'react';
import {
    TrendingUp, BarChart3, PieChart, Users, Globe,
    ArrowUpRight, Download, Calendar, Share2, Target
} from 'lucide-react';
import { useWalletQuery } from '@azora/api-client/react-query-hooks';

export const InvestorDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState('1Y');
    const { data: walletData, isLoading } = useWalletQuery('current');

    const valuation = walletData?.balance || 0;
    const formattedValuation = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(valuation);

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                            <TrendingUp className="text-amber-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Investor</h2>
                            <p className="text-xs text-white/40">Relations</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'performance', icon: TrendingUp, label: 'Performance' },
                            { id: 'metrics', icon: BarChart3, label: 'Key Metrics' },
                            { id: 'cap-table', icon: PieChart, label: 'Cap Table' },
                            { id: 'updates', icon: Globe, label: 'Updates & News' },
                            { id: 'documents', icon: Calendar, label: 'Documents' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-xs font-medium text-white/60 mb-1">Next Board Meeting</p>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={14} className="text-amber-400" />
                            <span className="text-sm font-bold text-white">Nov 28, 2025</span>
                        </div>
                        <button className="w-full py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
                            View Agenda
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white">Performance Overview</h1>
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            {['1M', '3M', 'YTD', '1Y', 'ALL'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeRange === range
                                        ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
                                        : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                            <Share2 size={14} />
                            <span>Share View</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-amber-900/20">
                            <Download size={14} />
                            <span>Download Report</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* Main Chart Area (Placeholder) */}
                    <div className="h-80 bg-white/5 border border-white/10 rounded-xl p-6 mb-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-50" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-sm text-white/40 mb-1">Valuation</p>
                                <h3 className="text-4xl font-bold text-white">{isLoading ? '...' : formattedValuation}</h3>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                                <ArrowUpRight size={14} />
                                <span>+24.8%</span>
                            </div>
                        </div>
                        {/* Abstract Chart Lines */}
                        <div className="absolute bottom-0 left-0 right-0 h-48 flex items-end justify-between px-6 pb-6 gap-2 opacity-30">
                            {[40, 65, 55, 80, 70, 90, 85, 100, 95, 110, 105, 120].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-full bg-amber-500 rounded-t-sm transition-all duration-500 group-hover:bg-amber-400"
                                    style={{ height: `${h}%`, opacity: 0.5 + (i * 0.04) }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* KPI Grid */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {[
                            { label: 'Annual Recurring Revenue', value: '$12.4M', change: '+15%', target: '$15M', icon: Target },
                            { label: 'Customer Growth', value: '1,240', change: '+8%', target: '1,500', icon: Users },
                            { label: 'Gross Margin', value: '78%', change: '+2%', target: '80%', icon: PieChart },
                        ].map((kpi, i) => (
                            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 rounded-lg bg-white/5 text-white/60">
                                        <kpi.icon size={20} />
                                    </div>
                                    <span className="text-xs text-white/40">Target: {kpi.target}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{kpi.value}</h3>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-white/40">{kpi.label}</p>
                                    <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        {kpi.change}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Updates */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-white/10">
                                <h3 className="font-bold text-white">Investor Updates</h3>
                            </div>
                            <div className="divide-y divide-white/5">
                                {[
                                    { title: 'Q3 2025 Shareholder Letter', date: 'Oct 15, 2025', type: 'Report' },
                                    { title: 'Series B Funding Announcement', date: 'Sep 01, 2025', type: 'Press Release' },
                                    { title: 'Strategic Partnership with Nebula', date: 'Aug 20, 2025', type: 'News' },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors">{item.title}</h4>
                                            <span className="text-xs text-white/40">{item.date}</span>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                                            {item.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-white/10">
                                <h3 className="font-bold text-white">Cap Table Summary</h3>
                            </div>
                            <div className="p-5 flex items-center justify-center h-64 relative">
                                {/* Simple CSS Pie Chart Representation */}
                                <div className="w-48 h-48 rounded-full border-8 border-white/10 relative flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-xs text-white/40">Total Shares</p>
                                        <p className="text-xl font-bold text-white">10M</p>
                                    </div>
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="70 30" />
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="20 80" strokeDashoffset="-70" />
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="10 90" strokeDashoffset="-90" />
                                    </svg>
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        <span className="text-white/60">Founders (70%)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-white/60">Investors (20%)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-white/60">Employees (10%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
