/**
 * Azora OS Typography System
 * Professional, Modern, Accessible
 */
export declare const typography: {
    readonly fontFamily: {
        readonly primary: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
        readonly mono: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace";
    };
    readonly fontWeight: {
        readonly regular: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
        readonly extrabold: 800;
        readonly black: 900;
    };
    readonly fontSize: {
        readonly hero: "90px";
        readonly display: "72px";
        readonly h1: "60px";
        readonly h2: "45px";
        readonly h3: "32px";
        readonly h4: "24px";
        readonly h5: "20px";
        readonly h6: "18px";
        readonly body: "16px";
        readonly bodyLarge: "18px";
        readonly bodySmall: "14px";
        readonly caption: "14px";
        readonly label: "12px";
        readonly tiny: "10px";
    };
    readonly lineHeight: {
        readonly tight: 1.2;
        readonly normal: 1.5;
        readonly relaxed: 1.75;
        readonly loose: 2;
    };
    readonly letterSpacing: {
        readonly tighter: "-0.03em";
        readonly tight: "-0.02em";
        readonly normal: "-0.01em";
        readonly wide: "0.02em";
        readonly wider: "0.05em";
    };
};
export type Typography = typeof typography;
export type FontWeight = keyof typeof typography.fontWeight;
export type FontSize = keyof typeof typography.fontSize;
//# sourceMappingURL=typography.d.ts.map