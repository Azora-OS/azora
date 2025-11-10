import React from 'react';
export type MiningIconType = 'algorithm' | 'multiplier' | 'power-mode' | 'status';
export type AlgorithmName = 'azr' | 'erg' | 'iron' | 'kas' | 'xmr';
export type MultiplierLevel = '1x' | '2x' | '3x' | '4x' | '5x';
export type PowerMode = 'balanced' | 'turbo' | 'beast' | 'stealth';
export type MiningStatus = 'active' | 'earning' | 'idle' | 'paused' | 'error';
export interface MiningIconProps {
    type: MiningIconType;
    name: AlgorithmName | MultiplierLevel | PowerMode | MiningStatus;
    size?: number;
    animated?: boolean;
    showLabel?: boolean;
    className?: string;
}
/**
 * Mining Icon Component
 *
 * Displays icons for mining-related UI elements:
 * - Algorithms (AZR, ERG, IRON, KAS, XMR)
 * - Multipliers (1x-5x)
 * - Power Modes (Balanced, Turbo, Beast, Stealth)
 * - Status Indicators (Active, Earning, Idle, Paused, Error)
 *
 * @example
 * ```tsx
 * <MiningIcon type="algorithm" name="azr" size={48} animated />
 * <MiningIcon type="status" name="active" size={32} showLabel />
 * ```
 */
export declare const MiningIcon: React.FC<MiningIconProps>;
export default MiningIcon;
//# sourceMappingURL=MiningIcon.d.ts.map