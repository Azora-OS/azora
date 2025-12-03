'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function BurnPage() {
    const [burnAmount, setBurnAmount] = useState('');
    const [reason, setReason] = useState('');
    const ubuntuServices = useUbuntuServices();

    const burnStats = {
        totalBurned: 125000,
        yourBurned: 250,
        circulatingSupply: 875000,
        maxSupply: 1000000,
        burnRate: 0.5
    };

    const recentBurns = [
        { id: 1, amount: 1000, reason: 'Deflationary mechanism', time: '2 hours ago', user: 'Community Pool' },
        { id: 2, amount: 500, reason: 'Governance vote', time: '1 day ago', user: 'DAO Treasury' },
        { id: 3, amount: 250, reason: 'Personal burn', time: '2 days ago', user: 'You' }
    ];

    const handleBurn = async () => {
        if (!burnAmount || parseFloat(burnAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        await ubuntuServices.events.publishEvent('tokens.burned', {
            userId: 'demo-student-001',
            amount: parseFloat(burnAmount),
            reason,
            timestamp: new Date().toISOString()
        }, 'azora-mint');

        alert(`Successfully burned ${burnAmount} AZR tokens! (Feature coming soon)`);
        setBurnAmount('');
        setReason('');
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Burn History</Button>
                    <Button size="sm">Learn More</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Token Burn</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Deflationary mechanism to increase token value</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-red-500">{burnStats.totalBurned.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Burned</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{burnStats.circulatingSupply.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Circulating Supply</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">{burnStats.yourBurned}</div>
                        <div className="text-sm text-muted-foreground">Your Burned</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">{burnStats.burnRate}%</div>
                        <div className="text-sm text-muted-foreground">Monthly Rate</div>
                    </AccessibleCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-2xl font-bold mb-6">Burn AZR Tokens</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Amount to Burn</label>
                                    <input
                                        type="number"
                                        value={burnAmount}
                                        onChange={(e) => setBurnAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary text-2xl font-bold"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">Available: 1,890 AZR</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Why are you burning these tokens?"
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                    <p className="text-sm text-yellow-500 font-semibold mb-1">⚠️ Warning</p>
                                    <p className="text-sm text-muted-foreground">
                                        Burning tokens is permanent and irreversible. Burned tokens are removed from circulation forever.
                                    </p>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={handleBurn}
                                    disabled={!burnAmount || parseFloat(burnAmount) <= 0}
                                >
                                    🔥 Burn Tokens
                                </Button>
                            </div>
                        </AccessibleCard>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Recent Burns</h2>
                            <div className="space-y-3">
                                {recentBurns.map((burn, index) => (
                                    <motion.div
                                        key={burn.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <AccessibleCard className="glass-card p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">{burn.user}</p>
                                                    <p className="text-sm text-muted-foreground">{burn.reason}</p>
                                                    <p className="text-xs text-muted-foreground">{burn.time}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-red-500">🔥 {burn.amount} AZR</div>
                                                </div>
                                            </div>
                                        </AccessibleCard>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Why Burn?</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>✓ Reduces total supply</li>
                                <li>✓ Increases scarcity</li>
                                <li>✓ Supports token value</li>
                                <li>✓ Community-driven deflation</li>
                                <li>✓ Constitutional compliance</li>
                            </ul>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Supply Chart</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Circulating</span>
                                        <span className="font-semibold">{((burnStats.circulatingSupply / burnStats.maxSupply) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                            style={{ width: `${(burnStats.circulatingSupply / burnStats.maxSupply) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Burned</span>
                                        <span className="font-semibold">{((burnStats.totalBurned / burnStats.maxSupply) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-card rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                            style={{ width: `${(burnStats.totalBurned / burnStats.maxSupply) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground">
                                Token burning benefits the entire community by increasing scarcity and value for all holders.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
