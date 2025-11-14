'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { DollarSign, TrendingUp, List } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', earnings: 4000 },
  { name: 'Feb', earnings: 3000 },
  { name: 'Mar', earnings: 5000 },
  { name: 'Apr', earnings: 4500 },
  { name: 'May', earnings: 6000 },
  { name: 'Jun', earnings: 8000 },
];

export default function WalletPage() {
  const { data: wallet, isLoading, error } = useWallet();

  return (
    <div className="min-h-screen text-white">
        <h1 className="text-4xl font-bold mb-8">Your Wallet</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wallet?.balance || 0} AZR</div>
              <p className="text-xs text-muted-foreground">Your current token balance</p>
            </CardContent>
          </Card>
           <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wallet?.lifetimeEarnings || 0} AZR</div>
              <p className="text-xs text-muted-foreground">Total tokens earned</p>
            </CardContent>
          </Card>
           <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wallet?.transactions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total transactions made</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your AZR earnings over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                 <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                  <Area type="monotone" dataKey="earnings" stroke="#14b8a6" fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your last 5 transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-slate-800">
                {wallet?.transactions?.slice(0, 5).map((tx: any) => (
                  <li key={tx.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{tx.type === 'credit' ? 'Earned' : 'Spent'}: {tx.description}</p>
                      <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount} AZR
                    </span>
                  </li>
                ))}
                 {!wallet?.transactions?.length && <p className="text-center text-muted-foreground py-4">No transactions yet.</p>}
              </ul>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
