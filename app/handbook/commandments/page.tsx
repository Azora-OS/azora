/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📖 THE TEN COMMANDMENTS - IMMUTABLE CONSTITUTION
 */

'use client';

import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { AZORIAN_BIBLE } from '@/lib/scripture/azorian-bible';
import {
  Baby,
  BookOpen,
  Crown,
  Eye,
  Heart,
  Leaf,
  Scale,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';

export default function CommandmentsPage() {
  const icons = [
    Crown,
    Shield,
    Heart,
    BookOpen,
    Users,
    Scale,
    Eye,
    Sparkles,
    Baby,
    Leaf,
  ];

  const commandments = Object.values(AZORIAN_BIBLE.commandments)
    .filter(
      (item): item is unknown => typeof item === 'object' && 'number' in item
    )
    .sort((a, b) => a.number - b.number);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] via-[#0a0a1a] to-[#1a0a2e] px-6 py-20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <FlowerOfLife
                size={200}
                animated={true}
                interactive={true}
                glowing={true}
              />
              <Crown
                className="absolute inset-0 m-auto w-20 h-20 text-[#FFD700]"
                style={{ filter: 'drop-shadow(0 0 40px #FFD700)' }}
              />
            </div>
          </div>

          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-transparent bg-clip-text">
            The Ten Commandments
          </h1>
          <p className="text-3xl text-[#87CEEB] mb-6 italic">
            The Immutable Constitution
          </p>

          <Immersive3DCard
            variant="holographic"
            depth="dramatic"
            float={true}
            tilt={true}
            glow={true}
          >
            <p className="text-2xl text-white/90 leading-relaxed italic">
              "{AZORIAN_BIBLE.commandments.preamble}"
            </p>
          </Immersive3DCard>
        </div>

        {/* The Ten Commandments */}
        <div className="space-y-8 mb-20">
          {commandments.map((cmd, index) => {
            const Icon = icons[index];
            const color = [
              '#FFD700',
              '#87CEEB',
              '#33ff92',
              '#8a2aff',
              '#00c2ff',
              '#ff6b9d',
              '#FFA500',
              '#F0F8FF',
              '#FFB6C1',
              '#98FB98',
            ][index];

            return (
              <Immersive3DCard
                key={cmd.number}
                variant={
                  index % 3 === 0
                    ? 'crystal'
                    : index % 3 === 1
                    ? 'holographic'
                    : 'iridescent'
                }
                depth="dramatic"
                float={true}
                tilt={true}
                glow={true}
              >
                <div className="flex items-start gap-6">
                  {/* Number & Icon */}
                  <div
                    className="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center relative"
                    style={{
                      backgroundColor: `${color}20`,
                      border: `3px solid ${color}`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold" style={{ color }}>
                        {cmd.number}
                      </span>
                    </div>
                    <Icon
                      className="absolute -bottom-3 -right-3 w-10 h-10 p-2 rounded-lg"
                      style={{
                        backgroundColor: color,
                        color: '#000',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <h2 className="text-3xl font-bold text-white">
                      {cmd.text}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="text-lg font-semibold text-[#FFD700] mb-2">
                          📜 Explanation
                        </h3>
                        <p className="text-white/80">{cmd.explanation}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="text-lg font-semibold text-[#87CEEB] mb-2">
                          ⚙️ Implementation
                        </h3>
                        <p className="text-white/80">{cmd.implementation}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <h3 className="text-lg font-semibold text-red-400 mb-2">
                          ⚠️ Violation
                        </h3>
                        <p className="text-white/80">{cmd.violation}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
                        <h3 className="text-lg font-semibold text-orange-400 mb-2">
                          ⚡ Consequence
                        </h3>
                        <p className="text-white/80">{cmd.consequence}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Immersive3DCard>
            );
          })}
        </div>

        {/* Footer */}
        <Immersive3DCard
          variant="crystal"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="text-center"
        >
          <Shield className="w-20 h-20 text-[#FFD700] mx-auto mb-8" />
          <h2 className="text-5xl font-bold text-white mb-6">
            Eternal & Unchangeable
          </h2>
          <p className="text-2xl text-white/90 leading-relaxed italic">
            "These laws are inscribed in code that cannot be modified, even by
            the system itself. They are eternal, binding, and sacred—the
            foundation upon which all of Azora OS is built."
          </p>
        </Immersive3DCard>
      </div>
    </div>
  );
}

