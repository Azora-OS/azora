'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'mined'>('all');
    const [loading, setLoading] = useState(true);
    const ubuntuServices = useUbuntuServices();

    useEffect(() => {
        loadTransactions();
    }, [filter]);

    const loadTransactions = async () => {
        try {
            setLoading(true);

            // Mock transactions for demonstration
            const mockTransactions = [
                {
                    id: '1',
                    type: 'received',
                    amount: 125,
                    from: 'Azora Sapiens Academy',
                    to: 'You',
                    description: 'Proof of Knowledge Reward',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    hash: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
                    status: 'confirmed',
                    confirmations: 24
                },
                {
                    id: '2',
                    type: 'sent',
                    amount: 50,
                    from: 'You',
                    to: 'Sarah M.',
                    description: 'Peer tutoring payment',
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                    hash: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
                    status: 'confirmed',
                    confirmations: 18
                },
                {
                    id: '3',
                    type: 'mined',
                    amount: 200,
                    from: 'Mining Pool',
                    to: 'You',
                    description: 'Course completion mining reward',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
                    status: 'confirmed',
                    confirmations: 156
                },
                {
                    id: '4',
                    type: 'received',
                    amount: 75,
                    from: 'CitadelFund',
                    to: 'You',
                    description: 'Scholarship disbursement',
                    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
                    hash: '0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g',
                    status: 'confirmed',
                    confirmations: 289
                },
                {
                    id: '5',
                    type: 'sent',
                    amount: 100,
                    from: 'You',
                    to: 'Staking Pool',
                    description: 'Stake AZR tokens',
                    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
                    hash: '0xabcdef1234567890abcdef1234567890abcdef12',
                    status: 'confirmed',
                    confirmations: 412
                }
            ];

            const filteredTransactions = filter === 'all'
                ? mockTransactions
                : mockTransactions.filter(t => t.type === filter);

            setTransactions(filteredTransactions);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'received': return '📥';
            case 'sent': return '📤';
            case 'mined': return '⛏️';
            default: return '💸';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'received': return 'text-green-500';
            case 'sent': return 'text-red-500';
            case 'mined': return 'text-blue-500';
            default: return 'text-muted-foreground';
        }
    };

    const handleViewOnBlockchain = (hash: string) => {
        window.open(`https://polygonscan.com/tx/${hash}`, '_blank');
    };

    const totalReceived = transactions
        .filter(t => t.type === 'received' || t.type === 'mined')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalSent = transactions
        .filter(t => t.type === 'sent')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Export CSV</Button>
                    <Button size="sm">Send AZR</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Transaction History</GradientText>
                    </h1>
                    <p className="text-muted-foreground">
                        All transactions are blockchain-verified and immutable
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">+{totalReceived} AZR</div>
                        <div className="text-sm text-muted-foreground">Total Received</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-red-500">-{totalSent} AZR</div>
                        <div className="text-sm text-muted-foreground">Total Sent</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{transactions.length}</div>
                        <div className="text-sm text-muted-foreground">Total Transactions</div>
                    </AccessibleCard>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'all', label: 'All', icon: '💸' },
                        { id: 'received', label: 'Received', icon: '📥' },
                        { id: 'sent', label: 'Sent', icon: '📤' },
                        { id: 'mined', label: 'Mined', icon: '⛏️' }
                    ].map((filterOption) => (
                        <Button
                            key={filterOption.id}
                            variant={filter === filterOption.id ? 'default' : 'outline'}
                            onClick={() => setFilter(filterOption.id as any)}
                            size="sm"
                        >
                            <span className="mr-2">{filterOption.icon}</span>
                            {filterOption.label}
                        </Button>
                    ))}
                </div>

                {/* Transactions List */}
                <div className="space-y-4">
                    {transactions.map((tx, index) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <AccessibleCard className="glass-card p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="text-4xl">{getTypeIcon(tx.type)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{tx.description}</h3>
                                                <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
                                                    ✓ {tx.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {tx.from} → {tx.to}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>
                                                    {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                                                </span>
                                                <span>•</span>
                                                <span>{tx.confirmations} confirmations</span>
                                            </div>
                                            <div className="mt-2">
                                                <code className="text-xs font-mono bg-card px-2 py-1 rounded">
                                                    {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className={`text-2xl font-bold ${getTypeColor(tx.type)}`}>
                                            {tx.type === 'sent' ? '-' : '+'}{tx.amount} AZR
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => handleViewOnBlockchain(tx.hash)}
                                        >
                                            🔍 Verify
                                        </Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                {/* Ubuntu Philosophy */}
                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Every transaction on Azora OS is transparent and verifiable on the blockchain.
                        Your economic activity contributes to the collective prosperity of the community.
                        <span className="italic"> "Ngiyakwazi ngoba sikwazi" - "I can because we can"</span>
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
