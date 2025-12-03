'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function HistoryPage() {
    const history = [
        { id: 1, title: 'Advanced Calculus Textbook', type: 'PDF', viewedDate: '2024-12-01 14:30', duration: '45 min' },
        { id: 2, title: 'Blockchain Fundamentals Video', type: 'Video', viewedDate: '2024-11-30 10:15', duration: '1h 20min' },
        { id: 3, title: 'Python Data Structures', type: 'Code', viewedDate: '2024-11-29 16:45', duration: '30 min' },
        { id: 4, title: 'Machine Learning Paper', type: 'PDF', viewedDate: '2024-11-28 09:00', duration: '2h 15min' }
    ];

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Clear History</Button>
                    <Button size="sm">Export</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Reading History</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Track your learning journey</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{history.length}</div>
                        <div className="text-sm text-muted-foreground">Resources Viewed</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">5h 50min</div>
                        <div className="text-sm text-muted-foreground">Total Time</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">Today</div>
                        <div className="text-sm text-muted-foreground">Last Activity</div>
                    </AccessibleCard>
                </div>

                <div className="space-y-4">
                    {history.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>{item.type}</span>
                                            <span>•</span>
                                            <span>Viewed {item.viewedDate}</span>
                                            <span>•</span>
                                            <span>Duration: {item.duration}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">View Again</Button>
                                        <Button variant="outline" size="sm">Save</Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Your learning history helps you track progress and revisit valuable resources, contributing to continuous growth.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
