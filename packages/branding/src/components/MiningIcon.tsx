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

const labels: Record<string, string> = {
  // Algorithms
  azr: 'AZR Algorithm',
  erg: 'ERG Algorithm',
  iron: 'IRON Algorithm',
  kas: 'KAS Algorithm',
  xmr: 'XMR Algorithm',
  
  // Multipliers
  '1x': '1x Multiplier',
  '2x': '2x Multiplier',
  '3x': '3x Multiplier',
  '4x': '4x Multiplier',
  '5x': '5x Multiplier',
  
  // Power Modes
  balanced: 'Balanced Mode',
  turbo: 'Turbo Mode',
  beast: 'Beast Mode',
  stealth: 'Stealth Mode',
  
  // Status
  active: 'Mining Active',
  earning: 'Earning Rewards',
  idle: 'Mining Idle',
  paused: 'Mining Paused',
  error: 'Mining Error',
};

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
export const MiningIcon: React.FC<MiningIconProps> = ({
  type,
  name,
  size = 48,
  animated = false,
  showLabel = false,
  className = '',
}) => {
  // Construct the path based on type and name
  const pathMap: Record<MiningIconType, string> = {
    algorithm: `algorithms/algo-${name}.svg`,
    multiplier: `multipliers/multiplier-${name}.svg`,
    'power-mode': `power-modes/mode-${name}.svg`,
    status: `status/mining-${name}.svg`,
  };

  const iconPath = `/packages/public/branding/mining-${type}-${name}.svg`;
  const label = labels[name] || name;

  return (
    <div 
      className={`mining-icon mining-${type} mining-${name} ${animated ? 'mining-animated' : ''} ${className}`}
      style={{ 
        width: size, 
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
      }}
      title={label}
    >
      <img
        src={iconPath}
        alt={label}
        width={size}
        height={size}
        style={{ 
          width: size, 
          height: size, 
          objectFit: 'contain',
        }}
      />
      {showLabel && (
        <span style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          fontWeight: 500,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default MiningIcon;
