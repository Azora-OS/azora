'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@azora/shared-design/layouts/AppLayout';
import { AccessibleCard, GradientText, Button } from '@azora/shared-design';

export default function AnalyticsPage() {
    const analytics = {
        totalSupply: 1000000,
        circulatingSupply: 875000,
        burned: 125000,
        holders: 12450,
        transactions24h: 3420,
        volume24h: 125000,
        marketCap: 4375000,
        price: 5.00,
        priceChange24h: 12.5
    };

    const distributionData = [
        { category: 'Community', percentage: 40, amount: 400000, color: 'from-blue-500 to-cyan-500' },
        { category: 'CitadelFund', percentage: 15, amount: 150000, color: 'from-green-500 to-emerald-500' },
        { category: 'Development', percentage: 20, amount: 200000, color: 'from-purple-500 to-pink-500' },
        { category: 'Treasury', percentage: 15, amount: 150000, color: 'from-orange-500 to-red-500' },
        { category: 'Team', percentage: 10, amount: 100000, color: 'from-yellow-500 to-amber-500' }
    ];

    const priceHistory = [
        { date: 'Jan', price: 3.20 },
        { date: 'Feb', price: 3.50 },
        { date: 'Mar', price: 3.80 },
        { date: 'Apr', price: 4.20 },
        { date: 'May', price: 4.50 },
        { date: 'Jun', price: 5.00 }
    ];

    const maxPrice = Math.max(...priceHistory.map(p => p.price));

    return (
        <AppLayout
            headerActions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Export Data</Button>
                    <Button size="sm">Refresh</Button>
                </div>
            }
        >
            <div className="max-w-7xl mx-auto py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <GradientText>Token Analytics</GradientText>
                    </h1>
                    <p className="text-muted-foreground">Real-time AZR token metrics and insights</p>
                </motion.div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-primary">${analytics.price.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Price (USD)</div>
                        <div className={`text-xs mt-1 ${analytics.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {analytics.priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(analytics.priceChange24h)}% (24h)
                        </div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-blue-500">${(analytics.marketCap / 1000000).toFixed(2)}M</div>
                        <div className="text-sm text-muted-foreground">Market Cap</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-green-500">{analytics.holders.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Token Holders</div>
                    </AccessibleCard>
                    <AccessibleCard className="glass-card p-6">
                        <div className="text-3xl font-bold text-orange-500">{analytics.transactions24h.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">24h Transactions</div>
                    </AccessibleCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Price Chart */}
                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-2xl font-bold mb-6">Price History</h2>
                            <div className="flex items-end justify-between gap-2 h-64">
                                {priceHistory.map((data, index) => (
                                    <div key={data.date} className="flex-1 flex flex-col items-center gap-2">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(data.price / maxPrice) * 100}%` }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-lg min-h-[40px] relative group cursor-pointer"
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border px-2 py-1 rounded text-xs whitespace-nowrap">
                                                ${data.price.toFixed(2)}
                                            </div>
                                        </motion.div>
                                        <div className="text-xs text-muted-foreground">{data.date}</div>
                                    </div>
                                ))}
                            </div>
                        </AccessibleCard>

                        {/* Supply Metrics */}
                        <AccessibleCard className="glass-card p-6">
                            <h2 className="text-2xl font-bold mb-6">Supply Metrics</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Circulating Supply</span>
                                        <span className="font-semibold">{analytics.circulatingSupply.toLocaleString()} AZR ({(analytics.circulatingSupply / analytics.totalSupply * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-3 bg-card rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(analytics.circulatingSupply / analytics.totalSupply) * 100}%` }}
                                            transition={{ duration: 1 }}
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Burned</span>
                                        <span className="font-semibold">{analytics.burned.toLocaleString()} AZR ({(analytics.burned / analytics.totalSupply * 100).toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-3 bg-card rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(analytics.burned / analytics.totalSupply) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Max Supply</span>
                                        <span className="font-bold text-primary">{analytics.totalSupply.toLocaleString()} AZR</span>
                                    </div>
                                </div>
                            </div>
                        </AccessibleCard>
                    </div>

                    <div className="space-y-6">
                        {/* Token Distribution */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">Token Distribution</h3>
                            <div className="space-y-3">
                                {distributionData.map((item, index) => (
                                    <motion.div
                                        key={item.category}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">{item.category}</span>
                                            <span className="font-semibold">{item.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-card rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${item.color}`}
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {item.amount.toLocaleString()} AZR
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </AccessibleCard>

                        {/* 24h Activity */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-4">24h Activity</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Volume:</span>
                                    <span className="font-semibold">${analytics.volume24h.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Transactions:</span>
                                    <span className="font-semibold">{analytics.transactions24h.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">New Holders:</span>
                                    <span className="font-semibold text-green-500">+124</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Avg Transaction:</span>
                                    <span className="font-semibold">${(analytics.volume24h / analytics.transactions24h).toFixed(2)}</span>
                                </div>
                            </div>
                        </AccessibleCard>

                        {/* Ubuntu Philosophy */}
                        <AccessibleCard className="glass-card p-6">
                            <h3 className="text-lg font-bold mb-2">🤝 Ubuntu Philosophy</h3>
                            <p className="text-sm text-muted-foreground">
                                AZR token economics are designed for collective prosperity. All metrics are transparent and verifiable on-chain.
                            </p>
                        </AccessibleCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
