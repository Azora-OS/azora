/**
 * Elara AI Avatar Component
 * The goddess of Constitutional AI
 * 7 variants from packages/public/branding
 */
import * as React from 'react';

export type ElaraVariant = 'core' | 'ide' | 'voice' | 'vision' | 'mind' | 'heart' | 'dreams';
export type ElaraMood = 'helpful' | 'thinking' | 'speaking' | 'learning' | 'error' | 'success';
export type ElaraSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface ElaraAvatarProps {
  variant?: ElaraVariant;
  mood?: ElaraMood;
  size?: ElaraSize;
  showName?: boolean;
  showAura?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeMap: Record<Exclude<ElaraSize, number>, number> = {
  sm: 60,
  md: 100,
  lg: 150,
  xl: 250,
};

const variantNames: Record<ElaraVariant, string> = {
  core: 'Elara Core',
  ide: 'Elara IDE',
  voice: 'Elara Voice',
  vision: 'Elara Vision',
  mind: 'Elara Mind',
  heart: 'Elara Heart',
  dreams: 'Elara Dreams',
};

const variantDescriptions: Record<ElaraVariant, string> = {
  core: 'Constitutional AI Teacher',
  ide: 'Code Weaver & Development Guide',
  voice: 'Voice Assistant & Communicator',
  vision: 'Visual Seer & Future Guide',
  mind: 'Deep Thinker & Analyst',
  heart: 'Emotional Intelligence & Care',
  dreams: 'Inspiration & Possibility Explorer',
};

/**
 * Elara AI Avatar Component
 * 
 * @example
 * ```tsx
 * <ElaraAvatar variant="core" mood="helpful" size="lg" showName showAura />
 * <ElaraAvatar variant="ide" size={120} animated />
 * ```
 */
export const ElaraAvatar = React.forwardRef<HTMLDivElement, ElaraAvatarProps>(
  ({ 
    variant = 'core', 
    mood = 'helpful', 
    size = 'md', 
    showName = false,
    showAura = false,
    animated = false, 
    className = '' 
  }, ref) => {
    const computedSize = typeof size === 'number' ? size : sizeMap[size];
    const name = variantNames[variant];
    const description = variantDescriptions[variant];
    
    // Map variant to logo file
    const logoName = variant === 'core' ? 'elara-logo.svg' : `elara-${variant}-logo.svg`;
    const logoPath = `/packages/public/branding/services/${logoName}`;

    // Mood-based styling
    const moodClasses: Record<ElaraMood, string> = {
      helpful: 'opacity-100',
      thinking: 'opacity-80 animate-pulse',
      speaking: 'opacity-100 animate-pulse-premium',
      learning: 'opacity-90',
      error: 'opacity-70 grayscale-[30%]',
      success: 'opacity-100 brightness-110',
    };

    return (
      <div 
        ref={ref}
        className={`elara-avatar inline-flex flex-col items-center gap-2 ${animated ? 'animate-float' : ''} ${className}`}
      >
        <div 
          className={`relative ${moodClasses[mood]}`}
          style={{ width: computedSize, height: computedSize }}
        >
          {showAura && (
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-xl"
              style={{ transform: 'scale(1.2)' }}
            />
          )}
          <img
            src={logoPath}
            alt={name}
            width={computedSize}
            height={computedSize}
            className="relative z-10 object-contain rounded-full"
          />
        </div>
        {showName && (
          <div className="text-center space-y-1">
            <div 
              className="elara-name font-semibold text-foreground tracking-wide"
              style={{ fontSize: Math.max(14, computedSize * 0.12) }}
            >
              {name}
            </div>
            <div 
              className="elara-description text-xs text-muted-foreground"
              style={{ fontSize: Math.max(10, computedSize * 0.08) }}
            >
              {description}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ElaraAvatar.displayName = "ElaraAvatar";

export default ElaraAvatar;
