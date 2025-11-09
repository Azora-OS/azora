import React from 'react';

export type LogoVariant = 'primary' | 'primary-pro' | 'white' | 'black';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface AzoraLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  animated?: boolean;
  showTagline?: boolean;
  className?: string;
}

const sizeMap: Record<Exclude<LogoSize, number>, number> = {
  sm: 120,
  md: 200,
  lg: 300,
  xl: 400,
};

/**
 * Azora OS Logo Component
 * 
 * The main logo of Azora OS with multiple variants and sizes.
 * Embodies Ubuntu philosophy and African excellence.
 * 
 * @example
 * ```tsx
 * <AzoraLogo variant="primary-pro" size="lg" animated />
 * ```
 */
export const AzoraLogo: React.FC<AzoraLogoProps> = ({
  variant = 'primary',
  size = 'md',
  animated = false,
  showTagline = false,
  className = '',
}) => {
  const width = typeof size === 'number' ? size : sizeMap[size];
  const height = width * 0.23; // Maintain aspect ratio from original (320/1400)

  // Map variant to actual file name
  const variantMap: Record<LogoVariant, string> = {
    'primary': 'logo-primary.svg',
    'primary-pro': 'logo-primary-pro.svg',
    'white': 'logo-white.svg',
    'black': 'logo-black.svg',
  };

  const logoPath = `/packages/public/branding/${variantMap[variant]}`;

  return (
    <div 
      className={`azora-logo ${animated ? 'azora-logo-animated' : ''} ${className}`}
      style={{ width, height }}
    >
      <img
        src={logoPath}
        alt="Azora OS - Constitutional AI Operating System"
        width={width}
        height={height}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      {showTagline && (
        <p className="azora-logo-tagline" style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#94a3b8',
          textAlign: 'center',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}>
          Universal Human Infrastructure
        </p>
      )}
    </div>
  );
};

export default AzoraLogo;
