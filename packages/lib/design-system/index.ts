/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🎨 DIVINE DESIGN SYSTEM
 *
 * Complete design system with sacred geometry, golden ratios, and divine aesthetics
 *
 * Usage:
 * ```tsx
 * import { DIVINE_COLORS, divineVariants, DivineTheme } from '@/lib/design-system';
 * ```
 */

// Design tokens
export * from './divine-tokens';

// TypeScript types
export * from './types';

// Framer Motion configurations
export * from './motion-config';

// Re-export commonly used items for convenience
export {
  DIVINE_ANIMATIONS,
  DIVINE_BREAKPOINTS,
  DIVINE_COLORS,
  DIVINE_DURATION,
  DIVINE_EASING,
  DIVINE_RADIUS,
  DIVINE_SHADOWS,
  DIVINE_SPACING,
  DIVINE_TYPOGRAPHY,
  DIVINE_Z_INDEX,
  PHI,
  PHI_INVERSE,
  SACRED_GEOMETRY,
} from './divine-tokens';

export {
  createAccessibleAnimation,
  createDivineTransition,
  createStagger,
  divineGestures,
  divineStagger,
  divineTransitions,
  divineVariants,
  modalVariants,
  pageVariants,
} from './motion-config';

export type {
  ComponentSize,
  ComponentVariant,
  DivineAnimationProps,
  DivineBreakpoint,
  DivineColor,
  DivineDuration,
  DivineEasing,
  DivineFontSize,
  DivineRadius,
  DivineShadow,
  DivineSpacing,
  DivineStyleProps,
  DivineTheme,
  DivineZIndex,
  ResponsiveValue,
  ThemeMode,
} from './types';

