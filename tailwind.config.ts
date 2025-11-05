/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
import type { Config } from 'tailwindcss';
import {
  PREMIUM_BREAKPOINTS,
  PREMIUM_COLORS,
  PREMIUM_DURATION,
  PREMIUM_RADIUS,
  PREMIUM_SHADOWS,
  PREMIUM_SPACING,
  PREMIUM_TYPOGRAPHY,
} from './lib/design-system/premium-tokens';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    // Override default breakpoints with premium breakpoints
    screens: {
      xs: PREMIUM_BREAKPOINTS.xs,
      sm: PREMIUM_BREAKPOINTS.sm,
      md: PREMIUM_BREAKPOINTS.md,
      lg: PREMIUM_BREAKPOINTS.lg,
      xl: PREMIUM_BREAKPOINTS.xl,
      '2xl': PREMIUM_BREAKPOINTS['2xl'],
    },
    extend: {
      // Premium spacing system
      spacing: PREMIUM_SPACING,

      // Premium colors
      colors: {
        // Keep shadcn/ui colors for compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Add premium colors
        premium: PREMIUM_COLORS.primary,
        neutral: PREMIUM_COLORS.neutral,
      },

      // Premium typography
      fontSize: PREMIUM_TYPOGRAPHY.fontSize,
      fontWeight: PREMIUM_TYPOGRAPHY.fontWeight,
      lineHeight: PREMIUM_TYPOGRAPHY.lineHeight,

      // Premium border radius
      borderRadius: {
        ...PREMIUM_RADIUS,
        // Keep shadcn/ui radius for compatibility
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // Premium shadows
      boxShadow: PREMIUM_SHADOWS,

      // Premium animation durations
      transitionDuration: PREMIUM_DURATION,

      // Divine keyframes
      keyframes: {
        // Keep shadcn/ui animations
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },

        // Premium animations
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-premium': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)' },
        },
        'rotate-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },

      // Divine animations
      animation: {
        // Keep shadcn/ui animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',

        // Premium animations
        'fade-in': 'fade-in 233ms cubic-bezier(0.618, 0, 0.382, 1)',
        'fade-in-up': 'fade-in-up 377ms cubic-bezier(0.618, 0, 0.382, 1)',
        'scale-in': 'scale-in 233ms cubic-bezier(0.618, 0, 0.382, 1)',
        'slide-in-right':
          'slide-in-right 377ms cubic-bezier(0.618, 0, 0.382, 1)',
        'pulse-premium': 'pulse-premium 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
