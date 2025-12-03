'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

export default function MiningPage() {
    const [miningStats, setMiningStats] = useState<any>(null);
    const [isMining, setIsMining] = useState(false);
    const ubuntuServices = useUbuntuServices();

    useEffect(() => {
        loadMiningStats();
    }, []);

    const loadMiningStats = async () => {
        const stats = {
            totalMined: 1250,
            todayMined: 45,
            miningPower: 85,
            activeTasks: 3,
            pendingRewards: 12.5,
            rank: 142,
            efficiency: 92,
            recentMining: [
                { id: 1, activity: 'Completed Advanced Math Course', reward: 200, time: '2 hours ago' },
                { id: 2, activity: 'Helped 5 students in community', reward: 125, time: '5 hours ago' },
                { id: 3, activity: 'Achieved 15-day streak', reward: 100, time: '1 day ago' }
            ]
        };
        setMiningStats(stats);
    };

    const handleStartMining = async () => {
        setIsMining(true);
        await ubuntuServices.events.publishEvent('mining.started', {
            userId: 'demo-student-001',
            timestamp: new Date().toISOString()
        }, 'azora-mint');

        setTimeout(() => {
            setIsMining(false);
            alert('Mining session completed! +15 AZR earned');
        }, 3000);
    };

    if (!miningStats) {
        return <AppLayout><div className="flex items-center justify-center h-screen">Loading...</div></AppLayout>;
    }

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Mining History</Button>
                    <Button size="sm">Claim Rewards</Button>
                </div>
            }
        >
            <div className="max-w-6xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Proof of Knowledge Mining</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Earn AZR tokens through verified learning and contribution</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">{miningStats.totalMined} AZR</div>
                        <div className="text-sm text-muted-foreground">Total Mined</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">+{miningStats.todayMined} AZR</div>
                        <div className="text-sm text-muted-foreground">Today</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">{miningStats.miningPower}%</div>
                        <div className="text-sm text-muted-foreground">Mining Power</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">#{miningStats.rank}</div>
                        <div className="text-sm text-muted-foreground">Global Rank</div>
                    </AccessibleCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <AccessibleCard className="glass-card p-8">
                            <h2 className="text-2xl font-bold mb-4">Start Mining</h2>
                            <div className="text-center py-8">
                                {!isMining ? (
                                    <>
                                        <div className="text-6xl mb-4">⛏️</div>
                                        <p className="text-muted-foreground mb-6">
                                            Complete learning activities to mine AZR tokens
                                        </p>
                                        <Button size="lg" onClick={handleStartMining}>
                                            Start Mining Session
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-6xl mb-4 animate-bounce">⛏️</div>
                                        <p className="text-primary font-bold mb-2">Mining in Progress...</p>
                                        <p className="text-sm text-muted-foreground">Verifying your knowledge contributions</p>
                                    </>
                                )}
                            </div>
                        </AccessibleCard>

                        <section>
                            <h2 className="text-2xl font-bold mb-4">Recent Mining Activity</h2>
                            <div className="space-y-3">
                                {miningStats.recentMining.map((activity: any, index: number) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <AccessibleCard className="glass-card p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">{activity.activity}</p>
                                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-green-500">+{activity.reward} AZR</div>
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
                            <h3 className="text-lg font-bold mb-4">Mining Opportunities</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Complete Course:</span>
                                    <span className="font-semibold text-green-500">+200 AZR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Help Peer:</span>
                                    <span className="font-semibold text-green-500">+25 AZR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Daily Streak:</span>
                                    <span className="font-semibold text-green-500">+10 AZR</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Perfect Score:</span>
                                    <span className="font-semibold text-green-500">+50 AZR</span>
                                </div>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground italic mb-2">
                                "Ngiyakwazi ngoba sikwazi"
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Mining rewards are based on your contribution to collective knowledge and community prosperity.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
