/**
 * Elara AI Avatar Component
 * The goddess of Constitutional AI
 * 7 variants from packages/public/branding
 */
import * as React from 'react';
export type ElaraVariant = 'core' | 'ide' | 'voice' | 'vision' | 'mind' | 'heart' | 'dreams';
export type ElaraMood = 'helpful' | 'thinking' | 'speaking' | 'learning' | 'error' | 'success';
export type ElaraSize = 'sm' | 'md' | 'lg' | 'xl' | number;
export interface ElaraAvatarProps {
    variant?: ElaraVariant;
    mood?: ElaraMood;
    size?: ElaraSize;
    showName?: boolean;
    showAura?: boolean;
    animated?: boolean;
    className?: string;
}
/**
 * Elara AI Avatar Component
 *
 * @example
 * ```tsx
 * <ElaraAvatar variant="core" mood="helpful" size="lg" showName showAura />
 * <ElaraAvatar variant="ide" size={120} animated />
 * ```
 */
export declare const ElaraAvatar: React.ForwardRefExoticComponent<ElaraAvatarProps & React.RefAttributes<HTMLDivElement>>;
export default ElaraAvatar;
//# sourceMappingURL=ElaraAvatar.d.ts.map