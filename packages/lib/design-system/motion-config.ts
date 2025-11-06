/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🌊 DIVINE MOTION CONFIGURATION
 *
 * Framer Motion configurations for organic, divine animations
 */

import type { Transition } from 'framer-motion';

/**
 * DIVINE TRANSITION PRESETS
 * Pre-configured transitions with divine timing
 */
export const divineTransitions = {
  instant: {
    duration: 0.089,
    ease: [0.618, 0, 0.382, 1],
  },

  fast: {
    duration: 0.144,
    ease: [0.618, 0, 0.382, 1],
  },

  normal: {
    duration: 0.233,
    ease: [0.618, 0, 0.382, 1],
  },

  slow: {
    duration: 0.377,
    ease: [0.618, 0, 0.382, 1],
  },

  slower: {
    duration: 0.61,
    ease: [0.618, 0, 0.382, 1],
  },

  slowest: {
    duration: 0.987,
    ease: [0.618, 0, 0.382, 1],
  },

  // Organic spring
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },

  // Bouncy spring
  bounce: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
  },

  // Smooth spring
  smooth: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 40,
  },
} as const;

/**
 * DIVINE ANIMATION VARIANTS
 * Reusable animation variants for common patterns
 */
export const divineVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  fadeInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },

  fadeInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },

  // Scale animations
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },

  scaleInBig: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
  },

  // Rotation animations
  rotateIn: {
    initial: { opacity: 0, rotate: -180 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 180 },
  },

  // Slide animations
  slideInUp: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  },

  slideInDown: {
    initial: { y: '-100%' },
    animate: { y: 0 },
    exit: { y: '-100%' },
  },

  slideInLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
  },

  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },

  // Continuous animations
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    },
  },

  float: {
    animate: {
      y: [0, -10, 0],
    },
  },

  glow: {
    animate: {
      boxShadow: [
        '0 0 20px rgba(255, 215, 0, 0.3)',
        '0 0 40px rgba(255, 215, 0, 0.6)',
        '0 0 20px rgba(255, 215, 0, 0.3)',
      ],
    },
  },

  rotate: {
    animate: {
      rotate: 360,
    },
  },

  shimmer: {
    animate: {
      backgroundPosition: ['0% 0%', '100% 0%'],
    },
  },
} as const;

/**
 * STAGGER CONFIGURATIONS
 * For animating lists and groups
 */
export const divineStagger = {
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0,
  },

  normal: {
    staggerChildren: 0.1,
    delayChildren: 0.1,
  },

  slow: {
    staggerChildren: 0.2,
    delayChildren: 0.2,
  },

  cascade: {
    staggerChildren: 0.15,
    delayChildren: 0.3,
  },
} as const;

/**
 * GESTURE CONFIGURATIONS
 * For hover, tap, and drag interactions
 */
export const divineGestures = {
  // Hover effects
  hoverScale: {
    whileHover: { scale: 1.05 },
  },

  hoverLift: {
    whileHover: { y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)' },
  },

  hoverGlow: {
    whileHover: {
      boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
      scale: 1.02,
    },
  },

  // Tap effects
  tapScale: {
    whileTap: { scale: 0.95 },
  },

  tapShrink: {
    whileTap: { scale: 0.9 },
  },

  // Combined effects
  interactive: {
    whileHover: { scale: 1.05, y: -5 },
    whileTap: { scale: 0.95 },
  },

  button: {
    whileHover: {
      scale: 1.05,
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
    },
    whileTap: { scale: 0.95 },
  },
} as const;

/**
 * PAGE TRANSITION VARIANTS
 * For page-level animations
 */
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.377,
      ease: [0.618, 0, 0.382, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.233,
      ease: [0.618, 0, 0.382, 1],
    },
  },
} as const;

/**
 * MODAL/OVERLAY VARIANTS
 */
export const modalVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  modal: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
  },

  drawer: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },
} as const;

/**
 * UTILITY FUNCTIONS
 */

/**
 * Create staggered children animation
 */
export function createStagger(
  staggerDelay: number = 0.1,
  delayChildren: number = 0
): Transition {
  return {
    staggerChildren: staggerDelay,
    delayChildren,
  };
}

/**
 * Create responsive animation based on reduced motion preference
 */
export function createAccessibleAnimation(
  animation: Record<string, any>,
  reducedMotion: boolean = false
): Record<string, any> {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return animation;
}

