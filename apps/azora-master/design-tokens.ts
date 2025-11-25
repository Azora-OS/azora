// Premium Color Palette - HSL-based for smooth gradients
export const premiumColors = {
    primary: {
        50: 'hsl(250, 100%, 97%)',
        100: 'hsl(250, 95%, 92%)',
        200: 'hsl(250, 90%, 85%)',
        300: 'hsl(250, 85%, 75%)',
        400: 'hsl(250, 80%, 65%)',
        500: 'hsl(250, 75%, 55%)',
        600: 'hsl(250, 70%, 45%)',
        700: 'hsl(250, 65%, 35%)',
        800: 'hsl(250, 60%, 25%)',
        900: 'hsl(250, 90%, 15%)',
    },
    accent: {
        50: 'hsl(280, 100%, 97%)',
        100: 'hsl(280, 95%, 92%)',
        200: 'hsl(280, 90%, 85%)',
        300: 'hsl(280, 85%, 75%)',
        400: 'hsl(280, 80%, 65%)',
        500: 'hsl(280, 75%, 55%)',
        600: 'hsl(280, 70%, 45%)',
        700: 'hsl(280, 65%, 35%)',
        800: 'hsl(280, 60%, 25%)',
        900: 'hsl(280, 90%, 15%)',
    },
    gradients: {
        primary: 'linear-gradient(135deg, hsl(250, 75%, 55%) 0%, hsl(280, 75%, 55%) 100%)',
        accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        sunset: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        forest: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    glow: {
        primary: 'rgba(102, 126, 234, 0.5)',
        accent: 'rgba(118, 75, 162, 0.5)',
        success: 'rgba(16, 185, 129, 0.5)',
        warning: 'rgba(251, 191, 36, 0.5)',
        error: 'rgba(239, 68, 68, 0.5)',
    },
    glass: {
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.15)',
        strong: 'rgba(255, 255, 255, 0.2)',
    },
};

// Typography Scale
export const typography = {
    fontFamily: {
        sans: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif',
        ].join(', '),
        mono: [
            'JetBrains Mono',
            'Fira Code',
            'Consolas',
            'Monaco',
            'monospace',
        ].join(', '),
    },
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
};

// Spacing Scale (8px grid)
export const spacing = {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
    40: '10rem',     // 160px
    48: '12rem',     // 192px
    56: '14rem',     // 224px
    64: '16rem',     // 256px
};

// Shadow Scale
export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(102, 126, 234, 0.5)',
    glowLg: '0 0 40px rgba(102, 126, 234, 0.6)',
};

// Animation Durations
export const animations = {
    duration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
        slower: '1000ms',
    },
    easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
};

// Border Radius
export const borderRadius = {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
};

export const designTokens = {
    colors: premiumColors,
    typography,
    spacing,
    shadows,
    animations,
    borderRadius,
};

export default designTokens;
