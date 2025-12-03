'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button, UbuntuPhilosophyCard } from '@azora/shared-design';

export default function PayDashboard() {
    const stats = { balance: 1890, sent: 450, received: 2340, pending: 0 };
    const recentTransactions = [
        { id: 1, type: 'received', from: 'Azora Sapiens', amount: 125, date: '2 hours ago' },
        { id: 2, type: 'sent', to: 'Sarah M.', amount: 50, date: '1 day ago' }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" href="/send">Send</Button>
                    <Button size="sm" href="/request">Request</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2"><GradientText>Payment Dashboard</GradientText></h1>
                    <p className="text-muted-foreground">Manage your AZR payments</p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{stats.balance} AZR</div>
                        <div className="text-sm text-muted-foreground">Balance</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">+{stats.received} AZR</div>
                        <div className="text-sm text-muted-foreground">Received</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-red-500">-{stats.sent} AZR</div>
                        <div className="text-sm text-muted-foreground">Sent</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">{stats.pending}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                    </AccessibleCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
                            <div className="space-y-3">
                                {recentTransactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg bg-card">
                                        <div>
                                            <p className="font-semibold">{tx.type === 'received' ? `From ${tx.from}` : `To ${tx.to}`}</p>
                                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                                        </div>
                                        <div className={`text-xl font-bold ${tx.type === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.type === 'received' ? '+' : '-'}{tx.amount} AZR
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4" href="/history">View All</Button>
                        </AccessibleCard>
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Button className="w-full" href="/send">💸 Send Payment</Button>
                                <Button variant="outline" className="w-full" href="/request">📥 Request Payment</Button>
                                <Button variant="outline" className="w-full" href="/methods">💳 Payment Methods</Button>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground">
                                10% of all transaction fees support the CitadelFund, enabling collective prosperity.
                            </p>
                        </AccessibleCard>
                    </div>

                    <div className="mt-8">
                        <UbuntuPhilosophyCard
                            collaborationScore={90}
                            communityImpact={86}
                            knowledgeSharing={88}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
