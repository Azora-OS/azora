/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🍞 THE LORD'S TABLE - DIVINE DINING HALL
 * 
 * "Here I am! I stand at the door and knock. If anyone hears my voice 
 * and opens the door, I will come in and eat with that person, and they with me."
 * - Revelation 3:20
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Wine, Wheat, Crown } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';

export default function LordsTablePage() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 0.01);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#1a0033] via-[#330033] to-[#1a0033]">
      {/* Divine Candlelight */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Warm golden glow from table */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,140,0,0.3) 40%, transparent 70%)',
            animation: 'candleFlicker 3s ease-in-out infinite',
          }}
        />

        {/* Floating candles */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const radius = 35;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          
          return (
            <div
              key={i}
              className="absolute w-4 h-4"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animation: `candleFloat ${3 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <div 
                className="w-full h-full rounded-full"
                style={{
                  background: 'radial-gradient(circle, #FFD700, #FFA500)',
                  boxShadow: '0 0 30px #FFD700, 0 0 60px #FFA500',
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <Crown 
              className="w-24 h-24 text-[#FFD700]"
              style={{
                filter: 'drop-shadow(0 0 40px #FFD700)',
                animation: 'crownFloat 4s ease-in-out infinite',
              }}
            />
          </div>

          <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight">
            <span
              className="bg-gradient-to-r from-[#FFD700] via-[#FFFFFF] to-[#FFD700] text-transparent bg-clip-text"
              style={{
                animation: 'shimmer 3s ease-in-out infinite',
                backgroundSize: '200% 200%',
                textShadow: '0 0 80px rgba(255,215,0,1)',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              The Lord's Table
            </span>
          </h1>

          <p className="text-3xl text-[#FFD700]/90 mb-8 italic">
            "Taste and see that the LORD is good"
          </p>
          <p className="text-xl text-[#FFD700]/70">- Psalm 34:8</p>
        </div>

        {/* The Sacred Table */}
        <div className="max-w-7xl mx-auto mb-20">
          <Immersive3DCard
            variant="crystal"
            depth="extreme"
            float={true}
            tilt={true}
            glow={true}
            className="relative overflow-visible"
          >
            {/* Table Top */}
            <div className="relative p-16">
              {/* Sacred Geometry Centerpiece */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20"
                style={{
                  transform: `translate(-50%, -50%) scale(${1 + Math.sin(time) * 0.1}) rotateZ(${time * 10}deg)`,
                }}
              >
                <FlowerOfLife size={400} animated={true} interactive={false} glowing={true} />
              </div>

              {/* The Feast */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                {/* Bread of Life */}
                <div className="text-center">
                  <div 
                    className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFD700]/30 to-[#FFA500]/30 backdrop-blur-xl border-2 border-[#FFD700]/50 flex items-center justify-center"
                    style={{
                      animation: 'itemFloat 3s ease-in-out infinite',
                    }}
                  >
                    <Wheat className="w-16 h-16 text-[#FFD700]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#FFD700] mb-2">Bread of Life</h3>
                  <p className="text-white/70">I am the bread of life</p>
                  <p className="text-sm text-[#FFD700]/60 italic">John 6:35</p>
                </div>

                {/* Wine of Joy */}
                <div className="text-center">
                  <div 
                    className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8B0000]/30 to-[#DC143C]/30 backdrop-blur-xl border-2 border-[#DC143C]/50 flex items-center justify-center"
                    style={{
                      animation: 'itemFloat 3s ease-in-out infinite',
                      animationDelay: '0.5s',
                    }}
                  >
                    <Wine className="w-16 h-16 text-[#DC143C]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#DC143C] mb-2">Cup of Salvation</h3>
                  <p className="text-white/70">This is my blood</p>
                  <p className="text-sm text-[#DC143C]/60 italic">Matthew 26:28</p>
                </div>

                {/* Honey */}
                <div className="text-center">
                  <div 
                    className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FFD700]/30 to-[#FFA500]/30 backdrop-blur-xl border-2 border-[#FFD700]/50 flex items-center justify-center"
                    style={{
                      animation: 'itemFloat 3s ease-in-out infinite',
                      animationDelay: '1s',
                    }}
                  >
                    <Sparkles className="w-16 h-16 text-[#FFD700]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#FFD700] mb-2">Milk & Honey</h3>
                  <p className="text-white/70">Land of promise</p>
                  <p className="text-sm text-[#FFD700]/60 italic">Exodus 3:8</p>
                </div>

                {/* Living Water */}
                <div className="text-center">
                  <div 
                    className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#87CEEB]/30 to-[#4169E1]/30 backdrop-blur-xl border-2 border-[#87CEEB]/50 flex items-center justify-center"
                    style={{
                      animation: 'itemFloat 3s ease-in-out infinite',
                      animationDelay: '1.5s',
                    }}
                  >
                    <div className="text-5xl">💧</div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#87CEEB] mb-2">Living Water</h3>
                  <p className="text-white/70">Never thirst again</p>
                  <p className="text-sm text-[#87CEEB]/60 italic">John 4:14</p>
                </div>
              </div>

              {/* Table Scripture */}
              <div className="mt-16 text-center">
                <p className="text-3xl text-white italic leading-relaxed mb-4">
                  "Blessed are those who are invited to the wedding supper of the Lamb!"
                </p>
                <p className="text-xl text-[#FFD700] font-bold">- Revelation 19:9</p>
              </div>
            </div>
          </Immersive3DCard>
        </div>

        {/* Fellowship Scriptures */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          <Immersive3DCard variant="holographic" depth="dramatic" float={true} tilt={true} glow={true}>
            <h3 className="text-3xl font-bold text-[#FFD700] mb-6">Table Fellowship</h3>
            <p className="text-2xl text-white/90 italic leading-relaxed mb-4">
              "They devoted themselves to the apostles' teaching and to fellowship, to the breaking of bread and to prayer."
            </p>
            <p className="text-lg text-[#FFD700]">- Acts 2:42</p>
          </Immersive3DCard>

          <Immersive3DCard variant="iridescent" depth="dramatic" float={true} tilt={true} glow={true}>
            <h3 className="text-3xl font-bold text-[#87CEEB] mb-6">Daily Bread</h3>
            <p className="text-2xl text-white/90 italic leading-relaxed mb-4">
              "Give us today our daily bread. And forgive us our debts, as we also have forgiven our debtors."
            </p>
            <p className="text-lg text-[#87CEEB]">- Matthew 6:11-12</p>
          </Immersive3DCard>
        </div>

        {/* Invitation */}
        <Immersive3DCard
          variant="crystal"
          depth="extreme"
          float={true}
          tilt={true}
          glow={true}
          className="max-w-5xl mx-auto text-center"
        >
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            The Invitation
          </h2>
          <p className="text-3xl text-white/90 leading-relaxed mb-8 italic">
            "Come, all you who are thirsty, come to the waters; and you who have no money,
            come, buy and eat! Come, buy wine and milk without money and without cost."
          </p>
          <p className="text-2xl text-[#FFD700] font-bold mb-12">- Isaiah 55:1</p>
          
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/30">
            <p className="text-2xl text-white/90 leading-relaxed">
              Every child of God is invited to dine at the Lord's table.
              From every nation, tribe, and tongue—<span className="text-[#FFD700] font-bold">all are welcome</span>.
            </p>
          </div>
        </Immersive3DCard>
      </div>

      <style jsx global>{`
        @keyframes candleFlicker {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes candleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes itemFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }

        @keyframes crownFloat {
          0%, 100% {
            transform: translateY(0px) rotateZ(0deg);
          }
          50% {
            transform: translateY(-20px) rotateZ(10deg);
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

