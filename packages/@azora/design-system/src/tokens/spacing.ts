/**
 * Azora OS Spacing System
 * Sankofa Rhythm: Based on 8px grid system
 * 
 * "Ubuntu spacing multiplies harmony"
 */

/**
 * === SPACING SCALE ===
 * Based on 8px base unit (Sankofa Rhythm)
 */
export const spacing = {
  0: '0px',
  1: '8px',      // Tight
  2: '16px',     // Compact
  3: '24px',     // Comfortable
  4: '32px',     // Spacious
  5: '40px',     // Generous
  6: '48px',     // Luxurious
  8: '64px',     // Dramatic
  12: '96px',    // Epic
  16: '128px',   // Monumental
  20: '160px',   // Legendary
} as const;

/**
 * === BORDER RADIUS ===
 */
export const radius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

/**
 * === BOX SHADOWS ===
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  /** Special: Azora Gem glow effect */
  gem: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(16, 185, 129, 0.2), 0 0 60px rgba(239, 68, 68, 0.1)',
  
  none: 'none',
} as const;

/**
 * === ANIMATION DURATIONS ===
 */
export const duration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '700ms',
  slowest: '1000ms',
} as const;

/**
 * === EASING FUNCTIONS ===
 */
export const easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  /** Ubuntu easing: Natural, organic motion */
  ubuntu: 'cubic-bezier(0.618, 0, 0.382, 1)',  // Golden ratio
} as const;

/**
 * === BREAKPOINTS ===
 */
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * === Z-INDEX SCALE ===
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

/**
 * === COMPLETE SPACING SYSTEM ===
 */
export const spacingSystem = {
  spacing,
  radius,
  shadows,
  duration,
  easing,
  breakpoints,
  zIndex,
} as const;

/**
 * === TYPE EXPORTS ===
 */
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type Duration = typeof duration;
export type Breakpoints = typeof breakpoints;
