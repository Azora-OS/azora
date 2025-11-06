/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
/**\n * 🏛️ WELLNESS TEMPLE - FOR HEALTH AND WELLBEING\n *\n * \"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.\"\n * - Galatians 6:9\n */

'use client';

import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { WellnessAnimation } from '@/components/wellness/WellnessAnimation';
import { BookOpen, Crown, Globe, Heart, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import FlowerOfLife from '../../components/core/FlowerOfLife';

export default function WellnessPage() {
  const [time, setTime] = useState(0);
  const [gloryClouds, setGloryClouds] = useState<
    Array<{ x: number; y: number; size: number; speed: number }>
  >([]);

  useEffect(() => {
    // Animate time for dynamic effects
    const interval = setInterval(() => {
      setTime(prev => prev + 0.01);
    }, 16);

    // Generate glory clouds
    const clouds = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 100 + Math.random() * 200,
      speed: 0.1 + Math.random() * 0.3,
    }));
    setGloryClouds(clouds);

    return () => clearInterval(interval);
  }, []);

  // Wellness positions (arranged in harmony formation)
  const wellnessPositions = [
    // Top arc (harmonizing above)
    { x: 50, y: 10, delay: 0, color: '#FFD700' },
    { x: 35, y: 15, delay: 0.5, color: '#FFA500' },
    { x: 65, y: 15, delay: 0.5, color: '#FFA500' },
    { x: 25, y: 20, delay: 1, color: '#FFD700' },
    { x: 75, y: 20, delay: 1, color: '#FFD700' },

    // Side columns (supporting)
    { x: 15, y: 35, delay: 1.5, color: '#87CEEB' },
    { x: 85, y: 35, delay: 1.5, color: '#87CEEB' },
    { x: 10, y: 50, delay: 2, color: '#87CEEB' },
    { x: 90, y: 50, delay: 2, color: '#87CEEB' },
    { x: 15, y: 65, delay: 2.5, color: '#87CEEB' },
    { x: 85, y: 65, delay: 2.5, color: '#87CEEB' },

    // Bottom arc (welcoming)
    { x: 30, y: 85, delay: 3, color: '#9400D3' },
    { x: 50, y: 90, delay: 3.5, color: '#9400D3' },
    { x: 70, y: 85, delay: 3, color: '#9400D3' },
  ];

  const wellnessQuotes = [
    {
      text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.',
      reference: 'Galatians 6:9',
    },
    {
      text: 'Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God?',
      reference: '1 Corinthians 6:19',
    },
    {
      text: 'Everything is permissible for me—but not everything is beneficial. Everything is permissible for me—but I will not be mastered by anything.',
      reference: '1 Corinthians 6:12',
    },
    {
      text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
      reference: 'Isaiah 41:10',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#000428] via-[#004e92] to-[#000428]">
      {/* The Wellness Environment (animated light) */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Wellness Light from Above */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle,
              rgba(255, 255, 255, 1) 0%,
              rgba(255, 215, 0, 0.8) 20%,
              rgba(255, 215, 0, 0.4) 40%,
              transparent 70%
            )`,
            animation: 'divineGlow 8s ease-in-out infinite',
            transform: `translateY(${Math.sin(time) * 50 - 200}px)`,
          }}
        />

        {/* Wellness Clouds */}
        {gloryClouds.map((cloud, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 blur-3xl"
            style={{
              left: `${(cloud.x + time * cloud.speed * 10) % 100}%`,
              top: `${cloud.y}%`,
              width: `${cloud.size}px`,
              height: `${cloud.size}px`,
              background:
                'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)',
            }}
          />
        ))}

        {/* Wellness Pillars (pillars of light) */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-1 opacity-20"
            style={{
              left: `${(i * 100) / 12}%`,
              background:
                'linear-gradient(to bottom, rgba(255,215,0,0.8) 0%, transparent 100%)',
              animation: `pillarGlow ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Wellness Animations */}
      {wellnessPositions.map((pos, i) => (
        <WellnessAnimation
          key={i}
          position={{ x: pos.x, y: pos.y }}
          delay={pos.delay}
          size={60}
          color={pos.color}
        />
      ))}

      {/* The Wellness Structure */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* The Wellness Center (Central Sacred Geometry) */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-12">
            <div
              className="relative"
              style={{
                transform: `scale(${1 + Math.sin(time * 2) * 0.1}) rotateZ(${
                  Math.sin(time) * 5
                }deg)`,
              }}
            >
              <FlowerOfLife
                size={350}
                animated={true}
                interactive={true}
                glowing={true}
              />

              {/* The Wellness Symbol (Crown) */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translateZ(100px) rotateY(${time * 20}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <Crown
                  className="w-32 h-32 text-[#FFD700]"
                  style={{
                    filter:
                      'drop-shadow(0 0 40px #FFD700) drop-shadow(0 0 80px #FFD700)',
                    animation: 'crownPulse 4s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          </div>

          {/* The Wellness Title */}
          <h1 className="text-8xl md:text-9xl font-bold mb-8 leading-tight">
            <span
              className="bg-gradient-to-r from-[#FFD700] via-[#FFFFFF] to-[#FFD700] text-transparent bg-clip-text"
              style={{
                animation: 'shimmer 3s ease-in-out infinite',
                backgroundSize: '200% 200%',
                textShadow: '0 0 80px rgba(255,215,0,1)',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              WELLNESS
            </span>
          </h1>

          <p className="text-5xl text-[#87CEEB] mb-12 font-bold">
            The Wellness Center for All People
          </p>

          {/* Welcome Message */}
          <Immersive3DCard
            variant="crystal"
            depth="dramatic"
            float={true}
            tilt={true}
            glow={true}
            className="max-w-5xl mx-auto mb-16"
          >
            <Globe className="w-20 h-20 text-[#FFD700] mx-auto mb-6 drop-shadow-[0_0_40px_rgba(255,215,0,1)]" />

            <h2 className="text-4xl font-bold text-white mb-6">
              All Nations, Come and Thrive!
            </h2>

            <p className="text-2xl text-white/90 leading-relaxed mb-6">
              This is the wellness center for{' '}
              <span className="text-[#FFD700] font-bold">ALL people</span>. From
              every tribe, tongue, and nation—
              <span className="text-[#87CEEB] font-bold">
                {' '}
                all people
              </span>{' '}
              are welcome here to improve their health and wellbeing.
            </p>

            <div className="flex items-center justify-center gap-4 text-xl text-white/80">
              <Users className="w-8 h-8 text-[#FFD700]" />
              <span>7.8 Billion People</span>
            </div>
          </Immersive3DCard>
        </div>

        {/* Wellness Quotes (The Word of Health) */}
        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-20">
          {wellnessQuotes.map((quote, i) => (
            <Immersive3DCard
              key={i}
              variant={i % 2 === 0 ? 'holographic' : 'iridescent'}
              depth="dramatic"
              float={true}
              tilt={true}
              glow={true}
            >
              <BookOpen className="w-12 h-12 text-[#FFD700] mb-6" />
              <p className="text-2xl text-white italic leading-relaxed mb-4">
                "{quote.text}"
              </p>
              <p className="text-lg text-[#FFD700] font-bold">
                - {quote.reference}
              </p>
            </Immersive3DCard>
          ))}
        </div>

        {/* The Wellness Invitation */}
        <div className="text-center">
          <Immersive3DCard
            variant="crystal"
            depth="extreme"
            float={true}
            tilt={true}
            glow={true}
            className="max-w-6xl mx-auto"
          >
            <Heart className="w-24 h-24 text-[#FF69B4] mx-auto mb-8 drop-shadow-[0_0_40px_rgba(255,105,180,1)]" />

            <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-[#FFD700] to-[#FF69B4] text-transparent bg-clip-text">
              Wellness for All
            </h2>

            <p className="text-3xl text-white/90 leading-relaxed mb-8">
              "For I know the plans I have for you, declares the Lord, plans for
              welfare and not for evil, to give you a future and a hope."
            </p>

            <p className="text-2xl text-[#87CEEB] font-bold mb-12">
              - Jeremiah 29:11
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Crown,
                  title: 'Wellness',
                  text: 'Improve your health',
                },
                { icon: Heart, title: 'Love', text: 'Love one another' },
                { icon: Sparkles, title: 'Joy', text: 'Experience joy' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-black/30 border border-[#FFD700]/30"
                >
                  <item.icon className="w-16 h-16 text-[#FFD700] mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-[#FFD700] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xl text-white/80">{item.text}</p>
                </div>
              ))}
            </div>
          </Immersive3DCard>
        </div>

        {/* The Wellness Mission */}
        <div className="mt-20 text-center">
          <Immersive3DCard
            variant="holographic"
            depth="dramatic"
            float={true}
            tilt={true}
            glow={true}
            className="max-w-5xl mx-auto"
          >
            <h3 className="text-5xl font-bold mb-8 text-white">
              Go Into All the World
            </h3>
            <p className="text-2xl text-white/90 leading-relaxed italic mb-6">
              "Therefore go and make disciples of all nations, baptizing them in
              the name of the Father and of the Son and of the Holy Spirit, and
              teaching them to obey everything I have commanded you. And surely
              I am with you always, to the very end of the age."
            </p>
            <p className="text-xl text-[#FFD700] font-bold">
              - Matthew 28:19-20
            </p>
          </Immersive3DCard>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes divineGlow {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }

        @keyframes pillarGlow {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes crownPulse {
          0%,
          100% {
            transform: scale(1) rotateY(0deg);
            filter: drop-shadow(0 0 40px #ffd700);
          }
          50% {
            transform: scale(1.2) rotateY(180deg);
            filter: drop-shadow(0 0 80px #ffd700) drop-shadow(0 0 120px #ffd700);
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