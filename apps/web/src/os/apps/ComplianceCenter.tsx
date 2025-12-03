import React, { useState } from 'react';
import {
    ShieldCheck, FileText, AlertTriangle, Lock, CheckCircle,
    Search, Filter, Download, ChevronRight, Scale
} from 'lucide-react';
import { useHealthCheckQuery } from '@azora/api-client/react-query-hooks';

export const ComplianceCenter: React.FC = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const { data: healthData, isLoading } = useHealthCheckQuery();

    const isHealthy = healthData?.status === 'ok';
    const complianceScore = isHealthy ? 98 : 85;
    const riskCount = isHealthy ? 0 : 2;
    const riskStatus = isHealthy ? 'System secure' : 'Attention needed';

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <ShieldCheck className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Compliance</h2>
                            <p className="text-xs text-white/40">Center</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'dashboard', icon: ShieldCheck, label: 'Dashboard' },
                            { id: 'policies', icon: FileText, label: 'Policies' },
                            { id: 'audits', icon: Scale, label: 'Audits' },
                            { id: 'risks', icon: AlertTriangle, label: 'Risk Assessment' },
                            { id: 'access', icon: Lock, label: 'Access Control' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeSection === item.id
                                    ? 'bg-emerald-600/20 text-emerald-400 shadow-lg shadow-emerald-900/20'
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
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-white/60">Compliance Score</span>
                            <span className={`text-xs font-bold ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>{complianceScore}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'} transition-all duration-500`}
                                style={{ width: `${complianceScore}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <h1 className="text-xl font-bold text-white">Compliance Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                            <Download size={14} />
                            <span>Export Report</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* Status Cards */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {[
                            { label: 'Policies Active', value: '142', status: 'All systems compliant', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                            { label: 'Pending Audits', value: '3', status: 'Due in 5 days', icon: Scale, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            { label: 'Critical Risks', value: riskCount.toString(), status: riskStatus, icon: ShieldCheck, color: isHealthy ? 'text-emerald-400' : 'text-red-400', bg: isHealthy ? 'bg-emerald-500/10' : 'bg-red-500/10' },
                        ].map((card, i) => (
                            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                                        <card.icon size={24} />
                                    </div>
                                    <span className="px-2 py-1 rounded-full bg-white/5 text-xs text-white/40 border border-white/5">
                                        Live
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">{isLoading ? '-' : card.value}</h3>
                                <p className="text-sm text-white/60 mb-4">{card.label}</p>
                                <div className="flex items-center gap-2 text-xs text-white/40 pt-4 border-t border-white/5">
                                    <CheckCircle size={12} className={isHealthy ? "text-emerald-500" : "text-amber-500"} />
                                    {card.status}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Alerts */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white">Recent Compliance Alerts</h3>
                            <div className="flex gap-2">
                                <button className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white">
                                    <Filter size={16} />
                                </button>
                                <button className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {[
                                { title: 'New GDPR Policy Update', type: 'Policy', severity: 'medium', time: '2h ago' },
                                { title: 'Unusual Access Pattern Detected', type: 'Security', severity: 'high', time: '5h ago' },
                                { title: 'Quarterly Audit Report Generated', type: 'Audit', severity: 'low', time: '1d ago' },
                                { title: 'Vendor Compliance Check', type: 'Third-party', severity: 'low', time: '2d ago' },
                            ].map((alert, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' :
                                            alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                            }`} />
                                        <div>
                                            <h4 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{alert.title}</h4>
                                            <p className="text-xs text-white/40">{alert.type} • {alert.time}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20 group-hover:text-white/60 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
