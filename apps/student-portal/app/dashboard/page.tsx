"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AzoraLogo } from "@/components/azora-logo";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import { Coins, TrendingUp, Zap, Award } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { wallet, isLoading, startMining } = useWallet();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <AzoraLogo size={32} showText />
            <div className="text-teal-400 font-semibold">Wallet Dashboard</div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-teal-400">{user?.firstName || 'Student'}</span>
          </h1>
          <p className="text-slate-400">Track your AZR earnings and learning progress</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">AZR Balance</CardTitle>
              <Coins className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {wallet?.balance?.toLocaleString() || '0'} AZR
              </div>
              <p className="text-xs text-slate-400">
                ≈ ${((wallet?.balance || 0) * 0.1).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Staked AZR</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {wallet?.staked?.toLocaleString() || '0'} AZR
              </div>
              <p className="text-xs text-slate-400">
                +{((wallet?.staked || 0) * 0.05).toFixed(1)} AZR/day
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Mining Power</CardTitle>
              <Zap className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {wallet?.miningPower || '0'} H/s
              </div>
              <p className="text-xs text-slate-400">
                Proof-of-Knowledge rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Earned</CardTitle>
              <Award className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {wallet?.totalEarned?.toLocaleString() || '0'} AZR
              </div>
              <p className="text-xs text-slate-400">
                Lifetime learning rewards
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Proof-of-Knowledge Mining</CardTitle>
              <CardDescription>Earn AZR tokens by demonstrating your learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">⛏️</div>
                <p className="text-slate-400 mb-4">
                  Start mining AZR tokens through learning activities
                </p>
                <Button 
                  onClick={() => startMining.mutate()}
                  variant="azora"
                  disabled={startMining.isPending}
                  className="w-full"
                >
                  {startMining.isPending ? "Starting..." : "Start Mining"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription>Your latest AZR earnings and spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wallet?.transactions?.slice(0, 5).map((tx: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        tx.type === 'mining' ? 'bg-green-400' : 
                        tx.type === 'staking' ? 'bg-blue-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <p className="text-sm text-white font-medium">{tx.description}</p>
                        <p className="text-xs text-slate-400">{tx.timestamp}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} AZR
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-slate-400">
                    No transactions yet. Start learning to earn AZR!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}