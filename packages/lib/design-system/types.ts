/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🎨 DIVINE DESIGN SYSTEM TYPES
 *
 * TypeScript types for the divine design system
 */

import {
  DIVINE_BREAKPOINTS,
  DIVINE_COLORS,
  DIVINE_DURATION,
  DIVINE_EASING,
  DIVINE_RADIUS,
  DIVINE_SHADOWS,
  DIVINE_SPACING,
  DIVINE_TYPOGRAPHY,
  DIVINE_Z_INDEX,
} from './divine-tokens';

/**
 * SPACING TYPES
 */
export type DivineSpacing = keyof typeof DIVINE_SPACING;
export type SpacingValue = (typeof DIVINE_SPACING)[DivineSpacing];

/**
 * COLOR TYPES
 */
export type DivineDivineColor = keyof typeof DIVINE_COLORS.divine;
export type DivineEarthColor = keyof typeof DIVINE_COLORS.earth;
export type DivineNeutralColor = keyof typeof DIVINE_COLORS.neutral;
export type DivineSemanticColor = keyof typeof DIVINE_COLORS.semantic;

export type DivineColor =
  | DivineDivineColor
  | DivineEarthColor
  | DivineNeutralColor
  | DivineSemanticColor;

export type ColorValue = string;

/**
 * TYPOGRAPHY TYPES
 */
export type DivineFontSize = keyof typeof DIVINE_TYPOGRAPHY.fontSize;
export type DivineFontWeight = keyof typeof DIVINE_TYPOGRAPHY.fontWeight;
export type DivineLineHeight = keyof typeof DIVINE_TYPOGRAPHY.lineHeight;
export type DivineLetterSpacing = keyof typeof DIVINE_TYPOGRAPHY.letterSpacing;

export type FontSizeValue = (typeof DIVINE_TYPOGRAPHY.fontSize)[DivineFontSize];
export type FontWeightValue =
  (typeof DIVINE_TYPOGRAPHY.fontWeight)[DivineFontWeight];
export type LineHeightValue =
  (typeof DIVINE_TYPOGRAPHY.lineHeight)[DivineLineHeight];
export type LetterSpacingValue =
  (typeof DIVINE_TYPOGRAPHY.letterSpacing)[DivineLetterSpacing];

/**
 * ANIMATION TYPES
 */
export type DivineDuration = keyof typeof DIVINE_DURATION;
export type DivineEasing = keyof typeof DIVINE_EASING;

export type DurationValue = (typeof DIVINE_DURATION)[DivineDuration];
export type EasingValue = (typeof DIVINE_EASING)[DivineEasing];

/**
 * BORDER TYPES
 */
export type DivineRadius = keyof typeof DIVINE_RADIUS;
export type RadiusValue = (typeof DIVINE_RADIUS)[DivineRadius];

/**
 * SHADOW TYPES
 */
export type DivineShadow = keyof typeof DIVINE_SHADOWS;
export type ShadowValue = (typeof DIVINE_SHADOWS)[DivineShadow];

/**
 * BREAKPOINT TYPES
 */
export type DivineBreakpoint = keyof typeof DIVINE_BREAKPOINTS;
export type BreakpointValue = (typeof DIVINE_BREAKPOINTS)[DivineBreakpoint];

/**
 * Z-INDEX TYPES
 */
export type DivineZIndex = keyof typeof DIVINE_Z_INDEX;
export type ZIndexValue = (typeof DIVINE_Z_INDEX)[DivineZIndex];

/**
 * COMPONENT VARIANT TYPES
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ComponentVariant =
  | 'default'
  | 'divine'
  | 'cosmic'
  | 'neural'
  | 'organic'
  | 'glass'
  | 'holographic';

/**
 * THEME TYPES
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface DivineTheme {
  mode: ThemeMode;
  colors: typeof DIVINE_COLORS;
  spacing: typeof DIVINE_SPACING;
  typography: typeof DIVINE_TYPOGRAPHY;
  animations: {
    duration: typeof DIVINE_DURATION;
    easing: typeof DIVINE_EASING;
  };
  borders: {
    radius: typeof DIVINE_RADIUS;
  };
  shadows: typeof DIVINE_SHADOWS;
  breakpoints: typeof DIVINE_BREAKPOINTS;
  zIndex: typeof DIVINE_Z_INDEX;
}

/**
 * STYLE PROP TYPES
 */
export interface DivineStyleProps {
  // Spacing
  m?: DivineSpacing;
  mt?: DivineSpacing;
  mr?: DivineSpacing;
  mb?: DivineSpacing;
  ml?: DivineSpacing;
  mx?: DivineSpacing;
  my?: DivineSpacing;
  p?: DivineSpacing;
  pt?: DivineSpacing;
  pr?: DivineSpacing;
  pb?: DivineSpacing;
  pl?: DivineSpacing;
  px?: DivineSpacing;
  py?: DivineSpacing;

  // Colors
  color?: DivineColor;
  bg?: DivineColor;
  borderColor?: DivineColor;

  // Typography
  fontSize?: DivineFontSize;
  fontWeight?: DivineFontWeight;
  lineHeight?: DivineLineHeight;
  letterSpacing?: DivineLetterSpacing;

  // Borders
  borderRadius?: DivineRadius;

  // Shadows
  shadow?: DivineShadow;

  // Layout
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
}

/**
 * ANIMATION PROP TYPES
 */
export interface DivineAnimationProps {
  duration?: DivineDuration;
  easing?: DivineEasing;
  delay?: number;
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

/**
 * RESPONSIVE PROP TYPES
 */
export type ResponsiveValue<T> =
  | T
  | {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      '2xl'?: T;
    };

/**
 * UTILITY TYPES
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

// All types are already exported above with 'export type'
// No need to re-export them here

