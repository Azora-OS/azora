'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function CategoriesPage() {
    const categories = [
        { id: 1, name: 'Mathematics', icon: '📐', resources: 1245, color: 'from-blue-500 to-cyan-500' },
        { id: 2, name: 'Computer Science', icon: '💻', resources: 2340, color: 'from-purple-500 to-pink-500' },
        { id: 3, name: 'Physics', icon: '⚛️', resources: 890, color: 'from-green-500 to-emerald-500' },
        { id: 4, name: 'Chemistry', icon: '🧪', resources: 756, color: 'from-orange-500 to-red-500' },
        { id: 5, name: 'Biology', icon: '🧬', resources: 1120, color: 'from-teal-500 to-cyan-500' },
        { id: 6, name: 'Engineering', icon: '⚙️', resources: 1580, color: 'from-indigo-500 to-violet-500' },
        { id: 7, name: 'Business', icon: '💼', resources: 980, color: 'from-yellow-500 to-amber-500' },
        { id: 8, name: 'Arts & Humanities', icon: '🎨', resources: 670, color: 'from-pink-500 to-rose-500' }
    ];

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Browse Categories</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Explore resources by subject</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <AccessibleCard className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {category.icon}
                                </div>
                                <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {category.resources.toLocaleString()} resources
                                </p>
                                <Button variant="outline" className="w-full">
                                    Explore
                                </Button>
                            </AccessibleCard>
                        </motion.div>
                    ))}
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Our library is community-curated, with resources contributed by learners worldwide. Every category grows through collective knowledge sharing.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
