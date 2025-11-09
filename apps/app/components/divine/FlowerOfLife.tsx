import React from 'react';

interface FlowerOfLifeProps {
  className?: string;
  size?: number;
  animated?: boolean;
  glowing?: boolean;
}

export const FlowerOfLife: React.FC<FlowerOfLifeProps> = ({ className = '', size = 100, animated = false, glowing = false }) => {
  return (
    <div className={`inline-block ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" className={`${animated ? 'animate-spin-slow' : ''} ${glowing ? 'drop-shadow-glow' : ''}`}>
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <circle cx="35" cy="35" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <circle cx="65" cy="35" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <circle cx="35" cy="65" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <circle cx="65" cy="65" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      </svg>
    </div>
  );
};

export default FlowerOfLife;