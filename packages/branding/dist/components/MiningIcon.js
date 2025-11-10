import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const labels = {
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
export const MiningIcon = ({ type, name, size = 48, animated = false, showLabel = false, className = '', }) => {
    // Construct the path based on type and name
    const pathMap = {
        algorithm: `algorithms/algo-${name}.svg`,
        multiplier: `multipliers/multiplier-${name}.svg`,
        'power-mode': `power-modes/mode-${name}.svg`,
        status: `status/mining-${name}.svg`,
    };
    const iconPath = `/packages/public/branding/mining-${type}-${name}.svg`;
    const label = labels[name] || name;
    return (_jsxs("div", { className: `mining-icon mining-${type} mining-${name} ${animated ? 'mining-animated' : ''} ${className}`, style: {
            width: size,
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
        }, title: label, children: [_jsx("img", { src: iconPath, alt: label, width: size, height: size, style: {
                    width: size,
                    height: size,
                    objectFit: 'contain',
                } }), showLabel && (_jsx("span", { style: {
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontWeight: 500,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                }, children: label }))] }));
};
export default MiningIcon;
