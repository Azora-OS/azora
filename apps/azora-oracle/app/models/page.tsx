'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function ModelsPage() {
    const models = [
        { id: 1, name: 'Market Sentiment v2', type: 'NLP', status: 'active', accuracy: '91%', requests: '45k/day' },
        { id: 2, name: 'Price Action LSTM', type: 'Time Series', status: 'active', accuracy: '88%', requests: '120k/day' },
        { id: 3, name: 'Risk Assessment', type: 'Classification', status: 'training', accuracy: 'N/A', requests: '0/day' }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button size="sm">Train Model</Button>
                    <Button variant="outline" size="sm">API Keys</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>AI Models</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Manage and monitor predictive models</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {models.map((model, index) => (
                            <motion.div
                                key={model.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AccessibleCard className="glass-card p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-xl">{model.name}</h3>
                                            <p className="text-sm text-muted-foreground">{model.type}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${model.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {model.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="p-3 rounded-lg bg-card border border-border">
                                            <p className="text-muted-foreground mb-1">Accuracy</p>
                                            <p className="font-semibold">{model.accuracy}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-card border border-border">
                                            <p className="text-muted-foreground mb-1">Requests</p>
                                            <p className="font-semibold">{model.requests}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm">View Metrics</Button>
                                        <Button variant="outline" size="sm">Retrain</Button>
                                    </div>
                                </AccessibleCard>
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">API Latency</span>
                                    <span className="text-green-500 text-sm font-semibold">45ms</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Uptime</span>
                                    <span className="text-green-500 text-sm font-semibold">99.99%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm">Error Rate</span>
                                    <span className="text-green-500 text-sm font-semibold">0.01%</span>
                                </div>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu</h3>
                            <p className="text-sm text-muted-foreground">
                                Our models are trained on ethically sourced, community-verified data, ensuring fairness and reducing bias in automated decisions.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
