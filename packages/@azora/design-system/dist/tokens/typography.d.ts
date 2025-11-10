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
export declare const fontFamily: {
    /** Primary font: Clean, modern, accessible */
    readonly primary: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    /** Secondary font: Wisdom and tradition */
    readonly secondary: "'Merriweather', 'Georgia', serif";
    /** Monospace font: Code and technical data */
    readonly mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";
    /** Ubuntu font: Cultural connection */
    readonly ubuntu: "'Ubuntu', 'Noto Sans', sans-serif";
};
/**
 * === FONT WEIGHTS ===
 */
export declare const fontWeight: {
    readonly light: "300";
    readonly regular: "400";
    readonly medium: "500";
    readonly semibold: "600";
    readonly bold: "700";
    readonly extrabold: "800";
    readonly black: "900";
};
/**
 * === FONT SIZES ===
 * Each size includes recommended line height and weight
 */
export declare const fontSize: {
    /** Hero text for landing pages */
    readonly hero: {
        readonly size: "90px";
        readonly lineHeight: "1.1";
        readonly weight: "900";
    };
    /** H1 - Page titles */
    readonly h1: {
        readonly size: "60px";
        readonly lineHeight: "1.2";
        readonly weight: "800";
    };
    /** H2 - Section headers */
    readonly h2: {
        readonly size: "45px";
        readonly lineHeight: "1.3";
        readonly weight: "700";
    };
    /** H3 - Subsections */
    readonly h3: {
        readonly size: "32px";
        readonly lineHeight: "1.4";
        readonly weight: "600";
    };
    /** H4 - Minor headings */
    readonly h4: {
        readonly size: "24px";
        readonly lineHeight: "1.5";
        readonly weight: "600";
    };
    /** H5 - Small headings */
    readonly h5: {
        readonly size: "20px";
        readonly lineHeight: "1.5";
        readonly weight: "600";
    };
    /** H6 - Tiny headings */
    readonly h6: {
        readonly size: "18px";
        readonly lineHeight: "1.5";
        readonly weight: "600";
    };
    /** Body large - Emphasized content */
    readonly bodyLarge: {
        readonly size: "18px";
        readonly lineHeight: "1.6";
        readonly weight: "400";
    };
    /** Body - Standard content */
    readonly body: {
        readonly size: "16px";
        readonly lineHeight: "1.6";
        readonly weight: "400";
    };
    /** Body small - Secondary content */
    readonly bodySmall: {
        readonly size: "14px";
        readonly lineHeight: "1.5";
        readonly weight: "400";
    };
    /** Caption - Metadata and labels */
    readonly caption: {
        readonly size: "14px";
        readonly lineHeight: "1.5";
        readonly weight: "400";
    };
    /** Tiny - Smallest readable text */
    readonly tiny: {
        readonly size: "12px";
        readonly lineHeight: "1.4";
        readonly weight: "500";
    };
    /** Micro - UI labels and badges */
    readonly micro: {
        readonly size: "10px";
        readonly lineHeight: "1.4";
        readonly weight: "500";
    };
};
/**
 * === LINE HEIGHTS ===
 */
export declare const lineHeight: {
    readonly tight: "1.25";
    readonly snug: "1.375";
    readonly normal: "1.5";
    readonly relaxed: "1.625";
    readonly loose: "2";
};
/**
 * === LETTER SPACING ===
 */
export declare const letterSpacing: {
    readonly tighter: "-0.05em";
    readonly tight: "-0.025em";
    readonly normal: "0";
    readonly wide: "0.025em";
    readonly wider: "0.05em";
    readonly widest: "0.1em";
};
/**
 * === COMPLETE TYPOGRAPHY SYSTEM ===
 */
export declare const typography: {
    readonly fontFamily: {
        /** Primary font: Clean, modern, accessible */
        readonly primary: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
        /** Secondary font: Wisdom and tradition */
        readonly secondary: "'Merriweather', 'Georgia', serif";
        /** Monospace font: Code and technical data */
        readonly mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";
        /** Ubuntu font: Cultural connection */
        readonly ubuntu: "'Ubuntu', 'Noto Sans', sans-serif";
    };
    readonly fontWeight: {
        readonly light: "300";
        readonly regular: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
        readonly extrabold: "800";
        readonly black: "900";
    };
    readonly fontSize: {
        /** Hero text for landing pages */
        readonly hero: {
            readonly size: "90px";
            readonly lineHeight: "1.1";
            readonly weight: "900";
        };
        /** H1 - Page titles */
        readonly h1: {
            readonly size: "60px";
            readonly lineHeight: "1.2";
            readonly weight: "800";
        };
        /** H2 - Section headers */
        readonly h2: {
            readonly size: "45px";
            readonly lineHeight: "1.3";
            readonly weight: "700";
        };
        /** H3 - Subsections */
        readonly h3: {
            readonly size: "32px";
            readonly lineHeight: "1.4";
            readonly weight: "600";
        };
        /** H4 - Minor headings */
        readonly h4: {
            readonly size: "24px";
            readonly lineHeight: "1.5";
            readonly weight: "600";
        };
        /** H5 - Small headings */
        readonly h5: {
            readonly size: "20px";
            readonly lineHeight: "1.5";
            readonly weight: "600";
        };
        /** H6 - Tiny headings */
        readonly h6: {
            readonly size: "18px";
            readonly lineHeight: "1.5";
            readonly weight: "600";
        };
        /** Body large - Emphasized content */
        readonly bodyLarge: {
            readonly size: "18px";
            readonly lineHeight: "1.6";
            readonly weight: "400";
        };
        /** Body - Standard content */
        readonly body: {
            readonly size: "16px";
            readonly lineHeight: "1.6";
            readonly weight: "400";
        };
        /** Body small - Secondary content */
        readonly bodySmall: {
            readonly size: "14px";
            readonly lineHeight: "1.5";
            readonly weight: "400";
        };
        /** Caption - Metadata and labels */
        readonly caption: {
            readonly size: "14px";
            readonly lineHeight: "1.5";
            readonly weight: "400";
        };
        /** Tiny - Smallest readable text */
        readonly tiny: {
            readonly size: "12px";
            readonly lineHeight: "1.4";
            readonly weight: "500";
        };
        /** Micro - UI labels and badges */
        readonly micro: {
            readonly size: "10px";
            readonly lineHeight: "1.4";
            readonly weight: "500";
        };
    };
    readonly lineHeight: {
        readonly tight: "1.25";
        readonly snug: "1.375";
        readonly normal: "1.5";
        readonly relaxed: "1.625";
        readonly loose: "2";
    };
    readonly letterSpacing: {
        readonly tighter: "-0.05em";
        readonly tight: "-0.025em";
        readonly normal: "0";
        readonly wide: "0.025em";
        readonly wider: "0.05em";
        readonly widest: "0.1em";
    };
};
/**
 * === TYPE EXPORTS ===
 */
export type Typography = typeof typography;
export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
//# sourceMappingURL=typography.d.ts.map