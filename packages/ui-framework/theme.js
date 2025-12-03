/**
 * Azora Unified UI Framework
 * Cross-platform design system and component library
 */

import React from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';

// Azora Design System Colors
export const azoraColors = {
  // Primary colors
  primary: {
    main: '#1a365d',      // Deep navy blue
    light: '#2d3748',     // Lighter navy
    dark: '#0f1419',      // Darker navy
    contrast: '#ffffff'   // White text on primary
  },

  // Secondary colors
  secondary: {
    main: '#38b2ac',      // Teal
    light: '#4fd1c9',     // Light teal
    dark: '#2c7a7b',      // Dark teal
    contrast: '#ffffff'   // White text on secondary
  },

  // Constitutional colors (gold theme)
  constitutional: {
    main: '#d4af37',      // Gold
    light: '#f4e87c',     // Light gold
    dark: '#b7950b',      // Dark gold
    contrast: '#1a365d'   // Navy text on gold
  },

  // Status colors
  success: {
    main: '#38a169',      // Green
    light: '#68d391',
    dark: '#2f855a',
    contrast: '#ffffff'
  },

  warning: {
    main: '#d69e2e',      // Orange
    light: '#fbbf24',
    dark: '#b7791f',
    contrast: '#ffffff'
  },

  error: {
    main: '#e53e3e',      // Red
    light: '#fc8181',
    dark: '#c53030',
    contrast: '#ffffff'
  },

  info: {
    main: '#3182ce',      // Blue
    light: '#63b3ed',
    dark: '#2c5282',
    contrast: '#ffffff'
  },

  // Neutral colors
  grey: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923'
  },

  // Background colors
  background: {
    default: '#ffffff',
    paper: '#f7fafc',
    dark: '#1a202c'
  },

  // Text colors
  text: {
    primary: '#1a202c',
    secondary: '#4a5568',
    disabled: '#a0aec0',
    hint: '#cbd5e0'
  }
};

// Typography scale
export const typography = {
  fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem'     // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  }
};

// Spacing scale
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem'      // 128px
};

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px'
};

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(66, 153, 225, 0.5)'
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Azora Theme
export const azoraTheme = {
  colors: azoraColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,

  // Component-specific theme values
  components: {
    button: {
      borderRadius: borderRadius.md,
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      transition: 'all 0.2s ease-in-out'
    },

    input: {
      borderRadius: borderRadius.md,
      padding: `${spacing[2]} ${spacing[3]}`,
      border: `1px solid ${azoraColors.grey[300]}`,
      fontSize: typography.fontSize.md,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
    },

    card: {
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: shadows.md,
      border: `1px solid ${azoraColors.grey[200]}`
    }
  }
};

// Global Styles
export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    line-height: ${typography.lineHeight.normal};
  }

  body {
    font-family: ${typography.fontFamily};
    color: ${azoraColors.text.primary};
    background-color: ${azoraColors.background.default};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${typography.fontWeight.bold};
    line-height: ${typography.lineHeight.tight};
    margin-bottom: ${spacing[4]};
  }

  h1 { font-size: ${typography.fontSize['4xl']}; }
  h2 { font-size: ${typography.fontSize['3xl']}; }
  h3 { font-size: ${typography.fontSize['2xl']}; }
  h4 { font-size: ${typography.fontSize.xl}; }
  h5 { font-size: ${typography.fontSize.lg}; }
  h6 { font-size: ${typography.fontSize.md}; }

  p {
    margin-bottom: ${spacing[4]};
    line-height: ${typography.lineHeight.relaxed};
  }

  a {
    color: ${azoraColors.primary.main};
    text-decoration: none;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${azoraColors.primary.dark};
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease-in-out;
  }

  input, textarea, select {
    font-family: inherit;
    outline: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${azoraColors.grey[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${azoraColors.grey[400]};
    border-radius: ${borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${azoraColors.grey[500]};
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid ${azoraColors.primary.main};
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background-color: ${azoraColors.primary.main};
    color: ${azoraColors.primary.contrast};
  }

  /* Constitutional compliance indicator */
  .constitutional-compliant::before {
    content: '⚖️';
    margin-right: ${spacing[1]};
    color: ${azoraColors.constitutional.main};
  }
`;

// Utility functions
export const getColor = (colorPath) => {
  return colorPath.split('.').reduce((obj, key) => obj && obj[key], azoraColors);
};

export const getSpacing = (size) => spacing[size] || size;

export const getBreakpoint = (size) => breakpoints[size] || size;

// Responsive utilities
export const mediaQuery = (breakpoint) => `@media (min-width: ${breakpoints[breakpoint]})`;

// Theme provider wrapper
export const AzoraThemeProvider = ({ children, theme = azoraTheme }) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    {children}
  </ThemeProvider>
);

export default azoraTheme;