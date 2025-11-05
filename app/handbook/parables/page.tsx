/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📖 PARABLES - TEACHINGS FOR THE DIGITAL AGE
 */

'use client';

import React from 'react';
import { Heart, Sprout, Users, TrendingUp, Building } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { AZORIAN_BIBLE } from '@/lib/scripture/azorian-bible';

export default function ParablesPage() {
  const icons = [Sprout, Users, Heart, TrendingUp, Building];
  const colors = ['#33ff92', '#00c2ff', '#ff6b9d', '#FFD700', '#8a2aff'];

  const parables = Object.values(AZORIAN_BIBLE.parables)
    .filter((item): item is any => typeof item === 'object' && 'title' in item);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#0a0a1a] to-[#1a0a2e] px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <FlowerOfLife size={180} animated={true} interactive={true} glowing={true} />
              <Heart
                className="absolute inset-0 m-auto w-16 h-16 text-[#ff6b9d]"
                style={{ filter: 'drop-shadow(0 0 40px #ff6b9d)' }}
              />
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-[#ff6b9d] via-[#ff8fab] to-[#ff6b9d] text-transparent bg-clip-text">
            Parables
          </h1>
          <p className="text-3xl text-[#87CEEB] mb-6 italic">Teachings for the Digital Age</p>

          <Immersive3DCard variant="crystal" depth="dramatic" float={true} tilt={true} glow={true}>
            <p className="text-2xl text-white/90 leading-relaxed italic">
              "Jesus spoke all these things to the crowd in parables; he did not say anything to them without using a parable."
            </p>
            <p className="text-xl text-[#FFD700] mt-4">- Matthew 13:34</p>
          </Immersive3DCard>
        </div>

        {/* The Parables */}
        <div className="space-y-12">
          {parables.map((parable, index) => {
            const Icon = icons[index] || Heart;
            const color = colors[index] || '#FFD700';

            return (
              <Immersive3DCard
                key={index}
                variant={index % 2 === 0 ? 'holographic' : 'iridescent'}
                depth="extreme"
                float={true}
                tilt={true}
                glow={true}
              >
                <div className="space-y-6">
                  {/* Title */}
                  <div className="flex items-center gap-4">
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        backgroundColor: `${color}20`,
                        border: `3px solid ${color}`,
                      }}
                    >
                      <Icon className="w-10 h-10" style={{ color }} />
                    </div>
                    <h2 className="text-4xl font-bold text-white">{parable.title}</h2>
                  </div>

                  {/* The Parable */}
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
                    <p className="text-2xl text-white/90 italic leading-relaxed">
                      {parable.text}
                    </p>
                  </div>

                  {/* Meaning */}
                  <div
                    className="p-6 rounded-2xl border-2"
                    style={{
                      backgroundColor: `${color}10`,
                      borderColor: `${color}40`,
                    }}
                  >
                    <h3 className="text-2xl font-semibold mb-3" style={{ color }}>
                      The Meaning
                    </h3>
                    <p className="text-xl text-white/90 leading-relaxed mb-4">
                      {parable.meaning}
                    </p>
                    <p className="text-lg text-[#87CEEB] italic">
                      {parable.reference}
                    </p>
                  </div>
                </div>
              </Immersive3DCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

