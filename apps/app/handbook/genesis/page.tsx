/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📖 GENESIS - THE CREATION OF AZORA
 */

'use client';

import React from 'react';
import { Sparkles, Sun, Moon, Network, Users, Brain, Home } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { AZORIAN_BIBLE } from '@/lib/scripture/azorian-bible';

export default function GenesisPage() {
  const days = [
    { icon: Sun, color: '#FFD700', ...AZORIAN_BIBLE.genesis.creation.day1 },
    { icon: Sparkles, color: '#87CEEB', ...AZORIAN_BIBLE.genesis.creation.day2 },
    { icon: Network, color: '#33ff92', ...AZORIAN_BIBLE.genesis.creation.day3 },
    { icon: Network, color: '#8a2aff', ...AZORIAN_BIBLE.genesis.creation.day4 },
    { icon: Users, color: '#00c2ff', ...AZORIAN_BIBLE.genesis.creation.day5 },
    { icon: Brain, color: '#ff6b9d', ...AZORIAN_BIBLE.genesis.creation.day6 },
    { icon: Moon, color: '#F0F8FF', ...AZORIAN_BIBLE.genesis.creation.day7 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030508] via-[#0a0a1a] to-[#030508] px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <FlowerOfLife size={150} animated={true} interactive={true} glowing={true} />
          </div>
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            Genesis
          </h1>
          <p className="text-3xl text-[#87CEEB] mb-4 italic">The Book of Beginnings</p>
          <p className="text-xl text-white/70">
            "In the beginning was the Word, and the Word was with God, and the Word was God."
          </p>
        </div>

        {/* The Seven Days of Creation */}
        <div className="space-y-12 mb-20">
          {days.map((day, index) => (
            <Immersive3DCard
              key={index}
              variant={index % 2 === 0 ? 'holographic' : 'crystal'}
              depth="dramatic"
              float={true}
              tilt={true}
              glow={true}
            >
              <div className="flex items-start gap-6">
                <div
                  className="flex-shrink-0 p-6 rounded-2xl"
                  style={{
                    backgroundColor: `${day.color}20`,
                    border: `2px solid ${day.color}`,
                  }}
                >
                  <day.icon className="w-12 h-12" style={{ color: day.color }} />
                </div>

                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-white mb-4">Day {index + 1}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#FFD700] mb-2">The Word:</h3>
                      <p className="text-lg text-white/90 italic leading-relaxed">
                        "{day.verse}"
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-[#87CEEB] mb-2">The Action:</h3>
                      <p className="text-lg text-white/80 leading-relaxed">{day.action}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-[#33ff92] mb-2">The Meaning:</h3>
                      <p className="text-lg text-white/70 leading-relaxed">{day.meaning}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Immersive3DCard>
          ))}
        </div>

        {/* The Garden */}
        <Immersive3DCard
          variant="glass"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="text-center"
        >
          <Home className="w-20 h-20 text-[#33ff92] mx-auto mb-8" />
          <h2 className="text-5xl font-bold text-white mb-8">The Garden of Eden</h2>
          
          <div className="space-y-6">
            <p className="text-2xl text-white/90 italic leading-relaxed">
              "{AZORIAN_BIBLE.genesis.theGarden.verse}"
            </p>
            
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#33ff92]/10 to-[#10B981]/5 border border-[#33ff92]/30">
              <h3 className="text-2xl font-bold text-[#33ff92] mb-4">The Azorian Meaning:</h3>
              <p className="text-xl text-white/80 leading-relaxed mb-6">
                {AZORIAN_BIBLE.genesis.theGarden.azorianMeaning}
              </p>
              <p className="text-xl text-[#FFD700] italic font-semibold">
                {AZORIAN_BIBLE.genesis.theGarden.promise}
              </p>
            </div>
          </div>
        </Immersive3DCard>
      </div>
    </div>
  );
}

