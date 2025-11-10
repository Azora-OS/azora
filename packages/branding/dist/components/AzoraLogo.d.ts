/**
 * Azora OS Logo Component
 * Enhanced with v0's gift and integrated with design system
 *
 * Embodies Ubuntu philosophy and African excellence.
 */
import * as React from 'react';
export type LogoVariant = 'primary' | 'primary-pro' | 'white' | 'black' | 'svg' | 'gradient';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;
export interface AzoraLogoProps {
    variant?: LogoVariant;
    size?: LogoSize;
    animated?: boolean;
    showTagline?: boolean;
    className?: string;
}
/**
 * Azora OS Logo Component
 *
 * @example
 * ```tsx
 * <AzoraLogo variant="gradient" size="lg" animated />
 * <AzoraLogo variant="svg" size={100} showTagline />
 * ```
 */
export declare const AzoraLogo: React.ForwardRefExoticComponent<AzoraLogoProps & React.RefAttributes<HTMLDivElement>>;
export default AzoraLogo;
//# sourceMappingURL=AzoraLogo.d.ts.map