import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useWallet } from '../hooks/use-wallet';

interface WalletBalance {
  currency: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
  color: string;
}

interface SendFormData {
  currency: string;
  amount: string;
  recipient: string;
  message: string;
}

const WalletManagement: React.FC = () => {
  const { user } = useAuth();
  const { data: walletData, isLoading } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'receive' | 'exchange'>('overview');
  const [sendForm, setSendForm] = useState<SendFormData>({
    currency: 'AZR',
    amount: '',
    recipient: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  const walletBalances: WalletBalance[] = [
    {
      currency: 'AZR',
      balance: walletData?.balance || 0,
      usdValue: (walletData?.balance || 0) * 0.0125,
      change24h: 12.5,
      icon: '🪙',
      color: 'from-blue-500 to-purple-600'
    },
    {
      currency: 'BTC',
      balance: 0.0234,
      usdValue: 0.0234 * 47250,
      change24h: 3.2,
      icon: '₿',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      currency: 'ETH',
      balance: 1.567,
      usdValue: 1.567 * 3350,
      change24h: -1.8,
      icon: 'Ξ',
      color: 'from-purple-500 to-pink-500'
    },
    {
      currency: 'USD',
      balance: 2847.32,
      usdValue: 2847.32,
      change24h: 0,
      icon: '💵',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const response = await fetch('/api/wallet/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          ...sendForm,
          amount: parseFloat(sendForm.amount),
          senderId: user?.id
        })
      });

      if (response.ok) {
        alert('Transaction sent successfully! 🎉');
        setSendForm({ currency: 'AZR', amount: '', recipient: '', message: '' });
        setActiveTab('overview');
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Failed to send transaction. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const WalletCard = ({ wallet }: { wallet: WalletBalance }) => (
    <div className={`bg-gradient-to-br ${wallet.color} rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{wallet.icon}</span>
          <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
            {wallet.currency}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold">{wallet.balance.toLocaleString()}</p>
          <p className="text-white/80 text-sm">${wallet.usdValue.toLocaleString()}</p>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              wallet.change24h >= 0 
                ? 'bg-green-500/20 text-green-200' 
                : 'bg-red-500/20 text-red-200'
            }`}>
              {wallet.change24h >= 0 ? '↗' : '↘'} {Math.abs(wallet.change24h)}%
            </span>
            <span className="text-xs text-white/60">24h</span>
          </div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ tab, label, icon }: { tab: string; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
        activeTab === tab
          ? 'bg-indigo-500 text-white shadow-lg'
          : 'bg-white/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          💼 Wallet Management
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Your Ubuntu financial sovereignty center
        </p>
      </div>

      {/* Wallet Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {walletBalances.map((wallet) => (
          <WalletCard key={wallet.currency} wallet={wallet} />
        ))}
      </div>

      {/* Total Portfolio Value */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 mb-8">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-2">Total Portfolio Value</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            ${walletBalances.reduce((sum, w) => sum + w.usdValue, 0).toLocaleString()}
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm">
            <span className="flex items-center text-green-600">
              📈 +8.7% (24h)
            </span>
            <span className="flex items-center text-purple-600">
              🌍 Ubuntu Impact: 847 points
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 mb-8">
        <TabButton tab="overview" label="Overview" icon="📊" />
        <TabButton tab="send" label="Send" icon="💸" />
        <TabButton tab="receive" label="Receive" icon="💰" />
        <TabButton tab="exchange" label="Exchange" icon="🔄" />
      </div>

      {/* Tab Content */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Portfolio Overview</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Asset Allocation */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Asset Allocation</h4>
                <div className="space-y-4">
                  {walletBalances.map((wallet) => {
                    const percentage = (wallet.usdValue / walletBalances.reduce((sum, w) => sum + w.usdValue, 0)) * 100;
                    return (
                      <div key={wallet.currency} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{wallet.icon}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{wallet.currency}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{percentage.toFixed(1)}%</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">${wallet.usdValue.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {[
                    { type: 'Mining Reward', amount: '+12.5 AZR', time: '2 min ago', icon: '⛏️' },
                    { type: 'Payment Sent', amount: '-50.0 AZR', time: '1 hour ago', icon: '💸' },
                    { type: 'Knowledge Reward', amount: '+25.0 AZR', time: '3 hours ago', icon: '🧠' },
                    { type: 'Exchange', amount: '+0.001 BTC', time: '1 day ago', icon: '🔄' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{activity.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.type}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{activity.time}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${
                        activity.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {activity.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send Payment</h3>
            
            <form onSubmit={handleSend} className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Currency
                </label>
                <select
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={sendForm.currency}
                  onChange={(e) => setSendForm(prev => ({ ...prev, currency: e.target.value }))}
                >
                  {walletBalances.map((wallet) => (
                    <option key={wallet.currency} value={wallet.currency}>
                      {wallet.icon} {wallet.currency} (Balance: {wallet.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                  value={sendForm.amount}
                  onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter wallet address or username"
                  value={sendForm.recipient}
                  onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  placeholder="Add a message with Ubuntu spirit..."
                  value={sendForm.message}
                  onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-medium disabled:opacity-50"
              >
                {isSending ? '⏳ Sending...' : '💸 Send Payment'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'receive' && (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Receive Payment</h3>
            
            <div className="max-w-md mx-auto">
              <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 mb-6">
                <div className="w-48 h-48 mx-auto bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-4xl">📱</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">QR Code will appear here</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Wallet Address
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      readOnly
                      className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-l-xl font-mono text-sm"
                      value={user?.walletAddress || 'azr1234...5678'}
                    />
                    <button className="px-4 py-3 bg-indigo-500 text-white rounded-r-xl hover:bg-indigo-600 transition-colors">
                      📋
                    </button>
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
                  📤 Share Address
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exchange' && (
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Exchange Currencies</h3>
            
            <div className="max-w-md mx-auto">
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    From
                  </label>
                  <div className="flex space-x-3">
                    <select className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                      <option>🪙 AZR</option>
                      <option>₿ BTC</option>
                      <option>Ξ ETH</option>
                      <option>💵 USD</option>
                    </select>
                    <input
                      type="number"
                      className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <button className="w-12 h-12 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors">
                    🔄
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    To
                  </label>
                  <div className="flex space-x-3">
                    <select className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
                      <option>₿ BTC</option>
                      <option>🪙 AZR</option>
                      <option>Ξ ETH</option>
                      <option>💵 USD</option>
                    </select>
                    <input
                      type="number"
                      readOnly
                      className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Exchange Rate</span>
                    <span className="font-medium text-slate-900 dark:text-white">1 AZR = 0.00026 BTC</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-slate-600 dark:text-slate-400">Network Fee</span>
                    <span className="font-medium text-slate-900 dark:text-white">0.1 AZR</span>
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
                  🔄 Exchange Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletManagement;