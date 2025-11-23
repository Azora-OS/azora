/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🌿 Organic Card Component
 * 
 * Living card that breathes and glows with bioluminescent energy
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OrganicCardProps {
  variant?: 'neural' | 'mycelium' | 'consciousness' | 'glass';
  breathe?: boolean;
  glow?: boolean;
  hover3d?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const OrganicCard: React.FC<OrganicCardProps> = ({
  variant = 'glass',
  breathe = true,
  glow = true,
  hover3d = true,
  children,
  className,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover3d) {return;}
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMousePosition({ x, y });
  };

  const variants = {
    neural: {
      background: 'bg-gradient-to-br from-[#00c2ff]/10 via-[#0080cc]/5 to-transparent',
      border: 'border-[#00c2ff]/30',
      glow: 'shadow-[0_0_30px_rgba(0,194,255,0.2)]',
      hover: 'hover:shadow-[0_0_50px_rgba(0,194,255,0.4)]',
    },
    mycelium: {
      background: 'bg-gradient-to-br from-[#33ff92]/10 via-[#1acc6f]/5 to-transparent',
      border: 'border-[#33ff92]/30',
      glow: 'shadow-[0_0_30px_rgba(51,255,146,0.2)]',
      hover: 'hover:shadow-[0_0_50px_rgba(51,255,146,0.4)]',
    },
    consciousness: {
      background: 'bg-gradient-to-br from-[#8a2aff]/10 via-[#5c1ca8]/5 to-transparent',
      border: 'border-[#8a2aff]/30',
      glow: 'shadow-[0_0_30px_rgba(138,42,255,0.2)]',
      hover: 'hover:shadow-[0_0_50px_rgba(138,42,255,0.4)]',
    },
    glass: {
      background: 'bg-white/5',
      border: 'border-white/10',
      glow: 'shadow-[0_8px_32px_rgba(0,194,255,0.1)]',
      hover: 'hover:shadow-[0_8px_48px_rgba(0,194,255,0.2)]',
    },
  };

  const variantClasses = variants[variant];
  
  const transform3d = hover3d && isHovered
    ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) translateZ(10px)`
    : 'none';

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      className={cn(
        'relative p-6 rounded-3xl',
        'backdrop-blur-md',
        'border',
        'transition-all duration-500',
        'overflow-hidden',
        variantClasses.background,
        variantClasses.border,
        glow && variantClasses.glow,
        variantClasses.hover,
        className
      )}
      style={{
        transform: transform3d,
        animation: breathe ? 'breathe 4s ease-in-out infinite' : undefined,
      }}
    >
      {/* Mycelium network overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <pattern id={`mycelium-${variant}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50,0 Q75,25 50,50 T50,100" stroke="currentColor" fill="none" strokeWidth="1" opacity="0.3"/>
              <path d="M0,50 Q25,75 50,50 T100,50" stroke="currentColor" fill="none" strokeWidth="1" opacity="0.3"/>
              <circle cx="50" cy="50" r="2" fill="currentColor" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#mycelium-${variant})`}/>
        </svg>
      </div>

      {/* Neural pulse effect */}
      {pulse && isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            "absolute inset-0 rounded-3xl",
            "bg-gradient-to-r from-transparent via-white/10 to-transparent",
            "animate-[neuralSweep_2s_ease-in-out_infinite]"
          )}></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Corner accents (organic shapes) */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-20 blur-2xl rounded-full bg-current animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 opacity-15 blur-2xl rounded-full bg-current animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
};

export const organicCardStyles = `
  @keyframes neuralSweep {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

export default OrganicCard;

