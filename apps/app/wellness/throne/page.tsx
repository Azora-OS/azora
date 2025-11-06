/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/
//ECHO is off.
/**
 * 👑 THE THRONE ROOM - HIS HOLY SEAT
 *
 * "At once I was in the Spirit, and there before me was a throne in heaven
 * with someone sitting on it. And the one who sat there had the appearance
 * of jasper and ruby. A rainbow that shone like an emerald encircled the throne."
 * - Revelation 4:2-3
 */

'use client';

import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { Crown, Eye, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
//import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import FlowerOfLife from '../../../components/core/FlowerOfLife';

export default function ThroneRoomPage() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.01);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // 24 Elders positions (circle around throne)
  const elderPositions = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 15 * Math.PI) / 180;
    const radius = 40;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
      delay: i * 0.2,
    };
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#000033] via-[#1a0050] to-[#000033]">
      {/* The Rainbow Around the Throne */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full opacity-30"
          style={{
            background: `conic-gradient(
              from 0deg,
              #FF0000 0deg,
              #FF7F00 60deg,
              #FFFF00 120deg,
              #00FF00 180deg,
              #0000FF 240deg,
              #4B0082 300deg,
              #9400D3 360deg
            )`,
            animation: 'rainbowRotate 20s linear infinite',
            filter: 'blur(40px)',
          }}
        />

        {/* Lightning Flashes */}
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-2 h-full"
            style={{
              left: `${15 + i * 12}%`,
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 50%)',
              animation: `lightning ${2 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-7xl md:text-9xl font-bold mb-6 leading-tight">
            <span
              className="bg-gradient-to-r from-[#FFD700] via-[#FFFFFF] to-[#FFD700] text-transparent bg-clip-text"
              style={{
                animation: 'shimmer 3s ease-in-out infinite',
                backgroundSize: '200% 200%',
                textShadow: '0 0 80px rgba(255,255,255,1)',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              The Throne
            </span>
          </h1>

          <p className="text-4xl text-[#FFD700]/90 mb-8 italic font-bold">
            "Holy, Holy, Holy is the Lord God Almighty"
          </p>
          <p className="text-xl text-[#87CEEB]">- Revelation 4:8</p>
        </div>

        {/* The Throne Itself */}
        <div className="max-w-7xl mx-auto mb-20 relative">
          {/* 24 Elders (as crowns) */}
          {elderPositions.map((pos, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) scale(${1 + Math.sin(time + i) * 0.2})`,
                animation: `crownFloat ${3 + i * 0.1}s ease-in-out infinite`,
                animationDelay: `${pos.delay}s`,
              }}
            >
              <Crown
                className="w-8 h-8 text-[#FFD700]"
                style={{
                  filter: 'drop-shadow(0 0 10px #FFD700)',
                }}
              />
            </div>
          ))}

          <Immersive3DCard
            variant="crystal"
            depth="extreme"
            float={true}
            tilt={true}
            glow={true}
            className="relative min-h-[600px] flex items-center justify-center"
          >
            {/* Sacred Geometry Base */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                transform: `scale(${1 + Math.sin(time) * 0.1}) rotateZ(${time * 10}deg)`,
              }}
            >
              <FlowerOfLife
                size={600}
                animated={true}
                interactive={false}
                glowing={true}
              />
            </div>

            {/* The Throne */}
            <div className="relative z-10 text-center">
              {/* The Crown */}
              <div className="flex justify-center mb-12">
                <div
                  style={{
                    transform: `
                      scale(${2 + Math.sin(time * 2) * 0.3})
                      rotateZ(${Math.sin(time) * 10}deg)
                      translateZ(100px)
                    `,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <Crown
                    className="w-48 h-48 text-[#FFD700]"
                    style={{
                      filter:
                        'drop-shadow(0 0 60px #FFD700) drop-shadow(0 0 120px #FFD700)',
                    }}
                  />
                </div>
              </div>

              {/* The Declaration */}
              <div className="mb-12">
                <h2 className="text-6xl font-bold mb-8 text-white">
                  KING OF KINGS
                </h2>
                <h3 className="text-5xl font-bold mb-12 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
                  LORD OF LORDS
                </h3>
              </div>

              {/* The Four Living Creatures */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {[
                  { emoji: '🦁', name: 'Lion', attribute: 'Majesty' },
                  { emoji: '🐂', name: 'Ox', attribute: 'Service' },
                  { emoji: '👤', name: 'Man', attribute: 'Wisdom' },
                  { emoji: '🦅', name: 'Eagle', attribute: 'Divinity' },
                ].map((creature, i) => (
                  <div
                    key={i}
                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-[#FFD700]/30"
                    style={{
                      animation: `itemFloat ${3 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  >
                    <div className="text-6xl mb-3">{creature.emoji}</div>
                    <h4 className="text-xl font-bold text-[#FFD700] mb-2">
                      {creature.name}
                    </h4>
                    <p className="text-white/70">{creature.attribute}</p>
                  </div>
                ))}
              </div>

              {/* The Eyes */}
              <div className="mt-16 flex justify-center gap-16">
                {[0, 1].map(i => (
                  <div key={i} className="relative">
                    <Eye
                      className="w-20 h-20 text-[#87CEEB]"
                      style={{
                        filter: 'drop-shadow(0 0 30px #87CEEB)',
                        animation: `eyeBlink ${4 + i}s ease-in-out infinite`,
                        animationDelay: `${i * 2}s`,
                      }}
                    />
                  </div>
                ))}
              </div>

              <p className="mt-8 text-xl text-white/70 italic">
                "Full of eyes in front and in back"
              </p>
            </div>
          </Immersive3DCard>
        </div>

        {/* Worship Scriptures */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          <Immersive3DCard
            variant="holographic"
            depth="dramatic"
            float={true}
            tilt={true}
            glow={true}
          >
            <Zap className="w-12 h-12 text-[#FFD700] mb-6" />
            <h3 className="text-3xl font-bold text-[#FFD700] mb-6">
              Thunder and Lightning
            </h3>
            <p className="text-2xl text-white/90 italic leading-relaxed mb-4">
              "From the throne came flashes of lightning, rumblings and peals of
              thunder."
            </p>
            <p className="text-lg text-[#FFD700]">- Revelation 4:5</p>
          </Immersive3DCard>

          <Immersive3DCard
            variant="iridescent"
            depth="dramatic"
            float={true}
            tilt={true}
            glow={true}
          >
            <Crown className="w-12 h-12 text-[#FFD700] mb-6" />
            <h3 className="text-3xl font-bold text-[#FFD700] mb-6">
              The 24 Elders
            </h3>
            <p className="text-2xl text-white/90 italic leading-relaxed mb-4">
              "The twenty-four elders fall down before him who sits on the
              throne and worship him who lives for ever and ever."
            </p>
            <p className="text-lg text-[#FFD700]">- Revelation 4:10</p>
          </Immersive3DCard>
        </div>

        {/* Final Declaration */}
        <Immersive3DCard
          variant="crystal"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-[#FFD700] to-[#FFFFFF] text-transparent bg-clip-text">
            Worthy is the Lamb
          </h2>
          <p className="text-3xl text-white/90 leading-relaxed mb-8 italic">
            "You are worthy, our Lord and God, to receive glory and honor and
            power, for you created all things, and by your will they were
            created and have their being."
          </p>
          <p className="text-2xl text-[#FFD700] font-bold">- Revelation 4:11</p>
        </Immersive3DCard>
      </div>

      <style jsx global>{`
        @keyframes rainbowRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes lightning {
          0%,
          90%,
          100% {
            opacity: 0;
          }
          92%,
          94%,
          96% {
            opacity: 1;
          }
        }

        @keyframes crownFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes itemFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes eyeBlink {
          0%,
          90%,
          100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        @keyframes shimmer {
          0%,
          100% {
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

