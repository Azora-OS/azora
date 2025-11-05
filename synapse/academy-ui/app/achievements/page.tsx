/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Award, Target, Zap, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceHeader } from '@/components/branding/ServiceHeader';
import Image from 'next/image';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  azrReward: number;
}

const achievements: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Completed your first course',
    icon: '🎓',
    unlocked: true,
    unlockedAt: '2025-01-15',
    rarity: 'common',
    azrReward: 50,
  },
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Earned 500 AZR tokens',
    icon: '💎',
    unlocked: true,
    unlockedAt: '2025-01-20',
    rarity: 'rare',
    azrReward: 100,
  },
  {
    id: 'community-builder',
    name: 'Community Builder',
    description: 'Helped 10 fellow students',
    icon: '🤝',
    unlocked: true,
    unlockedAt: '2025-01-18',
    rarity: 'rare',
    azrReward: 75,
  },
  {
    id: 'african-ai-pioneer',
    name: 'African AI Pioneer',
    description: 'Specialized in African AI',
    icon: '🇿🇦',
    unlocked: false,
    rarity: 'epic',
    azrReward: 250,
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Scored 100% on a quiz',
    icon: '⭐',
    unlocked: false,
    rarity: 'rare',
    azrReward: 150,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Maintained a 7-day study streak',
    icon: '🔥',
    unlocked: false,
    rarity: 'epic',
    azrReward: 200,
  },
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400';
    case 'epic':
      return 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400';
    case 'rare':
      return 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-400';
  }
};

export default function AchievementsPage() {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAzrEarned = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.azrReward, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950">
      <ServiceHeader servicePath="synapse/academy-ui" />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative h-24 w-72">
              <Image
                src="/branding/services/azora-education-logo.svg"
                alt="Azora Academy"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your learning milestones and accomplishments
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unlocked</p>
                  <p className="text-3xl font-bold">{unlockedCount}/{achievements.length}</p>
                </div>
                <Trophy className="w-12 h-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AZR Earned</p>
                  <p className="text-3xl font-bold">{totalAzrEarned}</p>
                </div>
                <Star className="w-12 h-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-3xl font-bold">
                    {Math.round((unlockedCount / achievements.length) * 100)}%
                  </p>
                </div>
                <Target className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full transition-all hover:scale-105 ${
                achievement.unlocked
                  ? 'border-2'
                  : 'opacity-60 border-dashed'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-16 h-16 rounded-lg ${getRarityColor(achievement.rarity)} flex items-center justify-center text-3xl`}>
                      {achievement.icon}
                    </div>
                    <Badge className={`${
                      achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                      achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <CardTitle>{achievement.name}</CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      {achievement.unlocked ? (
                        <>
                          <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 mb-2">
                            Unlocked
                          </Badge>
                          {achievement.unlockedAt && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="opacity-60">
                          Locked
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {achievement.azrReward} AZR
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


