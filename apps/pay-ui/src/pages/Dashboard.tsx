import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [balances, setBalances] = useState({
    AZR: 0,
    BTC: 0,
    ETH: 0,
    USD: 0
  });

  const [miningStats, setMiningStats] = useState({
    isActive: false,
    hashrate: 0,
    earnings: 0,
    efficiency: 0
  });

  const [marketData, setMarketData] = useState({
    AZR: { price: 0.01, change: 0 },
    BTC: { price: 45000, change: 0 },
    ETH: { price: 3200, change: 0 }
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setBalances({
        AZR: 12547.89,
        BTC: 0.0234,
        ETH: 1.567,
        USD: 2847.32
      });

      setMiningStats({
        isActive: true,
        hashrate: 42.5,
        earnings: 156.78,
        efficiency: 98.7
      });

      setMarketData({
        AZR: { price: 0.0125, change: 12.5 },
        BTC: { price: 47250, change: 3.2 },
        ETH: { price: 3350, change: -1.8 }
      });
    }, 1000);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setMiningStats(prev => ({
        ...prev,
        hashrate: Math.max(35, Math.min(50, prev.hashrate + (Math.random() - 0.5) * 2)),
        earnings: prev.earnings + Math.random() * 0.1
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const WalletCard = ({ currency, balance, usdValue, icon, gradient }: any) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl">{icon}</span>
          <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
            {currency}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold">{balance.toLocaleString()}</p>
          <p className="text-white/80 text-sm">${usdValue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  const MarketCard = ({ currency, price, change, icon }: any) => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{currency}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">${price.toLocaleString()}</p>
          </div>
        </div>
        <div className={`text-right ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <p className="font-semibold">{change >= 0 ? '+' : ''}{change}%</p>
          <p className="text-xs">{change >= 0 ? '📈' : '📉'}</p>
        </div>
      </div>
    </div>
  );

  const MiningCard = () => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">⛏️ Mining Status</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          miningStats.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {miningStats.isActive ? '🟢 Active' : '🔴 Inactive'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{miningStats.hashrate.toFixed(1)}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">MH/s</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{miningStats.earnings.toFixed(2)}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">AZR Earned</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Efficiency</span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">{miningStats.efficiency}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${miningStats.efficiency}%` }}
          ></div>
        </div>
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium">
        {miningStats.isActive ? '⏸️ Pause Mining' : '▶️ Start Mining'}
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Financial Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Your Constitutional AI Financial Command Center
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <WalletCard
          currency="AZR"
          balance={balances.AZR}
          usdValue={balances.AZR * marketData.AZR.price}
          icon="🪙"
          gradient="from-blue-500 to-purple-600"
        />
        <WalletCard
          currency="BTC"
          balance={balances.BTC}
          usdValue={balances.BTC * marketData.BTC.price}
          icon="₿"
          gradient="from-orange-500 to-yellow-500"
        />
        <WalletCard
          currency="ETH"
          balance={balances.ETH}
          usdValue={balances.ETH * marketData.ETH.price}
          icon="Ξ"
          gradient="from-purple-500 to-pink-500"
        />
        <WalletCard
          currency="USD"
          balance={balances.USD}
          usdValue={balances.USD}
          icon="💵"
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Data */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">📊 Market Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MarketCard
              currency="AZR"
              price={marketData.AZR.price}
              change={marketData.AZR.change}
              icon="🪙"
            />
            <MarketCard
              currency="BTC"
              price={marketData.BTC.price}
              change={marketData.BTC.change}
              icon="₿"
            />
            <MarketCard
              currency="ETH"
              price={marketData.ETH.price}
              change={marketData.ETH.change}
              icon="Ξ"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-center">
                <div className="text-2xl mb-2">💸</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Send</div>
              </button>
              <button className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Receive</div>
              </button>
              <button className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-center">
                <div className="text-2xl mb-2">🔄</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Exchange</div>
              </button>
              <button className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl hover:shadow-lg transition-all duration-300 text-center">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">Invest</div>
              </button>
            </div>
          </div>
        </div>

        {/* Mining & Stats */}
        <div className="space-y-6">
          <MiningCard />
          
          {/* Recent Activity */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📋 Recent Activity</h3>
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
    </div>
  );
};

export default Dashboard;