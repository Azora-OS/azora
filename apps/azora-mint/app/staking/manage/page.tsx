'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Unlock, ArrowLeft, TrendingUp } from 'lucide-react';

export default function ManageStakesPage() {
    const router = useRouter();

    const activeStakes = [
        { id: 1, amount: 500, pool: '30 Days', apy: 12.5, startDate: '2025-11-01', endDate: '2025-12-01', earned: 5.21, daysLeft: 6 },
        { id: 2, amount: 1000, pool: '90 Days', apy: 18.0, startDate: '2025-10-15', endDate: '2026-01-15', earned: 44.38, daysLeft: 51 },
        { id: 3, amount: 250, pool: 'Flexible', apy: 5.0, startDate: '2025-11-20', endDate: null, earned: 0.68, daysLeft: 0 },
    ];

    return (
        <AppLayout appName="Azora Mint" userName="User">
            <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/staking')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Staking
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Manage Stakes</GradientText>
                    </h1>
                    <p className="text-gray-400">View and manage your active stakes</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <AccessibleCard className="p-6 border-purple-500/50">
                            <div className="text-gray-400 text-sm mb-1">Total Staked</div>
                            <div className="text-3xl font-bold text-purple-400">
                                {activeStakes.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">LEARN tokens</div>
                        </AccessibleCard>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <AccessibleCard className="p-6 border-green-500/50">
                            <div className="text-gray-400 text-sm mb-1">Total Earned</div>
                            <div className="text-3xl font-bold text-green-400">
                                {activeStakes.reduce((sum, s) => sum + s.earned, 0).toFixed(2)}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">LEARN tokens</div>
                        </AccessibleCard>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <AccessibleCard className="p-6 border-blue-500/50">
                            <div className="text-gray-400 text-sm mb-1">Active Stakes</div>
                            <div className="text-3xl font-bold text-blue-400">{activeStakes.length}</div>
                            <div className="text-gray-400 text-sm mt-1">Positions</div>
                        </AccessibleCard>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Your Stakes</h2>
                        <div className="space-y-4">
                            {activeStakes.map((stake, i) => (
                                <motion.div
                                    key={stake.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.05) }}
                                    className="p-6 rounded-xl bg-card/30 border border-border"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-purple-500/20">
                                                <Lock className="h-6 w-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{stake.amount} LEARN</h3>
                                                <p className="text-gray-400 text-sm">{stake.pool} Pool • {stake.apy}% APY</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-400">+{stake.earned} LEARN</div>
                                            <div className="text-gray-400 text-sm">Earned</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <div className="text-gray-400">Start Date</div>
                                            <div className="font-bold">{stake.startDate}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">End Date</div>
                                            <div className="font-bold">{stake.endDate || 'Flexible'}</div>
                                        </div>
                                    </div>

                                    {stake.daysLeft > 0 && (
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-gray-400 mb-2">
                                                <span>Time Remaining</span>
                                                <span>{stake.daysLeft} days</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all"
                                                    style={{ width: `${100 - (stake.daysLeft / 90 * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1">
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Compound
                                        </Button>
                                        <Button
                                            variant={stake.daysLeft === 0 ? 'primary' : 'outline'}
                                            className="flex-1"
                                            disabled={stake.daysLeft > 0}
                                        >
                                            <Unlock className="h-4 w-4 mr-2" />
                                            {stake.daysLeft === 0 ? 'Unstake' : `Locked (${stake.daysLeft}d)`}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
