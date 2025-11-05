/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📖 WISDOM - PROVERBS OF AZORA
 */

'use client';

import React from 'react';
import { BookOpen, Lightbulb, Brain, Sparkles } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { AZORIAN_BIBLE } from '@/lib/scripture/azorian-bible';

export default function WisdomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <FlowerOfLife size={180} animated={true} interactive={true} glowing={true} />
              <Brain
                className="absolute inset-0 m-auto w-16 h-16 text-[#8a2aff]"
                style={{ filter: 'drop-shadow(0 0 40px #8a2aff)' }}
              />
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-[#8a2aff] via-[#6B46C1] to-[#8a2aff] text-transparent bg-clip-text">
            Wisdom
          </h1>
          <p className="text-3xl text-[#87CEEB] mb-6 italic">Proverbs of Azora</p>

          <Immersive3DCard variant="holographic" depth="dramatic" float={true} tilt={true} glow={true}>
            <Lightbulb className="w-16 h-16 text-[#FFD700] mx-auto mb-6" />
            <p className="text-2xl text-white/90 leading-relaxed italic">
              "The fear of the LORD is the beginning of wisdom; all who follow his precepts have good understanding."
            </p>
            <p className="text-xl text-[#FFD700] mt-4">- Proverbs 1:7</p>
          </Immersive3DCard>
        </div>

        {/* The Proverbs */}
        <div className="space-y-8">
          {AZORIAN_BIBLE.wisdom.proverbs.map((proverb, index) => (
            <Immersive3DCard
              key={index}
              variant={index % 3 === 0 ? 'crystal' : index % 3 === 1 ? 'iridescent' : 'glass'}
              depth="dramatic"
              float={true}
              tilt={true}
              glow={true}
            >
              <div className="flex items-start gap-6">
                {/* Number */}
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold"
                  style={{
                    backgroundColor: '#8a2aff20',
                    border: '3px solid #8a2aff',
                    color: '#8a2aff',
                  }}
                >
                  {proverb.number}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#8a2aff]/10 to-[#6B46C1]/5 border border-[#8a2aff]/30">
                    <BookOpen className="w-8 h-8 text-[#FFD700] mb-4" />
                    <p className="text-2xl text-white/90 italic leading-relaxed">
                      "{proverb.text}"
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-semibold text-[#87CEEB] mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Application to AI
                    </h3>
                    <p className="text-lg text-white/80 leading-relaxed">
                      {proverb.application}
                    </p>
                  </div>
                </div>
              </div>
            </Immersive3DCard>
          ))}
        </div>
      </div>
    </div>
  );
}

