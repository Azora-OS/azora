'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Zap } from 'lucide-react';

export default function LeaderboardPage() {
    const router = useRouter();

    const topMiners = [
        { rank: 1, name: 'CryptoMaster', tokens: 125000, proofs: 450, multiplier: 5.0, badge: 'Diamond' },
        { rank: 2, name: 'KnowledgeSeeker', tokens: 98500, proofs: 380, multiplier: 4.5, badge: 'Platinum' },
        { rank: 3, name: 'LearnToEarn', tokens: 87200, proofs: 320, multiplier: 4.0, badge: 'Platinum' },
        { rank: 4, name: 'ProofMaster', tokens: 76800, proofs: 290, multiplier: 3.8, badge: 'Gold' },
        { rank: 5, name: 'TokenHunter', tokens: 65400, proofs: 250, multiplier: 3.5, badge: 'Gold' },
        { rank: 6, name: 'MiningPro', tokens: 54200, proofs: 220, multiplier: 3.2, badge: 'Gold' },
        { rank: 7, name: 'SmartLearner', tokens: 48900, proofs: 200, multiplier: 3.0, badge: 'Silver' },
        { rank: 8, name: 'DataMiner', tokens: 42100, proofs: 180, multiplier: 2.8, badge: 'Silver' },
        { rank: 9, name: 'QuizMaster', tokens: 38700, proofs: 165, multiplier: 2.5, badge: 'Silver' },
        { rank: 10, name: 'StudyBuddy', tokens: 32500, proofs: 145, multiplier: 2.2, badge: 'Bronze' },
    ];

    const categories = [
        { id: 'all', name: 'All Time', active: true },
        { id: 'week', name: 'This Week', active: false },
        { id: 'month', name: 'This Month', active: false },
    ];

    const getBadgeColor = (badge: string) => {
        switch (badge) {
            case 'Diamond': return 'text-cyan-400 bg-cyan-500/20';
            case 'Platinum': return 'text-purple-400 bg-purple-500/20';
            case 'Gold': return 'text-yellow-400 bg-yellow-500/20';
            case 'Silver': return 'text-gray-300 bg-gray-500/20';
            case 'Bronze': return 'text-orange-400 bg-orange-500/20';
            default: return 'text-gray-400 bg-gray-500/20';
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="h-8 w-8 text-yellow-400" />;
            case 2: return <Medal className="h-8 w-8 text-gray-300" />;
            case 3: return <Medal className="h-8 w-8 text-orange-400" />;
            default: return <div className="text-2xl font-bold text-gray-400">#{rank}</div>;
        }
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
                            <GradientText>Leaderboard</GradientText>
                        </h1>
                        <p className="text-gray-400">Top miners and contributors in the ecosystem</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Back to Dashboard
                    </Button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <AccessibleCard className="p-6 border-yellow-500/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="h-6 w-6 text-yellow-400" />
                                <div className="text-gray-400 text-sm">Your Rank</div>
                            </div>
                            <div className="text-3xl font-bold text-yellow-400">#42</div>
                            <div className="text-gray-400 text-sm mt-2">Top 1% of miners</div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <AccessibleCard className="p-6 border-blue-500/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="h-6 w-6 text-blue-400" />
                                <div className="text-gray-400 text-sm">Your Tokens</div>
                            </div>
                            <div className="text-3xl font-bold text-blue-400">15,420</div>
                            <div className="text-gray-400 text-sm mt-2">LEARN earned</div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AccessibleCard className="p-6 border-green-500/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Award className="h-6 w-6 text-green-400" />
                                <div className="text-gray-400 text-sm">Proofs Submitted</div>
                            </div>
                            <div className="text-3xl font-bold text-green-400">87</div>
                            <div className="text-gray-400 text-sm mt-2">Validated</div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <AccessibleCard className="p-6 border-purple-500/50">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="h-6 w-6 text-purple-400" />
                                <div className="text-gray-400 text-sm">Multiplier</div>
                            </div>
                            <div className="text-3xl font-bold text-purple-400">2.1x</div>
                            <div className="text-gray-400 text-sm mt-2">Current rate</div>
                        </AccessibleCard>
                    </motion.div>
                </div>

                {/* Category Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`px-6 py-3 rounded-xl border transition-all ${cat.active
                                        ? 'bg-primary/20 border-primary'
                                        : 'bg-card/30 border-border hover:border-primary/50'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Leaderboard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Top Miners</h2>
                        <div className="space-y-3">
                            {topMiners.map((miner, index) => (
                                <motion.div
                                    key={miner.rank}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (index * 0.03) }}
                                    className={`p-6 rounded-xl border transition-all ${miner.rank <= 3
                                            ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/50'
                                            : 'bg-card/30 border-border hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            {/* Rank */}
                                            <div className="w-16 flex items-center justify-center">
                                                {getRankIcon(miner.rank)}
                                            </div>

                                            {/* User Info */}
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-bold">{miner.name}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(miner.badge)}`}>
                                                        {miner.badge}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span>{miner.proofs} proofs</span>
                                                    <span>•</span>
                                                    <span>{miner.multiplier}x multiplier</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tokens */}
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">
                                                {miner.tokens.toLocaleString()}
                                            </div>
                                            <div className="text-gray-400 text-sm">LEARN tokens</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AccessibleCard>
                </motion.div>

                {/* Your Position */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <AccessibleCard className="p-6 border-primary/50">
                        <h2 className="text-xl font-bold mb-4">Your Position</h2>
                        <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-primary/20 to-transparent">
                            <div className="flex items-center gap-6">
                                <div className="w-16 flex items-center justify-center">
                                    <div className="text-3xl font-bold text-primary">#42</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold">You</h3>
                                        <span className="px-3 py-1 rounded-full text-xs font-bold text-orange-400 bg-orange-500/20">
                                            Bronze
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span>87 proofs</span>
                                        <span>•</span>
                                        <span>2.1x multiplier</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary">15,420</div>
                                <div className="text-gray-400 text-sm">LEARN tokens</div>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-gray-400 text-sm">
                            You need <span className="text-primary font-bold">17,080 more tokens</span> to reach rank #41
                        </div>
                    </AccessibleCard>
                </motion.div>
            </div>
        </AppLayout>
    );
}
