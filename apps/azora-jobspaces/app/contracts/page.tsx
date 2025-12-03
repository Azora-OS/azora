'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function ContractsPage() {
    const contracts = [
        {
            id: 1,
            title: 'DeFi Platform Development',
            client: 'Sarah M.',
            status: 'active',
            value: '5,000 AZR',
            startDate: '2024-11-01',
            endDate: '2024-12-31',
            progress: 65,
            milestones: [
                { name: 'Smart Contract Development', status: 'completed', payment: '2,000 AZR' },
                { name: 'Frontend Integration', status: 'in-progress', payment: '2,000 AZR' },
                { name: 'Testing & Deployment', status: 'pending', payment: '1,000 AZR' }
            ]
        },
        {
            id: 2,
            title: 'NFT Marketplace UI/UX',
            client: 'Azora BuildSpaces',
            status: 'completed',
            value: '3,500 AZR',
            startDate: '2024-10-01',
            endDate: '2024-10-31',
            progress: 100,
            milestones: [
                { name: 'Design System', status: 'completed', payment: '1,500 AZR' },
                { name: 'UI Implementation', status: 'completed', payment: '2,000 AZR' }
            ]
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-500/10 text-blue-500';
            case 'completed': return 'bg-green-500/10 text-green-500';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    const getMilestoneIcon = (status: string) => {
        switch (status) {
            case 'completed': return '✓';
            case 'in-progress': return '⏳';
            case 'pending': return '○';
            default: return '○';
        }
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Templates</Button>
                    <Button size="sm">Create Contract</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Contracts</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Blockchain-secured work agreements</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">{contracts.filter(c => c.status === 'active').length}</div>
                        <div className="text-sm text-muted-foreground">Active Contracts</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">{contracts.filter(c => c.status === 'completed').length}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">
                            {contracts.reduce((sum, c) => sum + parseFloat(c.value.replace(/,/g, '')), 0).toLocaleString()} AZR
                        </div>
                        <div className="text-sm text-muted-foreground">Total Value</div>
                    </AccessibleCard>
                </div>

                <div className="space-y-6">
                    {contracts.map((contract, index) => (
                        <motion.div
                            key={contract.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-xl">{contract.title}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(contract.status)}`}>
                                                {contract.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Client: {contract.client}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">{contract.value}</div>
                                        <div className="text-xs text-muted-foreground">Total Value</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Start Date:</span>
                                        <span className="ml-2 font-semibold">{new Date(contract.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">End Date:</span>
                                        <span className="ml-2 font-semibold">{new Date(contract.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-semibold">{contract.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-primary/50"
                                            style={{ width: `${contract.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <h4 className="font-semibold mb-3">Milestones</h4>
                                    <div className="space-y-2">
                                        {contract.milestones.map((milestone, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{getMilestoneIcon(milestone.status)}</span>
                                                    <div>
                                                        <p className="font-semibold">{milestone.name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{milestone.status.replace('-', ' ')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-primary">{milestone.payment}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" className="flex-1">View Details</Button>
                                    {contract.status === 'active' && (
                                        <Button className="flex-1">Submit Work</Button>
                                    )}
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        All contracts are secured on the blockchain with smart contract escrow, ensuring fair payment and protecting both parties.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
