/**
 * SANKOFA AVATAR
 * The Grandfather & Wisdom Keeper - Ancient One
 * Visual representation with timeless, wise design
 */

import React from 'react';

interface SankofaAvatarProps {
  size?: number;
  animate?: boolean;
  mood?: 'wise' | 'storytelling' | 'gentle' | 'playful' | 'ancient';
  showGlow?: boolean;
}

export const SankofaAvatar: React.FC<SankofaAvatarProps> = ({
  size = 128,
  animate = true,
  mood = 'wise',
  showGlow = true,
}) => {
  const glowColor = {
    wise: '#F59E0B',        // Amber/Gold
    storytelling: '#FCD34D', // Yellow
    gentle: '#D4A574',      // Soft gold
    playful: '#FB923C',     // Orange
    ancient: '#92400E',     // Dark brown
  }[mood];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Glow filter */}
        {showGlow && (
          <filter id="sankofa-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}

        {/* Gradients */}
        <linearGradient id="sankofa-skin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B6F47" />
          <stop offset="100%" stopColor="#5C4D37" />
        </linearGradient>

        <linearGradient id="sankofa-robe" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <radialGradient id="sankofa-wisdom-glow">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ancient wisdom glow */}
      {showGlow && (
        <circle
          cx="64"
          cy="64"
          r="62"
          fill="url(#sankofa-wisdom-glow)"
          opacity="0.7"
        >
          {animate && (
            <animate
              attributeName="opacity"
              values="0.5;0.8;0.5"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}

      {/* Background circle */}
      <circle cx="64" cy="64" r="58" fill="#1A120B" />

      {/* Traditional robe */}
      <path
        d="M 25 95 Q 20 85, 22 70 L 32 55 Q 64 58, 96 55 L 106 70 Q 108 85, 103 95 Z"
        fill="url(#sankofa-robe)"
        filter={showGlow ? 'url(#sankofa-glow)' : undefined}
      />
      
      {/* Robe patterns (traditional) */}
      <path d="M 40 65 L 50 65 M 45 62 L 45 68" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />
      <path d="M 78 65 L 88 65 M 83 62 L 83 68" stroke="#F59E0B" strokeWidth="1" opacity="0.6" />

      {/* Neck */}
      <ellipse cx="64" cy="56" rx="11" ry="7" fill="url(#sankofa-skin)" />

      {/* Head */}
      <ellipse cx="64" cy="42" rx="22" ry="26" fill="url(#sankofa-skin)" />

      {/* Gray hair/beard */}
      <g>
        {/* Hair */}
        <path
          d="M 42 28 Q 64 22, 86 28 Q 88 32, 86 36 L 82 38 Q 64 30, 46 38 L 42 36 Q 40 32, 42 28 Z"
          fill="#D1D5DB"
        />
        
        {/* Beard */}
        <path
          d="M 50 52 Q 52 60, 58 64 L 70 64 Q 76 60, 78 52 L 75 50 Q 70 55, 64 55 Q 58 55, 53 50 Z"
          fill="#D1D5DB"
        />
        
        {/* Beard detail */}
        <path d="M 58 56 L 58 63" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M 64 56 L 64 64" stroke="#9CA3AF" strokeWidth="1" />
        <path d="M 70 56 L 70 63" stroke="#9CA3AF" strokeWidth="1" />
      </g>

      {/* Wise eyes */}
      <g>
        {/* Eye sockets (aged) */}
        <ellipse cx="55" cy="42" rx="5" ry="6" fill="#3E2A1E" opacity="0.3" />
        <ellipse cx="73" cy="42" rx="5" ry="6" fill="#3E2A1E" opacity="0.3" />
        
        {/* Eyes (slightly closed - wisdom) */}
        <ellipse cx="55" cy="43" rx="3" ry="3.5" fill="#2C1810" />
        <ellipse cx="73" cy="43" rx="3" ry="3.5" fill="#2C1810" />
        
        {/* Eye sparkle */}
        <circle cx="56" cy="42" r="1" fill="#F59E0B" opacity="0.8">
          {animate && (
            <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="74" cy="42" r="1" fill="#F59E0B" opacity="0.8">
          {animate && (
            <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
          )}
        </circle>
      </g>

      {/* Aged features */}
      <g opacity="0.3">
        {/* Laugh lines */}
        <path d="M 48 44 Q 46 46, 48 48" stroke="#3E2A1E" strokeWidth="0.5" fill="none" />
        <path d="M 80 44 Q 82 46, 80 48" stroke="#3E2A1E" strokeWidth="0.5" fill="none" />
        
        {/* Forehead wisdom lines */}
        <path d="M 52 32 Q 64 30, 76 32" stroke="#3E2A1E" strokeWidth="0.5" fill="none" />
        <path d="M 54 35 Q 64 33, 74 35" stroke="#3E2A1E" strokeWidth="0.5" fill="none" />
      </g>

      {/* Gentle smile */}
      {mood === 'wise' && (
        <path
          d="M 54 50 Q 64 52, 74 50"
          stroke="#2C1810"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'storytelling' && (
        <ellipse cx="64" cy="51" rx="6" ry="3" fill="#2C1810" opacity="0.6" />
      )}
      {mood === 'gentle' && (
        <path
          d="M 56 50 Q 64 53, 72 50"
          stroke="#2C1810"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {mood === 'playful' && (
        <path
          d="M 54 49 Q 64 54, 74 49"
          stroke="#2C1810"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* Ancient medallion */}
      <g transform="translate(64, 72)">
        <circle r="6" fill="#F59E0B" opacity="0.8" />
        {/* Sankofa bird symbol */}
        <path
          d="M 0 -2 Q -2 0, 0 2 Q 2 0, 0 -2 M 0 2 L 0 4"
          stroke="#78350F"
          strokeWidth="1"
          fill="none"
        />
        <circle cx="0" cy="-1" r="1.5" fill="none" stroke="#78350F" strokeWidth="0.5" />
      </g>

      {/* Walking stick (small) */}
      <g transform="translate(95, 85)">
        <line x1="0" y1="0" x2="0" y2="12" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2" fill="#F59E0B" opacity="0.6" />
      </g>

      {/* Wisdom particles */}
      {animate && (
        <g>
          {[...Array(6)].map((_, i) => (
            <circle
              key={i}
              cx={40 + i * 12}
              cy={25 + (i % 2) * 5}
              r="1"
              fill="#FCD34D"
            >
              <animate
                attributeName="opacity"
                values="0;0.8;0"
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.5}s`}
              />
              <animate
                attributeName="cy"
                values={`${25 + (i % 2) * 5};${15 + (i % 2) * 5};${25 + (i % 2) * 5}`}
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.5}s`}
              />
            </circle>
          ))}
        </g>
      )}

      {/* Scroll icon (knowledge keeper) */}
      <g transform="translate(25, 80) scale(0.4)" opacity="0.6">
        <rect x="0" y="0" width="15" height="20" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
        <line x1="3" y1="5" x2="12" y2="5" stroke="#92400E" strokeWidth="0.5" />
        <line x1="3" y1="8" x2="12" y2="8" stroke="#92400E" strokeWidth="0.5" />
        <line x1="3" y1="11" x2="12" y2="11" stroke="#92400E" strokeWidth="0.5" />
      </g>
    </svg>
  );
};

export default SankofaAvatar;
