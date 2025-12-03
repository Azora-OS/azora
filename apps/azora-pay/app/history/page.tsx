'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function HistoryPage() {
    const transactions = [
        { id: 1, type: 'received', from: 'Azora Sapiens', amount: 125, date: '2 hours ago', status: 'Completed', note: 'Course Reward' },
        { id: 2, type: 'sent', to: 'Sarah M.', amount: 50, date: '1 day ago', status: 'Completed', note: 'Lunch money' },
        { id: 3, type: 'sent', to: 'Coffee Shop', amount: 12.50, date: '2 days ago', status: 'Completed', note: 'Latte' },
        { id: 4, type: 'received', from: 'JobSpaces Escrow', amount: 4500, date: '1 week ago', status: 'Completed', note: 'Project Milestone 1' },
        { id: 5, type: 'sent', to: 'CitadelFund', amount: 100, date: '1 week ago', status: 'Completed', note: 'Donation' },
    ];

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2"><GradientText>Transaction History</GradientText></h1>
                    <p className="text-muted-foreground">View all your past payments and requests</p>
                </motion.div>

                <AccessibleCard className="glass-card p-6">
                    <div className="space-y-4">
                        {transactions.map((tx, index) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-lg bg-card hover:bg-card/80 transition-colors border border-border/50"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${tx.type === 'received' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.type === 'received' ? '📥' : '📤'}
                                    </div>
                                    <div>
                                        <p className="font-bold">{tx.type === 'received' ? tx.from : tx.to}</p>
                                        <p className="text-sm text-muted-foreground">{tx.date} • {tx.note}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-lg ${tx.type === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                                        {tx.type === 'received' ? '+' : '-'}{tx.amount.toFixed(2)} AZR
                                    </p>
                                    <p className="text-xs text-green-500">✓ {tx.status}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
