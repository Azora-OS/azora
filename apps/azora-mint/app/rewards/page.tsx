'use client';

import { AppLayout, AccessibleCard, GradientText, Button, useWallet } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Zap, CheckCircle, Clock } from 'lucide-react';

export default function RewardsPage() {
    const router = useRouter();
    const userId = "demo-user-001";
    const { balance } = useWallet(userId);

    const displayBalance = balance || { learn: 0, azr: 0, earned: 0 };

    // Mock rewards data
    const recentRewards = [
        { id: 1, type: 'Mining', amount: 25.50, token: 'LEARN', date: '2025-11-24 14:30', multiplier: 2.0 },
        { id: 2, type: 'Course Completion', amount: 50.00, token: 'LEARN', date: '2025-11-23 10:15', multiplier: 1.5 },
        { id: 3, type: 'Proof-of-Knowledge', amount: 100.00, token: 'AZR', date: '2025-11-22 16:45', multiplier: 3.0 },
        { id: 4, type: 'Daily Login', amount: 5.00, token: 'LEARN', date: '2025-11-21 08:00', multiplier: 1.0 },
        { id: 5, type: 'Referral Bonus', amount: 75.00, token: 'AZR', date: '2025-11-20 12:30', multiplier: 2.5 },
    ];

    const achievements = [
        { id: 1, title: 'First Steps', description: 'Complete your first course', earned: true, reward: 10 },
        { id: 2, title: 'Knowledge Seeker', description: 'Earn 100 LEARN tokens', earned: true, reward: 25 },
        { id: 3, title: 'Mining Master', description: 'Mine for 100 hours', earned: false, reward: 50, progress: 45 },
        { id: 4, title: 'Proof Expert', description: 'Submit 50 proofs', earned: false, reward: 100, progress: 32 },
    ];

    return (
        <AppLayout appName="Azora Mint" userName="Azora Citizen">
            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            <GradientText>Rewards</GradientText>
                        </h1>
                        <p className="text-gray-400">Track your earnings and achievements</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Back to Dashboard
                    </Button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AccessibleCard className="p-6 border-green-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-green-500/20">
                                    <TrendingUp className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Total Earned</div>
                                    <div className="text-3xl font-bold text-green-400">
                                        {displayBalance.earned.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">All-time earnings</div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <AccessibleCard className="p-6 border-blue-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-blue-500/20">
                                    <Zap className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">This Week</div>
                                    <div className="text-3xl font-bold text-blue-400">
                                        {(displayBalance.earned * 0.15).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">+25% from last week</div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AccessibleCard className="p-6 border-purple-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-purple-500/20">
                                    <Award className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Achievements</div>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {achievements.filter(a => a.earned).length}/{achievements.length}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">Unlock more rewards</div>
                        </AccessibleCard>
                    </motion.div>
                </div>

                {/* Recent Rewards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Recent Rewards</h2>
                        <div className="space-y-4">
                            {recentRewards.map((reward, index) => (
                                <motion.div
                                    key={reward.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (index * 0.05) }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-green-500/20">
                                            <Award className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{reward.type}</div>
                                            <div className="text-gray-400 text-sm">{reward.date}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-green-400">
                                            +{reward.amount} {reward.token}
                                        </div>
                                        <div className="text-gray-400 text-sm">{reward.multiplier}x multiplier</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AccessibleCard>
                </motion.div>

                {/* Achievements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Achievements</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {achievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.55 + (index * 0.05) }}
                                    className={`p-6 rounded-xl border ${achievement.earned
                                            ? 'bg-green-500/10 border-green-500/50'
                                            : 'bg-card/30 border-border'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {achievement.earned ? (
                                                <CheckCircle className="h-6 w-6 text-green-400" />
                                            ) : (
                                                <Clock className="h-6 w-6 text-gray-400" />
                                            )}
                                            <div>
                                                <h3 className="font-bold">{achievement.title}</h3>
                                                <p className="text-gray-400 text-sm">{achievement.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-primary">
                                                +{achievement.reward} LEARN
                                            </div>
                                        </div>
                                    </div>
                                    {!achievement.earned && achievement.progress && (
                                        <div>
                                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                                <span>Progress</span>
                                                <span>{achievement.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${achievement.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
