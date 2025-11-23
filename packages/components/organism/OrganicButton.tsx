/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🌿 Organic Button Component
 *
 * Living, breathing button that pulses with life energy
 *
 * Enhanced with:
 * - Haptic-like visual feedback with micro-animations
 * - Loading states with organic spinner
 * - Optimized ripple effects (auto-cleanup)
 * - 44x44px minimum touch targets for mobile
 * - Full keyboard accessibility
 * - Reduced motion support
 * - ARIA labels and states
 */

'use client';

import { divineTransitions } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

interface OrganicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'neural'
    | 'mycelium'
    | 'consciousness'
    | 'energy'
    | 'divine'
    | 'cosmic';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  blessing?: boolean;
  sacred?: boolean;
  loading?: boolean; // New: loading state
  loadingText?: string; // New: text to show when loading
  icon?: React.ReactNode; // New: optional icon
  iconPosition?: 'left' | 'right'; // New: icon position
}

export const OrganicButton: React.FC<OrganicButtonProps> = ({
  variant = 'neural',
  size = 'md',
  pulse = true,
  glow = true,
  className,
  children,
  blessing = true,
  sacred = false,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);
  const [blessingCount, setBlessingCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Optimized ripple effect with auto-cleanup
  const createRipple = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current || prefersReducedMotion) {return;}

      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples(prev => [...prev, { x, y, id }]);

      // Auto-cleanup after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600); // Match animation duration
    },
    [prefersReducedMotion]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {return;}

      createRipple(e);

      // Haptic-like feedback
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);

      if (blessing) {
        setBlessingCount(prev => prev + 1);
      }

      props.onClick?.(e);
    },
    [loading, disabled, blessing, props, createRipple]
  );

  const variants = {
    neural: {
      base: 'bg-gradient-to-r from-[#00c2ff] to-[#0080cc]',
      hover: 'from-[#00d4ff] to-[#0090dd]',
      glow: 'shadow-[0_0_20px_rgba(0,194,255,0.5)]',
      pulse: 'animate-[organicPulse_3s_ease-in-out_infinite]',
      text: 'text-white',
    },
    mycelium: {
      base: 'bg-gradient-to-r from-[#33ff92] to-[#1acc6f]',
      hover: 'from-[#44ffaa] to-[#2add7f]',
      glow: 'shadow-[0_0_20px_rgba(51,255,146,0.5)]',
      pulse: 'animate-[organicPulse_3s_ease-in-out_infinite]',
      text: 'text-white',
    },
    consciousness: {
      base: 'bg-gradient-to-r from-[#8a2aff] to-[#5c1ca8]',
      hover: 'from-[#9a3aff] to-[#6c2cb8]',
      glow: 'shadow-[0_0_20px_rgba(138,42,255,0.5)]',
      pulse: 'animate-[organicPulse_3s_ease-in-out_infinite]',
      text: 'text-white',
    },
    energy: {
      base: 'bg-gradient-to-r from-[#ffbf26] to-[#f5b121]',
      hover: 'from-[#ffcf36] to-[#ffc131]',
      glow: 'shadow-[0_0_20px_rgba(255,191,38,0.5)]',
      pulse: 'animate-[organicPulse_3s_ease-in-out_infinite]',
      text: 'text-black',
    },
    divine: {
      base: 'bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00]',
      hover: 'from-[#FFDF40] via-[#FFB340] to-[#FF9C40]',
      glow: 'shadow-[0_0_30px_rgba(255,215,0,0.7)]',
      pulse: 'animate-[divinePulse_4s_ease-in-out_infinite]',
      text: 'text-black',
    },
    cosmic: {
      base: 'bg-gradient-to-r from-[#9400D3] via-[#8A2BE2] to-[#4B0082]',
      hover: 'from-[#A020F0] via-[#9370DB] to-[#8A2BE2]',
      glow: 'shadow-[0_0_30px_rgba(148,0,211,0.7)]',
      pulse: 'animate-[cosmicPulse_5s_ease-in-out_infinite]',
      text: 'text-white',
    },
  };

  // Ensure minimum 44x44px touch targets
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[48px]',
    xl: 'px-10 py-5 text-xl min-h-[52px]',
  };

  const variantClasses = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <motion.div
      whileHover={
        !isDisabled && !prefersReducedMotion ? { scale: 1.05 } : undefined
      }
      whileTap={
        !isDisabled && !prefersReducedMotion ? { scale: 0.95 } : undefined
      }
      transition={divineTransitions.fast}
      style={{ display: 'inline-block' }}
    >
      <button
        ref={buttonRef}
        {...props}
        onClick={handleClick}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => !isDisabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={isDisabled}
        className={cn(
          'relative overflow-hidden font-semibold transition-all duration-300',
          'rounded-[30%_70%_70%_30%/30%_30%_70%_70%]',
          'hover:rounded-[60%_40%_30%_70%/60%_30%_70%_40%]',
          variantClasses.base,
          isHovered && !isDisabled && variantClasses.hover,
          glow && !isDisabled && variantClasses.glow,
          pulse && !isDisabled && !prefersReducedMotion && variantClasses.pulse,
          sizes[size],
          'backdrop-blur-sm',
          'border border-white/20',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          variant === 'divine' ? 'focus:ring-[#FFD700]' : 'focus:ring-current',
          variantClasses.text,
          isDisabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        style={{
          animation:
            pulse && !isDisabled && !prefersReducedMotion
              ? 'breathe 4s ease-in-out infinite'
              : undefined,
        }}
        aria-busy={loading}
        aria-disabled={isDisabled}
        aria-label={loading ? loadingText || 'Loading' : undefined}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            initial={{
              width: 0,
              height: 0,
              left: ripple.x,
              top: ripple.y,
              opacity: 1,
            }}
            animate={{
              width: 300,
              height: 300,
              left: ripple.x - 150,
              top: ripple.y - 150,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Neural connections overlay */}
        {!prefersReducedMotion && (
          <span className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
            <span className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent animate-[neuralPulse_2s_ease-in-out_infinite]"></span>
            <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent animate-[neuralPulse_2s_ease-in-out_infinite_reverse]"></span>
          </span>
        )}

        {/* Sacred overlay for divine buttons */}
        {sacred && (
          <span className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
              <pattern
                id="sacred-pattern"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#sacred-pattern)" />
            </svg>
          </span>
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {/* Loading spinner */}
          {loading && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={divineTransitions.fast}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.span>
          )}

          {/* Icon (left) */}
          {!loading && icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}

          {/* Text content */}
          <span className="flex-shrink-0">
            {loading && loadingText ? loadingText : children}
          </span>

          {/* Icon (right) */}
          {!loading && icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </span>

        {/* Glow effect on hover */}
        {isHovered && glow && !isDisabled && (
          <motion.span
            className="absolute inset-0 bg-white/10 blur-md pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={divineTransitions.fast}
          />
        )}

        {/* Haptic-like press feedback */}
        {isPressed && !prefersReducedMotion && (
          <motion.span
            className="absolute inset-0 bg-black/20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}

        {/* Divine sparkles for sacred buttons */}
        {sacred && isHovered && !isDisabled && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={divineTransitions.fast}
          >
            <Sparkles className="absolute top-2 right-2 w-4 h-4 text-white animate-pulse" />
          </motion.span>
        )}

        {/* Blessing counter */}
        {blessing && blessingCount > 0 && (
          <motion.span
            className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-[#FFD700] text-black text-xs font-bold rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            {blessingCount}
          </motion.span>
        )}
      </button>
    </motion.div>
  );
};

export default OrganicButton;

