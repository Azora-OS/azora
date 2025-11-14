import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  ubuntuImpact?: number;
}

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    currency: 'all',
    status: 'all',
    dateRange: '30'
  });

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user?.id || '',
        ...filter,
        limit: '50'
      });

      const response = await fetch(`/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (category: string) => {
    switch (category) {
      case 'mining': return '⛏️';
      case 'learning': return '🧠';
      case 'payment': return '💳';
      case 'transfer': return '💸';
      case 'reward': return '🎁';
      case 'staking': return '🔒';
      case 'exchange': return '🔄';
      default: return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
            {getTransactionIcon(transaction.category)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {transaction.description}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
              {transaction.category} • {new Date(transaction.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${
            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} {transaction.currency}
          </p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Transaction ID</p>
          <p className="font-mono text-slate-900 dark:text-white truncate">{transaction.id}</p>
        </div>
        {transaction.txHash && (
          <div>
            <p className="text-slate-500 dark:text-slate-400">Blockchain Hash</p>
            <p className="font-mono text-slate-900 dark:text-white truncate">{transaction.txHash}</p>
          </div>
        )}
        {transaction.ubuntuImpact && (
          <div>
            <p className="text-slate-500 dark:text-slate-400">Ubuntu Impact</p>
            <p className="font-semibold text-purple-600 dark:text-purple-400">
              +{transaction.ubuntuImpact} Community Points
            </p>
          </div>
        )}
      </div>

      {(transaction.fromAddress || transaction.toAddress) && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {transaction.fromAddress && (
              <div>
                <p className="text-slate-500 dark:text-slate-400">From</p>
                <p className="font-mono text-slate-900 dark:text-white truncate">{transaction.fromAddress}</p>
              </div>
            )}
            {transaction.toAddress && (
              <div>
                <p className="text-slate-500 dark:text-slate-400">To</p>
                <p className="font-mono text-slate-900 dark:text-white truncate">{transaction.toAddress}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filter.type === 'all' || tx.type === filter.type;
    const currencyMatch = filter.currency === 'all' || tx.currency === filter.currency;
    const statusMatch = filter.status === 'all' || tx.status === filter.status;
    
    const daysDiff = Math.floor((Date.now() - new Date(tx.timestamp).getTime()) / (1000 * 60 * 60 * 24));
    const dateMatch = filter.dateRange === 'all' || daysDiff <= parseInt(filter.dateRange);
    
    return typeMatch && currencyMatch && statusMatch && dateMatch;
  });

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          📊 Payment History
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Your complete Ubuntu financial journey
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Earned</p>
              <p className="text-2xl font-bold">
                {transactions
                  .filter(tx => tx.type === 'credit')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toLocaleString()} AZR
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Spent</p>
              <p className="text-2xl font-bold">
                {transactions
                  .filter(tx => tx.type === 'debit')
                  .reduce((sum, tx) => sum + tx.amount, 0)
                  .toLocaleString()} AZR
              </p>
            </div>
            <span className="text-3xl">💸</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Transactions</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <span className="text-3xl">📋</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Ubuntu Impact</p>
              <p className="text-2xl font-bold">
                {transactions
                  .reduce((sum, tx) => sum + (tx.ubuntuImpact || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <span className="text-3xl">🌍</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-slate-700/50 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">🔍 Filter Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Type
            </label>
            <select
              className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={filter.type}
              onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              <option value="credit">Income</option>
              <option value="debit">Expenses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Currency
            </label>
            <select
              className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={filter.currency}
              onChange={(e) => setFilter(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="all">All Currencies</option>
              <option value="AZR">AZR</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Date Range
            </label>
            <select
              className="w-full px-4 py-2 bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={filter.dateRange}
              onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Transactions Found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {Object.values(filter).some(f => f !== 'all') 
                ? 'Try adjusting your filters to see more transactions.'
                : 'Your transaction history will appear here once you start using Azora Pay.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </h2>
              <button className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">
                📥 Export CSV
              </button>
            </div>
            
            {filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;