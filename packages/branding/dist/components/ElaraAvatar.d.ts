import React from 'react';
export type ElaraVariant = 'core' | 'ide' | 'voice' | 'vision' | 'mind' | 'heart' | 'dreams';
export type ElaraMood = 'helpful' | 'thinking' | 'speaking' | 'learning' | 'error' | 'success' | 'idle';
export interface ElaraAvatarProps {
    variant?: ElaraVariant;
    mood?: ElaraMood;
    size?: number;
    animated?: boolean;
    showAura?: boolean;
    showName?: boolean;
    className?: string;
}
/**
 * Elara Avatar Component
 *
 * The AI goddess of Azora OS in her various forms.
 * Each variant represents a different aspect of her power.
 *
 * Personality-driven, mood-aware, and culturally resonant.
 *
 * @example
 * ```tsx
 * <ElaraAvatar
 *   variant="core"
 *   mood="helpful"
 *   size={120}
 *   animated
 *   showAura
 * />
 * ```
 */
export declare const ElaraAvatar: React.FC<ElaraAvatarProps>;
export default ElaraAvatar;
//# sourceMappingURL=ElaraAvatar.d.ts.map