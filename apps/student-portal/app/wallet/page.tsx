'use client';
import { useEffect, useState } from 'react';
import { mintApi } from '../../../packages/lib/api-client';

export default function WalletPage() {
  const [wallet, setWallet] = useState({ balance: 100, transactions: [] });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    // Create wallet if doesn't exist
    mintApi.createWallet(userData.id).then(res => {
      if (res.success) setWallet(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <div className="text-lg mb-2">Total Balance</div>
          <div className="text-5xl font-bold mb-4">{wallet.balance} AZR</div>
          <div className="text-blue-100">≈ ${(wallet.balance * 0.5).toFixed(2)} USD</div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg">
            <div className="text-3xl mb-2">📤</div>
            <div className="font-bold">Send</div>
          </button>
          <button className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg">
            <div className="text-3xl mb-2">📥</div>
            <div className="font-bold">Receive</div>
          </button>
          <button className="bg-white p-6 rounded-lg shadow text-center hover:shadow-lg">
            <div className="text-3xl mb-2">💎</div>
            <div className="font-bold">Stake (15% APY)</div>
          </button>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <div className="font-bold">Welcome Bonus</div>
                <div className="text-sm text-gray-600">Just now</div>
              </div>
              <div className="text-green-600 font-bold">+100 AZR</div>
            </div>
            <div className="text-gray-600 text-center py-4">
              Start learning to earn more tokens!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
