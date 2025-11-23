import React, { useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { PremiumButton } from './components/PremiumButton';
import { ChatWidget } from './components/ChatWidget';
import { PremiumNavbar } from './components/PremiumNavbar';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

function App() {
    const [chatMessages, setChatMessages] = useState([]);
    const [totalRaised] = useState('$12.5M');
    const [valuation] = useState('$85M');

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
                content: "Our user acquisition cost has decreased by 15% this quarter, while LTV has increased by 10%.",
                sender: 'ai',
                timestamp: new Date(),
                aiMember: 'Elara',
            };
            setChatMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const revenueData = [
        { name: 'Q1', value: 1.2 },
        { name: 'Q2', value: 1.8 },
        { name: 'Q3', value: 2.5 },
        { name: 'Q4', value: 3.8 },
    ];

    const userGrowthData = [
        { name: 'Jan', users: 10000 },
        { name: 'Feb', users: 15000 },
        { name: 'Mar', users: 22000 },
        { name: 'Apr', users: 35000 },
        { name: 'May', users: 50000 },
        { name: 'Jun', users: 75000 },
    ];

    const documents = [
        { id: 1, title: 'Q3 2025 Investor Deck', type: 'PDF', date: 'Oct 15, 2025' },
        { id: 2, title: 'Financial Statements FY24', type: 'XLSX', date: 'Sep 30, 2025' },
        { id: 3, title: 'Legal Due Diligence', type: 'PDF', date: 'Aug 12, 2025' },
    ];

    return (
        <div className="min-h-screen pb-20 bg-[#0f172a]">
            <PremiumNavbar
                title="AZORA INVEST"
                subtitle="Investor Relations"
                menuItems={[
                    { label: 'Dashboard', href: '/' },
                    { label: 'Metrics', href: '#metrics' },
                    { label: 'Documents', href: '#documents' },
                    { label: 'Cap Table', href: '#captable' },
                ]}
                actions={
                    <PremiumButton variant="secondary" size="sm">
                        Contact IR
                    </PremiumButton>
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                    {/* Key Metrics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <GlassCard className="p-6 text-center">
                            <h3 className="text-amber-200 mb-2">Total Raised</h3>
                            <div className="text-4xl font-bold text-white mb-2">{totalRaised}</div>
                            <div className="text-sm text-green-400">Series A Complete</div>
                        </GlassCard>
                        <GlassCard className="p-6 text-center">
                            <h3 className="text-amber-200 mb-2">Valuation</h3>
                            <div className="text-4xl font-bold text-white mb-2">{valuation}</div>
                            <div className="text-sm text-green-400">+45% YoY</div>
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
                                <h3 className="text-xl font-bold text-white">Revenue Growth (Millions)</h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs">Quarterly</span>
                                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">Yearly</span>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="name" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fbbf24' }}
                                            cursor={{ fill: '#ffffff05' }}
                                        />
                                        <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Growth */}
                    <div className="lg:col-span-2">
                        <GlassCard className="p-8">
                            <h3 className="text-xl font-bold text-white mb-6">User Growth</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={userGrowthData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                        <XAxis dataKey="name" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fbbf24' }}
                                        />
                                        <Line type="monotone" dataKey="users" stroke="#fbbf24" strokeWidth={3} dot={{ fill: '#fbbf24' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Documents & Actions */}
                    <div className="space-y-8">
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-4">Recent Documents</h3>
                            <div className="space-y-4">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">📄</div>
                                            <div>
                                                <div className="font-semibold text-sm">{doc.title}</div>
                                                <div className="text-xs text-gray-400">{doc.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs px-2 py-1 rounded bg-white/10">{doc.type}</div>
                                    </div>
                                ))}
                            </div>
                            <PremiumButton variant="outline" size="sm" className="w-full mt-4">
                                View Data Room
                            </PremiumButton>
                        </GlassCard>

                        <GlassCard className="p-6 bg-gradient-to-br from-amber-600 to-yellow-600 border-none text-center">
                            <h3 className="font-bold text-xl mb-2">Schedule Briefing</h3>
                            <p className="text-sm text-amber-100 mb-4">Book a time with our executive team for a deep dive.</p>
                            <PremiumButton variant="secondary" className="w-full">
                                Book Meeting
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
