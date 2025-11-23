/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM EDUCATION BADGE COMPONENT
Premium visual indicators for education features
*/

import React from 'react';
import { Crown, Sparkles, Zap, Star, Award } from 'lucide-react';

interface PremiumBadgeProps {
    variant?: 'default' | 'gold' | 'platinum' | 'diamond' | 'elite';
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    className?: string;
}

export function PremiumBadge({
    variant = 'default',
    size = 'md',
    animated = true,
    className = ''
}: PremiumBadgeProps) {
    const variants = {
        default: 'bg-gradient-to-r from-yellow-500 to-amber-500',
        gold: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600',
        platinum: 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500',
        diamond: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600',
        elite: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <span
            className={`
        ${variants[variant]}
        ${sizes[size]}
        ${animated ? 'animate-pulse' : ''}
        inline-flex items-center gap-1.5 rounded-full font-bold text-white shadow-lg
        ${className}
      `}
        >
            <Crown className={iconSizes[size]} />
            <span>PREMIUM</span>
            <Sparkles className={`${iconSizes[size]} ${animated ? 'animate-spin' : ''}`} />
        </span>
    );
}

interface PremiumFeatureBadgeProps {
    feature: string;
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function PremiumFeatureBadge({ feature, icon, size = 'md' }: PremiumFeatureBadgeProps) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg backdrop-blur-sm">
            {icon || <Star className="w-4 h-4 text-yellow-400" />}
            <span className="text-sm font-semibold text-purple-200">{feature}</span>
            <PremiumBadge variant="gold" size="sm" animated={false} />
        </div>
    );
}

interface PremiumCourseBadgeProps {
    level?: 'basic' | 'advanced' | 'elite';
}

export function PremiumCourseBadge({ level = 'basic' }: PremiumCourseBadgeProps) {
    const levels = {
        basic: {
            color: 'from-yellow-500 to-amber-500',
            icon: <Star className="w-4 h-4" />,
            label: 'Premium',
        },
        advanced: {
            color: 'from-purple-500 to-pink-500',
            icon: <Award className="w-4 h-4" />,
            label: 'Premium+',
        },
        elite: {
            color: 'from-cyan-400 via-blue-500 to-purple-600',
            icon: <Crown className="w-4 h-4" />,
            label: 'Elite',
        },
    };

    const config = levels[level];

    return (
        <span
            className={`
        bg-gradient-to-r ${config.color}
        px-3 py-1 rounded-full
        inline-flex items-center gap-1.5
        text-xs font-bold text-white
        shadow-lg animate-pulse
      `}
        >
            {config.icon}
            {config.label}
            <Zap className="w-3 h-3" />
        </span>
    );
}
