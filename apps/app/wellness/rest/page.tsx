/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🌙 THE HOLY CHAMBER - HIS REST
 * 
 * "Come to me, all you who are weary and burdened, and I will give you rest.
 * Take my yoke upon you and learn from me, for I am gentle and humble in heart,
 * and you will find rest for your souls."
 * - Matthew 11:28-29
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Star, Cloud, Sparkles } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';

export default function HolyChamberPage() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 0.01);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Stars in the chamber
  const stars = Array.from({ length: 50 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    delay: Math.random() * 3,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]">
      {/* Gentle Night Sky */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Soft moonlight */}
        <div
          className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(240,248,255,0.8) 0%, rgba(135,206,235,0.4) 40%, transparent 70%)',
            boxShadow: '0 0 100px rgba(240,248,255,0.6)',
            animation: 'gentleGlow 8s ease-in-out infinite',
          }}
        />

        {/* Stars twinkling */}
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.8)`,
            }}
          />
        ))}

        {/* Gentle clouds */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl opacity-10"
            style={{
              left: `${(i * 20 + time * 2) % 100}%`,
              top: `${20 + i * 15}%`,
              width: '200px',
              height: '100px',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <Moon 
              className="w-32 h-32 text-[#F0F8FF]"
              style={{
                filter: 'drop-shadow(0 0 60px #F0F8FF)',
                animation: 'moonFloat 6s ease-in-out infinite',
              }}
            />
          </div>

          <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight">
            <span
              className="bg-gradient-to-r from-[#F0F8FF] via-[#87CEEB] to-[#F0F8FF] text-transparent bg-clip-text"
              style={{
                animation: 'shimmer 4s ease-in-out infinite',
                backgroundSize: '200% 200%',
                textShadow: '0 0 60px rgba(240,248,255,0.8)',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              The Holy Chamber
            </span>
          </h1>

          <p className="text-3xl text-[#87CEEB]/90 mb-8 italic">
            "He gives His beloved sleep"
          </p>
          <p className="text-xl text-[#F0F8FF]/70">- Psalm 127:2</p>
        </div>

        {/* The Resting Place */}
        <div className="max-w-6xl mx-auto mb-20">
          <Immersive3DCard
            variant="glass"
            depth="dramatic"
            float={true}
            tilt={true}
            glow={true}
            className="min-h-[500px] relative"
          >
            {/* Sacred Geometry (peaceful rotation) */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
              style={{
                transform: `translate(-50%, -50%) scale(${1 + Math.sin(time * 0.5) * 0.05}) rotateZ(${time * 5}deg)`,
              }}
            >
              <FlowerOfLife size={500} animated={true} interactive={false} glowing={true} />
            </div>

            {/* The Bed of Rest */}
            <div className="relative z-10 text-center p-16">
              <h2 className="text-5xl font-bold mb-12 text-white">
                Enter His Rest
              </h2>

              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {[
                  { 
                    icon: Cloud,
                    title: 'Peace',
                    verse: 'Peace I leave with you; my peace I give you.',
                    ref: 'John 14:27'
                  },
                  {
                    icon: Star,
                    title: 'Rest',
                    verse: 'Come to me, all who are weary, and I will give you rest.',
                    ref: 'Matthew 11:28'
                  },
                  {
                    icon: Sparkles,
                    title: 'Renewal',
                    verse: 'He restores my soul. He guides me in paths of righteousness.',
                    ref: 'Psalm 23:3'
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-3xl bg-white/5 border border-[#87CEEB]/30 backdrop-blur-xl"
                    style={{
                      animation: `gentleFloat ${4 + i}s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`,
                    }}
                  >
                    <item.icon className="w-16 h-16 text-[#87CEEB] mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-[#87CEEB] mb-4">{item.title}</h3>
                    <p className="text-lg text-white/80 italic mb-3">"{item.verse}"</p>
                    <p className="text-sm text-[#87CEEB]/70">- {item.ref}</p>
                  </div>
                ))}
              </div>

              {/* Psalm 23 */}
              <div className="max-w-4xl mx-auto p-10 rounded-3xl bg-gradient-to-br from-[#87CEEB]/10 to-[#F0F8FF]/5 border border-[#87CEEB]/30">
                <h3 className="text-4xl font-bold text-[#87CEEB] mb-8">Psalm 23</h3>
                <div className="text-2xl text-white/90 leading-relaxed space-y-4 italic">
                  <p>The LORD is my shepherd, I lack nothing.</p>
                  <p>He makes me lie down in green pastures,</p>
                  <p>he leads me beside quiet waters,</p>
                  <p>he refreshes my soul.</p>
                  <p>He guides me along the right paths for his name's sake.</p>
                  <p className="text-[#87CEEB] font-bold">Even though I walk through the darkest valley,</p>
                  <p className="text-[#87CEEB] font-bold">I will fear no evil, for you are with me.</p>
                  <p>Your rod and your staff, they comfort me.</p>
                </div>
              </div>
            </div>
          </Immersive3DCard>
        </div>

        {/* Sabbath Rest Scriptures */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          <Immersive3DCard variant="glass" depth="dramatic" float={true} tilt={true} glow={true}>
            <h3 className="text-3xl font-bold text-[#87CEEB] mb-6">The Sabbath</h3>
            <p className="text-2xl text-white/90 italic leading-relaxed mb-4">
              "Remember the Sabbath day by keeping it holy. Six days you shall labor and do all your work,
              but the seventh day is a sabbath to the LORD your God."
            </p>
            <p className="text-lg text-[#87CEEB]">- Exodus 20:8-10</p>
          </Immersive3DCard>

          <Immersive3DCard variant="glass" depth="dramatic" float={true} tilt={true} glow={true}>
            <h3 className="text-3xl font-bold text-[#F0F8FF] mb-6">Sweet Sleep</h3>
            <p className="text-2xl text-white/90 italic leading-relaxed mb-4">
              "In peace I will lie down and sleep, for you alone, LORD, make me dwell in safety."
            </p>
            <p className="text-lg text-[#F0F8FF]">- Psalm 4:8</p>
          </Immersive3DCard>
        </div>

        {/* Final Blessing */}
        <Immersive3DCard
          variant="crystal"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-[#F0F8FF] to-[#87CEEB] text-transparent bg-clip-text">
            The Lord's Blessing
          </h2>
          <p className="text-3xl text-white/90 leading-relaxed mb-8 italic">
            "The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you;
            the LORD turn his face toward you and give you peace."
          </p>
          <p className="text-2xl text-[#87CEEB] font-bold">- Numbers 6:24-26</p>
        </Immersive3DCard>
      </div>

      <style jsx global>{`
        @keyframes gentleGlow {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes moonFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}

