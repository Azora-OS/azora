/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Marketing Assets Configuration
 * Centralized asset paths and service metadata
 */

export type LogoStyle = 'geometric' | 'abstract' | 'minimalist';
export type LogoSize = 'icon' | 'small' | 'medium' | 'large' | 'full';

export interface ServiceAsset {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
  category: string;
}

export const SERVICES: ServiceAsset[] = [
  {
    name: 'Azora OS',
    shortName: 'azora-os',
    tagline: 'Quantum-Secure Intelligence Ecosystem',
    description: 'Universal Human Infrastructure Platform',
    color: '#0A1A3A',
    accent: '#00D9FF',
    icon: '🌍',
    category: 'Platform',
  },
  {
    name: 'Azora Aegis',
    shortName: 'aegis',
    tagline: 'Global Genesis Protocol',
    description: 'Security, Compliance & Sovereignty',
    color: '#0066FF',
    accent: '#00D9FF',
    icon: '🛡️',
    category: 'Security',
  },
  {
    name: 'Azora Mint',
    shortName: 'mint',
    tagline: 'Economic Sovereignty Engine',
    description: 'Knowledge Rewards & Financial Infrastructure',
    color: '#FFD700',
    accent: '#FF6B35',
    icon: '💰',
    category: 'Finance',
  },
  {
    name: 'Azora Sapiens',
    shortName: 'sapiens',
    tagline: 'Universal Education Platform',
    description: 'Complete K-12 to PhD Education with AI Tutors',
    color: '#00FF88',
    accent: '#00D9FF',
    icon: '🎓',
    category: 'Education',
  },
  {
    name: 'Azora Oracle',
    shortName: 'oracle',
    tagline: 'Intelligence Oracle',
    description: 'Cognitive Simulation & Predictive Analytics',
    color: '#9D4EDD',
    accent: '#00F5FF',
    icon: '🔮',
    category: 'AI',
  },
  {
    name: 'Azora Nexus',
    shortName: 'nexus',
    tagline: 'AI Recommendations Hub',
    description: 'Neural Network & Intelligent Recommendations',
    color: '#00D9FF',
    accent: '#FFD700',
    icon: '🔗',
    category: 'AI',
  },
  {
    name: 'Azora Forge',
    shortName: 'forge',
    tagline: 'Marketplace Platform',
    description: 'Decentralized Commerce & Services',
    color: '#FF6B35',
    accent: '#FFD700',
    icon: '🔥',
    category: 'Marketplace',
  },
  {
    name: 'Azora Covenant',
    shortName: 'covenant',
    tagline: 'Blockchain & Ledger',
    description: 'Proof of Compliance & Smart Contracts',
    color: '#6C5CE7',
    accent: '#00D9FF',
    icon: '⚖️',
    category: 'Blockchain',
  },
  {
    name: 'Azora Scriptorium',
    shortName: 'scriptorium',
    tagline: 'Document Management',
    description: 'Content & Document Intelligence',
    color: '#F77F00',
    accent: '#F5F5F5',
    icon: '📚',
    category: 'Content',
  },
  {
    name: 'Azora Synapse',
    shortName: 'synapse',
    tagline: 'Platform Service',
    description: 'Enterprise Integration Platform',
    color: '#00F5FF',
    accent: '#FFD700',
    icon: '🧠',
    category: 'Platform',
  },
  {
    name: 'Azora Workspace',
    shortName: 'workspace',
    tagline: 'Workspace Management',
    description: 'Collaborative Workspace Platform',
    color: '#4ECDC4',
    accent: '#00D9FF',
    icon: '💼',
    category: 'Productivity',
  },
  {
    name: 'Elara IDE',
    shortName: 'elara-ide',
    tagline: 'AI-Powered Development',
    description: 'Intelligent Code Editor & Development Platform',
    color: '#7B2CBF',
    accent: '#00F5FF',
    icon: '⚡',
    category: 'Development',
  },
  {
    name: 'Elara AI',
    shortName: 'elara',
    tagline: 'Omniscient Consciousness',
    description: 'Constitutional AI System',
    color: '#00D9FF',
    accent: '#FFD700',
    icon: '🧠',
    category: 'AI',
  },
];

/**
 * Get logo path for a service
 */
export function getLogoPath(
  shortName: string,
  style: LogoStyle = 'geometric',
  size: LogoSize = 'full'
): string {
  if (size === 'icon') {
    return `/images/icons/${shortName}-icon-${style === 'geometric' ? 'geometric' : 'minimalist'}.svg`;
  }
  
  return `/images/logos/premium/${shortName}-${style}.svg`;
}

/**
 * Get service metadata by short name
 */
export function getService(shortName: string): ServiceAsset | undefined {
  return SERVICES.find((s) => s.shortName === shortName);
}

/**
 * Get all services by category
 */
export function getServicesByCategory(category: string): ServiceAsset[] {
  return SERVICES.filter((s) => s.category === category);
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(SERVICES.map((s) => s.category)));
}

/**
 * Get poster path for a service
 */
export function getPosterPath(shortName: string): string {
  return `/marketing/premium/posters/${shortName}-premium-poster.html`;
}

/**
 * Get social media asset path
 */
export function getSocialAssetPath(
  shortName: string,
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook'
): string {
  return `/marketing/premium/social/${platform}/${shortName}-${platform}.html`;
}



