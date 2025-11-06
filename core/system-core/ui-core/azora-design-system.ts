/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * Azora Design System - Unified Theme and Configuration
 * Constitutional AI-driven design principles for all subdomains
 * Version: 1.0.0
 */

export const AzoraDesignSystem = {
  // Color Palette - Constitutional Clarity
  colors: {
    // Primary - Cyan/Deep Blue (Constitutional Authority)
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c3d66',
      950: '#082f49',
    },

    // Accent - Amber/Gold (Opportunity & Value)
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },

    // Success - Emerald (Progress & Achievement)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#145231',
      950: '#051f1e',
    },

    // Warning - Orange (Alerts & Caution)
    warning: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },

    // Danger - Red (Critical Actions)
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#431407',
    },

    // Neutral - Cool Gray
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },

    // Background & Surface
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceDim: '#f1f5f9',
    
    // Semantic Colors
    info: '#3b82f6',
    infoLight: '#dbeafe',
    infoDark: '#1e40af',
  },

  // Typography Scale
  typography: {
    // Headings
    h1: {
      fontSize: '3.5rem',
      lineHeight: '1.1',
      fontWeight: '800',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.875rem',
      lineHeight: '1.2',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      lineHeight: '1.33',
      fontWeight: '600',
    },
    h5: {
      fontSize: '1.25rem',
      lineHeight: '1.4',
      fontWeight: '600',
    },
    h6: {
      fontSize: '1rem',
      lineHeight: '1.5',
      fontWeight: '600',
    },

    // Body Text
    bodyLarge: {
      fontSize: '1.125rem',
      lineHeight: '1.6',
      fontWeight: '400',
    },
    bodyMedium: {
      fontSize: '1rem',
      lineHeight: '1.6',
      fontWeight: '400',
    },
    bodySmall: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontWeight: '400',
    },

    // Labels & Captions
    label: {
      fontSize: '0.875rem',
      lineHeight: '1.25',
      fontWeight: '500',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: '1',
      fontWeight: '400',
      letterSpacing: '0.02em',
    },

    // Display (Marketing)
    display: {
      fontSize: '4rem',
      lineHeight: '1',
      fontWeight: '800',
      letterSpacing: '-0.02em',
    },
  },

  // Spacing Scale (8px base)
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    6: '1.5rem',
    8: '2rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    
    // Glow Effects
    glowCyan: '0 0 20px rgb(6 182 212 / 0.5)',
    glowPrimary: '0 0 20px rgb(14 165 233 / 0.5)',
    glowSuccess: '0 0 20px rgb(34 197 94 / 0.5)',
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    verySlow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index Scale
  zIndex: {
    hide: '-1',
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    backdrop: '1040',
    offcanvas: '1050',
    modal: '1060',
    popover: '1070',
    tooltip: '1080',
  },

  // Breakpoints (Mobile-first)
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component Sizes
  sizes: {
    button: {
      xs: { padding: '0.375rem 0.75rem', fontSize: '0.75rem' },
      sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
      lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
      xl: { padding: '1.25rem 2.5rem', fontSize: '1.25rem' },
    },

    input: {
      sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
      md: { padding: '0.75rem 1rem', fontSize: '1rem' },
      lg: { padding: '1rem 1.25rem', fontSize: '1.125rem' },
    },
  },

  // Animations
  animations: {
    fadeIn: 'fadeIn 300ms ease-in-out forwards',
    fadeOut: 'fadeOut 300ms ease-in-out forwards',
    slideInDown: 'slideInDown 300ms ease-out forwards',
    slideInUp: 'slideInUp 300ms ease-out forwards',
    slideInLeft: 'slideInLeft 300ms ease-out forwards',
    slideInRight: 'slideInRight 300ms ease-out forwards',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    spin: 'spin 1s linear infinite',
  },
}

// Export design tokens for Tailwind CSS integration
export type DesignSystem = typeof AzoraDesignSystem

