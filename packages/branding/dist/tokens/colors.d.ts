/**
 * Azora OS Color Palette
 * Ubuntu Philosophy Meets Quantum Technology
 */
export declare const colors: {
    readonly primary: {
        readonly purple: "#8b5cf6";
        readonly pink: "#ec4899";
        readonly cyan: "#06b6d4";
        readonly blue: "#0ea5e9";
    };
    readonly accent: {
        readonly gold: "#fbbf24";
        readonly orange: "#f59e0b";
        readonly green: "#10b981";
        readonly red: "#ef4444";
    };
    readonly background: {
        readonly dark: "#0f172a";
        readonly darkAlt: "#1e293b";
        readonly slate: "#334155";
        readonly card: "#1e293b";
        readonly hover: "#334155";
    };
    readonly text: {
        readonly primary: "#ffffff";
        readonly secondary: "#94a3b8";
        readonly muted: "#64748b";
        readonly disabled: "#475569";
    };
    readonly services: {
        readonly sapiens: {
            readonly from: "#8b5cf6";
            readonly to: "#06b6d4";
        };
        readonly forge: {
            readonly from: "#f59e0b";
            readonly to: "#ef4444";
        };
        readonly covenant: {
            readonly from: "#06b6d4";
            readonly to: "#0ea5e9";
        };
        readonly aegis: {
            readonly from: "#ef4444";
            readonly to: "#fbbf24";
        };
        readonly oracle: {
            readonly from: "#8b5cf6";
            readonly to: "#06b6d4";
        };
        readonly mint: {
            readonly from: "#10b981";
            readonly to: "#fbbf24";
        };
        readonly nexus: {
            readonly from: "#ec4899";
            readonly to: "#8b5cf6";
        };
        readonly synapse: {
            readonly from: "#06b6d4";
            readonly to: "#8b5cf6";
        };
        readonly pay: {
            readonly from: "#10b981";
            readonly to: "#06b6d4";
        };
    };
    readonly elara: {
        readonly core: {
            readonly from: "#ec4899";
            readonly to: "#8b5cf6";
            readonly accent: "#fbbf24";
        };
        readonly ide: {
            readonly from: "#06b6d4";
            readonly to: "#8b5cf6";
            readonly accent: "#10b981";
        };
        readonly voice: {
            readonly from: "#f59e0b";
            readonly to: "#ec4899";
            readonly accent: "#06b6d4";
        };
        readonly vision: {
            readonly from: "#06b6d4";
            readonly to: "#8b5cf6";
            readonly accent: "#10b981";
        };
        readonly mind: {
            readonly from: "#8b5cf6";
            readonly to: "#ec4899";
            readonly accent: "#fbbf24";
        };
        readonly heart: {
            readonly from: "#ec4899";
            readonly to: "#ef4444";
            readonly accent: "#fbbf24";
        };
        readonly dreams: {
            readonly from: "#8b5cf6";
            readonly to: "#06b6d4";
            readonly accent: "#ec4899";
        };
    };
    readonly status: {
        readonly success: "#10b981";
        readonly warning: "#f59e0b";
        readonly error: "#ef4444";
        readonly info: "#06b6d4";
        readonly idle: "#64748b";
    };
    readonly mining: {
        readonly active: "#10b981";
        readonly earning: "#fbbf24";
        readonly idle: "#64748b";
        readonly paused: "#f59e0b";
        readonly error: "#ef4444";
    };
};
export type ColorPalette = typeof colors;
export type PrimaryColor = keyof typeof colors.primary;
export type AccentColor = keyof typeof colors.accent;
export type ServiceName = keyof typeof colors.services;
export type ElaraVariant = keyof typeof colors.elara;
//# sourceMappingURL=colors.d.ts.map