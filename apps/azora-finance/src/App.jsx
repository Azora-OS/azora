import React, { useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { PremiumButton } from './components/PremiumButton';
import { ChatWidget } from './components/ChatWidget';
import { PremiumNavbar } from './components/PremiumNavbar';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function App() {
    const [chatMessages, setChatMessages] = useState([]);
    const [netWorth] = useState('R 1,245,000.00');
    const [monthlyGrowth] = useState('+8.5%');

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
                content: "Your portfolio is performing well! The tech sector allocation has driven most of the growth this month.",
                sender: 'ai',
                timestamp: new Date(),
                aiMember: 'Elara',
            };
            setChatMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const portfolioData = [
        { name: 'Jan', value: 1000000 },
        { name: 'Feb', value: 1050000 },
        { name: 'Mar', value: 1080000 },
        { name: 'Apr', value: 1150000 },
        { name: 'May', value: 1120000 },
        { name: 'Jun', value: 1245000 },
    ];

    const allocationData = [
        { name: 'Stocks', value: 60, color: '#3b82f6' },
        { name: 'Crypto', value: 20, color: '#06b6d4' },
        { name: 'Bonds', value: 10, color: '#8b5cf6' },
        { name: 'Cash', value: 10, color: '#10b981' },
    ];

    const investments = [
        { id: 1, name: 'S&P 500 ETF', symbol: 'VOO', value: 'R 450,000', change: '+12.4%' },
        { id: 2, name: 'Bitcoin', symbol: 'BTC', value: 'R 250,000', change: '+5.2%' },
        { id: 3, name: 'Tesla Inc.', symbol: 'TSLA', value: 'R 120,000', change: '-2.1%' },
        { id: 4, name: 'Apple Inc.', symbol: 'AAPL', value: 'R 180,000', change: '+1.8%' },
    ];

    return (
        <div className="min-h-screen pb-20 bg-[#0f172a]">
            <PremiumNavbar
                title="AZORA FINANCE"
                subtitle="Wealth Management"
                menuItems={[
                    { label: 'Overview', href: '/' },
                    { label: 'Portfolio', href: '#portfolio' },
                    { label: 'Analysis', href: '#analysis' },
                    { label: 'Reports', href: '#reports' },
                ]}
                actions={
                    <PremiumButton variant="secondary" size="sm">
                        New Investment
                    </PremiumButton>
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Net Worth Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <GlassCard className="p-8 h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />

                            <div className="relative z-10 flex justify-between items-end">
                                <div>
                                    <h2 className="text-blue-200 mb-2">Total Net Worth</h2>
                                    <div className="text-5xl font-bold mb-4">{netWorth}</div>
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                                        {monthlyGrowth} this month
                                    </div>
                                </div>
                                <div className="hidden md:block h-32 w-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={portfolioData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Asset Allocation */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <GlassCard className="p-8 h-full flex flex-col items-center justify-center">
                            <h3 className="text-blue-200 mb-4 w-full text-left">Asset Allocation</h3>
                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={allocationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {allocationData.map((entry, index) => (
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
                            <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                {allocationData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm text-gray-300">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Investment Portfolio */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Investment Portfolio</h2>
                            <PremiumButton variant="ghost" size="sm">View All</PremiumButton>
                        </div>
                        <div className="space-y-4">
                            {investments.map((inv, index) => (
                                <motion.div
                                    key={inv.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <GlassCard className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-blue-400">
                                                {inv.symbol}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{inv.name}</div>
                                                <div className="text-sm text-gray-400">{inv.symbol}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white">{inv.value}</div>
                                            <div className={`text-sm ${inv.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {inv.change}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Market Insights */}
                    <div className="space-y-8">
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-4">Market Insights</h3>
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-white/5 border-l-4 border-green-500">
                                    <div className="text-sm font-semibold text-green-400 mb-1">Bullish Trend</div>
                                    <p className="text-xs text-gray-300">Tech sector showing strong momentum ahead of earnings season.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border-l-4 border-yellow-500">
                                    <div className="text-sm font-semibold text-yellow-400 mb-1">Inflation Watch</div>
                                    <p className="text-xs text-gray-300">CPI data release tomorrow may impact bond yields.</p>
                                </div>
                            </div>
                            <PremiumButton variant="outline" size="sm" className="w-full mt-4">
                                Read Full Report
                            </PremiumButton>
                        </GlassCard>

                        <GlassCard className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 border-none text-center">
                            <h3 className="font-bold text-xl mb-2">Talk to Elara</h3>
                            <p className="text-sm text-blue-100 mb-4">Get personalized investment advice based on your portfolio.</p>
                            <PremiumButton variant="secondary" className="w-full">
                                Start Chat
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
