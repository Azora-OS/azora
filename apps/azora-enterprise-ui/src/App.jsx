import React, { useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { PremiumButton } from './components/PremiumButton';
import { ChatWidget } from './components/ChatWidget';
import { PremiumNavbar } from './components/PremiumNavbar';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

function App() {
    const [chatMessages, setChatMessages] = useState([]);
    const [systemStatus] = useState('Operational');
    const [activeUsers] = useState('12,450');

    const handleSendMessage = async (message) => {
        const userMessage = {
            id: Date.now().toString(),
            content: message,
            sender: 'user',
            timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                content: "System load is currently at 45%. All regional clusters are operating within normal parameters.",
                sender: 'ai',
                timestamp: new Date(),
                aiMember: 'Elara',
            };
            setChatMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const resourceUsageData = [
        { name: '00:00', cpu: 30, memory: 45 },
        { name: '04:00', cpu: 25, memory: 40 },
        { name: '08:00', cpu: 65, memory: 70 },
        { name: '12:00', cpu: 85, memory: 80 },
        { name: '16:00', cpu: 75, memory: 75 },
        { name: '20:00', cpu: 45, memory: 55 },
    ];

    const revenueByRegion = [
        { name: 'NA', value: 4500 },
        { name: 'EU', value: 3200 },
        { name: 'APAC', value: 2800 },
        { name: 'LATAM', value: 1200 },
    ];

    const recentAlerts = [
        { id: 1, type: 'warning', message: 'High latency detected in EU-West cluster', time: '10 min ago' },
        { id: 2, type: 'info', message: 'Scheduled maintenance completed successfully', time: '1 hour ago' },
        { id: 3, type: 'error', message: 'Failed backup attempt on DB-Shard-04', time: '3 hours ago' },
    ];

    return (
        <div className="min-h-screen pb-20 bg-[#020617]">
            <PremiumNavbar
                title="AZORA ENTERPRISE"
                subtitle="System Overview"
                menuItems={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Resources', href: '#resources' },
                    { label: 'Security', href: '#security' },
                    { label: 'Settings', href: '#settings' },
                ]}
                actions={
                    <PremiumButton variant="secondary" size="sm">
                        System Logs
                    </PremiumButton>
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                    {/* Status Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-slate-300 mb-2">System Status</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                <div className="text-2xl font-bold text-white">{systemStatus}</div>
                            </div>
                            <div className="text-sm text-slate-400 mt-2">Uptime: 99.99%</div>
                        </GlassCard>
                        <GlassCard className="p-6">
                            <h3 className="text-slate-300 mb-2">Active Users</h3>
                            <div className="text-3xl font-bold text-white">{activeUsers}</div>
                            <div className="text-sm text-green-400 mt-2">+12% vs last week</div>
                        </GlassCard>
                    </motion.div>

                    {/* Resource Usage */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3"
                    >
                        <GlassCard className="p-8 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Resource Usage</h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-sm text-slate-300">CPU</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                                        <span className="text-sm text-slate-300">Memory</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={resourceUsageData}>
                                        <defs>
                                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCpu)" />
                                        <Area type="monotone" dataKey="memory" stroke="#a855f7" fillOpacity={1} fill="url(#colorMem)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Regional Performance */}
                    <div className="lg:col-span-2">
                        <GlassCard className="p-8">
                            <h3 className="text-xl font-bold text-white mb-6">Regional Performance</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueByRegion}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: '#ffffff05' }}
                                        />
                                        <Bar dataKey="value" fill="#475569" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Alerts & Actions */}
                    <div className="space-y-8">
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">System Alerts</h3>
                                <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">3 New</span>
                            </div>
                            <div className="space-y-4">
                                {recentAlerts.map((alert) => (
                                    <div key={alert.id} className="p-3 rounded-lg bg-white/5 border-l-2 border-slate-500">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-bold uppercase ${alert.type === 'warning' ? 'text-yellow-400' :
                                                    alert.type === 'error' ? 'text-red-400' : 'text-blue-400'
                                                }`}>{alert.type}</span>
                                            <span className="text-xs text-slate-500">{alert.time}</span>
                                        </div>
                                        <p className="text-sm text-slate-300">{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                            <PremiumButton variant="outline" size="sm" className="w-full mt-4">
                                View All Alerts
                            </PremiumButton>
                        </GlassCard>

                        <GlassCard className="p-6 bg-gradient-to-br from-slate-800 to-gray-800 border-none text-center">
                            <h3 className="font-bold text-xl mb-2">Enterprise Support</h3>
                            <p className="text-sm text-slate-300 mb-4">Need assistance with your enterprise deployment?</p>
                            <PremiumButton variant="secondary" className="w-full">
                                Contact Support
                            </PremiumButton>
                        </GlassCard>
                    </div>
                </div>
            </main>

            <ChatWidget
                onSendMessage={handleSendMessage}
                messages={chatMessages}
                aiMember="Elara"
            />
        </div>
    );
}

export default App;
