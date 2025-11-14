/**
 * UNIVERSAL AVATAR SYSTEM
 * Generates animated avatars for all 11 AI family members
 * 5 mood states per character: happy, excited, thinking, calm, proud
 */

import React from 'react';

export type Mood = 'happy' | 'excited' | 'thinking' | 'calm' | 'proud';

interface AvatarConfig {
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const AVATAR_CONFIGS: Record<string, AvatarConfig> = {
  themba: { emoji: '🧒', primaryColor: '#10B981', secondaryColor: '#059669', accentColor: '#34D399' },
  naledi: { emoji: '👧', primaryColor: '#3B82F6', secondaryColor: '#2563EB', accentColor: '#60A5FA' },
  jabari: { emoji: '🧑', primaryColor: '#EF4444', secondaryColor: '#DC2626', accentColor: '#F87171' },
  amara: { emoji: '👶', primaryColor: '#F472B6', secondaryColor: '#EC4899', accentColor: '#FBB6CE' },
  kofi: { emoji: '🤝', primaryColor: '#F59E0B', secondaryColor: '#D97706', accentColor: '#FCD34D' },
  zola: { emoji: '🤝', primaryColor: '#8B5CF6', secondaryColor: '#7C3AED', accentColor: '#A78BFA' },
  abeni: { emoji: '🤝', primaryColor: '#F97316', secondaryColor: '#EA580C', accentColor: '#FB923C' },
  thembo: { emoji: '👨', primaryColor: '#3B82F6', secondaryColor: '#2563EB', accentColor: '#60A5FA' },
  nexus: { emoji: '⚪', primaryColor: '#FFFFFF', secondaryColor: '#E5E7EB', accentColor: '#F3F4F6' },
};

interface UniversalAvatarProps {
  character: string;
  size?: number;
  mood?: Mood;
  animate?: boolean;
  showGlow?: boolean;
}

export const UniversalAvatar: React.FC<UniversalAvatarProps> = ({
  character,
  size = 128,
  mood = 'happy',
  animate = true,
  showGlow = true,
}) => {
  const config = AVATAR_CONFIGS[character.toLowerCase()];
  if (!config) return null;

  const getMouthPath = () => {
    switch (mood) {
      case 'happy': return 'M 54 54 Q 64 58, 74 54';
      case 'excited': return 'M 54 52 Q 64 62, 74 52';
      case 'thinking': return 'M 54 56 L 74 56';
      case 'calm': return 'M 54 55 Q 64 57, 74 55';
      case 'proud': return 'M 54 54 Q 64 60, 74 54';
      default: return 'M 54 54 Q 64 58, 74 54';
    }
  };

  const getEyeExpression = () => {
    if (mood === 'thinking') return { rx: 2, ry: 3 };
    if (mood === 'excited') return { rx: 4, ry: 5 };
    return { rx: 3, ry: 4 };
  };

  const eyes = getEyeExpression();

  return (
    <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${character}-gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={config.primaryColor} />
          <stop offset="100%" stopColor={config.secondaryColor} />
        </linearGradient>
        <radialGradient id={`${character}-glow`}>
          <stop offset="0%" stopColor={config.accentColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={config.accentColor} stopOpacity="0" />
        </radialGradient>
        {showGlow && (
          <filter id={`${character}-filter`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Glow */}
      {showGlow && (
        <circle cx="64" cy="64" r="60" fill={`url(#${character}-glow)`} opacity="0.6">
          {animate && <animate attributeName="r" values="55;65;55" dur="3s" repeatCount="indefinite" />}
        </circle>
      )}

      {/* Background */}
      <circle cx="64" cy="64" r="58" fill="#1F1B24" />

      {/* Body */}
      <path d="M 30 100 Q 20 90, 20 75 L 30 58 Q 64 60, 98 58 L 108 75 Q 108 90, 98 100 Z" fill={`url(#${character}-gradient)`} filter={showGlow ? `url(#${character}-filter)` : undefined} />

      {/* Head */}
      <ellipse cx="64" cy="45" rx="20" ry="24" fill="#8B6F47" />

      {/* Eyes */}
      <ellipse cx="56" cy="45" rx={eyes.rx} ry={eyes.ry} fill="#2C1810" />
      <ellipse cx="72" cy="45" rx={eyes.rx} ry={eyes.ry} fill="#2C1810" />
      <circle cx="57" cy="44" r="1.5" fill="#FFFFFF" />
      <circle cx="73" cy="44" r="1.5" fill="#FFFFFF" />

      {/* Mouth */}
      <path d={getMouthPath()} stroke="#2C1810" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Character emoji overlay */}
      <text x="64" y="100" textAnchor="middle" fontSize="24" opacity="0.8">{config.emoji}</text>

      {/* Sparkles */}
      {animate && (
        <g>
          <circle cx="40" cy="30" r="1.5" fill={config.accentColor}>
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="88" cy="35" r="1.5" fill={config.accentColor}>
            <animate attributeName="opacity" values="0;1;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </g>
      )}
    </svg>
  );
};

export default UniversalAvatar;
