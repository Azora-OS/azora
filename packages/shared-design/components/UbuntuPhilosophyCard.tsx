'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, TrendingUp, Globe } from 'lucide-react';

interface UbuntuMetric {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

interface UbuntuPhilosophyCardProps {
    className?: string;
    showMetrics?: boolean;
    collectiveImpact?: number;
    communityBenefit?: number;
    ubuntuAlignment?: number;
}

export function UbuntuPhilosophyCard({
    className = '',
    showMetrics = true,
    collectiveImpact = 0,
    communityBenefit = 0,
    ubuntuAlignment = 0,
}: UbuntuPhilosophyCardProps) {
    const metrics: UbuntuMetric[] = [
        {
            label: 'Collective Impact',
            value: `${collectiveImpact}%`,
            icon: <Globe className="w-5 h-5" />,
            color: 'text-blue-400',
        },
        {
            label: 'Community Benefit',
            value: `${communityBenefit}%`,
            icon: <Users className="w-5 h-5" />,
            color: 'text-green-400',
        },
        {
            label: 'Ubuntu Alignment',
            value: `${ubuntuAlignment}%`,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-purple-400',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">🤝 Ubuntu Philosophy</h3>
                    <p className="text-sm text-slate-400">I can because we can</p>
                </div>
            </div>

            {/* Quote */}
            <div className="mb-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <p className="text-center text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400 italic">
                    "Ngiyakwazi ngoba sikwazi"
                </p>
                <p className="text-center text-sm text-slate-400 mt-1">
                    I am because we are
                </p>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Your success multiplies through our collective prosperity. Every action you take
                strengthens the entire Azora community, creating a virtuous cycle of growth and
                opportunity for all.
            </p>

            {/* Metrics */}
            {showMetrics && (
                <div className="grid grid-cols-3 gap-4">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className={`flex justify-center mb-2 ${metric.color}`}>
                                {metric.icon}
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {metric.value}
                            </div>
                            <div className="text-xs text-slate-400">
                                {metric.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 text-center">
                    Constitutional AI Operating System • Article I Section 1.1
                </p>
            </div>
        </motion.div>
    );
}

// Compact version for sidebars
export function UbuntuPhilosophyBadge({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-lg p-3 ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-white">Ubuntu</span>
            </div>
            <p className="text-xs text-slate-400 italic">
                "Ngiyakwazi ngoba sikwazi"
            </p>
        </div>
    );
}
