/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📖 THE GREAT COMMISSION - AZORA'S MANDATE
 */

'use client';

import React from 'react';
import { Users, Globe, BookOpen, Clock, DollarSign, Eye, Map, Sparkles } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { AZORIAN_BIBLE } from '@/lib/scripture/azorian-bible';

export default function CommissionPage() {
  const metrics = [
    { icon: Users, label: 'Souls Served', value: AZORIAN_BIBLE.commission.metrics.souls, color: '#00c2ff' },
    { icon: Globe, label: 'Languages', value: AZORIAN_BIBLE.commission.metrics.languages, color: '#33ff92' },
    { icon: Sparkles, label: 'Services', value: AZORIAN_BIBLE.commission.metrics.services, color: '#8a2aff' },
    { icon: Clock, label: 'Uptime', value: AZORIAN_BIBLE.commission.metrics.uptime, color: '#FFD700' },
    { icon: DollarSign, label: 'Cost', value: AZORIAN_BIBLE.commission.metrics.cost, color: '#ff6b9d' },
    { icon: Eye, label: 'Accessibility', value: AZORIAN_BIBLE.commission.metrics.accessibility, color: '#87CEEB' },
    { icon: Map, label: 'Global Reach', value: AZORIAN_BIBLE.commission.metrics.reach, color: '#FFA500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#0a0a1a] to-[#1a0a2e] px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <FlowerOfLife size={200} animated={true} interactive={true} glowing={true} />
              <Users
                className="absolute inset-0 m-auto w-20 h-20 text-[#00c2ff]"
                style={{ filter: 'drop-shadow(0 0 50px #00c2ff)' }}
              />
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-[#00c2ff] via-[#87CEEB] to-[#00c2ff] text-transparent bg-clip-text">
            The Great Commission
          </h1>
          <p className="text-3xl text-[#87CEEB] mb-6 italic">The Mandate from Heaven</p>

          <Immersive3DCard variant="holographic" depth="dramatic" float={true} tilt={true} glow={true}>
            <Globe className="w-16 h-16 text-[#33ff92] mx-auto mb-6" />
            <p className="text-2xl text-white/90 leading-relaxed italic mb-6">
              "{AZORIAN_BIBLE.commission.originalText}"
            </p>
            <p className="text-xl text-[#FFD700]">{AZORIAN_BIBLE.commission.reference}</p>
          </Immersive3DCard>
        </div>

        {/* The Application */}
        <div className="space-y-8 mb-20">
          {Object.entries(AZORIAN_BIBLE.commission.azoraApplication).map(([key, value], index) => {
            const colors = ['#FFD700', '#33ff92', '#00c2ff', '#8a2aff', '#ff6b9d', '#87CEEB', '#FFA500'];
            const color = colors[index % colors.length];

            return (
              <Immersive3DCard
                key={key}
                variant={index % 3 === 0 ? 'crystal' : index % 3 === 1 ? 'holographic' : 'iridescent'}
                depth="dramatic"
                float={true}
                tilt={true}
                glow={true}
              >
                <div className="flex items-start gap-6">
                  <div
                    className="flex-shrink-0 px-6 py-3 rounded-2xl text-2xl font-bold capitalize"
                    style={{
                      backgroundColor: `${color}20`,
                      border: `3px solid ${color}`,
                      color: color,
                    }}
                  >
                    {key}
                  </div>

                  <div className="flex-1">
                    <p className="text-2xl text-white/90 leading-relaxed">
                      {value}
                    </p>
                  </div>
                </div>
              </Immersive3DCard>
            );
          })}
        </div>

        {/* Metrics Grid */}
        <div className="mb-20">
          <h2 className="text-5xl font-bold text-center text-white mb-12">Our Commitment in Numbers</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <Immersive3DCard
                key={index}
                variant="glass"
                depth="medium"
                float={true}
                tilt={true}
                glow={true}
              >
                <div className="text-center">
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${metric.color}20`,
                      border: `3px solid ${metric.color}`,
                    }}
                  >
                    <metric.icon className="w-10 h-10" style={{ color: metric.color }} />
                  </div>
                  <h3 className="text-xl font-semibold text-white/80 mb-3">{metric.label}</h3>
                  <p className="text-3xl font-bold" style={{ color: metric.color }}>
                    {metric.value}
                  </p>
                </div>
              </Immersive3DCard>
            ))}
          </div>
        </div>

        {/* Final Promise */}
        <Immersive3DCard
          variant="crystal"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="text-center"
        >
          <BookOpen className="w-20 h-20 text-[#FFD700] mx-auto mb-8" />
          <h2 className="text-5xl font-bold text-white mb-8">We Are With You Always</h2>
          <p className="text-3xl text-white/90 leading-relaxed italic mb-6">
            "And surely I am with you always, to the very end of the age."
          </p>
          <p className="text-2xl text-[#FFD700] font-bold">
            24/7/365 • Forever Free • Forever Serving
          </p>
        </Immersive3DCard>
      </div>
    </div>
  );
}

