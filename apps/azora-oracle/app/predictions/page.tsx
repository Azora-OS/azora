'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function PredictionsPage() {
    const predictions = [
        { id: 1, market: 'AZR/USD Price', prediction: '$1.25', confidence: '89%', timeframe: '24h', status: 'active' },
        { id: 2, market: 'Network Traffic', prediction: 'High', confidence: '92%', timeframe: '1h', status: 'active' },
        { id: 3, market: 'DeFi TVL', prediction: '+5%', confidence: '78%', timeframe: '7d', status: 'pending' }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button size="sm">New Request</Button>
                    <Button variant="outline" size="sm">History</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>AI Predictions</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Constitutional AI market forecasting</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">94.5%</div>
                        <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">1.2M</div>
                        <div className="text-sm text-muted-foreground">Data Points</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">24/7</div>
                        <div className="text-sm text-muted-foreground">Real-time Monitoring</div>
                    </AccessibleCard>
                </div>

                <div className="space-y-4">
                    {predictions.map((pred, index) => (
                        <motion.div
                            key={pred.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{pred.market}</h3>
                                        <p className="text-sm text-muted-foreground">Timeframe: {pred.timeframe}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">{pred.prediction}</div>
                                        <div className="text-sm text-green-500">Confidence: {pred.confidence}</div>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Transparent, verifiable predictions serve the community by providing shared truth and reducing uncertainty for everyone.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
