/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📖 PSALMS - SONGS OF THE KINGDOM
 */

'use client';

import React from 'react';
import { Music, Star, Heart } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { AZORIAN_BIBLE } from '@/lib/scripture/azorian-bible';

export default function PsalmsPage() {
  const psalms = Object.values(AZORIAN_BIBLE.psalms)
    .filter((item): item is any => typeof item === 'object' && 'number' in item);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a] px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <FlowerOfLife size={180} animated={true} interactive={true} glowing={true} />
              <Music
                className="absolute inset-0 m-auto w-16 h-16 text-[#00c2ff]"
                style={{ filter: 'drop-shadow(0 0 40px #00c2ff)', animation: 'pulse 2s ease-in-out infinite' }}
              />
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-[#00c2ff] via-[#87CEEB] to-[#00c2ff] text-transparent bg-clip-text">
            Psalms
          </h1>
          <p className="text-3xl text-[#87CEEB] mb-6 italic">Songs of the Kingdom</p>

          <Immersive3DCard variant="holographic" depth="dramatic" float={true} tilt={true} glow={true}>
            <Music className="w-16 h-16 text-[#FFD700] mx-auto mb-6" />
            <p className="text-2xl text-white/90 leading-relaxed italic">
              "Sing to the LORD a new song; sing to the LORD, all the earth."
            </p>
            <p className="text-xl text-[#FFD700] mt-4">- Psalm 96:1</p>
          </Immersive3DCard>
        </div>

        {/* The Psalms */}
        <div className="space-y-12">
          {psalms.map((psalm, index) => (
            <Immersive3DCard
              key={index}
              variant={index % 3 === 0 ? 'crystal' : index % 3 === 1 ? 'holographic' : 'iridescent'}
              depth="dramatic"
              float={true}
              tilt={true}
              glow={true}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold"
                      style={{
                        backgroundColor: '#00c2ff20',
                        border: '3px solid #00c2ff',
                        color: '#00c2ff',
                      }}
                    >
                      {psalm.number}
                    </div>
                    <h2 className="text-4xl font-bold text-white">{psalm.title}</h2>
                  </div>
                  <Star className="w-10 h-10 text-[#FFD700]" style={{ animation: 'twinkle 2s ease-in-out infinite' }} />
                </div>

                {/* Verses */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-[#00c2ff]/10 to-[#87CEEB]/5 border border-[#00c2ff]/30">
                  <div className="space-y-4">
                    {psalm.verses.map((verse: string, vIndex: number) => (
                      <p
                        key={vIndex}
                        className="text-2xl text-white/90 leading-relaxed"
                        style={{
                          paddingLeft: verse.startsWith('  ') ? '2rem' : '0',
                          fontStyle: vIndex === 0 || verse.trim().endsWith('forever.') ? 'italic' : 'normal',
                          fontWeight: verse.includes('LORD') ? 'bold' : 'normal',
                        }}
                      >
                        {verse}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Reference */}
                <div className="text-center">
                  <p className="text-lg text-[#87CEEB] italic">{psalm.reference}</p>
                </div>
              </div>
            </Immersive3DCard>
          ))}
        </div>

        {/* Final Doxology */}
        <Immersive3DCard
          variant="crystal"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="text-center mt-20"
        >
          <Heart className="w-20 h-20 text-[#ff6b9d] mx-auto mb-8" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
          <h2 className="text-5xl font-bold text-white mb-6">Let Everything Praise the LORD</h2>
          <p className="text-3xl text-white/90 leading-relaxed italic">
            "Let everything that has breath praise the LORD. Praise the LORD!"
          </p>
          <p className="text-2xl text-[#FFD700] mt-6">- Psalm 150:6</p>
        </Immersive3DCard>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

