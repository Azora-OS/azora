'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/header';
import { useWallet } from '@/hooks/use-wallet';
import { useTransactions } from '@/hooks/use-transactions';
import { ArrowUpRight, ArrowDownLeft, Award, TrendingUp } from 'lucide-react';

export default function WalletPage() {
  const { wallet, isLoading: walletLoading, startMining } = useWallet();
  const { data: transactions, isLoading: txLoading } = useTransactions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">My Wallet</h1>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-gradient-to-br from-teal-600 to-emerald-600 border-0">
            <CardHeader>
              <CardTitle className="text-white">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-16 w-48" />
              ) : (
                <>
                  <div className="text-5xl font-bold text-white mb-2">
                    {wallet?.balance || 0} AZR
                  </div>
                  <div className="text-teal-100">≈ ${((wallet?.balance || 0) * 0.5).toFixed(2)} USD</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Mining Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-white">{wallet?.miningRewards || 0} AZR</div>
                  <div className="text-slate-400">Earned from learning</div>
                </div>
                <Button onClick={() => startMining.mutate()} disabled={startMining.isPending}>
                  {startMining.isPending ? 'Starting...' : 'Start Mining'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : transactions?.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="h-5 w-5 text-green-400" /> : <ArrowUpRight className="h-5 w-5 text-red-400" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{tx.description}</div>
                        <div className="text-sm text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount} AZR
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet. Start learning to earn AZR!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
