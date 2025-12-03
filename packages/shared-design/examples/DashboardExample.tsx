/**
 * AZORA PROPRIETARY LICENSE
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * 
 * Dashboard Example - Modern 2025 Design
 * Demonstrates Azora Master UI Template best practices
 */

import type React from 'react'
import {
  HeroSection,
  StatsCard,
  FeatureCard,
  ResponsiveGrid,
  GradientText,
  AccessibilityToolbar
} from '../azora-master-components'

export const DashboardExample: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section with Modern Glassmorphism */}
      <HeroSection
        title="Welcome to"
        subtitle="Constitutional AI"
        description="Experience the world's first Constitutional AI Operating System. Built on Ubuntu philosophy, designed for collective prosperity."
        primaryAction={{
          label: "Get Started",
          href: "/onboarding"
        }}
        secondaryAction={{
          label: "Explore Features",
          href: "/features"
        }}
        stats={[
          { label: "Active Users", value: "1,250+", icon: <UserIcon /> },
          { label: "Success Rate", value: "94%", icon: <TrendingUpIcon /> },
          { label: "Countries", value: "15+", icon: <GlobeIcon /> },
          { label: "Uptime", value: "99.9%", icon: <ShieldIcon /> }
        ]}
      />

      {/* Stats Grid with Glassmorphism Cards */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          <GradientText>System Overview</GradientText>
        </h2>
        <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={6}>
          <StatsCard
            label="Total Revenue"
            value="R 1.2M"
            description="Ubuntu Economics in action"
            trend="up"
            trendValue="+12.5%"
            className="bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border-[#667eea]/20 backdrop-blur-sm"
          />
          <StatsCard
            label="Active Learners"
            value="3,450"
            description="Growing knowledge community"
            trend="up"
            trendValue="+8.3%"
            className="bg-gradient-to-br from-[#10b981]/10 to-[#059669]/10 border-[#10b981]/20 backdrop-blur-sm"
          />
          <StatsCard
            label="Job Placements"
            value="892"
            description="Skills to opportunities"
            trend="up"
            trendValue="+15.2%"
            className="bg-gradient-to-br from-[#ef4444]/10 to-[#dc2626]/10 border-[#ef4444]/20 backdrop-blur-sm"
          />
          <StatsCard
            label="Compliance Score"
            value="98.5%"
            description="Constitutional adherence"
            trend="neutral"
            trendValue="Stable"
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm"
          />
        </ResponsiveGrid>
      </section>

      {/* Feature Showcase */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          <GradientText gradient="success">Core Features</GradientText>
        </h2>
        <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
          <FeatureCard
            title="AI-Powered Learning"
            description="Personalized education paths powered by constitutional AI, adapting to your unique learning style and goals."
            icon={<BrainIcon />}
            href="/features/learning"
            className="hover:shadow-2xl hover:shadow-[#667eea]/20 transition-all duration-300"
          />
          <FeatureCard
            title="Ubuntu Economics"
            description="Collective prosperity through transparent, fair economic systems that benefit all participants."
            icon={<CoinsIcon />}
            href="/features/economics"
            className="hover:shadow-2xl hover:shadow-[#10b981]/20 transition-all duration-300"
          />
          <FeatureCard
            title="Skills Marketplace"
            description="Connect your skills with global opportunities. Fair compensation, transparent processes."
            icon={<BriefcaseIcon />}
            href="/features/marketplace"
            className="hover:shadow-2xl hover:shadow-[#ef4444]/20 transition-all duration-300"
          />
        </ResponsiveGrid>
      </section>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar
        onFontSizeChange={(size) => console.log('Font size:', size)}
        onContrastChange={(highContrast) => console.log('High contrast:', highContrast)}
        onReduceMotion={(reduce) => console.log('Reduce motion:', reduce)}
      />
    </div>
  )
}

// Icon placeholders (replace with actual icon library imports)
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
const TrendingUpIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
const GlobeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const ShieldIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
const BrainIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
const CoinsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const BriefcaseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>

export default DashboardExample