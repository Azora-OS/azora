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
export declare const spacing: {
    readonly 0: "0px";
    readonly 1: "8px";
    readonly 2: "16px";
    readonly 3: "24px";
    readonly 4: "32px";
    readonly 5: "40px";
    readonly 6: "48px";
    readonly 8: "64px";
    readonly 12: "96px";
    readonly 16: "128px";
    readonly 20: "160px";
};
/**
 * === BORDER RADIUS ===
 */
export declare const radius: {
    readonly none: "0px";
    readonly sm: "0.125rem";
    readonly base: "0.25rem";
    readonly md: "0.375rem";
    readonly lg: "0.5rem";
    readonly xl: "0.75rem";
    readonly '2xl': "1rem";
    readonly '3xl': "1.5rem";
    readonly full: "9999px";
};
/**
 * === BOX SHADOWS ===
 */
export declare const shadows: {
    readonly sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    readonly base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
    readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    readonly '2xl': "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    readonly inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
    /** Special: Azora Gem glow effect */
    readonly gem: "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(16, 185, 129, 0.2), 0 0 60px rgba(239, 68, 68, 0.1)";
    readonly none: "none";
};
/**
 * === ANIMATION DURATIONS ===
 */
export declare const duration: {
    readonly fast: "150ms";
    readonly normal: "300ms";
    readonly slow: "500ms";
    readonly slower: "700ms";
    readonly slowest: "1000ms";
};
/**
 * === EASING FUNCTIONS ===
 */
export declare const easing: {
    readonly linear: "linear";
    readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
    readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
    readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    /** Ubuntu easing: Natural, organic motion */
    readonly ubuntu: "cubic-bezier(0.618, 0, 0.382, 1)";
};
/**
 * === BREAKPOINTS ===
 */
export declare const breakpoints: {
    readonly xs: "320px";
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
};
/**
 * === Z-INDEX SCALE ===
 */
export declare const zIndex: {
    readonly base: 0;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly fixed: 1200;
    readonly modalBackdrop: 1300;
    readonly modal: 1400;
    readonly popover: 1500;
    readonly tooltip: 1600;
};
/**
 * === COMPLETE SPACING SYSTEM ===
 */
export declare const spacingSystem: {
    readonly spacing: {
        readonly 0: "0px";
        readonly 1: "8px";
        readonly 2: "16px";
        readonly 3: "24px";
        readonly 4: "32px";
        readonly 5: "40px";
        readonly 6: "48px";
        readonly 8: "64px";
        readonly 12: "96px";
        readonly 16: "128px";
        readonly 20: "160px";
    };
    readonly radius: {
        readonly none: "0px";
        readonly sm: "0.125rem";
        readonly base: "0.25rem";
        readonly md: "0.375rem";
        readonly lg: "0.5rem";
        readonly xl: "0.75rem";
        readonly '2xl': "1rem";
        readonly '3xl': "1.5rem";
        readonly full: "9999px";
    };
    readonly shadows: {
        readonly sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
        readonly base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
        readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
        readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
        readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
        readonly '2xl': "0 25px 50px -12px rgb(0 0 0 / 0.25)";
        readonly inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
        /** Special: Azora Gem glow effect */
        readonly gem: "0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(16, 185, 129, 0.2), 0 0 60px rgba(239, 68, 68, 0.1)";
        readonly none: "none";
    };
    readonly duration: {
        readonly fast: "150ms";
        readonly normal: "300ms";
        readonly slow: "500ms";
        readonly slower: "700ms";
        readonly slowest: "1000ms";
    };
    readonly easing: {
        readonly linear: "linear";
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
        /** Ubuntu easing: Natural, organic motion */
        readonly ubuntu: "cubic-bezier(0.618, 0, 0.382, 1)";
    };
    readonly breakpoints: {
        readonly xs: "320px";
        readonly sm: "640px";
        readonly md: "768px";
        readonly lg: "1024px";
        readonly xl: "1280px";
        readonly '2xl': "1536px";
    };
    readonly zIndex: {
        readonly base: 0;
        readonly dropdown: 1000;
        readonly sticky: 1100;
        readonly fixed: 1200;
        readonly modalBackdrop: 1300;
        readonly modal: 1400;
        readonly popover: 1500;
        readonly tooltip: 1600;
    };
};
/**
 * === TYPE EXPORTS ===
 */
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type Duration = typeof duration;
export type Breakpoints = typeof breakpoints;
//# sourceMappingURL=spacing.d.ts.map