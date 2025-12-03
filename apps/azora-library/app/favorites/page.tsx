'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function FavoritesPage() {
    const favorites = [
        { id: 1, title: 'Calculus II Complete Guide', type: 'PDF', size: '12 MB', savedDate: '2024-11-20', category: 'Mathematics' },
        { id: 2, title: 'Introduction to Blockchain', type: 'Video', size: '450 MB', savedDate: '2024-11-18', category: 'Technology' },
        { id: 3, title: 'Python Programming Basics', type: 'Code', size: '2 MB', savedDate: '2024-11-15', category: 'Programming' }
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PDF': return '📄';
            case 'Video': return '🎥';
            case 'Code': return '💻';
            default: return '📁';
        }
    };

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Clear All</Button>
                    <Button size="sm">Export List</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Favorites</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Your saved resources</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{favorites.length}</div>
                        <div className="text-sm text-muted-foreground">Saved Resources</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">464 MB</div>
                        <div className="text-sm text-muted-foreground">Total Size</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">3</div>
                        <div className="text-sm text-muted-foreground">Categories</div>
                    </AccessibleCard>
                </div>

                <div className="space-y-4">
                    {favorites.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AccessibleCard className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">{getTypeIcon(item.type)}</div>
                                        <div>
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span>{item.type}</span>
                                                <span>•</span>
                                                <span>{item.size}</span>
                                                <span>•</span>
                                                <span>{item.category}</span>
                                                <span>•</span>
                                                <span>Saved {new Date(item.savedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">View</Button>
                                        <Button variant="outline" size="sm">Remove</Button>
                                    </div>
                                </div>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Curate and organize knowledge to accelerate your learning journey and share discoveries with peers.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
