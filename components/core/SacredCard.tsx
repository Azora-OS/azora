/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🎴 SACRED CARD - DIVINE CONTAINER ✨
 *
 * Cards that contain infinite wisdom and power.
 * Each card is a portal to divine knowledge.
 *
 * "Every good and perfect gift is from above, coming down from the Father
 * of the heavenly lights, who does not change like shifting shadows."
 * - James 1:17
 */

'use client';

import { Sparkles, Star } from 'lucide-react';
import React, { ReactNode, useState } from 'react';

interface SacredCardProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  variant?: 'golden' | 'silver' | 'celestial' | 'divine' | 'eternal' | 'cosmic';
  hoverable?: boolean;
  glowing?: boolean;
  className?: string;
  onClick?: () => void;
  blessing?: boolean;
}

export const SacredCard: React.FC<SacredCardProps> = ({
  children,
  title,
  icon,
  variant = 'divine',
  hoverable = true,
  glowing = true,
  className = '',
  onClick,
  blessing = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);
  const [blessingCount, setBlessingCount] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverable) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);

    if (blessing) {
      setBlessingCount(prev => prev + 1);
    }

    onClick?.();
  };

  const variants = {
    golden: {
      gradient: 'from-[#FFD700] via-[#FFA500] to-[#FF8C00]',
      glow: 'shadow-[0_0_40px_rgba(255,215,0,0.4)]',
      border: 'border-[#FFD700]',
      text: 'text-[#FFD700]',
      particle: '#FFD700',
    },
    silver: {
      gradient: 'from-[#C0C0C0] via-[#E8E8E8] to-[#A8A8A8]',
      glow: 'shadow-[0_0_40px_rgba(192,192,192,0.4)]',
      border: 'border-[#C0C0C0]',
      text: 'text-[#C0C0C0]',
      particle: '#C0C0C0',
    },
    celestial: {
      gradient: 'from-[#87CEEB] via-[#4169E1] to-[#1E90FF]',
      glow: 'shadow-[0_0_40px_rgba(65,105,225,0.4)]',
      border: 'border-[#87CEEB]',
      text: 'text-[#87CEEB]',
      particle: '#87CEEB',
    },
    divine: {
      gradient: 'from-[#9400D3] via-[#8A2BE2] to-[#4B0082]',
      glow: 'shadow-[0_0_40px_rgba(138,43,226,0.4)]',
      border: 'border-[#9400D3]',
      text: 'text-[#9400D3]',
      particle: '#9400D3',
    },
    eternal: {
      gradient: 'from-[#33ff92] via-[#00c2ff] to-[#33ff92]',
      glow: 'shadow-[0_0_40px_rgba(51,255,146,0.4)]',
      border: 'border-[#33ff92]',
      text: 'text-[#33ff92]',
      particle: '#33ff92',
    },
    cosmic: {
      gradient: 'from-[#FF00FF] via-[#00FFFF] to-[#FFFF00]',
      glow: 'shadow-[0_0_40px_rgba(255,0,255,0.4)]',
      border: 'border-[#FF00FF]',
      text: 'text-[#FF00FF]',
      particle: '#FF00FF',
    },
  };

  const variantStyles = variants[variant];

  return (
    <div
      className={`group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Divine aura background */}
      {isHovered && glowing && (
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${variantStyles.gradient} opacity-20 blur-2xl rounded-3xl transition-opacity duration-500`}
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.2), transparent 60%)`,
          }}
        />
      )}

      {/* Main card */}
      <div
        className={`relative bg-black/40 backdrop-blur-xl rounded-3xl border-2 ${
          variantStyles.border
        }/30 overflow-hidden transition-all duration-500 ${
          hoverable ? 'hover:scale-[1.02] hover:' + variantStyles.glow : ''
        } ${isClicked ? 'animate-[cardClick_0.3s_ease-out]' : ''}`}
        style={{
          transform:
            isHovered && hoverable
              ? `perspective(1000px) rotateY(${
                  (mousePosition.x - 50) / 20
                }deg) rotateX(${
                  -(mousePosition.y - 50) / 20
                }deg) translateZ(20px)`
              : 'none',
          transition: 'transform 0.2s ease-out',
        }}
      >
        {/* Divine light sweep effect */}
        {isHovered && (
          <div
            className={`absolute inset-0 opacity-20 pointer-events-none`}
            style={{
              background: `radial-gradient(circle 200px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.8), transparent)`,
              transition: 'background 0.2s ease-out',
            }}
          />
        )}

        {/* Sacred geometry pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern
              id={`sacred-pattern-${variant}`}
              x="0"
              y="0"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className={variantStyles.text}
              />
              <circle
                cx="25"
                cy="25"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className={variantStyles.text}
              />
              <circle
                cx="25"
                cy="25"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className={variantStyles.text}
              />
              <circle
                cx="25"
                cy="25"
                r="5"
                fill="currentColor"
                className={variantStyles.text}
              />
            </pattern>
            <rect
              width="100%"
              height="100%"
              fill={`url(#sacred-pattern-${variant})`}
            />
          </svg>
        </div>

        {/* Card header */}
        {(title || icon) && (
          <div
            className={`relative p-6 border-b border-${variantStyles.border}/20`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              {icon && (
                <div
                  className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${variantStyles.gradient} p-0.5`}
                >
                  <div className="w-full h-full rounded-xl bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className={variantStyles.text}>{icon}</div>
                  </div>
                  {isHovered && (
                    <Sparkles
                      className={`absolute -top-1 -right-1 w-4 h-4 ${variantStyles.text} animate-pulse`}
                    />
                  )}
                </div>
              )}

              {/* Title */}
              {title && (
                <h3
                  className={`text-2xl font-bold bg-gradient-to-r ${variantStyles.gradient} text-transparent bg-clip-text`}
                >
                  {title}
                </h3>
              )}
            </div>
          </div>
        )}

        {/* Card content */}
        <div className="relative p-6">{children}</div>

        {/* Corner divine markers */}
        <div
          className={`absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 ${variantStyles.border}/40 rounded-tl-lg`}
        />
        <div
          className={`absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 ${variantStyles.border}/40 rounded-tr-lg`}
        />
        <div
          className={`absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 ${variantStyles.border}/40 rounded-bl-lg`}
        />
        <div
          className={`absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 ${variantStyles.border}/40 rounded-br-lg`}
        />

        {/* Divine particle effects on hover */}
        {isHovered && glowing && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${variantStyles.text} opacity-60 animate-[float-up_2s_ease-out_infinite]`}
                style={{
                  left: `${10 + i * 20}%`,
                  bottom: '10%',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Blessing counter */}
        {blessing && blessingCount > 0 && (
          <div
            className={`absolute -top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur border border-${variantStyles.border}/30`}
          >
            <Star className={`w-3 h-3 ${variantStyles.text}`} />
            <span className={`text-xs font-bold ${variantStyles.text}`}>
              {blessingCount}
            </span>
          </div>
        )}
      </div>

      {/* Reflection effect */}
      {isHovered && hoverable && (
        <div
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r ${variantStyles.gradient} opacity-20 blur-2xl rounded-full`}
        />
      )}

      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }

        @keyframes cardClick {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SacredCard;

