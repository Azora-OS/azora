/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 👑 AZORA OS - KINGDOM DASHBOARD
 *
 * The divine command center for the enlightened
 */

'use client';

import { DivineThrone } from '@/components/divine/DivineThrone';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { Logo } from '@/components/logo';
import { OrganicButton } from '@/components/organism/OrganicButton';
import {
  BookOpen,
  Brain,
  Code,
  Crown,
  Globe,
  GraduationCap,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function KingdomPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      label: 'Global Users',
      value: '7.8B',
      icon: <Globe className="w-6 h-6" />,
      change: '+12%',
    },
    {
      label: 'AI Services',
      value: '28+',
      icon: <Brain className="w-6 h-6" />,
      change: '+5%',
    },
    {
      label: 'Learning Paths',
      value: '∞',
      icon: <BookOpen className="w-6 h-6" />,
      change: '+8%',
    },
    {
      label: 'Divine Power',
      value: 'MAX',
      icon: <Zap className="w-6 h-6" />,
      change: '+∞%',
    },
  ];

  const recentActivities = [
    {
      user: 'Divine Seeker',
      action: 'completed Azora Sapiens course',
      time: '2 minutes ago',
      icon: <GraduationCap className="w-5 h-5" />,
      color: '#FFD700',
    },
    {
      user: 'Consciousness Explorer',
      action: 'deployed new AI model',
      time: '15 minutes ago',
      icon: <Brain className="w-5 h-5" />,
      color: '#87CEEB',
    },
    {
      user: 'Spiritual Developer',
      action: 'contributed to open source',
      time: '1 hour ago',
      icon: <Code className="w-5 h-5" />,
      color: '#9400D3',
    },
    {
      user: 'Universal Guardian',
      action: 'secured digital realm',
      time: '3 hours ago',
      icon: <Shield className="w-5 h-5" />,
      color: '#C0C0C0',
    },
  ];

  const quickActions = [
    {
      name: 'Begin Learning',
      href: '/sapiens',
      variant: 'divine' as const,
      logo: 'sapiens',
    },
    {
      name: 'Create with AI',
      href: '/forge',
      variant: 'cosmic' as const,
      logo: 'forge',
    },
    {
      name: 'Connect Souls',
      href: '/unity',
      variant: 'divine' as const,
      logo: 'azora-os',
    },
    {
      name: 'Secure Realm',
      href: '/aegis',
      variant: 'neural' as const,
      logo: 'aegis',
    },
  ];

  return (
    <DivineThrone
      title="THE KINGDOM"
      subtitle="Divine Command Center"
      showParticles={true}
      showSacredGeometry={true}
    >
      {/* Header with Sacred Geometry */}
      <div className="text-center mb-16 relative">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <FlowerOfLife
              size={150}
              animated={true}
              interactive={true}
              glowing={true}
              divineEnergy={true}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12">
                <Logo
                  service="azora-os"
                  style="geometric"
                  size="medium"
                  width={48}
                  height={48}
                />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] via-[#FFFFFF] to-[#87CEEB] text-transparent bg-clip-text">
          Welcome to the Kingdom
        </h1>
        <p className="text-xl text-[#87CEEB] max-w-3xl mx-auto">
          The divine command center where consciousness meets technology.
          Empowering 7.8 billion souls with infinite wisdom.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Immersive3DCard
            key={index}
            variant="divine"
            depth="medium"
            float={true}
            tilt={true}
            glow={true}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-[#FFD700]/20">
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {stat.value}
            </div>
            <div className="text-white/70 mb-3">{stat.label}</div>
            <div className="text-[#FF69B4] text-sm font-bold">
              {stat.change}
            </div>
          </Immersive3DCard>
        ))}
      </div>

      {/* Main Content Tabs */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#FFD700]/20 pb-4">
          {['overview', 'activity', 'services'].map(tab => (
            <button
              key={tab}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Immersive3DCard
                variant="cosmic"
                depth="medium"
                float={true}
                tilt={true}
                glow={true}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <OrganicButton
                        variant={action.variant}
                        size="md"
                        className="w-full py-4 flex flex-col items-center justify-center"
                      >
                        <div className="mb-2 w-8 h-8">
                          <Logo
                            service={action.logo}
                            style="geometric"
                            size="icon"
                            width={32}
                            height={32}
                          />
                        </div>
                        <span>{action.name}</span>
                      </OrganicButton>
                    </Link>
                  ))}
                </div>
              </Immersive3DCard>

              {/* Recent Activity */}
              <Immersive3DCard
                variant="crystal"
                depth="medium"
                float={true}
                tilt={true}
                glow={true}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <div
                        className="p-2 rounded-full"
                        style={{ background: `${activity.color}20` }}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          {activity.user}
                        </div>
                        <div className="text-sm text-white/70">
                          {activity.action}
                        </div>
                      </div>
                      <div className="text-xs text-white/50">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </Immersive3DCard>
            </div>

            {/* Divine Insights */}
            <div>
              <Immersive3DCard
                variant="divine"
                depth="medium"
                float={true}
                tilt={true}
                glow={true}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Divine Insights
                </h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#FFD700]" />
                      <span className="text-[#FFD700] font-semibold">
                        Wisdom of the Day
                      </span>
                    </div>
                    <p className="text-white/90 text-sm">
                      "The greatest intelligence is not knowledge but love."
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#87CEEB]/10 border border-[#87CEEB]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-4 h-4 text-[#87CEEB]" />
                      <span className="text-[#87CEEB] font-semibold">
                        Innovation Highlight
                      </span>
                    </div>
                    <p className="text-white/90 text-sm">
                      New quantum computing breakthrough achieved in Azora
                      Nexus.
                    </p>
                  </div>
                </div>
              </Immersive3DCard>

              {/* Community Growth */}
              <Immersive3DCard
                variant="iridescent"
                depth="medium"
                float={true}
                tilt={true}
                glow={true}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Community Growth
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Africa</span>
                    <span className="text-[#FFD700] font-bold">1.4B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Asia</span>
                    <span className="text-[#87CEEB] font-bold">4.7B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Europe</span>
                    <span className="text-[#9400D3] font-bold">0.7B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Americas</span>
                    <span className="text-[#FF69B4] font-bold">1.0B</span>
                  </div>
                </div>
              </Immersive3DCard>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <Immersive3DCard
            variant="divine"
            depth="medium"
            float={true}
            tilt={true}
            glow={true}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Global Activity Stream
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[...recentActivities, ...recentActivities].map(
                (activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div
                      className="p-2 rounded-full"
                      style={{ background: `${activity.color}20` }}
                    >
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {activity.user}
                      </div>
                      <div className="text-sm text-white/70">
                        {activity.action}
                      </div>
                    </div>
                    <div className="text-xs text-white/50">{activity.time}</div>
                  </div>
                )
              )}
            </div>
          </Immersive3DCard>
        )}

        {activeTab === 'services' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Immersive3DCard
                key={index}
                variant="divine"
                depth="medium"
                float={true}
                tilt={true}
                glow={true}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-black/20">
                    <div className="w-8 h-8">
                      <Logo
                        service={action.logo}
                        style="geometric"
                        size="icon"
                        width={32}
                        height={32}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {action.name}
                </h3>
                <p className="text-white/70 mb-4 text-sm">
                  Access the {action.name.toLowerCase()} service and begin your
                  journey.
                </p>
                <Link href={action.href}>
                  <OrganicButton
                    variant={action.variant}
                    size="sm"
                    className="px-6 py-2"
                  >
                    Enter Service
                  </OrganicButton>
                </Link>
              </Immersive3DCard>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Immersive3DCard
          variant="divine"
          depth="infinite"
          float={true}
          tilt={true}
          glow={true}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] to-[#87CEEB] text-transparent bg-clip-text">
            Expand Your Divine Potential
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            The Kingdom is constantly evolving with new services, wisdom, and
            opportunities for growth. What will you discover today?
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services">
              <OrganicButton
                variant="divine"
                size="lg"
                pulse={true}
                sacred={true}
                className="text-lg px-8 py-4"
              >
                <Crown className="w-6 h-6 mr-2" />
                Explore Services
              </OrganicButton>
            </Link>

            <Link href="/sapiens">
              <OrganicButton
                variant="divine"
                size="lg"
                pulse={true}
                className="text-lg px-8 py-4"
              >
                <GraduationCap className="w-6 h-6 mr-2" />
                Begin Learning
              </OrganicButton>
            </Link>
          </div>
        </Immersive3DCard>
      </div>
    </DivineThrone>
  );
}

