'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function DatasetsPage() {
    const datasets = [
        { id: 1, name: 'Global Blockchain Transactions 2024', size: '450 GB', downloads: '1.2k', license: 'CC-BY' },
        { id: 2, name: 'DeFi Lending Rates Historical', size: '25 GB', downloads: '890', license: 'CC0' },
        { id: 3, name: 'Crypto Sentiment Analysis Corpus', size: '12 GB', downloads: '2.4k', license: 'CC-BY-SA' }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button size="sm">Upload Dataset</Button>
                    <Button variant="outline" size="sm">Request Data</Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Open Datasets</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Access and share high-quality research data</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="space-y-6">
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="font-bold mb-4">Filters</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <select className="w-full mt-1 p-2 rounded bg-card border border-border text-sm">
                                        <option>All</option>
                                        <option>Finance</option>
                                        <option>Social</option>
                                        <option>Technical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">License</label>
                                    <div className="mt-1 space-y-1">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" /> CC0 (Public Domain)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" /> CC-BY
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </AccessibleCard>
                    </div>

                    <div className="lg:col-span-3 space-y-4">
                        {datasets.map((dataset, index) => (
                            <motion.div
                                key={dataset.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AccessibleCard className="glass-card p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">{dataset.name}</h3>
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <span>💾 {dataset.size}</span>
                                                <span>⬇️ {dataset.downloads}</span>
                                                <span>⚖️ {dataset.license}</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Download</Button>
                                    </div>
                                </AccessibleCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Data is a shared resource. By making datasets open and accessible, we empower the entire community to analyze, learn, and innovate.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
