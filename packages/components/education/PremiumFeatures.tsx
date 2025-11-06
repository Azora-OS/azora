/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM EDUCATION FEATURES COMPONENT
Premium feature showcases and unlocks
*/

'use client';

import React from 'react';
import {
  Crown,
  Sparkles,
  Zap,
  Star,
  Award,
  Brain,
  Video,
  Users,
  BookOpen,
  BarChart3,
  Download,
  Shield,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { PremiumBadge } from './PremiumBadge';

interface PremiumFeature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
  category: 'content' | 'ai' | 'analytics' | 'support' | 'tools';
}

export function PremiumFeatures() {
  const features: PremiumFeature[] = [
    {
      id: 'ai-tutor',
      icon: <Brain className="w-6 h-6" />,
      title: 'Advanced AI Tutor',
      description: '24/7 personalized AI tutoring with advanced reasoning',
      unlocked: false,
      category: 'ai',
    },
    {
      id: 'video-content',
      icon: <Video className="w-6 h-6" />,
      title: 'Premium Video Library',
      description: 'Access to exclusive video courses and tutorials',
      unlocked: false,
      category: 'content',
    },
    {
      id: 'advanced-analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Advanced Learning Analytics',
      description: 'Detailed insights into your learning patterns and progress',
      unlocked: false,
      category: 'analytics',
    },
    {
      id: 'priority-support',
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Priority Support',
      description: 'Get help from mentors within 1 hour',
      unlocked: false,
      category: 'support',
    },
    {
      id: 'download-certificates',
      icon: <Download className="w-6 h-6" />,
      title: 'Download Certificates',
      description: 'Download and share verified blockchain certificates',
      unlocked: false,
      category: 'tools',
    },
    {
      id: 'study-groups',
      icon: <Users className="w-6 h-6" />,
      title: 'Premium Study Groups',
      description: 'Join exclusive study groups with top learners',
      unlocked: false,
      category: 'support',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
            Premium Features
          </h2>
          <p className="text-gray-400 mt-1">Unlock exclusive learning tools and content</p>
        </div>
        <PremiumBadge variant="gold" size="lg" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <PremiumFeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
}

function PremiumFeatureCard({ feature }: { feature: PremiumFeature }) {
  return (
    <div
      className={`
        relative p-6 rounded-2xl border-2 transition-all
        ${
          feature.unlocked
            ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50'
            : 'bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50 opacity-75'
        }
        hover:scale-105 hover:shadow-xl
      `}
    >
      {/* Lock overlay */}
      {!feature.unlocked && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-pulse" />
            <p className="text-yellow-400 font-bold">Premium Only</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-0">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${feature.unlocked ? 'bg-green-600/20' : 'bg-gray-700/30'}`}>
            <div className={feature.unlocked ? 'text-green-400' : 'text-gray-500'}>
              {feature.icon}
            </div>
          </div>
          {feature.unlocked && (
            <span className="text-green-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
        <p className="text-gray-400 text-sm mb-4">{feature.description}</p>

        {feature.unlocked ? (
          <span className="inline-flex items-center gap-1 text-sm text-green-400 font-semibold">
            <Zap className="w-4 h-4" />
            Active
          </span>
        ) : (
          <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 px-4 py-2 rounded-lg font-semibold text-white transition-all">
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
}

interface PremiumUnlockModalProps {
  feature: PremiumFeature;
  onClose: () => void;
}

export function PremiumUnlockModal({ feature, onClose }: PremiumUnlockModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full border-2 border-yellow-500/50">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Unlock Premium</h3>
          <p className="text-gray-400">Get access to {feature.title} and all premium features</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
            {feature.icon}
            <div>
              <p className="font-semibold">{feature.title}</p>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              <strong>Premium Benefits:</strong>
            </p>
            <ul className="text-xs text-yellow-300 mt-2 space-y-1">
              <li>✓ Advanced AI tutoring</li>
              <li>✓ Exclusive content library</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Download certificates</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Maybe Later
          </button>
          <button className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 rounded-lg font-semibold text-white transition-all">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
