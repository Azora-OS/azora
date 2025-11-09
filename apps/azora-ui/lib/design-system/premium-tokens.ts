/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM DESIGN TOKENS - World-Class UI System
Chief Architect Approval: Sizwe Ngwenya ✨
*/

/**
 * 💎 AZORA PREMIUM DESIGN SYSTEM
 * 
 * World-class premium UI system surpassing Google, Apple, and Microsoft
 * Glassmorphic effects, premium color trimmings, Azora Gem integration
 * 
 * @ubuntu Premium individual experience → Collective excellence
 */

/**
 * 🔷 PREMIUM SAPPHIRE - Technology Pillar (Enhanced)
 * Deeper, richer blues with premium metallic finishes
 */
export const PREMIUM_SAPPHIRE = {
  50: '#f0f7ff',
  100: '#e0efff',
  200: '#b8ddff',
  300: '#7cc2ff',
  400: '#36a0ff',
  500: '#0c7ce8', // PREMIUM PRIMARY - Rich Constitutional Blue
  600: '#0062c4',
  700: '#004d9e',
  800: '#034083',
  900: '#0a366c',
  950: '#062244',
  // Premium metallic variants
  metallic: 'linear-gradient(135deg, #0c7ce8 0%, #0062c4 50%, #004d9e 100%)',
  glow: 'rgba(12, 124, 232, 0.4)',
  glass: 'rgba(12, 124, 232, 0.1)',
} as const;

/**
 * 🟢 PREMIUM EMERALD - Education Pillar (Enhanced)
 * Vibrant, sophisticated greens with premium depth
 */
export const PREMIUM_EMERALD = {
  50: '#f0fdf9',
  100: '#ccfce7',
  200: '#99f9d0',
  300: '#5ef0b8',
  400: '#2dd99b',
  500: '#10b981', // PREMIUM PRIMARY - Sovereign Green
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
  // Premium metallic variants
  metallic: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
  glow: 'rgba(16, 185, 129, 0.4)',
  glass: 'rgba(16, 185, 129, 0.1)',
} as const;

/**
 * 🔴 PREMIUM RUBY - Finance Pillar (Enhanced)
 * Rich, luxurious reds with premium warmth
 */
export const PREMIUM_RUBY = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#ffcdd2',
  300: '#ffa4ab',
  400: '#ff707a',
  500: '#ef4444', // PREMIUM PRIMARY - Prosperity Red
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
  // Premium metallic variants
  metallic: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
  glow: 'rgba(239, 68, 68, 0.4)',
  glass: 'rgba(239, 68, 68, 0.1)',
} as const;

/**
 * ⚪ PREMIUM UBUNTU - Unity White (Enhanced)
 * Pure, premium whites with subtle warmth
 */
export const PREMIUM_UBUNTU = {
  white: '#ffffff',
  light: '#fafbfc',
  base: '#f5f7fa',
  dark: '#e8ecf1',
  charcoal: '#2d3748',
  // Premium variants
  glass: 'rgba(255, 255, 255, 0.1)',
  glassStrong: 'rgba(255, 255, 255, 0.2)',
  glow: 'rgba(255, 255, 255, 0.3)',
} as const;

/**
 * 🌟 PREMIUM ACCENT COLORS
 * Luxury accent colors for premium trimmings
 */
export const PREMIUM_ACCENTS = {
  gold: {
    500: '#f59e0b',
    600: '#d97706',
    metallic: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  platinum: {
    500: '#94a3b8',
    600: '#64748b',
    metallic: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)',
    glow: 'rgba(148, 163, 184, 0.4)',
  },
  amethyst: {
    500: '#a855f7',
    600: '#9333ea',
    metallic: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7e22ce 100%)',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
} as const;

/**
 * 🎨 GLASSMORPHIC EFFECTS
 * Premium glassmorphic design tokens
 */
export const GLASSMORPHIC = {
  // Base glass effects
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdrop: 'blur(20px) saturate(180%)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdrop: 'blur(24px) saturate(180%)',
    border: 'rgba(255, 255, 255, 0.25)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.4)',
  },
  strong: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdrop: 'blur(28px) saturate(180%)',
    border: 'rgba(255, 255, 255, 0.3)',
    shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.45)',
  },
  // Dark glass effects
  dark: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdrop: 'blur(20px) saturate(180%)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
  },
  // Colored glass (Azora Gem)
  sapphire: {
    background: 'rgba(12, 124, 232, 0.15)',
    backdrop: 'blur(20px) saturate(180%)',
    border: 'rgba(12, 124, 232, 0.3)',
    shadow: '0 8px 32px 0 rgba(12, 124, 232, 0.3)',
  },
  emerald: {
    background: 'rgba(16, 185, 129, 0.15)',
    backdrop: 'blur(20px) saturate(180%)',
    border: 'rgba(16, 185, 129, 0.3)',
    shadow: '0 8px 32px 0 rgba(16, 185, 129, 0.3)',
  },
  ruby: {
    background: 'rgba(239, 68, 68, 0.15)',
    backdrop: 'blur(20px) saturate(180%)',
    border: 'rgba(239, 68, 68, 0.3)',
    shadow: '0 8px 32px 0 rgba(239, 68, 68, 0.3)',
  },
} as const;

/**
 * ✨ PREMIUM SHADOWS
 * Multi-layered shadows for depth and premium feel
 */
export const PREMIUM_SHADOWS = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
  // Premium colored glows
  sapphireGlow: '0 0 30px rgba(12, 124, 232, 0.4), 0 0 60px rgba(12, 124, 232, 0.2)',
  emeraldGlow: '0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)',
  rubyGlow: '0 0 30px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)',
  goldGlow: '0 0 30px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.2)',
  // Glassmorphic shadows
  glassLight: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  glassMedium: '0 8px 32px 0 rgba(31, 38, 135, 0.4)',
  glassStrong: '0 8px 32px 0 rgba(31, 38, 135, 0.45)',
} as const;

/**
 * 🎯 PREMIUM BORDER RADIUS
 * Refined, elegant curves
 */
export const PREMIUM_RADIUS = {
  none: '0px',
  xs: '0.25rem',
  sm: '0.5rem',
  base: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
  full: '9999px',
} as const;

/**
 * 🌊 PREMIUM ANIMATIONS
 * Smooth, premium transitions
 */
export const PREMIUM_ANIMATIONS = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  easing: {
    premium: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

/**
 * 💎 PREMIUM SPACING
 * Golden ratio spacing with premium precision
 */
export const PREMIUM_SPACING = {
  xs: '0.382rem',   // φ^-2
  sm: '0.618rem',   // φ^-1
  md: '1rem',       // Base
  lg: '1.618rem',   // φ
  xl: '2.618rem',   // φ^2
  '2xl': '4.236rem', // φ^3
  '3xl': '6.854rem', // φ^4
  '4xl': '11.09rem', // φ^5
} as const;

/**
 * 🎨 PREMIUM TYPOGRAPHY
 * World-class typography system
 */
export const PREMIUM_TYPOGRAPHY = {
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
    '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.035em' }],
    '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
    '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.045em' }],
    '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
    '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.055em' }],
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  fontFamily: {
    sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
    display: ['Geist', 'Inter', 'system-ui', 'sans-serif'], // Premium display font
  },
} as const;

/**
 * 💎 COMPLETE PREMIUM DESIGN SYSTEM
 * All premium tokens unified
 */
export const PREMIUM_DESIGN_SYSTEM = {
  colors: {
    sapphire: PREMIUM_SAPPHIRE,
    emerald: PREMIUM_EMERALD,
    ruby: PREMIUM_RUBY,
    ubuntu: PREMIUM_UBUNTU,
    accents: PREMIUM_ACCENTS,
  },
  glassmorphic: GLASSMORPHIC,
  shadows: PREMIUM_SHADOWS,
  radius: PREMIUM_RADIUS,
  spacing: PREMIUM_SPACING,
  typography: PREMIUM_TYPOGRAPHY,
  animations: PREMIUM_ANIMATIONS,
} as const;

/**
 * Helper: Get premium glassmorphic style
 */
export function getGlassmorphicStyle(
  variant: 'light' | 'medium' | 'strong' | 'dark' | 'sapphire' | 'emerald' | 'ruby' = 'light'
) {
  const glass = GLASSMORPHIC[variant]
  return {
    background: glass.background,
    backdropFilter: glass.backdrop,
    WebkitBackdropFilter: glass.backdrop,
    border: `1px solid ${glass.border}`,
    boxShadow: glass.shadow,
  }
}

/**
 * Helper: Get premium glow style
 */
export function getPremiumGlow(color: 'sapphire' | 'emerald' | 'ruby' | 'gold' = 'sapphire') {
  const glowMap = {
    sapphire: PREMIUM_SHADOWS.sapphireGlow,
    emerald: PREMIUM_SHADOWS.emeraldGlow,
    ruby: PREMIUM_SHADOWS.rubyGlow,
    gold: PREMIUM_SHADOWS.goldGlow,
  }
  return {
    boxShadow: glowMap[color],
  }
}

export default PREMIUM_DESIGN_SYSTEM;
