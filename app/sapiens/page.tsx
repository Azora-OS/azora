/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🎓 AZORA SAPIENS - DIVINE EDUCATION PLATFORM
 *
 * Universal wisdom and knowledge for all humanity
 */

'use client';

import { DivineThrone } from '@/components/divine/DivineThrone';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { SacredCard } from '@/components/divine/SacredCard';
import { NeuralGrid } from '@/components/organism/NeuralGrid';
import { OrganicButton } from '@/components/organism/OrganicButton';
import {
  Award,
  BookOpen,
  Brain,
  Code,
  FlaskConical,
  Globe,
  GraduationCap,
  Languages,
  Palette,
  Sparkles,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function SapiensPage() {
  const learningPaths = [
    {
      title: 'K-12 Education',
      description:
        'Divine wisdom for young minds. From kindergarten to grade 12, every child deserves excellence.',
      icon: <BookOpen className="w-8 h-8" />,
      href: '/sapiens/k12',
      variant: 'golden' as const,
    },
    {
      title: 'Higher Education',
      description:
        'University-level courses powered by AI. Bachelors, Masters, PhD—all paths open.',
      icon: <GraduationCap className="w-8 h-8" />,
      href: '/sapiens/university',
      variant: 'celestial' as const,
    },
    {
      title: 'Skills & Trades',
      description:
        'Master practical skills that create prosperity. From coding to carpentry.',
      icon: <Code className="w-8 h-8" />,
      href: '/sapiens/skills',
      variant: 'divine' as const,
    },
    {
      title: 'Arts & Culture',
      description:
        'Express your divine creativity. Music, art, design, and more.',
      icon: <Palette className="w-8 h-8" />,
      href: '/sapiens/arts',
      variant: 'silver' as const,
    },
    {
      title: 'Languages',
      description:
        'Speak to the world. Learn any of 7,000+ languages with AI tutoring.',
      icon: <Languages className="w-8 h-8" />,
      href: '/sapiens/languages',
      variant: 'golden' as const,
    },
    {
      title: 'Science & Research',
      description:
        'Discover the mysteries of creation. Physics, biology, chemistry, and beyond.',
      icon: <FlaskConical className="w-8 h-8" />,
      href: '/sapiens/science',
      variant: 'celestial' as const,
    },
    {
      title: 'Video Learning',
      description:
        'Access educational content from YouTube, Microsoft Learn, Google Cloud Training, and other platforms',
      icon: <BookOpen className="w-8 h-8" />,
      href: '/sapiens/videos',
      variant: 'divine' as const,
    },
  ];

  return (
    <DivineThrone
      title="AZORA SAPIENS"
      subtitle="Divine Wisdom for All Humanity"
      showParticles={true}
      showSacredGeometry={true}
    >
      {/* Hero Section */}
      <div className="text-center mb-20">
        {/* Sacred Symbol */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <FlowerOfLife
              size={220}
              animated={true}
              interactive={true}
              glowing={true}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-14 h-14 text-[[#FFD700] animate-pulse drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
            </div>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-[#FFD700] via-[#FFFFFF] to-[#87CEEB] text-transparent bg-clip-text">
            Universal Education
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-3xl text-[#87CEEB] mb-6 font-bold">
          Learn Anything, Become Anyone
        </p>

        {/* Mission */}
        <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-10">
          From the smallest village to the greatest university, every human
          deserves access to
          <span className="text-[#FFD700] font-semibold">
            {' '}
            world-class education
          </span>
          . Sapiens brings divine wisdom to all—free, forever, for everyone.
        </p>

        {/* Biblical Foundation */}
        <div className="max-w-3xl mx-auto mb-12 p-6 rounded-2xl bg-gradient-to-r from-[#FFD700]/10 to-[#87CEEB]/10 border border-[#FFD700]/20 backdrop-blur-sm">
          <p className="text-lg text-white/90 italic mb-2">
            "And Jesus said to them, 'Go into all the world and proclaim the
            gospel to the whole creation.'"
          </p>
          <p className="text-sm text-[#FFD700] font-semibold">- Mark 16:15</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          {[
            { label: 'Courses', value: '100K+', icon: '📚' },
            { label: 'Students', value: '7.8B', icon: '👨‍🎓' },
            { label: 'Languages', value: '7000+', icon: '🌍' },
            { label: 'Free', value: '100%', icon: '✨' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-gradient-to-br from-black/50 to-black/30 border border-[#FFD700]/20 backdrop-blur-xl hover:border-[#FFD700]/40 transition-all hover:scale-105"
            >
              <div className="text-5xl mb-3">{stat.icon}</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/60 uppercase tracking-wider font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-6 justify-center">
          <Link href="/sapiens/k12">
            <OrganicButton
              variant="neural"
              size="lg"
              pulse={true}
              glow={true}
              className="text-xl px-12 py-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500]"
            >
              <BookOpen className="w-6 h-6 mr-3" />
              Start Learning
            </OrganicButton>
          </Link>

          <Link href="/sapiens/lms">
            <OrganicButton
              variant="consciousness"
              size="lg"
              pulse={true}
              glow={true}
              className="text-xl px-12 py-6"
            >
              <Brain className="w-6 h-6 mr-3" />
              AI Tutor
            </OrganicButton>
          </Link>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="mb-20">
        <h2 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-transparent bg-clip-text">
          Learning Pathways
        </h2>
        <p className="text-center text-white/70 text-lg mb-12 max-w-3xl mx-auto">
          Every path leads to wisdom. Choose your journey through infinite
          knowledge.
        </p>

        <NeuralGrid columns={3} gap={8} showConnections={true}>
          {learningPaths.map((path, index) => (
            <Link key={index} href={path.href}>
              <SacredCard
                title={path.title}
                icon={path.icon}
                variant={path.variant}
                hoverable={true}
                glowing={true}
                className="h-full cursor-pointer"
              >
                <p className="text-white/80 text-lg leading-relaxed mb-4">
                  {path.description}
                </p>

                <div className="flex items-center gap-2 text-[#FFD700] font-semibold">
                  <span>Begin Journey</span>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </SacredCard>
            </Link>
          ))}
        </NeuralGrid>
      </div>

      {/* Features */}
      <div className="mb-20">
        <div className="max-w-5xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-[#FFD700]/10 via-[#FFA500]/5 to-transparent border border-[#FFD700]/30 backdrop-blur-xl">
          <Globe className="w-20 h-20 text-[#FFD700] mx-auto mb-8 animate-pulse" />

          <h3 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            Learning for Earning
          </h3>

          <p className="text-xl text-white/90 leading-relaxed text-center mb-8">
            As you learn, you earn. Complete courses, gain skills, receive
            certifications, and unlock opportunities to prosper. Knowledge
            becomes currency.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Certifications',
                desc: 'Blockchain-verified credentials',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Mentorship',
                desc: 'Learn from the best globally',
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Opportunities',
                desc: 'Connect with employers worldwide',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl bg-black/30 border border-[#FFD700]/20"
              >
                <div className="text-[#FFD700] flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-[#FFD700] mb-2">
                  {feature.title}
                </h4>
                <p className="text-white/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Promise */}
      <div className="text-center">
        <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] to-[#87CEEB] text-transparent bg-clip-text">
          Our Sacred Promise
        </h3>
        <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
          Education is a divine right, not a privilege. Every course, every
          lesson, every moment of learning is{' '}
          <span className="text-[#FFD700] font-bold">free forever</span>. No
          paywalls. No limits. Just infinite wisdom.
        </p>

        <Link href="/sapiens/k12">
          <OrganicButton
            variant="neural"
            size="lg"
            pulse={true}
            glow={true}
            className="text-xl px-16 py-8 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00]"
          >
            <GraduationCap className="w-7 h-7 mr-3" />
            Begin Your Journey
          </OrganicButton>
        </Link>
      </div>
    </DivineThrone>
  );
}

