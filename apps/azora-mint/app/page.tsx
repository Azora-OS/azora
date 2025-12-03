'use client';

import { AppLayout, AccessibleCard, GradientText, Button, FinanceDashboard, useWallet, SignatureStamp, UbuntuPhilosophyCard } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, Zap, Award, ArrowRight, Play, Pause } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const userId = "demo-user-001"; // TODO: Get from auth context
  const { balance, loading, error } = useWallet(userId);

  const [miningActive, setMiningActive] = useState(false);
  const [miningStats, setMiningStats] = useState({
    hashRate: 0,
    tokensEarned: 0,
    uptime: 0,
    difficulty: 1.0
  });

  // Simulate mining activity
  useEffect(() => {
    if (!miningActive) return;

    const interval = setInterval(() => {
      setMiningStats(prev => ({
        hashRate: Math.random() * 100 + 50,
        tokensEarned: prev.tokensEarned + (Math.random() * 0.1),
        uptime: prev.uptime + 1,
        difficulty: 1.0 + (Math.random() * 0.5)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [miningActive]);

  const displayBalance = balance || {
    learn: 0,
    azr: 0,
    staked: 0,
    earned: 0,
    converted: 0
  };

  const toggleMining = () => {
    setMiningActive(!miningActive);
    if (!miningActive) {
      setMiningStats({ hashRate: 0, tokensEarned: 0, uptime: 0, difficulty: 1.0 });
    }
  };

  return (
    <AppLayout appName="Azora Mint" userName="Azora Citizen">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold tracking-tighter">
            <GradientText>Azora Mint</GradientText>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Proof-of-Knowledge Token Mining Dashboard
          </p>
        </motion.div>

        {/* Finance Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading && <div className="text-center text-gray-400 mb-4">Loading wallet...</div>}
          {error && <div className="text-center text-red-400 mb-4">Error loading wallet. Using offline mode.</div>}
          <FinanceDashboard
            balance={displayBalance}
            miningActive={miningActive}
            miningMultiplier={2.0}
            premiumTier="bronze"
            stakingAPY={12.5}
          />
        </motion.div>

        {/* Mining Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AccessibleCard className="p-8 border-primary/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${miningActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  <Zap className={`h-6 w-6 ${miningActive ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Mining Status</h2>
                  <p className="text-gray-400">
                    {miningActive ? 'Active Mining Session' : 'Mining Inactive'}
                  </p>
                </div>
              </div>
              <Button
                variant={miningActive ? 'outline' : 'primary'}
                onClick={toggleMining}
                className="flex items-center gap-2"
              >
                {miningActive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stop Mining
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Mining
                  </>
                )}
              </Button>
            </div>

            {/* Mining Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Hash Rate</div>
                <div className="text-2xl font-bold">
                  {miningActive ? miningStats.hashRate.toFixed(2) : '0.00'} H/s
                </div>
              </div>
              <div className="bg-card/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Tokens Earned</div>
                <div className="text-2xl font-bold text-green-400">
                  +{miningStats.tokensEarned.toFixed(4)} LEARN
                </div>
              </div>
              <div className="bg-card/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Uptime</div>
                <div className="text-2xl font-bold">
                  {Math.floor(miningStats.uptime / 60)}:{(miningStats.uptime % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="bg-card/30 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Difficulty</div>
                <div className="text-2xl font-bold">
                  {miningStats.difficulty.toFixed(2)}x
                </div>
              </div>
            </div>
          </AccessibleCard>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push('/wallet')}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Coins className="h-6 w-6 text-blue-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Wallet</h3>
              <p className="text-gray-400 text-sm mb-4">
                View your token balances and transaction history
              </p>
              <div className="text-2xl font-bold text-blue-400">
                {(displayBalance.learn + displayBalance.azr).toFixed(2)} Tokens
              </div>
            </AccessibleCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push('/rewards')}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Award className="h-6 w-6 text-green-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rewards</h3>
              <p className="text-gray-400 text-sm mb-4">
                Track your earnings and proof-of-knowledge submissions
              </p>
              <div className="text-2xl font-bold text-green-400">
                {displayBalance.earned.toFixed(2)} Earned
              </div>
            </AccessibleCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push('/staking')}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Staking</h3>
              <p className="text-gray-400 text-sm mb-4">
                Stake your tokens and earn passive rewards
              </p>
              <div className="text-2xl font-bold text-purple-400">
                {displayBalance.staked.toFixed(2)} Staked
              </div>
            </AccessibleCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <AccessibleCard className="p-6 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => router.push('/leaderboard')}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Award className="h-6 w-6 text-orange-400" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
              <p className="text-gray-400 text-sm mb-4">
                See top miners and contributors in the ecosystem
              </p>
              <div className="text-2xl font-bold text-orange-400">
                Rank #42
              </div>
            </AccessibleCard>
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <AccessibleCard className="p-8">
            <h2 className="text-2xl font-bold mb-4">How Proof-of-Knowledge Mining Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">1</div>
                <h3 className="text-lg font-bold mb-2">Learn & Contribute</h3>
                <p className="text-gray-400">
                  Complete courses, answer questions, and contribute knowledge to the Azora ecosystem.
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">2</div>
                <h3 className="text-lg font-bold mb-2">Prove Your Knowledge</h3>
                <p className="text-gray-400">
                  Submit proof-of-knowledge validations that demonstrate your learning progress.
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">3</div>
                <h3 className="text-lg font-bold mb-2">Earn Tokens</h3>
                <p className="text-gray-400">
                  Receive LEARN and AZR tokens as rewards for your contributions and knowledge.
                </p>
              </div>
            </div>
          </AccessibleCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <UbuntuPhilosophyCard
            collaborationScore={85}
            communityImpact={87}
            knowledgeSharing={90}
          />
        </motion.div>

        <div className="mt-12 mb-8">
          <SignatureStamp appName="Azora Mint" department="The Treasury" />
        </div>
    </AppLayout>
  );
}
