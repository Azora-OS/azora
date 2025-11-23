/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SUBSCRIPTION MANAGER COMPONENT
Premium subscription management and upgrades
*/

import React, { useState, useEffect } from 'react';
import { Crown, Check, Zap, Star, Award, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { PremiumBadge } from './PremiumBadge';

interface SubscriptionTier {
    id: 'basic' | 'advanced' | 'elite';
    name: string;
    price: number;
    currency: string;
    features: string[];
    icon: React.ReactNode;
    color: string;
    popular?: boolean;
}

interface SubscriptionManagerProps {
    onClose?: () => void;
}

export function SubscriptionManager({ onClose }: SubscriptionManagerProps) {
    const [currentTier, setCurrentTier] = useState<'basic' | 'advanced' | 'elite' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTier, setSelectedTier] = useState<'basic' | 'advanced' | 'elite'>('advanced');

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        try {
            const subscription = await apiClient.getSubscription();
            setCurrentTier(subscription?.tier || null);
        } catch (error) {
            console.error('Failed to load subscription:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async (tier: 'basic' | 'advanced' | 'elite') => {
        try {
            if (currentTier) {
                await apiClient.upgradeSubscription(tier);
            } else {
                await apiClient.subscribe(tier);
            }
            setCurrentTier(tier);
            alert(`Successfully ${currentTier ? 'upgraded' : 'subscribed'} to ${tier} tier!`);
        } catch (error) {
            console.error('Subscription failed:', error);
            alert('Subscription failed. Please try again.');
        }
    };

    const tiers: SubscriptionTier[] = [
        {
            id: 'basic',
            name: 'Basic',
            price: 99,
            currency: 'AZR',
            icon: <Star className="w-6 h-6" />,
            color: 'from-yellow-500 to-amber-500',
            features: [
                'Advanced AI Tutor',
                'Premium Video Library',
                'Priority Support',
                'Download Certificates',
                'Basic Analytics',
            ],
        },
        {
            id: 'advanced',
            name: 'Advanced',
            price: 199,
            currency: 'AZR',
            icon: <Award className="w-6 h-6" />,
            color: 'from-purple-500 to-pink-500',
            popular: true,
            features: [
                'Everything in Basic',
                'Advanced Learning Analytics',
                'Premium Study Groups',
                'Personalized Learning Paths',
                'Offline Course Access',
                'Priority Course Enrollment',
            ],
        },
        {
            id: 'elite',
            name: 'Elite',
            price: 399,
            currency: 'AZR',
            icon: <Crown className="w-6 h-6" />,
            color: 'from-cyan-400 via-blue-500 to-purple-600',
            features: [
                'Everything in Advanced',
                'Unlimited Course Access',
                'Personal Mentor (1-on-1)',
                'Custom Learning Plans',
                'Early Access to New Courses',
                'Exclusive Elite Community',
                'Career Guidance Sessions',
            ],
        },
    ];

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-yellow-500/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 p-4 border-b border-yellow-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Premium Subscription</h3>
                            <p className="text-xs text-yellow-300">
                                {currentTier ? `Current: ${currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}` : 'Choose your plan'}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-pulse" />
                            <p className="text-gray-400">Loading subscription...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Current Subscription */}
                        {currentTier && (
                            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                            <Check className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-400 font-semibold">Active Subscription</p>
                                            <p className="text-xl font-bold text-white">
                                                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
                                            </p>
                                        </div>
                                    </div>
                                    <PremiumBadge variant="gold" size="md" />
                                </div>
                            </div>
                        )}

                        {/* Tier Comparison */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {tiers.map((tier) => (
                                <motion.div
                                    key={tier.id}
                                    whileHover={{ scale: 1.02 }}
                                    className={`relative bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-2 rounded-2xl p-6 ${tier.popular
                                            ? 'border-purple-500/50 shadow-lg shadow-purple-500/20'
                                            : 'border-gray-700/50'
                                        } ${currentTier === tier.id ? 'ring-2 ring-green-500' : ''}`}
                                >
                                    {/* Popular Badge */}
                                    {tier.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 rounded-full text-xs font-bold text-white">
                                                MOST POPULAR
                                            </span>
                                        </div>
                                    )}

                                    {/* Current Badge */}
                                    {currentTier === tier.id && (
                                        <div className="absolute -top-3 right-4">
                                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                CURRENT
                                            </span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={`w-14 h-14 bg-gradient-to-r ${tier.color} rounded-xl flex items-center justify-center mb-4`}>
                                        <div className="text-white">{tier.icon}</div>
                                    </div>

                                    {/* Name & Price */}
                                    <h4 className="text-2xl font-bold text-white mb-2">{tier.name}</h4>
                                    <div className="mb-6">
                                        <span className="text-3xl font-bold text-white">{tier.price}</span>
                                        <span className="text-gray-400 ml-2">{tier.currency}/month</span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6">
                                        {tier.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm">
                                                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleUpgrade(tier.id)}
                                        disabled={currentTier === tier.id}
                                        className={`w-full py-3 rounded-lg font-semibold transition-all ${currentTier === tier.id
                                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                : `bg-gradient-to-r ${tier.color} hover:opacity-90 text-white`
                                            }`}
                                    >
                                        {currentTier === tier.id
                                            ? 'Current Plan'
                                            : currentTier
                                                ? 'Upgrade'
                                                : 'Subscribe'}
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Benefits Section */}
                        <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-500/30 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                Why Go Premium?
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <span>Accelerate your learning with AI-powered tutoring</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <span>Access exclusive content and courses</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <span>Get personalized learning recommendations</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <span>Join a community of top learners</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
