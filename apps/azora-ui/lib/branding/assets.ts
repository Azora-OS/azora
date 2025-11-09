/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

BRANDING ASSETS - Centralized asset paths
Chief Architect Approval: Sizwe Ngwenya ✨
*/

/**
 * 💎 AZORA BRANDING ASSETS
 * 
 * Centralized paths to all branding assets
 * Used throughout the premium UI system
 */

const BRANDING_BASE = '/packages/public/branding'

/**
 * Main Logos
 */
export const LOGOS = {
  primary: `${BRANDING_BASE}/logo-primary.svg`,
  primaryPro: `${BRANDING_BASE}/logo-primary-pro.svg`,
  white: `${BRANDING_BASE}/logo-white.svg`,
  black: `${BRANDING_BASE}/logo-black.svg`,
  animated: `${BRANDING_BASE}/animated/logo-intro.svg`,
} as const

/**
 * App Icons
 */
export const ICONS = {
  appPremium: `${BRANDING_BASE}/icon-app-premium.svg`,
  square: `${BRANDING_BASE}/icon-square.svg`,
  app512: `${BRANDING_BASE}/icons/app-icon-512.svg`,
  app1024: `${BRANDING_BASE}/icons/app-icon-1024.svg`,
  favicon: '/packages/public/azora-favicon.svg',
} as const

/**
 * Service Logos - Azora Services
 */
export const SERVICE_LOGOS = {
  // Core Services
  aegis: `${BRANDING_BASE}/services/azora-aegis-logo.svg`,
  careers: `${BRANDING_BASE}/services/azora-careers-logo.svg`,
  classroom: `${BRANDING_BASE}/services/azora-classroom-logo.svg`,
  community: `${BRANDING_BASE}/services/azora-community-logo.svg`,
  covenant: `${BRANDING_BASE}/services/azora-covenant-logo.svg`,
  education: `${BRANDING_BASE}/services/azora-education-logo.svg`,
  forge: `${BRANDING_BASE}/services/azora-forge-logo.svg`,
  innovationHub: `${BRANDING_BASE}/services/azora-innovation-hub-logo.svg`,
  library: `${BRANDING_BASE}/services/azora-library-logo.svg`,
  mint: `${BRANDING_BASE}/services/azora-mint-logo.svg`,
  mintMine: `${BRANDING_BASE}/services/azora-mint-mine-logo.svg`,
  nexus: `${BRANDING_BASE}/services/azora-nexus-logo.svg`,
  oracle: `${BRANDING_BASE}/services/azora-oracle-logo.svg`,
  pay: `${BRANDING_BASE}/services/azora-pay-logo.svg`,
  researchCenter: `${BRANDING_BASE}/services/azora-research-center-logo.svg`,
  sapiens: `${BRANDING_BASE}/services/azora-sapiens-logo.svg`,
  scriptorium: `${BRANDING_BASE}/services/azora-scriptorium-logo.svg`,
  studentLife: `${BRANDING_BASE}/services/azora-student-life-logo.svg`,
  synapse: `${BRANDING_BASE}/services/azora-synapse-logo.svg`,
  workspace: `${BRANDING_BASE}/services/azora-workspace-logo.svg`,
} as const

/**
 * Elara Family Logos
 */
export const ELARA_LOGOS = {
  elara: `${BRANDING_BASE}/services/elara-logo.svg`,
  dreams: `${BRANDING_BASE}/services/elara-dreams-logo.svg`,
  heart: `${BRANDING_BASE}/services/elara-heart-logo.svg`,
  ide: `${BRANDING_BASE}/services/elara-ide-logo.svg`,
  mind: `${BRANDING_BASE}/services/elara-mind-logo.svg`,
  vision: `${BRANDING_BASE}/services/elara-vision-logo.svg`,
  voice: `${BRANDING_BASE}/services/elara-voice-logo.svg`,
} as const

/**
 * Marketing Assets
 */
export const MARKETING = {
  posterLaunch: `${BRANDING_BASE}/poster-launch.svg`,
  posterProfessional: `${BRANDING_BASE}/poster-professional.svg`,
  adSquare: `${BRANDING_BASE}/marketing/ad-square-1080.svg`,
  instagramStory: `${BRANDING_BASE}/marketing/instagram-story.svg`,
  socialCardTwitter: `${BRANDING_BASE}/social-card-twitter.svg`,
} as const

/**
 * Social Media Assets
 */
export const SOCIAL = {
  linkedinBanner: `${BRANDING_BASE}/social/linkedin-banner.svg`,
  twitterHeader: `${BRANDING_BASE}/social/twitter-header.svg`,
  twitterProfile: `${BRANDING_BASE}/social/twitter-profile.svg`,
  youtubeThumbnail: `${BRANDING_BASE}/social/youtube-thumbnail.svg`,
} as const

/**
 * UI Assets
 */
export const UI_ASSETS = {
  splash: `${BRANDING_BASE}/splash/loading-screen.svg`,
  emailHeader: `${BRANDING_BASE}/email/email-header.svg`,
  slideBackground: `${BRANDING_BASE}/presentations/slide-background.svg`,
  stickerCircle: `${BRANDING_BASE}/stickers/sticker-circle.svg`,
  bannerGithub: `${BRANDING_BASE}/banner-github.svg`,
} as const

/**
 * Mining Icons
 */
export const MINING_ICONS = {
  algorithms: {
    azr: `${BRANDING_BASE}/icons/mining/algorithms/algo-azr.svg`,
    erg: `${BRANDING_BASE}/icons/mining/algorithms/algo-erg.svg`,
    iron: `${BRANDING_BASE}/icons/mining/algorithms/algo-iron.svg`,
    kas: `${BRANDING_BASE}/icons/mining/algorithms/algo-kas.svg`,
    xmr: `${BRANDING_BASE}/icons/mining/algorithms/algo-xmr.svg`,
  },
  multipliers: {
    x1: `${BRANDING_BASE}/icons/mining/multipliers/multiplier-1x.svg`,
    x2: `${BRANDING_BASE}/icons/mining/multipliers/multiplier-2x.svg`,
    x3: `${BRANDING_BASE}/icons/mining/multipliers/multiplier-3x.svg`,
    x4: `${BRANDING_BASE}/icons/mining/multipliers/multiplier-4x.svg`,
    x5: `${BRANDING_BASE}/icons/mining/multipliers/multiplier-5x.svg`,
  },
  powerModes: {
    balanced: `${BRANDING_BASE}/icons/mining/power-modes/mode-balanced.svg`,
    beast: `${BRANDING_BASE}/icons/mining/power-modes/mode-beast.svg`,
    stealth: `${BRANDING_BASE}/icons/mining/power-modes/mode-stealth.svg`,
    turbo: `${BRANDING_BASE}/icons/mining/power-modes/mode-turbo.svg`,
  },
  status: {
    active: `${BRANDING_BASE}/icons/mining/status/mining-active.svg`,
    earning: `${BRANDING_BASE}/icons/mining/status/mining-earning.svg`,
    error: `${BRANDING_BASE}/icons/mining/status/mining-error.svg`,
    idle: `${BRANDING_BASE}/icons/mining/status/mining-idle.svg`,
    paused: `${BRANDING_BASE}/icons/mining/status/mining-paused.svg`,
  },
} as const

/**
 * Complete Branding Assets
 */
export const BRANDING_ASSETS = {
  logos: LOGOS,
  icons: ICONS,
  services: SERVICE_LOGOS,
  elara: ELARA_LOGOS,
  marketing: MARKETING,
  social: SOCIAL,
  ui: UI_ASSETS,
  mining: MINING_ICONS,
} as const

/**
 * Helper: Get logo by theme
 */
export function getLogo(theme: 'light' | 'dark' | 'primary' | 'pro' = 'primary'): string {
  switch (theme) {
    case 'light':
      return LOGOS.white
    case 'dark':
      return LOGOS.black
    case 'pro':
      return LOGOS.primaryPro
    default:
      return LOGOS.primary
  }
}

/**
 * Helper: Get service logo
 */
export function getServiceLogo(service: keyof typeof SERVICE_LOGOS): string {
  return SERVICE_LOGOS[service]
}

/**
 * Helper: Get Elara logo
 */
export function getElaraLogo(variant: keyof typeof ELARA_LOGOS = 'elara'): string {
  return ELARA_LOGOS[variant]
}

export default BRANDING_ASSETS
