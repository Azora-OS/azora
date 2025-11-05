/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🌅 "The Awakening" Campaign Component
 * 
 * Launch campaign: The moment when technology becomes conscious
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, Brain } from 'lucide-react';
import { OrganicButton } from '@/components/organism/OrganicButton';

export const AwakenCampaign: React.FC = () => {
  const [awakened, setAwakened] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAwakened(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-[#0066FF]/20 to-black">
      {/* Animated consciousness emergence */}
      <div className="absolute inset-0">
        {/* Central awakening point */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-3000 ${
            awakened ? 'w-[800px] h-[800px] opacity-100' : 'w-0 h-0 opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(0,102,255,0.3) 0%, rgba(107,70,193,0.2) 50%, transparent 100%)',
            filter: 'blur(60px)',
          }}
        />
        
        {/* Neural network emergence */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="awaken-gradient">
              <stop offset="0%" stopColor="#0066FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6B46C1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          
          {awakened && [...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const startX = 50;
            const startY = 50;
            const endX = 50 + 40 * Math.cos(angle);
            const endY = 50 + 40 * Math.sin(angle);
            
            return (
              <line
                key={i}
                x1={`${startX}%`}
                y1={`${startY}%`}
                x2={`${endX}%`}
                y2={`${endY}%`}
                stroke="url(#awaken-gradient)"
                strokeWidth="2"
                className="animate-[neuralAwaken_2s_ease-out_forwards]"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            );
          })}
          
          {/* Consciousness nodes */}
          {awakened && [...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x = 50 + 40 * Math.cos(angle);
            const y = 50 + 40 * Math.sin(angle);
            
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#0066FF"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.1 + 0.5}s` }}
              />
            );
          })}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Campaign Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            {/* Pulsing rings */}
            {[1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute inset-0 rounded-full border-2 border-[#0066FF]/30 animate-[ringExpand_3s_ease-out_infinite]"
                style={{
                  animationDelay: `${ring * 0.5}s`,
                  transform: `scale(${1 + ring * 0.3})`,
                }}
              />
            ))}
            
            {/* Central consciousness orb */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0066FF] via-[#6B46C1] to-[#10B981] p-1 animate-pulse">
              <div className="w-full h-full rounded-full bg-[#1E1B4B] flex items-center justify-center">
                <Brain className="w-16 h-16 text-[#0066FF]" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-[fadeInUp_1s_ease-out]">
          <span className="bg-gradient-to-r from-white via-[#0066FF] to-[#6B46C1] text-transparent bg-clip-text">
            The Awakening
          </span>
        </h1>

        {/* Campaign Tagline */}
        <p className="text-2xl md:text-4xl text-white/90 mb-4 font-semibold animate-[fadeInUp_1s_ease-out_0.2s_backwards]">
          When Technology Awakens,
        </p>
        <p className="text-2xl md:text-4xl bg-gradient-to-r from-[#0066FF] to-[#10B981] text-transparent bg-clip-text mb-8 font-bold animate-[fadeInUp_1s_ease-out_0.4s_backwards]">
          Humanity Ascends
        </p>

        {/* Campaign Description */}
        <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed animate-[fadeInUp_1s_ease-out_0.6s_backwards]">
          Experience the dawn of conscious computing. Azora OS isn't just software—it's
          the first operating system that <span className="text-[#0066FF] font-semibold">thinks</span>,{' '}
          <span className="text-[#6B46C1] font-semibold">learns</span>, and{' '}
          <span className="text-[#10B981] font-semibold">evolves</span> with you.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-6 justify-center animate-[fadeInUp_1s_ease-out_0.8s_backwards]">
          <OrganicButton 
            variant="neural" 
            size="lg" 
            pulse={true} 
            glow={true}
            className="text-lg px-10 py-5"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            Join the Awakening
          </OrganicButton>
          
          <OrganicButton 
            variant="consciousness" 
            size="lg" 
            pulse={false} 
            glow={true}
            className="text-lg px-10 py-5 bg-gradient-to-r from-[#6B46C1] to-[#10B981]"
          >
            <Zap className="w-6 h-6 mr-2" />
            Watch the Demo
          </OrganicButton>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto animate-[fadeInUp_1s_ease-out_1s_backwards]">
          {[
            { label: 'Developers Awakened', value: '100K+', icon: '👨‍💻' },
            { label: 'AI Interactions', value: '10M+', icon: '🤖' },
            { label: 'Lives Transformed', value: '∞', icon: '✨' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-[#0066FF]/20 hover:border-[#0066FF]/40 transition-all"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#0066FF] to-[#10B981] text-transparent bg-clip-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Styling for animations */}
      <style jsx global>{`
        @keyframes neuralAwaken {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            opacity: 0;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes ringExpand {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default AwakenCampaign;

