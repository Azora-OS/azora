import React, { useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { PremiumButton } from './components/PremiumButton';
import { ChatWidget } from './components/ChatWidget';
import { PremiumNavbar } from './components/PremiumNavbar';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

function App() {
    const [chatMessages, setChatMessages] = useState([]);
    const [activeProjects] = useState(12);
    const [totalFunding] = useState('$2.4M');

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
                content: "Based on your current traction, I recommend focusing on user retention metrics for your next pitch deck update.",
                sender: 'ai',
                timestamp: new Date(),
                aiMember: 'Elara',
            };
            setChatMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const projectProgress = [
        { name: 'Ideation', value: 5, color: '#6366f1' },
        { name: 'MVP', value: 4, color: '#8b5cf6' },
        { name: 'Growth', value: 2, color: '#a855f7' },
        { name: 'Scale', value: 1, color: '#d946ef' },
    ];

    const monthlyRevenue = [
        { name: 'Jan', value: 12000 },
        { name: 'Feb', value: 19000 },
        { name: 'Mar', value: 15000 },
        { name: 'Apr', value: 22000 },
        { name: 'May', value: 35000 },
        { name: 'Jun', value: 45000 },
    ];

    const startups = [
        { id: 1, name: 'EcoStream', stage: 'Growth', revenue: '$15k/mo', trend: '+12%' },
        { id: 2, name: 'DataVantage', stage: 'MVP', revenue: '$2k/mo', trend: '+5%' },
        { id: 3, name: 'HealthSync', stage: 'Ideation', revenue: '$0', trend: '0%' },
        { id: 4, name: 'CyberShield', stage: 'Scale', revenue: '$85k/mo', trend: '+8%' },
    ];

    return (
        <div className="min-h-screen pb-20 bg-[#0f172a]">
            <PremiumNavbar
                title="AZORA INCUBATOR"
                subtitle="Startup Accelerator"
                menuItems={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Startups', href: '#startups' },
                    { label: 'Mentors', href: '#mentors' },
                    { label: 'Funding', href: '#funding' },
                ]}
                actions={
                    <PremiumButton variant="secondary" size="sm">
                        New Application
                    </PremiumButton>
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                    {/* Stats Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-indigo-200 mb-2">Active Startups</h3>
                            <div className="text-4xl font-bold text-white mb-2">{activeProjects}</div>
                            <div className="text-sm text-green-400">+2 this month</div>
                        </GlassCard>
                        <GlassCard className="p-6">
                            <h3 className="text-indigo-200 mb-2">Total Funding Raised</h3>
                            <div className="text-4xl font-bold text-white mb-2">{totalFunding}</div>
                            <div className="text-sm text-green-400">Seed & Series A</div>
                        </GlassCard>
                    </motion.div>

                    {/* Revenue Growth */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3"
                    >
                        <GlassCard className="p-8 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Portfolio Revenue</h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs">Monthly</span>
                                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">Quarterly</span>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyRevenue}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="name" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Startup List */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Top Performing Startups</h2>
                            <PremiumButton variant="ghost" size="sm">View All</PremiumButton>
                        </div>
                        <div className="space-y-4">
                            {startups.map((startup, index) => (
                                <motion.div
                                    key={startup.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GlassCard className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white">
                                                {startup.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{startup.name}</div>
                                                <div className="text-sm text-gray-400">{startup.stage} Stage</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white">{startup.revenue}</div>
                                            <div className="text-sm text-green-400">{startup.trend}</div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Pipeline & Actions */}
                    <div className="space-y-8">
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-4">Pipeline Distribution</h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={projectProgress}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {projectProgress.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {projectProgress.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-gray-300">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 bg-gradient-to-br from-indigo-600 to-violet-600 border-none text-center">
                            <h3 className="font-bold text-xl mb-2">Pitch Practice</h3>
                            <p className="text-sm text-indigo-100 mb-4">Practice your pitch with our AI investors and get feedback.</p>
                            <PremiumButton variant="secondary" className="w-full">
                                Start Session
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
