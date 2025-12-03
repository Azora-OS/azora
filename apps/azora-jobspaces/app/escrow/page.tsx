'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function EscrowPage() {
    const escrowAccounts = [
        { id: 1, contract: 'DeFi Platform Development', amount: '3,000 AZR', status: 'locked', releaseDate: '2024-12-15' },
        { id: 2, contract: 'NFT Marketplace UI/UX', amount: '0 AZR', status: 'released', releaseDate: '2024-11-01' }
    ];

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2"><GradientText>Escrow</GradientText></h1>
                    <p className="text-muted-foreground">Blockchain-secured payment protection</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">3,000 AZR</div>
                        <div className="text-sm text-muted-foreground">In Escrow</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">12,500 AZR</div>
                        <div className="text-sm text-muted-foreground">Released</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">15,500 AZR</div>
                        <div className="text-sm text-muted-foreground">Total Processed</div>
                    </AccessibleCard>
                </div>

                <div className="space-y-4">
                    {escrowAccounts.map((escrow, index) => (
                        <motion.div key={escrow.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{escrow.contract}</h3>
                                        <p className="text-sm text-muted-foreground">Release: {new Date(escrow.releaseDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">{escrow.amount}</div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${escrow.status === 'locked' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                            {escrow.status}
                                        </span>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Smart contract escrow ensures fair payment for all parties, protecting both freelancers and clients.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
