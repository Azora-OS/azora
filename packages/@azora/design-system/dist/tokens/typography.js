/**
 * Azora OS Typography System
 *
 * Font hierarchy aligned with Ubuntu philosophy:
 * - Primary: Modern clarity and accessibility
 * - Secondary: Wisdom and tradition
 * - Mono: Technical precision
 * - Ubuntu: Cultural connection
 */
/**
 * === FONT FAMILIES ===
 */
export const fontFamily = {
    /** Primary font: Clean, modern, accessible */
    primary: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    /** Secondary font: Wisdom and tradition */
    secondary: "'Merriweather', 'Georgia', serif",
    /** Monospace font: Code and technical data */
    mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    /** Ubuntu font: Cultural connection */
    ubuntu: "'Ubuntu', 'Noto Sans', sans-serif",
};
/**
 * === FONT WEIGHTS ===
 */
export const fontWeight = {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
};
/**
 * === FONT SIZES ===
 * Each size includes recommended line height and weight
 */
export const fontSize = {
    /** Hero text for landing pages */
    hero: {
        size: '90px',
        lineHeight: '1.1',
        weight: '900',
    },
    /** H1 - Page titles */
    h1: {
        size: '60px',
        lineHeight: '1.2',
        weight: '800',
    },
    /** H2 - Section headers */
    h2: {
        size: '45px',
        lineHeight: '1.3',
        weight: '700',
    },
    /** H3 - Subsections */
    h3: {
        size: '32px',
        lineHeight: '1.4',
        weight: '600',
    },
    /** H4 - Minor headings */
    h4: {
        size: '24px',
        lineHeight: '1.5',
        weight: '600',
    },
    /** H5 - Small headings */
    h5: {
        size: '20px',
        lineHeight: '1.5',
        weight: '600',
    },
    /** H6 - Tiny headings */
    h6: {
        size: '18px',
        lineHeight: '1.5',
        weight: '600',
    },
    /** Body large - Emphasized content */
    bodyLarge: {
        size: '18px',
        lineHeight: '1.6',
        weight: '400',
    },
    /** Body - Standard content */
    body: {
        size: '16px',
        lineHeight: '1.6',
        weight: '400',
    },
    /** Body small - Secondary content */
    bodySmall: {
        size: '14px',
        lineHeight: '1.5',
        weight: '400',
    },
    /** Caption - Metadata and labels */
    caption: {
        size: '14px',
        lineHeight: '1.5',
        weight: '400',
    },
    /** Tiny - Smallest readable text */
    tiny: {
        size: '12px',
        lineHeight: '1.4',
        weight: '500',
    },
    /** Micro - UI labels and badges */
    micro: {
        size: '10px',
        lineHeight: '1.4',
        weight: '500',
    },
};
/**
 * === LINE HEIGHTS ===
 */
export const lineHeight = {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
};
/**
 * === LETTER SPACING ===
 */
export const letterSpacing = {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
};
/**
 * === COMPLETE TYPOGRAPHY SYSTEM ===
 */
export const typography = {
    fontFamily,
    fontWeight,
    fontSize,
    lineHeight,
    letterSpacing,
};
