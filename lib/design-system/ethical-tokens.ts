/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🌟 DIVINE DESIGN TOKENS
 *
 * Sacred geometry, golden ratios, and divine aesthetics
 * Based on φ (phi) = 1.618033988749895 (Golden Ratio)
 * Fibonacci sequence for timing: 89, 144, 233, 377, 610ms
 *
 * "Geometry has two great treasures: one is the theorem of Pythagoras,
 * the other the division of a line into extreme and mean ratio.
 * The first we may compare to a mass of gold, the second we may call a precious jewel."
 * - Johannes Kepler
 */

// Golden Ratio constant
export const PHI = 1.618033988749895;
export const PHI_INVERSE = 0.618033988749895;

/**
 * DIVINE SPACING SYSTEM
 * Based on powers of the golden ratio
 */
export const DIVINE_SPACING = {
  // φ^-2 = 0.382
  xs: '0.382rem', // 6.112px at 16px base
  // φ^-1 = 0.618
  sm: '0.618rem', // 9.888px
  // Base unit
  md: '1rem', // 16px
  // φ = 1.618
  lg: '1.618rem', // 25.888px
  // φ^2 = 2.618
  xl: '2.618rem', // 41.888px
  // φ^3 = 4.236
  xxl: '4.236rem', // 67.776px
  // φ^4 = 6.854
  xxxl: '6.854rem', // 109.664px
} as const;

/**
 * SACRED COLOR PALETTE
 * Colors inspired by divine light, nature, and cosmic energy
 */
export const DIVINE_COLORS = {
  // Divine realm - celestial and sacred
  divine: {
    gold: '#FFD700', // Divine light, enlightenment
    celestial: '#87CEEB', // Heavenly blue, infinite sky
    sacred: '#9400D3', // Royal purple, spiritual wisdom
    ethereal: '#F0F8FF', // Angelic white, purity
    cosmic: '#191970', // Midnight blue, cosmic depth
    radiant: '#FFA500', // Amber radiance, warmth
  },

  // Earth realm - nature and life
  earth: {
    emerald: '#00FF88', // Life, growth, prosperity
    amber: '#FFA500', // Energy, vitality, warmth
    ruby: '#FF69B4', // Love, passion, connection
    sapphire: '#0066FF', // Wisdom, depth, trust
    jade: '#00A86B', // Balance, harmony, healing
    topaz: '#FFCC00', // Joy, optimism, clarity
  },

  // Neutral palette - foundation
  neutral: {
    white: '#FFFFFF',
    light: '#F5F5F5',
    gray: '#808080',
    dark: '#1A1A1A',
    black: '#000000',
  },

  // Semantic colors
  semantic: {
    success: '#00FF88', // Emerald
    warning: '#FFCC00', // Topaz
    error: '#FF4444', // Ruby variant
    info: '#0066FF', // Sapphire
  },
} as const;

/**
 * TYPOGRAPHY SCALE
 * Based on golden ratio progression
 */
export const DIVINE_TYPOGRAPHY = {
  fontSize: {
    // φ^-2 = 0.618 * 0.618 = 0.382
    xs: '0.618rem', // 9.888px
    // φ^-1 = 0.618
    sm: '0.786rem', // 12.576px (√φ^-1)
    // Base
    base: '1rem', // 16px
    // √φ = 1.272
    lg: '1.272rem', // 20.352px
    // φ = 1.618
    xl: '1.618rem', // 25.888px
    // φ * √φ = 2.058
    '2xl': '2.058rem', // 32.928px
    // φ^2 = 2.618
    '3xl': '2.618rem', // 41.888px
    // φ^2 * √φ = 3.330
    '4xl': '3.330rem', // 53.28px
    // φ^3 = 4.236
    '5xl': '4.236rem', // 67.776px
    // φ^4 = 6.854
    '6xl': '6.854rem', // 109.664px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.272, // √φ
    normal: 1.618, // φ
    relaxed: 2.058, // φ * √φ
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

/**
 * ANIMATION TIMING
 * Based on Fibonacci sequence for natural, organic feel
 */
export const DIVINE_DURATION = {
  instant: '89ms', // Fibonacci 11th
  fast: '144ms', // Fibonacci 12th
  normal: '233ms', // Fibonacci 13th
  slow: '377ms', // Fibonacci 14th
  slower: '610ms', // Fibonacci 15th
  slowest: '987ms', // Fibonacci 16th
} as const;

/**
 * EASING FUNCTIONS
 * Organic, natural motion curves
 */
export const DIVINE_EASING = {
  // Standard easing
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Organic easing (based on golden ratio)
  organic: 'cubic-bezier(0.618, 0, 0.382, 1)',
  organicIn: 'cubic-bezier(0.618, 0, 1, 1)',
  organicOut: 'cubic-bezier(0, 0, 0.382, 1)',

  // Bounce and elastic
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

/**
 * BORDER RADIUS
 * Smooth, organic curves
 */
export const DIVINE_RADIUS = {
  none: '0',
  sm: '0.382rem', // φ^-2
  md: '0.618rem', // φ^-1
  lg: '1rem', // base
  xl: '1.618rem', // φ
  '2xl': '2.618rem', // φ^2
  full: '9999px', // Perfect circle
} as const;

/**
 * SHADOWS
 * Depth and elevation with divine glow
 */
export const DIVINE_SHADOWS = {
  none: 'none',

  // Standard shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Divine glows
  goldGlow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
  celestialGlow:
    '0 0 20px rgba(135, 206, 235, 0.5), 0 0 40px rgba(135, 206, 235, 0.3)',
  sacredGlow:
    '0 0 20px rgba(148, 0, 211, 0.5), 0 0 40px rgba(148, 0, 211, 0.3)',
  emeraldGlow:
    '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',

  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
} as const;

/**
 * Z-INDEX SCALE
 * Layering system for depth
 */
export const DIVINE_Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
  max: 9999,
} as const;

/**
 * BREAKPOINTS
 * Responsive design breakpoints
 */
export const DIVINE_BREAKPOINTS = {
  xs: '320px', // Small phones
  sm: '640px', // Large phones
  md: '768px', // Tablets
  lg: '1024px', // Laptops
  xl: '1280px', // Desktops
  '2xl': '1536px', // Large desktops
} as const;

/**
 * SACRED GEOMETRY PATTERNS
 * Mathematical constants for sacred geometry
 */
export const SACRED_GEOMETRY = {
  phi: PHI,
  phiInverse: PHI_INVERSE,

  // Flower of Life
  flowerOfLife: {
    circles: 19,
    radius: 1,
    overlap: PHI_INVERSE,
  },

  // Metatron's Cube
  metatronsCube: {
    spheres: 13,
    connections: 78,
  },

  // Golden Spiral
  goldenSpiral: {
    ratio: PHI,
    turns: 5,
  },

  // Vesica Piscis
  vesicaPiscis: {
    ratio: Math.sqrt(3) / 2,
    angle: 60,
  },
} as const;

/**
 * ANIMATION PRESETS
 * Common animation configurations
 */
export const DIVINE_ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.233 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.377, ease: [0.618, 0, 0.382, 1] },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.233, ease: [0.618, 0, 0.382, 1] },
  },

  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.377, ease: [0.618, 0, 0.382, 1] },
  },

  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },

  float: {
    animate: {
      y: [0, -10, 0],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
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
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
} as const;

/**
 * TYPE EXPORTS
 * TypeScript types for design tokens
 */
export type DivineSpacing = keyof typeof DIVINE_SPACING;
export type DivineColor =
  | keyof typeof DIVINE_COLORS.divine
  | keyof typeof DIVINE_COLORS.earth;
export type DivineFontSize = keyof typeof DIVINE_TYPOGRAPHY.fontSize;
export type DivineDuration = keyof typeof DIVINE_DURATION;
export type DivineEasing = keyof typeof DIVINE_EASING;
export type DivineRadius = keyof typeof DIVINE_RADIUS;
export type DivineShadow = keyof typeof DIVINE_SHADOWS;
export type DivineBreakpoint = keyof typeof DIVINE_BREAKPOINTS;

