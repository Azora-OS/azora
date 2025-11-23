/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🎴 IMMERSIVE 3D CARD - THE ULTIMATE CARD COMPONENT
 *
 * Floating, tilting, depth-filled, holographic masterpiece
 *
 * Enhanced with:
 * - Performance optimizations (30+ FPS on older devices)
 * - Intersection Observer (only animate visible cards)
 * - New variants: quantum, ethereal, transcendent
 * - Reduced motion support
 * - GPU-accelerated transforms
 * - Throttled mouse tracking
 */

'use client';

import { divineTransitions } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface Immersive3DCardProps {
  children: React.ReactNode;
  variant?:
    | 'glass'
    | 'holographic'
    | 'iridescent'
    | 'crystal'
    | 'neumorphic'
    | 'divine'
    | 'cosmic'
    | 'quantum'
    | 'ethereal'
    | 'transcendent';
  depth?: 'subtle' | 'medium' | 'dramatic' | 'extreme' | 'infinite';
  float?: boolean;
  tilt?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
  enableIntersectionObserver?: boolean; // Only animate when visible
}

export const Immersive3DCard: React.FC<Immersive3DCardProps> = ({
  children,
  variant = 'crystal',
  depth = 'dramatic',
  float = true,
  tilt = true,
  glow = true,
  className,
  onClick,
  enableIntersectionObserver = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(!enableIntersectionObserver);
  const prefersReducedMotion = useReducedMotion();

  // Throttle mouse movement for better performance
  const throttleTimeoutRef = useRef<NodeJS.Timeout>();

  // Intersection Observer for performance
  useEffect(() => {
    if (!enableIntersectionObserver || !cardRef.current) {return;}

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '50px', // Start animating slightly before entering viewport
      }
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [enableIntersectionObserver]);

  // Throttled mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!cardRef.current || !tilt || !isVisible) {return;}

      // Throttle to ~60fps
      if (throttleTimeoutRef.current) {return;}

      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = undefined;
      }, 16); // ~60fps

      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        setMousePosition({ x, y });
      });
    },
    [tilt, isVisible]
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !tilt || !isVisible) {return;}

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
      setIsHovered(false);
      setMousePosition({ x: 0.5, y: 0.5 });
    };

    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 300);
      onClick?.();
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('click', handleClick);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('click', handleClick);
    };
  }, [tilt, onClick, handleMouseMove, isVisible]);

  const perspectives = {
    subtle: 2000,
    medium: 1200,
    dramatic: 800,
    extreme: 500,
    infinite: 300,
  };

  const maxTilt = {
    subtle: 5,
    medium: 10,
    dramatic: 15,
    extreme: 20,
    infinite: 25,
  };

  // Disable tilt if reduced motion is preferred
  const shouldTilt = tilt && !prefersReducedMotion && isVisible;
  const shouldFloat = float && !prefersReducedMotion && isVisible;
  const shouldGlow = glow && isVisible;

  const tiltX =
    isHovered && shouldTilt ? -(mousePosition.y - 0.5) * maxTilt[depth] : 0;
  const tiltY =
    isHovered && shouldTilt ? (mousePosition.x - 0.5) * maxTilt[depth] : 0;
  const translateZ = isHovered && shouldTilt ? 50 : 0;

  const variants = useMemo(
    () => ({
      glass: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(25px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        borderRadius: '24px',
      },
      holographic: {
        background:
          'linear-gradient(135deg, rgba(255, 0, 255, 0.15), rgba(0, 255, 255, 0.15), rgba(255, 255, 0, 0.15))',
        backgroundSize: '200% 200%',
        backdropFilter: 'blur(20px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 0 40px rgba(255, 0, 255, 0.3)',
        borderRadius: '24px',
        animation: prefersReducedMotion
          ? 'none'
          : 'holographicShift 3s ease-in-out infinite',
      },
      iridescent: {
        background:
          'linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(135, 206, 235, 0.15), rgba(255, 105, 180, 0.15))',
        backgroundSize: '300% 100%',
        backdropFilter: 'blur(25px) saturate(250%)',
        border: '1px solid rgba(255, 215, 0, 0.4)',
        boxShadow: '0 0 50px rgba(255, 215, 0, 0.4)',
        borderRadius: '24px',
        animation: prefersReducedMotion
          ? 'none'
          : 'iridescentFlow 6s linear infinite',
      },
      crystal: {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(40px) saturate(200%) contrast(1.2)',
        border: '2px solid rgba(255, 215, 0, 0.25)',
        boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
        borderRadius: '24px',
      },
      neumorphic: {
        background: 'linear-gradient(145deg, #1a1a2e, #16182a)',
        boxShadow: `
        12px 12px 24px rgba(0, 0, 0, 0.5),
        -12px -12px 24px rgba(42, 42, 60, 0.5)
      `,
        borderRadius: '24px',
      },
      divine: {
        background:
          'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(255, 215, 0, 0.2), rgba(135, 206, 235, 0.2))',
        backgroundSize: '400% 400%',
        backdropFilter: 'blur(50px) saturate(250%)',
        border: '3px solid rgba(255, 215, 0, 0.4)',
        boxShadow:
          '0 0 60px rgba(138, 43, 226, 0.5), inset 0 0 30px rgba(255, 215, 0, 0.3)',
        borderRadius: '24px',
        animation: prefersReducedMotion
          ? 'none'
          : 'divinePulse 8s ease-in-out infinite',
      },
      cosmic: {
        background:
          'linear-gradient(45deg, rgba(25, 25, 112, 0.25), rgba(75, 0, 130, 0.25), rgba(0, 0, 139, 0.25))',
        backgroundSize: '300% 300%',
        backdropFilter: 'blur(60px) saturate(300%)',
        border: '2px solid rgba(135, 206, 235, 0.5)',
        boxShadow:
          '0 0 80px rgba(75, 0, 130, 0.6), inset 0 0 40px rgba(135, 206, 235, 0.4)',
        borderRadius: '24px',
        animation: prefersReducedMotion
          ? 'none'
          : 'cosmicFlow 10s linear infinite',
      },
      // NEW VARIANTS
      quantum: {
        background:
          'linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(255, 0, 255, 0.15), rgba(0, 255, 0, 0.15))',
        backgroundSize: '400% 400%',
        backdropFilter: 'blur(45px) saturate(280%)',
        border: '2px solid rgba(0, 255, 255, 0.4)',
        boxShadow:
          '0 0 70px rgba(0, 255, 255, 0.5), inset 0 0 35px rgba(255, 0, 255, 0.3)',
        borderRadius: '24px',
        animation: prefersReducedMotion
          ? 'none'
          : 'quantumFlux 5s ease-in-out infinite',
      },
      ethereal: {
        background:
          'linear-gradient(135deg, rgba(240, 248, 255, 0.1), rgba(230, 230, 250, 0.1), rgba(255, 250, 250, 0.1))',
        backgroundSize: '300% 300%',
        backdropFilter: 'blur(55px) saturate(150%) brightness(1.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow:
          '0 0 50px rgba(255, 255, 255, 0.4), inset 0 0 25px rgba(240, 248, 255, 0.2)',
        borderRadius: '24px',
        animation: prefersReducedMotion
          ? 'none'
          : 'etherealGlow 7s ease-in-out infinite',
      },
      transcendent: {
        background:
          'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 255, 255, 0.15), rgba(138, 43, 226, 0.2), rgba(0, 191, 255, 0.15))',
        backgroundSize: '500% 500%',
        backdropFilter: 'blur(65px) saturate(350%) brightness(1.2)',
        border: '3px solid rgba(255, 215, 0, 0.5)',
        boxShadow:
          '0 0 90px rgba(255, 215, 0, 0.6), 0 0 60px rgba(138, 43, 226, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.3)',
        borderRadius: '24px',
        animation: prefersReducedMotion
          ? 'none'
          : 'transcendentAscension 12s ease-in-out infinite',
      },
    }),
    [prefersReducedMotion]
  );

  const variantStyle = variants[variant];

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer',
        'backdrop-blur-2xl',
        shouldFloat && 'animate-[float3D_6s_ease-in-out_infinite]',
        isClicked && 'animate-[cardClick_0.3s_ease-out]',
        className
      )}
      style={{
        ...variantStyle,
        perspective: perspectives[depth],
        transformStyle: 'preserve-3d',
        // Use GPU-accelerated transforms
        transform: `
          perspective(${perspectives[depth]}px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
          translateZ(${translateZ}px)
          ${shouldFloat ? '' : 'translateY(0)'}
          ${isClicked ? 'scale(0.95)' : ''}
        `,
        // Force GPU acceleration
        willChange: shouldTilt ? 'transform' : 'auto',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
      transition={divineTransitions.normal}
      role="article"
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label="Interactive 3D card"
    >
      {/* Dynamic spotlight following mouse */}
      {isHovered && shouldGlow && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 215, 0, 0.6) 0%,
              rgba(255, 215, 0, 0.2) 30%,
              transparent 60%
            )`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Layered depth effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ transform: 'translateZ(-20px)' }}
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-br from-[#FFD700]/20 via-transparent to-[#8A2BE2]/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6">{children}</div>

      {/* Glow border effect */}
      {shouldGlow && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow: `0 0 30px ${
              variant === 'divine' || variant === 'transcendent'
                ? 'rgba(255,215,0,0.5)'
                : variant === 'cosmic'
                ? 'rgba(135,206,235,0.5)'
                : variant === 'quantum'
                ? 'rgba(0,255,255,0.5)'
                : variant === 'ethereal'
                ? 'rgba(255,255,255,0.4)'
                : variant === 'crystal'
                ? 'rgba(255,215,0,0.3)'
                : 'rgba(255,255,255,0.2)'
            }`,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
};

