import React, { useState } from 'react';
import {
    Building2, Users, Briefcase, FileText, PieChart, Settings,
    Search, Bell, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Rocket
} from 'lucide-react';
import { useDashboardOverviewQuery, useDashboardActivityQuery } from '@azora/api-client/react-query-hooks';

export const EnterprisePortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { data: overviewData, isLoading: isOverviewLoading } = useDashboardOverviewQuery();
    const { data: activityData, isLoading: isActivityLoading } = useDashboardActivityQuery();

    const stats = overviewData?.data || {
        revenue: { value: '$4.2M', change: '+12.5%', trend: 'up' },
        projects: { value: '24', change: '+4', trend: 'up' },
        team: { value: '142', change: '+8', trend: 'up' },
        efficiency: { value: '94%', change: '-2.1%', trend: 'down' }
    };

    const activities = activityData?.data || [
        { user: 'Sarah C.', action: 'deployed to production', time: '2m ago', icon: Rocket, color: 'text-emerald-400' },
        { user: 'Mike R.', action: 'updated documentation', time: '15m ago', icon: FileText, color: 'text-blue-400' },
        { user: 'System', action: 'automated backup completed', time: '1h ago', icon: Settings, color: 'text-purple-400' },
        { user: 'Alex T.', action: 'invited 3 new members', time: '2h ago', icon: Users, color: 'text-amber-400' },
    ];

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Building2 className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Enterprise</h2>
                            <p className="text-xs text-white/40">Management Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'overview', icon: PieChart, label: 'Overview' },
                            { id: 'departments', icon: Building2, label: 'Departments' },
                            { id: 'employees', icon: Users, label: 'Employees' },
                            { id: 'projects', icon: Briefcase, label: 'Projects' },
                            { id: 'reports', icon: FileText, label: 'Reports' },
                            { id: 'settings', icon: Settings, label: 'Settings' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-900/20'
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
                    <div className="bg-gradient-to-br from-blue-900/50 to-slate-900 p-4 rounded-xl border border-white/10">
                        <p className="text-xs font-medium text-blue-300 mb-1">Enterprise Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-bold">Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                            <input
                                type="text"
                                placeholder="Search resources, employees, or projects..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border border-white/20" />
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-auto p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">Dashboard Overview</h1>
                            <p className="text-white/40 text-sm">Welcome back, Administrator</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-900/20">
                            <Plus size={16} />
                            <span>New Project</span>
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        {isOverviewLoading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 animate-pulse h-32" />
                            ))
                        ) : (
                            [
                                { label: 'Total Revenue', ...stats.revenue, color: 'blue' },
                                { label: 'Active Projects', ...stats.projects, color: 'purple' },
                                { label: 'Team Members', ...stats.team, color: 'emerald' },
                                { label: 'Efficiency', ...stats.efficiency, color: 'amber' },
                            ].map((stat, i) => (
                                <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-white/40 text-sm font-medium">{stat.label}</p>
                                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {stat.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {stat.change}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Recent Activity & Projects */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* Projects Table */}
                        <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-bold text-white">Active Projects</h3>
                                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All</button>
                            </div>
                            <div className="p-2">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-white/40 font-medium border-b border-white/5">
                                        <tr>
                                            <th className="px-4 py-3">Project Name</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Team</th>
                                            <th className="px-4 py-3">Progress</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { name: 'Project Phoenix', status: 'In Progress', team: 4, progress: 75 },
                                            { name: 'Nebula Expansion', status: 'Planning', team: 2, progress: 15 },
                                            { name: 'Quantum Core', status: 'Review', team: 6, progress: 90 },
                                            { name: 'Aether Interface', status: 'In Progress', team: 3, progress: 45 },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                                                        row.status === 'Planning' ? 'bg-purple-500/10 text-purple-400' :
                                                            'bg-amber-500/10 text-amber-400'
                                                        }`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-white/60">
                                                    <div className="flex -space-x-2">
                                                        {[...Array(row.team)].map((_, j) => (
                                                            <div key={j} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[10px] text-white">
                                                                {String.fromCharCode(65 + j)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full"
                                                            style={{ width: `${row.progress}%` }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-white/10">
                                <h3 className="font-bold text-white">Recent Activity</h3>
                            </div>
                            <div className="p-5 space-y-6">
                                {isActivityLoading ? (
                                    [...Array(4)].map((_, i) => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-8 h-8 rounded bg-white/10" />
                                            <div className="flex-1 space-y-2">
                                                <div className="w-3/4 h-3 rounded bg-white/10" />
                                                <div className="w-1/2 h-2 rounded bg-white/10" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    activities.map((item: any, i: number) => {
                                        // Map icon string to component if needed, or assume item has icon component if from static fallback
                                        // For real data, we'd need a mapping. For now, fallback uses components.
                                        // If data comes from API, it might be strings.
                                        const Icon = item.icon || FileText; // Fallback icon
                                        return (
                                            <div key={i} className="flex gap-3">
                                                <div className={`mt-1 ${item.color || 'text-blue-400'}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white">
                                                        <span className="font-medium">{item.user}</span> {item.action}
                                                    </p>
                                                    <p className="text-xs text-white/40 mt-1">{item.time}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
