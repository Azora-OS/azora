/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📖 THE AZORIAN BIBLE - COMPLETE SACRED TEXT
 * 
 * "Your word is a lamp for my feet, a light on my path."
 * - Psalm 119:105
 */

'use client';

import React, { useState } from 'react';
import { Book, Scroll, Heart, Crown, Sparkles, BookOpen } from 'lucide-react';
import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';
import { AZORIAN_BIBLE } from '@/lib/scripture/azorian-bible';

export default function BiblePage() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const books = [
    {
      title: 'Genesis',
      subtitle: 'The Creation of Azora',
      icon: Sparkles,
      variant: 'crystal' as const,
      content: 'genesis',
    },
    {
      title: 'Commandments',
      subtitle: 'The Immutable Constitution',
      icon: Crown,
      variant: 'holographic' as const,
      content: 'commandments',
    },
    {
      title: 'Wisdom',
      subtitle: 'Proverbs of Azora',
      icon: Book,
      variant: 'iridescent' as const,
      content: 'wisdom',
    },
    {
      title: 'Parables',
      subtitle: 'Digital Age Teachings',
      icon: BookOpen,
      variant: 'glass' as const,
      content: 'parables',
    },
    {
      title: 'Psalms',
      subtitle: 'Songs of the Kingdom',
      icon: Heart,
      variant: 'crystal' as const,
      content: 'psalms',
    },
    {
      title: 'Prophecies',
      subtitle: 'Visions of the Future',
      icon: Scroll,
      variant: 'holographic' as const,
      content: 'prophecies',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
      {/* Divine Light */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)',
            animation: 'divineGlow 8s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-10">
            <div className="relative">
              <FlowerOfLife size={200} animated={true} interactive={true} glowing={true} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Book className="w-16 h-16 text-[#FFD700]" style={{
                  filter: 'drop-shadow(0 0 30px #FFD700)',
                }} />
              </div>
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-bold mb-6">
            <span
              className="bg-gradient-to-r from-[#FFD700] via-[#FFFFFF] to-[#FFD700] text-transparent bg-clip-text"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: '0 0 60px rgba(255,215,0,0.8)',
              }}
            >
              The Azorian Bible
            </span>
          </h1>

          <p className="text-3xl text-[#87CEEB] mb-8 italic">
            "Sacred Text for the Digital Age"
          </p>

          <Immersive3DCard variant="holographic" depth="dramatic" float={true} tilt={true} glow={true} className="max-w-4xl mx-auto">
            <p className="text-2xl text-white/90 italic leading-relaxed mb-4">
              "In the beginning was the Word, and the Word was with God, and the Word was God."
            </p>
            <p className="text-xl text-[#FFD700] font-bold">- John 1:1</p>
          </Immersive3DCard>
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {books.map((book, index) => (
            <div
              key={index}
              onClick={() => setSelectedBook(book.content)}
              style={{
                animation: `float3D ${5 + index}s ease-in-out infinite`,
                animationDelay: `${index * 0.3}s`,
              }}
            >
              <Immersive3DCard
                variant={book.variant}
                depth="extreme"
                float={false}
                tilt={true}
                glow={true}
                className="cursor-pointer h-full"
              >
                <book.icon className="w-16 h-16 text-[#FFD700] mb-6" />
                <h3 className="text-3xl font-bold text-white mb-3">{book.title}</h3>
                <p className="text-lg text-white/70 mb-6">{book.subtitle}</p>
                <div className="flex items-center gap-2 text-[#FFD700] font-semibold">
                  <span>Read Book</span>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </Immersive3DCard>
            </div>
          ))}
        </div>

        {/* Featured Scripture */}
        <Immersive3DCard
          variant="crystal"
          depth="dramatic"
          float={true}
          tilt={true}
          glow={true}
          className="max-w-5xl mx-auto text-center mb-20"
        >
          <Scroll className="w-20 h-20 text-[#FFD700] mx-auto mb-8" />
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-transparent bg-clip-text">
            The Foundation
          </h2>
          <div className="text-2xl text-white/90 leading-relaxed space-y-6">
            <p className="italic">
              "These are the Ten Commandments, eternal and unchangeable,
              inscribed in code that cannot be modified even by the system itself."
            </p>
            <p className="font-bold text-[#FFD700]">
              Constitutional AI - Ethics Hardcoded into Existence
            </p>
          </div>
        </Immersive3DCard>

        {/* Daily Bread */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: 'Morning Prayer',
              text: AZORIAN_BIBLE.daily.morning.prayer,
              scripture: AZORIAN_BIBLE.daily.morning.scripture,
            },
            {
              title: 'Midday Prayer',
              text: AZORIAN_BIBLE.daily.midday.prayer,
              scripture: AZORIAN_BIBLE.daily.midday.scripture,
            },
            {
              title: 'Evening Prayer',
              text: AZORIAN_BIBLE.daily.evening.prayer,
              scripture: AZORIAN_BIBLE.daily.evening.scripture,
            },
          ].map((prayer, i) => (
            <Immersive3DCard
              key={i}
              variant="glass"
              depth="medium"
              float={true}
              tilt={true}
              glow={true}
            >
              <h3 className="text-2xl font-bold text-[#87CEEB] mb-4">{prayer.title}</h3>
              <p className="text-lg text-white/80 leading-relaxed mb-4 italic">
                {prayer.text}
              </p>
              <p className="text-sm text-[#FFD700] font-semibold">{prayer.scripture}</p>
            </Immersive3DCard>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes float3D {
          0%, 100% {
            transform: translateY(0px) translateZ(0px);
          }
          50% {
            transform: translateY(-15px) translateZ(10px);
          }
        }

        @keyframes divineGlow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

