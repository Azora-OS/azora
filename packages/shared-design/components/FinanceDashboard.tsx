"use client";

import React from 'react';
import { AccessibleCard, GradientText } from "@azora/shared-design";
import { Coins, TrendingUp, Lock, Star, ArrowRight, Zap } from "lucide-react";

export interface TokenBalance {
    learn: number;
    azr: number;
    staked: number;
    earned: number;
    converted: number;
}

export interface FinanceDashboardProps {
    balance: TokenBalance;
    miningActive?: boolean;
    miningMultiplier?: number;
    premiumTier?: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum';
    stakingAPY?: number;
    className?: string;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
    balance,
    miningActive = false,
    miningMultiplier = 1.0,
    premiumTier = 'free',
    stakingAPY = 12.5,
    className = ''
}) => {
    const getTierColor = (tier: string) => {
        const colors = {
            free: 'text-gray-400',
            bronze: 'text-orange-400',
            silver: 'text-gray-300',
            gold: 'text-yellow-400',
            platinum: 'text-purple-400'
        };
        return colors[tier as keyof typeof colors] || colors.free;
    };

    const getTierMultiplier = (tier: string) => {
        const multipliers = {
            free: 1.0,
            bronze: 1.5,
            silver: 2.0,
            gold: 3.0,
            platinum: 5.0
        };
        return multipliers[tier as keyof typeof multipliers] || 1.0;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main Balances */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* $LEARN Balance */}
                <AccessibleCard title="$LEARN Balance" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Coins className="w-5 h-5 text-blue-500" />
                                <span className="text-3xl font-bold text-blue-500">
                                    {balance.learn.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">Education Currency</p>
                        </div>
                        {miningActive && (
                            <div className="flex items-center gap-1 bg-blue-500/20 px-3 py-1 rounded-full">
                                <Zap className="w-4 h-4 text-blue-500 animate-pulse" />
                                <span className="text-sm font-bold text-blue-500">{miningMultiplier}x</span>
                            </div>
                        )}
                    </div>
                </AccessibleCard>

                {/* $AZR Balance */}
                <AccessibleCard title="$AZR Balance" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                <span className="text-3xl font-bold text-yellow-500">
                                    {balance.azr.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">Nation Currency</p>
                        </div>
                        <button className="text-sm text-primary hover:underline flex items-center gap-1">
                            Convert <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </AccessibleCard>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Earned */}
                <AccessibleCard title="Total Earned" className="p-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xl font-bold text-green-500">
                            {balance.earned.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">$LEARN</p>
                </AccessibleCard>

                {/* Staked */}
                <AccessibleCard title="Staked" className="p-4">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-purple-500" />
                        <span className="text-xl font-bold text-purple-500">
                            {balance.staked.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stakingAPY}% APY</p>
                </AccessibleCard>

                {/* Converted */}
                <AccessibleCard title="Converted" className="p-4">
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-cyan-500" />
                        <span className="text-xl font-bold text-cyan-500">
                            {balance.converted.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">$LEARN → $AZR</p>
                </AccessibleCard>

                {/* Premium Tier */}
                <AccessibleCard title="Premium Tier" className="p-4">
                    <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${getTierColor(premiumTier)} fill-current`} />
                        <span className={`text-xl font-bold ${getTierColor(premiumTier)} uppercase`}>
                            {premiumTier}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{getTierMultiplier(premiumTier)}x earnings</p>
                </AccessibleCard>
            </div>

            {/* Exchange Rate */}
            <AccessibleCard title="Exchange Rate" className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">10 $LEARN</span>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-bold text-primary">1 $AZR</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {miningActive && <span className="text-blue-500">⚡ Mining Active</span>}
                        {premiumTier !== 'free' && <span className="text-yellow-500 ml-2">⭐ Premium {getTierMultiplier(premiumTier)}x</span>}
                    </div>
                </div>
            </AccessibleCard>
        </div>
    );
};

export default FinanceDashboard;
