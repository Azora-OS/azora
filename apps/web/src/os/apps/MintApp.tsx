import React, { useState } from 'react';
import { Coins, ArrowUpRight, ArrowDownRight, Zap, Lock } from 'lucide-react';
import { useWalletQuery, useTransactionsQuery } from '@azora/api-client/react-query-hooks';

export const MintApp: React.FC = () => {
    const { data: walletData, isLoading: isWalletLoading } = useWalletQuery('current-user');
    const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactionsQuery({ limit: 10 });
    const [activeTab, setActiveTab] = useState<'wallet' | 'mining' | 'staking'>('wallet');
    const [stakeAmount, setStakeAmount] = useState('');
    const [stakeDuration, setStakeDuration] = useState(90);

    const loading = isWalletLoading || isTransactionsLoading;
    const wallet = walletData?.data || { balance: 0, staked: 0, earned: 0, pendingRewards: 0 };
    const transactions = transactionsData?.data || [];


    const handleStake = async () => {
        const amount = parseFloat(stakeAmount);
        if (!amount || amount <= 0 || amount > wallet.balance) return;
        try {
            const { getApiClient } = await import('@azora/api-client/react-query-hooks');
            const client = getApiClient();
            await client.wallet.stake(amount, stakeDuration);
            setStakeAmount('');
        } catch (err) {
            console.error('Failed to stake:', err);
            alert('Failed to stake tokens. Please try again.');
        }
    };

    const getAPY = (duration: number) => {
        if (duration === 30) return 5;
        if (duration === 90) return 10;
        if (duration === 365) return 15;
        return 0;
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-yellow-950/20 to-slate-900">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-bold text-white mb-4">Azora Mint</h1>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-white/60 mb-1">Total Balance</p>
                            <h2 className="text-4xl font-bold text-white">{wallet.balance.toFixed(2)} AZR</h2>
                        </div>
                        <div className="p-4 bg-yellow-500/20 rounded-full">
                            <Coins size={32} className="text-yellow-400" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-white/40 mb-1">Staked</p>
                            <p className="text-lg font-semibold text-white">{wallet.staked.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/40 mb-1">Total Earned</p>
                            <p className="text-lg font-semibold text-white">{wallet.earned.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/40 mb-1">Pending</p>
                            <p className="text-lg font-semibold text-green-400">+{wallet.pendingRewards.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {(['wallet', 'mining', 'staking'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-yellow-500 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'wallet' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                        {transactions.map(tx => (
                            <div key={tx.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${tx.type === 'earn' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {tx.type === 'earn' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{tx.description}</p>
                                        <p className="text-xs text-white/40">{new Date(tx.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className={`text-lg font-semibold ${tx.type === 'earn' ? 'text-green-400' : 'text-white'}`}>
                                    {tx.type === 'earn' ? '+' : '-'}{tx.amount.toFixed(2)} AZR
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'mining' && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="text-yellow-400" size={24} />
                            <h3 className="text-lg font-semibold text-white">Proof-of-Knowledge Mining</h3>
                        </div>
                        <p className="text-white/60 mb-6">Earn AZR tokens by completing courses and assessments</p>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-white/40 mb-1">Course Completion</p>
                                <p className="text-2xl font-bold text-white">10 AZR</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-white/40 mb-1">Job Completion</p>
                                <p className="text-2xl font-bold text-white">50 AZR</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <p className="text-xs text-white/40 mb-1">Assessment</p>
                                <p className="text-2xl font-bold text-white">5 AZR</p>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors">
                            Start Learning to Mine
                        </button>
                    </div>
                )}
                {activeTab === 'staking' && (
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Lock className="text-blue-400" size={24} />
                                <h3 className="text-lg font-semibold text-white">Stake AZR Tokens</h3>
                            </div>
                            <p className="text-white/60 mb-6">Lock your tokens to earn passive rewards</p>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {[30, 90, 365].map(duration => (
                                    <div key={duration} onClick={() => setStakeDuration(duration)} className={`p-4 rounded-lg cursor-pointer transition-all ${stakeDuration === duration ? 'bg-blue-500/20 border-2 border-blue-500' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}>
                                        <p className="text-xs text-white/40 mb-1">{duration} Days</p>
                                        <p className="text-2xl font-bold text-white">{getAPY(duration)}% APY</p>
                                        {duration === 90 && <p className="text-xs text-green-400 mt-1">Recommended</p>}
                                    </div>
                                ))}
                            </div>
                            <div className="mb-4">
                                <label className="text-sm text-white/60 mb-2 block">Amount to Stake</label>
                                <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="0.00" max={wallet.balance} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50" />
                                <p className="text-xs text-white/40 mt-1">Available: {wallet.balance.toFixed(2)} AZR</p>
                            </div>
                            <button onClick={handleStake} disabled={!stakeAmount || parseFloat(stakeAmount) <= 0} className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors">
                                Stake Tokens
                            </button>
                        </div>
                        {wallet.staked > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                <h4 className="text-lg font-semibold text-white mb-4">Your Stakes</h4>
                                <div className="bg-white/5 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white/60">Staked Amount</span>
                                        <span className="text-white font-semibold">{wallet.staked.toFixed(2)} AZR</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white/60">Duration</span>
                                        <span className="text-white">90 Days (10% APY)</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/60">Estimated Rewards</span>
                                        <span className="text-green-400 font-semibold">+{(wallet.staked * 0.1).toFixed(2)} AZR</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
