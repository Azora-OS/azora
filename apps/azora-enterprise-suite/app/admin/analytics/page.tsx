'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function AnalyticsPage() {
    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Enterprise Analytics</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Deep insights into organization performance</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">1,245</div>
                        <div className="text-sm text-muted-foreground">Active Users</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">98%</div>
                        <div className="text-sm text-muted-foreground">Engagement Rate</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">45.2k</div>
                        <div className="text-sm text-muted-foreground">Transactions</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">12</div>
                        <div className="text-sm text-muted-foreground">Pending Alerts</div>
                    </AccessibleCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AccessibleCard className="glass-card p-6 h-[400px] flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <span className="text-6xl block mb-4">📈</span>
                            <p>User Growth Chart Placeholder</p>
                        </div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6 h-[400px] flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <span className="text-6xl block mb-4">🥧</span>
                            <p>Resource Usage Distribution Placeholder</p>
                        </div>
                    </AccessibleCard>
                </div>

                <AccessibleCard className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-muted-foreground">
                        Transparent analytics empower organizations to make informed decisions that benefit the entire community of stakeholders.
                    </p>
                </AccessibleCard>
            </div>
        </AppLayout>
    );
}
