'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function BillingPage() {
    const invoices = [
        { id: 'INV-2024-001', date: '2024-12-01', amount: '5,000 AZR', status: 'paid' },
        { id: 'INV-2024-002', date: '2024-11-01', amount: '5,000 AZR', status: 'paid' },
        { id: 'INV-2024-003', date: '2024-10-01', amount: '4,500 AZR', status: 'paid' }
    ];

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Billing & Subscription</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Manage your enterprise plan</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2">
                        <AccessibleCard className="glass-card p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Enterprise Plan</h2>
                                    <p className="text-muted-foreground">Next billing date: Jan 1, 2025</p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">Active</span>
                            </div>
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between">
                                    <span>Base Subscription</span>
                                    <span>4,000 AZR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Additional Seats (10)</span>
                                    <span>1,000 AZR</span>
                                </div>
                                <div className="border-t border-border pt-2 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>5,000 AZR/month</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button>Upgrade Plan</Button>
                                <Button variant="outline">Manage Seats</Button>
                            </div>
                        </AccessibleCard>
                    </div>

                    <AccessibleCard className="glass-card p-6">
                        <h3 className="font-bold mb-4">Payment Method</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">💳</div>
                            <div>
                                <p className="font-semibold">Azora Wallet</p>
                                <p className="text-sm text-muted-foreground">...8x92</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full">Update Method</Button>
                    </AccessibleCard>
                </div>

                <AccessibleCard className="glass-card p-6">
                    <h3 className="font-bold mb-4">Invoice History</h3>
                    <div className="space-y-2">
                        {invoices.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                                <div>
                                    <p className="font-semibold">{inv.id}</p>
                                    <p className="text-sm text-muted-foreground">{inv.date}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold">{inv.amount}</span>
                                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs capitalize">{inv.status}</span>
                                    <Button variant="outline" size="sm">Download</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </AccessibleCard>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Fair and transparent pricing ensures sustainability for the platform while delivering value to the community.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
