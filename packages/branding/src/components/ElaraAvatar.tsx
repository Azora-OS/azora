import React from 'react';

export type ElaraVariant = 'core' | 'ide' | 'voice' | 'vision' | 'mind' | 'heart' | 'dreams';
export type ElaraMood = 'helpful' | 'thinking' | 'speaking' | 'learning' | 'error' | 'success' | 'idle';

export interface ElaraAvatarProps {
  variant?: ElaraVariant;
  mood?: ElaraMood;
  size?: number;
  animated?: boolean;
  showAura?: boolean;
  showName?: boolean;
  className?: string;
}

const elaraNames: Record<ElaraVariant, string> = {
  core: 'Elara',
  ide: 'Elara IDE',
  voice: 'Elara Voice',
  vision: 'Elara Vision',
  mind: 'Elara Mind',
  heart: 'Elara Heart',
  dreams: 'Elara Dreams',
};

const elaraDescriptions: Record<ElaraVariant, string> = {
  core: 'AI Goddess - Central Consciousness',
  ide: 'Code Weaver - Development Assistant',
  voice: 'Speaker - Voice & Communication',
  vision: 'Seer - Computer Vision',
  mind: 'Thinker - Deep Reasoning',
  heart: 'Emotional Intelligence & Wellbeing',
  dreams: 'Creative Generation & Imagination',
};

/**
 * Elara Avatar Component
 * 
 * The AI goddess of Azora OS in her various forms.
 * Each variant represents a different aspect of her power.
 * 
 * Personality-driven, mood-aware, and culturally resonant.
 * 
 * @example
 * ```tsx
 * <ElaraAvatar 
 *   variant="core" 
 *   mood="helpful" 
 *   size={120} 
 *   animated 
 *   showAura 
 * />
 * ```
 */
export const ElaraAvatar: React.FC<ElaraAvatarProps> = ({
  variant = 'core',
  mood = 'helpful',
  size = 120,
  animated = true,
  showAura = true,
  showName = false,
  className = '',
}) => {
  const logoPath = `/packages/public/branding/elara${variant !== 'core' ? `-${variant}` : ''}-logo.svg`;
  const name = elaraNames[variant];
  const description = elaraDescriptions[variant];

  // Mood-based styling
  const moodStyles: Record<ElaraMood, React.CSSProperties> = {
    helpful: { opacity: 1, filter: 'brightness(1)' },
    thinking: { opacity: 0.9, filter: 'brightness(1.1) saturate(1.2)' },
    speaking: { opacity: 1, filter: 'brightness(1.2) saturate(1.3)' },
    learning: { opacity: 0.95, filter: 'brightness(1.15) saturate(1.25)' },
    error: { opacity: 0.7, filter: 'brightness(0.8) saturate(0.8)' },
    success: { opacity: 1, filter: 'brightness(1.3) saturate(1.4)' },
    idle: { opacity: 0.8, filter: 'brightness(0.9)' },
  };

  return (
    <div 
      className={`elara-avatar elara-${variant} elara-mood-${mood} ${animated ? 'elara-animated' : ''} ${showAura ? 'elara-with-aura' : ''} ${className}`}
      style={{ 
        width: size, 
        display: 'inline-block',
        position: 'relative',
      }}
      title={`${name} - ${description}`}
    >
      {showAura && (
        <div 
          className="elara-aura"
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            animation: animated ? 'elara-pulse 2s ease-in-out infinite' : 'none',
            pointerEvents: 'none',
          }}
        />
      )}
      <img
        src={logoPath}
        alt={`${name} - ${description}`}
        width={size}
        height={size * 0.3}
        style={{ 
          width: '100%', 
          height: 'auto', 
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          ...moodStyles[mood],
          transition: 'all 0.3s ease',
        }}
      />
      {showName && (
        <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#ffffff',
            fontWeight: 600,
            margin: 0,
          }}>
            {name}
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            fontWeight: 400,
            margin: '0.25rem 0 0 0',
          }}>
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

// Add global styles for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes elara-pulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

export default ElaraAvatar;
