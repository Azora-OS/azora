import React, { useState } from 'react';
import {
    PieChart, TrendingUp, DollarSign, CreditCard, Wallet,
    ArrowUpRight, ArrowDownRight, Download, Filter, Search, MoreHorizontal
} from 'lucide-react';
import { useWalletQuery, useTransactionsQuery } from '@azora/api-client/react-query-hooks';

export const FinanceHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { data: walletData, isLoading: isWalletLoading } = useWalletQuery('current');
    const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactionsQuery();

    const balance = walletData?.balance || 0;
    const formattedBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance);

    const transactions = transactionsData?.data || [
        { name: 'AWS Cloud Services', date: 'Today, 10:42 AM', category: 'Infrastructure', status: 'Completed', amount: -2450.00, type: 'debit' },
        { name: 'Stripe Payout', date: 'Yesterday, 4:20 PM', category: 'Revenue', status: 'Completed', amount: 14200.50, type: 'credit' },
        { name: 'WeWork Office', date: 'Nov 20, 2025', category: 'Facilities', status: 'Pending', amount: -5200.00, type: 'debit' },
        { name: 'Slack Technologies', date: 'Nov 18, 2025', category: 'Software', status: 'Completed', amount: -850.00, type: 'debit' },
    ];

    return (
        <div className="flex h-full bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-950/50 border-r border-white/10 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                            <PieChart className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg tracking-tight">Finance</h2>
                            <p className="text-xs text-white/40">Hub</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {[
                            { id: 'overview', icon: PieChart, label: 'Overview' },
                            { id: 'transactions', icon: DollarSign, label: 'Transactions' },
                            { id: 'cards', icon: CreditCard, label: 'Cards & Accounts' },
                            { id: 'budget', icon: Wallet, label: 'Budgeting' },
                            { id: 'reports', icon: TrendingUp, label: 'Reports' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-indigo-600/20 text-indigo-400 shadow-lg shadow-indigo-900/20'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 p-4 rounded-xl border border-white/10">
                        <p className="text-xs font-medium text-indigo-300 mb-1">Total Balance</p>
                        <h3 className="text-xl font-bold text-white">{isWalletLoading ? '...' : formattedBalance}</h3>
                        <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                            <ArrowUpRight size={12} />
                            <span>+4.2% this month</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md">
                    <h1 className="text-xl font-bold text-white">Financial Overview</h1>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                            <Download size={14} />
                            <span>Export CSV</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20">
                            <PlusIcon />
                            <span>New Transfer</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {/* Cards Grid */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-900/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <CreditCard size={24} className="text-white/80" />
                                    <span className="text-lg font-mono opacity-80">**** 4291</span>
                                </div>
                                <p className="text-sm text-white/60 mb-1">Main Corporate</p>
                                <h3 className="text-3xl font-bold mb-4">{isWalletLoading ? '...' : formattedBalance}</h3>
                                <div className="flex justify-between items-center text-xs text-white/60">
                                    <span>Azora Bank Ltd.</span>
                                    <span>Exp 09/28</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">+12.5%</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">$1,204,500</h3>
                            <p className="text-sm text-white/40">Total Revenue (YTD)</p>
                        </div>

                        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                    <Wallet size={20} />
                                </div>
                                <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">-2.4%</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">$342,100</h3>
                            <p className="text-sm text-white/40">Total Expenses (This Month)</p>
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-5 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white">Recent Transactions</h3>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <button className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white">
                                    <Filter size={16} />
                                </button>
                            </div>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="text-white/40 font-medium border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-3">Transaction</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isTransactionsLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="h-6 bg-white/5 rounded animate-pulse" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    transactions.map((row: any, i: number) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${row.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/60'
                                                    }`}>
                                                    {row.amount > 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                                </div>
                                                {row.name || row.description || 'Transaction'}
                                            </td>
                                            <td className="px-6 py-4 text-white/60">{row.date || 'Today'}</td>
                                            <td className="px-6 py-4 text-white/60">
                                                <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-xs">
                                                    {row.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium ${row.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                                                    }`}>
                                                    {row.status || 'Completed'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-medium ${row.amount > 0 ? 'text-emerald-400' : 'text-white'
                                                }`}>
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
