/**
 * @azora/branding
 * 
 * Azora OS Branding Package
 * World-Class Design System
 * 
 * Ubuntu Philosophy Meets Quantum Technology
 */

// Components
export { AzoraLogo } from './components/AzoraLogo';
export type { AzoraLogoProps, LogoVariant, LogoSize } from './components/AzoraLogo';

export { ServiceLogo } from './components/ServiceLogo';
export type { ServiceLogoProps, ServiceName } from './components/ServiceLogo';

export { ElaraAvatar } from './components/ElaraAvatar';
export type { ElaraAvatarProps, ElaraVariant, ElaraMood } from './components/ElaraAvatar';

export { MiningIcon } from './components/MiningIcon';
export type { 
  MiningIconProps, 
  MiningIconType, 
  AlgorithmName, 
  MultiplierLevel, 
  PowerMode, 
  MiningStatus 
} from './components/MiningIcon';

// Tokens
export { colors } from './tokens/colors';
export type { ColorPalette, PrimaryColor, AccentColor } from './tokens/colors';

export { typography } from './tokens/typography';
export type { Typography, FontWeight, FontSize } from './tokens/typography';

// Version
export const VERSION = '1.0.0';

// Brand Constants
export const BRAND = {
  name: 'Azora OS',
  tagline: 'Universal Human Infrastructure',
  philosophy: 'Ubuntu - I can because we can',
  motto: 'Built with intelligence, designed with purpose, inspired by Africa',
} as const;
