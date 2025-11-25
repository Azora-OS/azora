'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ClaimRewardsPage() {
    const router = useRouter();

    const claimableRewards = [
        { id: 1, title: 'Mining Rewards', amount: 125.50, token: 'LEARN', date: '2025-11-24', status: 'ready' },
        { id: 2, title: 'Staking Rewards', amount: 45.25, token: 'AZR', date: '2025-11-23', status: 'ready' },
        { id: 3, title: 'Referral Bonus', amount: 75.00, token: 'LEARN', date: '2025-11-22', status: 'ready' },
        { id: 4, title: 'Achievement Unlock', amount: 50.00, token: 'AZR', date: '2025-11-25', status: 'pending' },
    ];

    const totalClaimable = claimableRewards
        .filter(r => r.status === 'ready')
        .reduce((sum, r) => sum + r.amount, 0);

    return (
        <AppLayout appName="Azora Mint" userName="User">
            <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="outline" onClick={() => router.push('/rewards')} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Rewards
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Claim Rewards</GradientText>
                    </h1>
                    <p className="text-gray-400">Collect your earned rewards</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <AccessibleCard className="p-8 border-green-500/50">
                        <div className="text-center mb-6">
                            <div className="text-gray-400 text-sm mb-2">Total Claimable</div>
                            <div className="text-5xl font-bold text-green-400">{totalClaimable.toFixed(2)}</div>
                            <div className="text-gray-400 text-sm mt-2">LEARN + AZR Tokens</div>
                        </div>
                        <Button variant="primary" className="w-full" disabled={totalClaimable === 0}>
                            <Gift className="h-5 w-5 mr-2" />
                            Claim All Rewards
                        </Button>
                    </AccessibleCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Available Rewards</h2>
                        <div className="space-y-4">
                            {claimableRewards.map((reward, i) => (
                                <motion.div
                                    key={reward.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 + (i * 0.05) }}
                                    className="p-6 rounded-xl bg-card/30 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${reward.status === 'ready' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                                            }`}>
                                            {reward.status === 'ready' ? (
                                                <CheckCircle className="h-6 w-6 text-green-400" />
                                            ) : (
                                                <Gift className="h-6 w-6 text-yellow-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{reward.title}</h3>
                                            <p className="text-gray-400 text-sm">{reward.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-primary">
                                                +{reward.amount} {reward.token}
                                            </div>
                                            <div className={`text-xs ${reward.status === 'ready' ? 'text-green-400' : 'text-yellow-400'
                                                }`}>
                                                {reward.status === 'ready' ? 'Ready to claim' : 'Processing'}
                                            </div>
                                        </div>
                                        <Button
                                            variant={reward.status === 'ready' ? 'primary' : 'outline'}
                                            size="sm"
                                            disabled={reward.status !== 'ready'}
                                        >
                                            Claim
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
