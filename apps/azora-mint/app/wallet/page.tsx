'use client';

import { AppLayout, AccessibleCard, GradientText, Button, useWallet } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Send, Download, ArrowUpRight, ArrowDownLeft, Copy, Check } from 'lucide-react';

export default function WalletPage() {
    const router = useRouter();
    const userId = "demo-user-001";
    const { balance, loading, error } = useWallet(userId);

    const [copied, setCopied] = useState(false);
    const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

    const displayBalance = balance || {
        learn: 0,
        azr: 0,
        staked: 0,
        earned: 0,
        converted: 0
    };

    // Mock transaction history
    const transactions = [
        { id: 1, type: 'receive', amount: 50.25, token: 'LEARN', from: 'Mining Rewards', date: '2025-11-24', status: 'completed' },
        { id: 2, type: 'send', amount: 10.00, token: 'AZR', to: 'Staking Pool', date: '2025-11-23', status: 'completed' },
        { id: 3, type: 'receive', amount: 25.50, token: 'LEARN', from: 'Course Completion', date: '2025-11-22', status: 'completed' },
        { id: 4, type: 'send', amount: 5.00, token: 'LEARN', to: 'Azora Pay', date: '2025-11-21', status: 'completed' },
        { id: 5, type: 'receive', amount: 100.00, token: 'AZR', from: 'Proof-of-Knowledge', date: '2025-11-20', status: 'completed' },
    ];

    const copyAddress = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                            <GradientText>Wallet</GradientText>
                        </h1>
                        <p className="text-gray-400">Manage your tokens and transactions</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/')}>
                        Back to Dashboard
                    </Button>
                </motion.div>

                {/* Wallet Address Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <AccessibleCard className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Wallet Address</div>
                                <div className="text-xl font-mono">{walletAddress}</div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={copyAddress}
                                className="flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                    </AccessibleCard>
                </motion.div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AccessibleCard className="p-6 border-blue-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-blue-500/20">
                                    <Wallet className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">LEARN Tokens</div>
                                    <div className="text-3xl font-bold text-blue-400">
                                        {displayBalance.learn.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">
                                ≈ ${(displayBalance.learn * 0.5).toFixed(2)} USD
                            </div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <AccessibleCard className="p-6 border-purple-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-purple-500/20">
                                    <Wallet className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">AZR Tokens</div>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {displayBalance.azr.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">
                                ≈ ${(displayBalance.azr * 1.2).toFixed(2)} USD
                            </div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <AccessibleCard className="p-6 border-green-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-green-500/20">
                                    <ArrowDownLeft className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Total Earned</div>
                                    <div className="text-3xl font-bold text-green-400">
                                        {displayBalance.earned.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">
                                All-time earnings
                            </div>
                        </AccessibleCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <AccessibleCard className="p-6 border-orange-500/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-orange-500/20">
                                    <ArrowUpRight className="h-6 w-6 text-orange-400" />
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Staked</div>
                                    <div className="text-3xl font-bold text-orange-400">
                                        {displayBalance.staked.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-400 text-sm">
                                Earning 12.5% APY
                            </div>
                        </AccessibleCard>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-xl bg-green-500/20">
                                    <Download className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Receive Tokens</h3>
                                    <p className="text-gray-400 text-sm">Get your wallet address or QR code</p>
                                </div>
                            </div>
                        </AccessibleCard>

                        <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-xl bg-blue-500/20">
                                    <Send className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Send Tokens</h3>
                                    <p className="text-gray-400 text-sm">Transfer to another wallet</p>
                                </div>
                            </div>
                        </AccessibleCard>
                    </div>
                </motion.div>

                {/* Transaction History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <AccessibleCard className="p-6">
                        <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
                        <div className="space-y-4">
                            {transactions.map((tx, index) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (index * 0.05) }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${tx.type === 'receive' ? 'bg-green-500/20' : 'bg-blue-500/20'
                                            }`}>
                                            {tx.type === 'receive' ? (
                                                <ArrowDownLeft className={`h-5 w-5 ${tx.type === 'receive' ? 'text-green-400' : 'text-blue-400'
                                                    }`} />
                                            ) : (
                                                <ArrowUpRight className="h-5 w-5 text-blue-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold">
                                                {tx.type === 'receive' ? 'Received from' : 'Sent to'} {tx.from || tx.to}
                                            </div>
                                            <div className="text-gray-400 text-sm">{tx.date}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xl font-bold ${tx.type === 'receive' ? 'text-green-400' : 'text-blue-400'
                                            }`}>
                                            {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.token}
                                        </div>
                                        <div className="text-gray-400 text-sm capitalize">{tx.status}</div>
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
