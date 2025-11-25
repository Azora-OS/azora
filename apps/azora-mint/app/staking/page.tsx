'use client';

import { AppLayout, AccessibleCard, GradientText, Button, useWallet } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, Unlock, Calendar, Percent } from 'lucide-react';

export default function StakingPage() {
    const router = useRouter();
    const userId = "demo-user-001";
    const { balance } = useWallet(userId);

    const [stakeAmount, setStakeAmount] = useState('');
    const [lockPeriod, setLockPeriod] = useState(30);

    const displayBalance = balance || { learn: 0, azr: 0, staked: 0 };

    const stakingPools = [
        { id: 1, name: 'Flexible', apy: 5.0, lockDays: 0, minStake: 10, totalStaked: 1250000 },
        { id: 2, name: '30 Days', apy: 12.5, lockDays: 30, minStake: 50, totalStaked: 2500000 },
        { id: 3, name: '90 Days', apy: 18.0, lockDays: 90, minStake: 100, totalStaked: 5000000 },
        { id: 4, name: '180 Days', apy: 25.0, lockDays: 180, minStake: 500, totalStaked: 10000000 },
    ];

    const myStakes = [
        { id: 1, amount: 500, pool: '30 Days', apy: 12.5, startDate: '2025-11-01', endDate: '2025-12-01', earned: 5.21 },
        { id: 2, amount: 1000, pool: '90 Days', apy: 18.0, startDate: '2025-10-15', endDate: '2026-01-15', earned: 44.38 },
    ];

    const calculateRewards = () => {
        const amount = parseFloat(stakeAmount) || 0;
        const selectedPool = stakingPools.find(p => p.lockDays === lockPeriod);
        if (!selectedPool) return 0;

        const dailyRate = selectedPool.apy / 365 / 100;
        return amount * dailyRate * lockPeriod;
    };

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
                            <GradientText>Staking</GradientText>
                        </h1>
                        <p className="text-gray-400">Stake your tokens and earn passive rewards</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Back to Dashboard
                    </Button>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AccessibleCard className="p-6 border-purple-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-purple-500/20">
                                    <Lock className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Total Staked</div>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {displayBalance.staked.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">LEARN tokens</div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <AccessibleCard className="p-6 border-green-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-green-500/20">
                                    <TrendingUp className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Rewards Earned</div>
                                    <div className="text-3xl font-bold text-green-400">
                                        {myStakes.reduce((sum, stake) => sum + stake.earned, 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">From all stakes</div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AccessibleCard className="p-6 border-blue-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-blue-500/20">
                                    <Percent className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Average APY</div>
                                    <div className="text-3xl font-bold text-blue-400">
                                        {(myStakes.reduce((sum, stake) => sum + stake.apy, 0) / myStakes.length).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">Across all pools</div>
                        </AccessibleCard>
                    </motion.div>
                </div>

                {/* Staking Calculator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <AccessibleCard className="p-8">
                        <h2 className="text-2xl font-bold mb-6">Stake Calculator</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Amount to Stake</label>
                                    <input
                                        type="number"
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full px-4 py-3 rounded-xl bg-card/50 border border-border focus:border-primary outline-none"
                                    />
                                    <div className="text-sm text-gray-400 mt-2">
                                        Available: {displayBalance.learn.toFixed(2)} LEARN
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Lock Period</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {stakingPools.map(pool => (
                                            <button
                                                key={pool.id}
                                                onClick={() => setLockPeriod(pool.lockDays)}
                                                className={`px-4 py-3 rounded-xl border transition-all ${lockPeriod === pool.lockDays
                                                        ? 'bg-primary/20 border-primary'
                                                        : 'bg-card/30 border-border hover:border-primary/50'
                                                    }`}
                                            >
                                                <div className="font-bold">{pool.name}</div>
                                                <div className="text-sm text-gray-400">{pool.apy}% APY</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button variant="primary" className="w-full">
                                    Stake Tokens
                                </Button>
                            </div>

                            <div className="bg-card/30 rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold mb-4">Estimated Rewards</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Stake Amount</span>
                                        <span className="font-bold">{stakeAmount || '0'} LEARN</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Lock Period</span>
                                        <span className="font-bold">{lockPeriod} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">APY</span>
                                        <span className="font-bold text-primary">
                                            {stakingPools.find(p => p.lockDays === lockPeriod)?.apy}%
                                        </span>
                                    </div>
                                    <div className="border-t border-border pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Estimated Earnings</span>
                                            <span className="text-2xl font-bold text-green-400">
                                                +{calculateRewards().toFixed(2)} LEARN
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AccessibleCard>
                </motion.div>

                {/* Staking Pools */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Staking Pools</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stakingPools.map((pool, index) => (
                                <motion.div
                                    key={pool.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.35 + (index * 0.05) }}
                                    className="p-6 rounded-xl bg-card/30 border border-border hover:border-primary/50 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">{pool.name}</h3>
                                            <p className="text-gray-400 text-sm">
                                                {pool.lockDays === 0 ? 'No lock period' : `${pool.lockDays} days lock`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-primary">{pool.apy}%</div>
                                            <div className="text-gray-400 text-sm">APY</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Min Stake</span>
                                            <span>{pool.minStake} LEARN</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Staked</span>
                                            <span>{(pool.totalStaked / 1000000).toFixed(2)}M LEARN</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AccessibleCard>
                </motion.div>

                {/* My Stakes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">My Active Stakes</h2>
                        <div className="space-y-4">
                            {myStakes.map((stake, index) => (
                                <motion.div
                                    key={stake.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.55 + (index * 0.05) }}
                                    className="p-6 rounded-xl bg-card/30 border border-border"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-purple-500/20">
                                                <Lock className="h-6 w-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold">{stake.amount} LEARN</h3>
                                                <p className="text-gray-400 text-sm">{stake.pool} Pool</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-400">+{stake.earned} LEARN</div>
                                            <div className="text-gray-400 text-sm">{stake.apy}% APY</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-400">Start Date</div>
                                            <div className="font-bold">{stake.startDate}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">End Date</div>
                                            <div className="font-bold">{stake.endDate}</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full mt-4">
                                        <Unlock className="h-4 w-4 mr-2" />
                                        Unstake (Available {stake.endDate})
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
