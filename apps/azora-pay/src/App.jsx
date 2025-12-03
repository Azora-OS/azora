import React, { useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { PremiumButton } from './components/PremiumButton';
import { ChatWidget } from './components/ChatWidget';
import { PremiumNavbar } from './components/PremiumNavbar';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WalletCard from './components/WalletCard';
import TransactionList from './components/TransactionList';

function App() {
    const [chatMessages, setChatMessages] = useState([]);
    const [monthlySpend] = useState('R 4,200.00');

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
                content: "I can help you analyze your spending patterns. You've spent 15% less on dining out this month!",
                sender: 'ai',
                timestamp: new Date(),
                aiMember: 'Elara',
            };
            setChatMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const data = [
        { name: 'Mon', value: 4000 },
        { name: 'Tue', value: 3000 },
        { name: 'Wed', value: 2000 },
        { name: 'Thu', value: 2780 },
        { name: 'Fri', value: 1890 },
        { name: 'Sat', value: 2390 },
        { name: 'Sun', value: 3490 },
    ];

    return (
        <div className="min-h-screen pb-20 bg-[#0f172a]">
            <PremiumNavbar
                title="AZORA PAY"
                subtitle="Financial Freedom"
                menuItems={[
                    { label: 'Wallet', href: '/' },
                    { label: 'Transactions', href: '#transactions' },
                    { label: 'Cards', href: '#cards' },
                    { label: 'Invest', href: '#invest' },
                ]}
                actions={
                    <PremiumButton variant="secondary" size="sm">
                        Add Funds
                    </PremiumButton>
                }
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <WalletCard balance={12450} currency="AZR" />
                    </motion.div>

                    {/* Monthly Spend */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <GlassCard className="p-8 h-full">
                            <h3 className="text-emerald-200 mb-4">Monthly Spend</h3>
                            <div className="text-3xl font-bold mb-2">{monthlySpend}</div>
                            <div className="text-sm text-emerald-400 mb-6">↓ 12% from last month</div>

                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Transactions */}
                    <div className="lg:col-span-2">
                        <TransactionList />
                    </div>

                    {/* Quick Actions & Cards */}
                    <div className="space-y-8">
                        <GlassCard className="p-6 bg-gradient-to-br from-emerald-600 to-teal-600 border-none">
                            <div className="flex justify-between items-start mb-8">
                                <div className="text-2xl">💳</div>
                                <div className="text-sm opacity-80">Azora Black</div>
                            </div>
                            <div className="text-xl font-mono mb-4">•••• •••• •••• 4242</div>
                            <div className="flex justify-between text-sm opacity-80">
                                <div>Alex Chen</div>
                                <div>12/26</div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h3 className="font-bold mb-4">Quick Transfer</h3>
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex-shrink-0 text-center">
                                        <div className="w-12 h-12 rounded-full bg-white/10 mb-1 mx-auto" />
                                        <div className="text-xs text-gray-400">User {i}</div>
                                    </div>
                                ))}
                                <div className="flex-shrink-0 text-center">
                                    <div className="w-12 h-12 rounded-full border border-dashed border-white/30 flex items-center justify-center mb-1 mx-auto text-xl">+</div>
                                    <div className="text-xs text-gray-400">Add</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Amount"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <PremiumButton size="sm">Send</PremiumButton>
                            </div>
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
