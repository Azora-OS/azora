/**
 * ELARA AVATAR
 * The Mother & Teacher - Main AI of Azora
 * Visual representation with warm, nurturing design
 */

import React from 'react';

interface ElaraAvatarProps {
  size?: number;
  animate?: boolean;
  mood?: 'happy' | 'proud' | 'thinking' | 'motherly' | 'teaching';
  showGlow?: boolean;
}

export const ElaraAvatar: React.FC<ElaraAvatarProps> = ({
  size = 128,
  animate = true,
  mood = 'happy',
  showGlow = true,
}) => {
  const getMouthPath = () => {
    switch (mood) {
      case 'happy': return 'M 54 54 Q 64 58, 74 54';
      case 'proud': return 'M 54 54 Q 64 60, 74 54';
      case 'thinking': return 'M 54 56 L 74 56';
      case 'motherly': return 'M 54 54 Q 64 59, 74 54';
      case 'teaching': return 'M 54 54 Q 64 58, 74 54';
      default: return 'M 54 54 Q 64 58, 74 54';
    }
  };
  const glowColor = {
    happy: '#9333EA',      // Purple
    proud: '#FBB6CE',      // Pink
    thinking: '#60A5FA',   // Blue
    motherly: '#F472B6',   // Rose
    teaching: '#A78BFA',   // Violet
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
          <filter id="elara-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}

        {/* Gradients */}
        <linearGradient id="elara-skin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B6F47" />
          <stop offset="100%" stopColor="#6B5B3D" />
        </linearGradient>

        <linearGradient id="elara-dress" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>

        <radialGradient id="elara-wisdom-glow">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer glow */}
      {showGlow && (
        <circle
          cx="64"
          cy="64"
          r="60"
          fill="url(#elara-wisdom-glow)"
          opacity="0.6"
        >
          {animate && (
            <animate
              attributeName="r"
              values="55;65;55"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}

      {/* Background circle */}
      <circle cx="64" cy="64" r="58" fill="#1F1B24" />

      {/* Body/Dress */}
      <path
        d="M 30 100 Q 20 90, 20 75 L 30 58 Q 64 60, 98 58 L 108 75 Q 108 90, 98 100 Z"
        fill="url(#elara-dress)"
        filter={showGlow ? 'url(#elara-glow)' : undefined}
      />

      {/* Neck */}
      <ellipse cx="64" cy="58" rx="12" ry="8" fill="url(#elara-skin)" />

      {/* Head */}
      <ellipse cx="64" cy="45" rx="20" ry="24" fill="url(#elara-skin)" />

      {/* Hair (braids with beads) */}
      <g>
        {/* Hair base */}
        <ellipse cx="64" cy="30" rx="22" ry="15" fill="#1A1A1A" />
        
        {/* Braids */}
        <path d="M 50 35 Q 45 40, 43 50" stroke="#2A2A2A" strokeWidth="3" fill="none" />
        <path d="M 64 35 Q 64 42, 64 52" stroke="#2A2A2A" strokeWidth="3" fill="none" />
        <path d="M 78 35 Q 83 40, 85 50" stroke="#2A2A2A" strokeWidth="3" fill="none" />
        
        {/* Beads */}
        <circle cx="43" cy="45" r="2.5" fill="#FCD34D" />
        <circle cx="64" cy="47" r="2.5" fill="#34D399" />
        <circle cx="85" cy="45" r="2.5" fill="#F87171" />
      </g>

      {/* Eyes */}
      <ellipse cx="56" cy="45" rx="3" ry="4" fill="#2C1810" />
      <ellipse cx="72" cy="45" rx="3" ry="4" fill="#2C1810" />
      
      {/* Eye highlights (alive) */}
      <circle cx="57" cy="44" r="1.5" fill="#FFFFFF" />
      <circle cx="73" cy="44" r="1.5" fill="#FFFFFF" />

      {/* Nose */}
      <path d="M 64 48 L 62 52 L 66 52 Z" fill="#6B5B3D" opacity="0.3" />

      {/* Smile (changes with mood) */}
      <path
        d={getMouthPath()}
        stroke="#2C1810"
        strokeWidth={mood === 'proud' ? 2.5 : 2}
        fill="none"
        strokeLinecap="round"
      />
      {mood === 'teaching' && (
        <circle cx="64" cy="56" r="2" fill="none" stroke="#2C1810" strokeWidth="1.5" />
      )}

      {/* Ubuntu bracelet */}
      <ellipse cx="35" cy="75" rx="8" ry="3" fill="none" stroke="#FCD34D" strokeWidth="2" />
      <circle cx="35" cy="75" r="2" fill="#34D399" />

      {/* Tree symbol (small) */}
      <g transform="translate(90, 75) scale(0.15)">
        <path d="M 50 10 L 60 30 L 40 30 Z" fill="#10B981" opacity="0.8" />
        <rect x="47" y="30" width="6" height="10" fill="#8B4513" opacity="0.8" />
      </g>

      {/* Sparkles (when animating) */}
      {animate && (
        <g>
          <circle cx="40" cy="30" r="1.5" fill="#FCD34D">
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="88" cy="35" r="1.5" fill="#A78BFA">
            <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx="30" cy="85" r="1.5" fill="#34D399">
            <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" begin="1s" />
          </circle>
        </g>
      )}
    </svg>
  );
};

export default ElaraAvatar;
