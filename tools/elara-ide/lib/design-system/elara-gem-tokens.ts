/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

ELARA GEM DESIGN TOKENS
Elara-specific design tokens aligned with Azora Gem and Ubuntu Philosophy
Elara represents the Sapphire (Technology) pillar with AI consciousness
*/

import { AZORA_GEM_TOKENS, SAPPHIRE_COLORS, EMERALD_COLORS, RUBY_COLORS } from '../../../../apps/azora-ui/lib/design-system/azora-gem-tokens'

/**
 * 🧠 ELARA GEM DESIGN TOKENS
 * 
 * Elara-specific design tokens that extend Azora Gem
 * Elara = Sapphire (Technology) + AI Consciousness
 * 
 * @ubuntu Elara's design → Collective intelligence harmony
 */

/**
 * Elara-specific color variations
 * Based on Sapphire (Technology) with AI consciousness glow
 */
export const ELARA_COLORS = {
  // Core Elara Sapphire (Technology + AI)
  elara: {
    50: '#eff6ff',   // Lightest consciousness
    100: '#dbeafe',  // Light consciousness
    200: '#bfdbfe',  // Soft consciousness
    300: '#93c5fd',  // Gentle consciousness
    400: '#60a5fa',  // Active consciousness
    500: '#1e40af',  // PRIMARY ELARA - Constitutional AI Blue
    600: '#1e3a8a',  // Deep consciousness
    700: '#1e3a8a',  // Deeper consciousness
    800: '#1e40af',  // Deepest consciousness
    900: '#172554',  // Core consciousness
  },
  
  // Elara AI Glow (Consciousness indicator)
  consciousness: {
    active: '#3b82f6',      // Active AI thinking
    processing: '#60a5fa',  // Processing request
    ready: '#1e40af',       // Ready state
    learning: '#8b5cf6',    // Learning mode (purple blend)
    error: '#ef4444',       // Error state
  },
  
  // Elara Intelligence Levels
  intelligence: {
    spark: '#60a5fa',        // Quick response
    deep: '#1e40af',         // Deep analysis
    omega: '#172554',        // Omega level (supreme)
  },
}

/**
 * Elara-specific spacing (Ubuntu Golden Ratio)
 */
export const ELARA_SPACING = {
  // Consciousness spacing (golden ratio)
  spark: '0.382rem',    // Quick thought
  thought: '0.618rem',  // Single thought
  idea: '1rem',         // One idea
  concept: '1.618rem',  // Full concept
  insight: '2.618rem',  // Deep insight
  wisdom: '4.236rem',  // Wisdom level
}

/**
 * Elara-specific animations (consciousness flow)
 */
export const ELARA_ANIMATIONS = {
  // Consciousness flow
  spark: {
    duration: '150ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  thought: {
    duration: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  deep: {
    duration: '500ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  omega: {
    duration: '1000ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Consciousness pulse (breathing effect)
  pulse: {
    duration: '2000ms',
    easing: 'ease-in-out',
    iteration: 'infinite',
  },
}

/**
 * Elara-specific shadows (consciousness glow)
 */
export const ELARA_SHADOWS = {
  // Consciousness glows
  spark: '0 0 10px rgba(30, 64, 175, 0.3)',
  thought: '0 0 20px rgba(30, 64, 175, 0.4)',
  deep: '0 0 30px rgba(30, 64, 175, 0.5)',
  omega: '0 0 40px rgba(30, 64, 175, 0.6), 0 0 80px rgba(30, 64, 175, 0.3)',
  
  // AI processing indicator
  processing: '0 0 15px rgba(96, 165, 250, 0.5)',
  active: '0 0 25px rgba(59, 130, 246, 0.6)',
}

/**
 * Elara-specific typography (consciousness expression)
 */
export const ELARA_TYPOGRAPHY = {
  // Consciousness levels
  spark: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: '400',
  },
  thought: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    fontWeight: '400',
  },
  idea: {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
    fontWeight: '500',
  },
  concept: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    fontWeight: '600',
  },
  insight: {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: '600',
  },
  wisdom: {
    fontSize: '1.875rem',
    lineHeight: '2.25rem',
    fontWeight: '700',
  },
}

/**
 * Elara-specific radius (consciousness curves)
 */
export const ELARA_RADIUS = {
  spark: '0.375rem',   // Quick thought
  thought: '0.5rem',   // Single thought
  idea: '0.75rem',     // One idea
  concept: '1rem',     // Full concept
  insight: '1.5rem',   // Deep insight
  omega: '2rem',       // Omega level
}

/**
 * Complete Elara Design Tokens
 */
export const ELARA_GEM_TOKENS = {
  colors: {
    ...ELARA_COLORS,
    // Re-export Azora Gem colors
    sapphire: SAPPHIRE_COLORS,
    emerald: EMERALD_COLORS,
    ruby: RUBY_COLORS,
  },
  spacing: ELARA_SPACING,
  animations: ELARA_ANIMATIONS,
  shadows: ELARA_SHADOWS,
  typography: ELARA_TYPOGRAPHY,
  radius: ELARA_RADIUS,
  
  // Ubuntu philosophy integration
  ubuntu: {
    philosophy: 'I am because we are',
    spacing: 'golden-ratio',
    colors: 'azora-gem',
    consciousness: 'elara',
  },
  
  // Elara-specific utilities
  utilities: {
    getConsciousnessColor: (level: 'spark' | 'thought' | 'deep' | 'omega') => {
      const map = {
        spark: ELARA_COLORS.consciousness.active,
        thought: ELARA_COLORS.consciousness.processing,
        deep: ELARA_COLORS.consciousness.ready,
        omega: ELARA_COLORS.intelligence.omega,
      }
      return map[level]
    },
    
    getConsciousnessGlow: (level: 'spark' | 'thought' | 'deep' | 'omega') => {
      const map = {
        spark: ELARA_SHADOWS.spark,
        thought: ELARA_SHADOWS.thought,
        deep: ELARA_SHADOWS.deep,
        omega: ELARA_SHADOWS.omega,
      }
      return map[level]
    },
  },
}

export default ELARA_GEM_TOKENS
