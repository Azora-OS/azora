import React, { useState } from 'react';
import {
    Database, FileText, Server, RefreshCw, Play, Pause,
    Settings, Activity, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';
import { useHealthCheckQuery, useServiceStatusQuery } from '@azora/api-client/react-query-hooks';

export const DataIngestion: React.FC = () => {
    const [activeTab, setActiveTab] = useState('pipelines');
    const { data: healthData } = useHealthCheckQuery();
    const { data: serviceData, isLoading: isServicesLoading } = useServiceStatusQuery();

    const isSystemHealthy = healthData?.status === 'ok';

    // Map services to pipelines for demo purposes
    const pipelines = serviceData?.data?.map((service: any, index: number) => ({
        name: service.name || `Pipeline ${index + 1}`,
        source: ['Kafka Cluster A', 'PostgreSQL DB', 'Web Servers', 'External API'][index % 4],
        dest: ['Data Lake', 'Warehouse', 'Elasticsearch', 'Real-time DB'][index % 4],
        status: service.status === 'running' ? 'Running' : 'Paused',
        throughput: service.status === 'running' ? `${Math.floor(Math.random() * 900)} MB/s` : '0 MB/s',
        latency: service.status === 'running' ? `${Math.floor(Math.random() * 50)}ms` : '-'
    })) || [
            { name: 'User Activity Stream', source: 'Kafka Cluster A', dest: 'Data Lake', status: 'Running', throughput: '450 MB/s', latency: '12ms' },
            { name: 'Transaction Sync', source: 'PostgreSQL DB', dest: 'Warehouse', status: 'Running', throughput: '120 MB/s', latency: '45ms' },
            { name: 'Log Aggregation', source: 'Web Servers', dest: 'Elasticsearch', status: 'Paused', throughput: '0 MB/s', latency: '-' },
            { name: 'Market Data Feed', source: 'External API', dest: 'Real-time DB', status: 'Running', throughput: '850 MB/s', latency: '5ms' },
        ];

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                            <Database className="text-pink-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Data</h2>
                            <p className="text-xs text-white/40">Ingestion</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'pipelines', icon: Activity, label: 'Pipelines' },
                            { id: 'sources', icon: Server, label: 'Data Sources' },
                            { id: 'logs', icon: FileText, label: 'Execution Logs' },
                            { id: 'settings', icon: Settings, label: 'Configuration' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-pink-600/20 text-pink-400 shadow-lg shadow-pink-900/20'
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
                            <span className="text-xs font-medium text-white/60">Throughput</span>
                            <span className="text-xs font-bold text-pink-400">1.2 GB/s</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500 w-3/4 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-white">Pipeline Status</h1>
                        <span className={`px-2 py-1 rounded border text-xs font-medium flex items-center gap-1 ${isSystemHealthy ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isSystemHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {isSystemHealthy ? 'System Healthy' : 'System Warning'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-pink-900/20">
                            <PlusIcon />
                            <span>New Pipeline</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* Pipeline Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {isServicesLoading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 animate-pulse h-32" />
                            ))
                        ) : (
                            pipelines.map((pipeline: any, i: number) => (
                                <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${pipeline.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{pipeline.name}</h3>
                                                <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                                                    <span>{pipeline.source}</span>
                                                    <ArrowRight size={12} />
                                                    <span>{pipeline.dest}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-white">{pipeline.throughput}</p>
                                                <p className="text-xs text-white/40">Throughput</p>
                                            </div>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-white">{pipeline.latency}</p>
                                                <p className="text-xs text-white/40">Latency</p>
                                            </div>
                                            <button className={`p-2 rounded-lg transition-colors ml-2 ${pipeline.status === 'Running'
                                                ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                                                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                }`}>
                                                {pipeline.status === 'Running' ? <Pause size={18} /> : <Play size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${pipeline.status === 'Running' ? 'bg-pink-500 animate-pulse' : 'bg-white/10'}`}
                                            style={{ width: pipeline.status === 'Running' ? '100%' : '0%' }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Recent Logs */}
                    <div className="mt-8 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white">System Logs</h3>
                            <button className="text-xs text-pink-400 hover:text-pink-300 font-medium flex items-center gap-1">
                                <RefreshCw size={12} />
                                Live Tail
                            </button>
                        </div>
                        <div className="p-4 font-mono text-xs space-y-2">
                            {[
                                { time: '10:42:15', level: 'INFO', msg: 'Pipeline [User Activity] checkpoint committed successfully', color: 'text-blue-400' },
                                { time: '10:42:12', level: 'WARN', msg: 'High latency detected in [Transaction Sync] partition 4', color: 'text-amber-400' },
                                { time: '10:42:08', level: 'INFO', msg: 'New worker node joined cluster [worker-04]', color: 'text-blue-400' },
                                { time: '10:41:55', level: 'ERROR', msg: 'Connection timeout: External API endpoint unreachable', color: 'text-red-400' },
                                { time: '10:41:50', level: 'INFO', msg: 'Batch processing completed for [Market Data] - 1.2M records', color: 'text-blue-400' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 text-white/60 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                    <span className="text-white/40 w-20">{log.time}</span>
                                    <span className={`w-12 font-bold ${log.color}`}>{log.level}</span>
                                    <span className="text-white/80">{log.msg}</span>
                                </div>
                            ))}
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
