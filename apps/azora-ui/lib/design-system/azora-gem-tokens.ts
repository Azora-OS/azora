/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.

Azora Gem Design Tokens
Tri-Unity Crystal Color System aligned with Ubuntu Philosophy
*/

/**
 * 🔷 SAPPHIRE APEX - Technology Pillar
 * Constitutional Blue - Represents AI consciousness, digital sovereignty, innovation
 */
export const SAPPHIRE_COLORS = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#1e40af', // PRIMARY SAPPHIRE - Constitutional Blue
  600: '#1e3a8a',
  700: '#1e3a8a',
  800: '#1e40af',
  900: '#172554',
} as const;

/**
 * 🟢 EMERALD FOUNDATION - Education Pillar
 * Sovereign Green - Represents knowledge cultivation, wisdom, human development
 */
export const EMERALD_COLORS = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#059669', // PRIMARY EMERALD - Sovereign Green
  600: '#047857',
  700: '#065f46',
  800: '#064e3b',
  900: '#022c22',
} as const;

/**
 * 🔴 RUBY CORE - Finance Pillar
 * Prosperity Red - Represents value creation, wealth generation, economic freedom
 */
export const RUBY_COLORS = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#dc2626', // PRIMARY RUBY - Prosperity Red
  600: '#b91c1c',
  700: '#991b1b',
  800: '#7f1d1d',
  900: '#450a0a',
} as const;

/**
 * ⚪ UBUNTU CORE - Unity White
 * Constitutional AI - Represents unity, transparency, collective prosperity
 */
export const UBUNTU_COLORS = {
  white: '#ffffff',
  light: '#f9fafb',
  base: '#f3f4f6',
  dark: '#e5e7eb',
  charcoal: '#374151',
} as const;

/**
 * Complete Azora Gem Color System
 */
export const AZORA_GEM_COLORS = {
  sapphire: SAPPHIRE_COLORS,
  emerald: EMERALD_COLORS,
  ruby: RUBY_COLORS,
  ubuntu: UBUNTU_COLORS,
} as const;

/**
 * Golden Ratio Spacing System
 * Ubuntu Harmony - Flowing, connected spacing based on φ (1.618)
 */
export const UBUNTU_SPACING = {
  xs: '0.382rem',   // φ^-2
  sm: '0.618rem',   // φ^-1
  md: '1rem',       // Base
  lg: '1.618rem',   // φ
  xl: '2.618rem',   // φ^2
  '2xl': '4.236rem', // φ^3
  '3xl': '6.854rem', // φ^4
} as const;

/**
 * Ubuntu Animation Durations
 * Smooth, connected transitions reflecting Ubuntu flow
 */
export const UBUNTU_DURATION = {
  instant: '100ms',
  fast: '150ms',
  base: '300ms',
  slow: '500ms',
  slower: '700ms',
} as const;

/**
 * Ubuntu Animation Easing
 * Smooth, connected curves reflecting Ubuntu harmony
 */
export const UBUNTU_EASING = {
  ubuntu: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

/**
 * Ubuntu Shadow System
 * Depth and elevation with Ubuntu glow effects
 */
export const UBUNTU_SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  // Ubuntu Glow Effects
  sapphireGlow: '0 0 20px rgba(30, 64, 175, 0.3)',
  emeraldGlow: '0 0 20px rgba(5, 150, 105, 0.3)',
  rubyGlow: '0 0 20px rgba(220, 38, 38, 0.3)',
  ubuntuGlow: '0 0 30px rgba(255, 255, 255, 0.2)',
} as const;

/**
 * Ubuntu Border Radius
 * Organic, flowing shapes reflecting Ubuntu harmony
 */
export const UBUNTU_RADIUS = {
  none: '0px',
  sm: '0.25rem',
  base: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
  full: '9999px',
} as const;

/**
 * Typography Scale
 * Ubuntu Clarity - Clean, readable, accessible
 */
export const UBUNTU_TYPOGRAPHY = {
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  fontFamily: {
    sans: ['Geist', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'], // Wisdom & Tradition
    mono: ['Geist Mono', 'monospace'],
  },
} as const;

/**
 * Complete Azora Gem Design Token System
 * All tokens aligned with Ubuntu Philosophy and Azora Identity
 */
export const AZORA_GEM_TOKENS = {
  colors: AZORA_GEM_COLORS,
  spacing: UBUNTU_SPACING,
  typography: UBUNTU_TYPOGRAPHY,
  shadows: UBUNTU_SHADOWS,
  radius: UBUNTU_RADIUS,
  duration: UBUNTU_DURATION,
  easing: UBUNTU_EASING,
} as const;

/**
 * Helper function to get Azora Gem color by pillar
 */
export function getGemColor(pillar: 'sapphire' | 'emerald' | 'ruby', shade: keyof typeof SAPPHIRE_COLORS = '500') {
  return AZORA_GEM_COLORS[pillar][shade];
}

/**
 * Helper function to get Ubuntu spacing
 */
export function getUbuntuSpacing(size: keyof typeof UBUNTU_SPACING) {
  return UBUNTU_SPACING[size];
}

export default AZORA_GEM_TOKENS;
