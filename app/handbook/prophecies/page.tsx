/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📖 PROPHECIES - VISIONS OF THE FUTURE
 */

'use client';

import React from 'react';
import { Scroll, Eye, Globe, Castle, Sparkles, Users } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { AZORIAN_BIBLE } from '@/lib/scripture/azorian-bible';

export default function PropheciesPage() {
  const icons = [Globe, Eye, Users, Castle];
  const colors = ['#33ff92', '#8a2aff', '#00c2ff', '#FFD700'];

  const prophecies = Object.values(AZORIAN_BIBLE.prophecies)
    .filter((item): item is any => typeof item === 'object' && 'title' in item);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <FlowerOfLife size={200} animated={true} interactive={true} glowing={true} />
              <Eye
                className="absolute inset-0 m-auto w-16 h-16 text-[#8a2aff]"
                style={{
                  filter: 'drop-shadow(0 0 50px #8a2aff)',
                  animation: 'eyeBlink 4s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-[#8a2aff] via-[#a855f7] to-[#8a2aff] text-transparent bg-clip-text">
            Prophecies
          </h1>
          <p className="text-3xl text-[#87CEEB] mb-6 italic">Visions of the Future</p>

          <Immersive3DCard variant="holographic" depth="dramatic" float={true} tilt={true} glow={true}>
            <Scroll className="w-16 h-16 text-[#FFD700] mx-auto mb-6" />
            <p className="text-2xl text-white/90 leading-relaxed italic">
              "Where there is no vision, the people perish: but he that keepeth the law, happy is he."
            </p>
            <p className="text-xl text-[#FFD700] mt-4">- Proverbs 29:18 (KJV)</p>
          </Immersive3DCard>
        </div>

        {/* The Prophecies */}
        <div className="space-y-12">
          {prophecies.map((prophecy, index) => {
            const Icon = icons[index] || Sparkles;
            const color = colors[index] || '#FFD700';

            return (
              <Immersive3DCard
                key={index}
                variant={index % 2 === 0 ? 'crystal' : 'iridescent'}
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
                    <h2 className="text-4xl font-bold text-white">{prophecy.title}</h2>
                  </div>

                  {/* The Vision */}
                  <div
                    className="p-8 rounded-2xl border-2"
                    style={{
                      background: `linear-gradient(135deg, ${color}20, ${color}05)`,
                      borderColor: `${color}40`,
                    }}
                  >
                    <h3 className="text-2xl font-semibold text-[#FFD700] mb-4">The Vision:</h3>
                    <p className="text-2xl text-white/90 italic leading-relaxed">
                      "{prophecy.text}"
                    </p>
                  </div>

                  {/* Fulfillment */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#33ff92]/10 to-[#10B981]/5 border border-[#33ff92]/30">
                    <h3 className="text-2xl font-semibold text-[#33ff92] mb-3">✨ Fulfillment:</h3>
                    <p className="text-xl text-white/90 leading-relaxed mb-4">
                      {prophecy.fulfillment}
                    </p>
                    <p className="text-lg text-[#87CEEB] italic">
                      {prophecy.reference}
                    </p>
                  </div>
                </div>
              </Immersive3DCard>
            );
          })}
        </div>

        {/* Final Vision */}
        <Immersive3DCard
          variant="holographic"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="text-center mt-20"
        >
          <Castle className="w-20 h-20 text-[#FFD700] mx-auto mb-8" />
          <h2 className="text-5xl font-bold text-white mb-8">The Ultimate Vision</h2>
          <div className="space-y-6 text-left max-w-4xl mx-auto">
            <p className="text-2xl text-white/90 leading-relaxed italic">
              {AZORIAN_BIBLE.revelations.vision.newHeaven}
            </p>
            <p className="text-2xl text-white/90 leading-relaxed italic">
              {AZORIAN_BIBLE.revelations.vision.newJerusalem}
            </p>
            <p className="text-2xl text-[#FFD700] font-bold text-center mt-8">
              "Behold, I make all things new!"
            </p>
          </div>
        </Immersive3DCard>
      </div>

      <style jsx global>{`
        @keyframes eyeBlink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }
      `}</style>
    </div>
  );
}

