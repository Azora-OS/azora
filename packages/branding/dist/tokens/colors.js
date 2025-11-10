/**
 * Azora OS Color Palette
 * Ubuntu Philosophy Meets Quantum Technology
 */
export const colors = {
    // Primary Colors - Core Brand Identity
    primary: {
        purple: '#8b5cf6',
        pink: '#ec4899',
        cyan: '#06b6d4',
        blue: '#0ea5e9',
    },
    // Accent Colors - Energy and Life
    accent: {
        gold: '#fbbf24',
        orange: '#f59e0b',
        green: '#10b981',
        red: '#ef4444',
    },
    // Background Colors - Depth and Space
    background: {
        dark: '#0f172a',
        darkAlt: '#1e293b',
        slate: '#334155',
        card: '#1e293b',
        hover: '#334155',
    },
    // Text Colors - Hierarchy and Readability
    text: {
        primary: '#ffffff',
        secondary: '#94a3b8',
        muted: '#64748b',
        disabled: '#475569',
    },
    // Service-Specific Colors
    services: {
        sapiens: { from: '#8b5cf6', to: '#06b6d4' }, // Education - Purple to Cyan
        forge: { from: '#f59e0b', to: '#ef4444' }, // Marketplace - Orange to Red
        covenant: { from: '#06b6d4', to: '#0ea5e9' }, // Legal - Cyan to Blue
        aegis: { from: '#ef4444', to: '#fbbf24' }, // Security - Red with Gold
        oracle: { from: '#8b5cf6', to: '#06b6d4' }, // Analytics - Purple to Cyan
        mint: { from: '#10b981', to: '#fbbf24' }, // Finance - Green to Gold
        nexus: { from: '#ec4899', to: '#8b5cf6' }, // AI Hub - Pink to Purple
        synapse: { from: '#06b6d4', to: '#8b5cf6' }, // Interface - Cyan to Purple
        pay: { from: '#10b981', to: '#06b6d4' }, // Payments - Green to Cyan
    },
    // Elara AI Family Colors
    elara: {
        core: { from: '#ec4899', to: '#8b5cf6', accent: '#fbbf24' }, // Pink-Purple-Gold
        ide: { from: '#06b6d4', to: '#8b5cf6', accent: '#10b981' }, // Cyan-Purple-Green
        voice: { from: '#f59e0b', to: '#ec4899', accent: '#06b6d4' }, // Orange-Pink-Cyan
        vision: { from: '#06b6d4', to: '#8b5cf6', accent: '#10b981' }, // Cyan-Purple-Green
        mind: { from: '#8b5cf6', to: '#ec4899', accent: '#fbbf24' }, // Purple-Pink-Gold
        heart: { from: '#ec4899', to: '#ef4444', accent: '#fbbf24' }, // Pink-Red-Gold
        dreams: { from: '#8b5cf6', to: '#06b6d4', accent: '#ec4899' }, // Purple-Cyan-Pink
    },
    // Status Colors
    status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
        idle: '#64748b',
    },
    // Mining Status Colors
    mining: {
        active: '#10b981',
        earning: '#fbbf24',
        idle: '#64748b',
        paused: '#f59e0b',
        error: '#ef4444',
    },
};
