/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Service Branding Configuration
 *
 * Maps each service to its branding assets, colors, and styling
 */

export interface ServiceBrand {
  id: string;
  name: string;
  logo: string;
  favicon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  description: string;
  tagline: string;
}

export const SERVICE_BRANDS: Record<string, ServiceBrand> = {
  // Main App
  'app': {
    id: 'azora-os',
    name: 'Azora OS',
    logo: '/branding/logo-primary-pro.svg',
    favicon: '/favicon.svg',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    },
    description: 'The Living Operating System - Constitutional AI serving humanity',
    tagline: 'From Africa 🇿🇦 For Humanity 🌍',
  },

  // Sapiens - Education
  'sapiens': {
    id: 'sapiens',
    name: 'Azora Sapiens',
    logo: '/branding/services/azora-sapiens-logo.svg',
    favicon: '/branding/services/azora-sapiens-logo.svg',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#c084fc',
      gradient: 'from-purple-500 via-purple-600 to-cyan-500',
    },
    description: 'Universal Education Platform - Learn, Earn, Graduate Debt-Free',
    tagline: 'Knowledge grows like the mighty Baobab',
  },

  // Academy
  'synapse/academy-ui': {
    id: 'academy',
    name: 'Azora Academy',
    logo: '/branding/services/azora-education-logo.svg',
    favicon: '/branding/services/azora-education-logo.svg',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    },
    description: 'SAQA-accredited courses with AZR token rewards',
    tagline: 'African Intelligence Education',
  },

  // Atlas - Knowledge
  'synapse/atlas-ui': {
    id: 'atlas',
    name: 'Azora Atlas',
    logo: '/branding/services/azora-oracle-logo.svg',
    favicon: '/branding/services/azora-oracle-logo.svg',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#818cf8',
      gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    },
    description: 'Knowledge and Intelligence Platform',
    tagline: 'Ancient wisdom + Modern analytics',
  },

  // Council - Governance
  'synapse/council-ui': {
    id: 'council',
    name: 'Azora Council',
    logo: '/branding/services/azora-covenant-logo.svg',
    favicon: '/branding/services/azora-covenant-logo.svg',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#22d3ee',
      gradient: 'from-cyan-500 via-blue-600 to-purple-600',
    },
    description: 'Governance and Decision Platform',
    tagline: 'Justice rooted in African communal values',
  },

  // Pulse - Monitoring
  'synapse/pulse-ui': {
    id: 'pulse',
    name: 'Azora Pulse',
    logo: '/branding/services/azora-oracle-logo.svg',
    favicon: '/branding/services/azora-oracle-logo.svg',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#f472b6',
      gradient: 'from-pink-500 via-rose-600 to-purple-600',
    },
    description: 'Real-time Monitoring and Analytics Platform',
    tagline: 'Continuous insight and vigilance',
  },

  // Signal - Intelligence
  'synapse/signal-ui': {
    id: 'signal',
    name: 'Azora Signal',
    logo: '/branding/services/azora-nexus-logo.svg',
    favicon: '/branding/services/azora-nexus-logo.svg',
    colors: {
      primary: '#f472b6',
      secondary: '#ec4899',
      accent: '#fb7185',
      gradient: 'from-pink-500 via-purple-600 to-cyan-500',
    },
    description: 'Real-time signals, analytics, and intelligence for African markets',
    tagline: 'Pan-African AI consciousness',
  },

  // Vault - Security
  'synapse/vault-ui': {
    id: 'vault',
    name: 'Azora Vault',
    logo: '/branding/services/azora-aegis-logo.svg',
    favicon: '/branding/services/azora-aegis-logo.svg',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#f87171',
      gradient: 'from-red-600 via-orange-600 to-amber-600',
    },
    description: 'Secure Asset & Data Custody',
    tagline: 'Ancient warrior strength meets quantum security',
  },

  // Vigil - Security
  'synapse/vigil-ui': {
    id: 'vigil',
    name: 'Azora Vigil',
    logo: '/branding/services/azora-aegis-logo.svg',
    favicon: '/branding/services/azora-aegis-logo.svg',
    colors: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#f87171',
      gradient: 'from-red-700 via-red-600 to-orange-600',
    },
    description: 'Security and Threat Intelligence Platform',
    tagline: 'Vigilance through advanced security',
  },

  // Main App (Synapse)
  'synapse/main-app': {
    id: 'synapse-main',
    name: 'Azora Synapse',
    logo: '/branding/services/azora-synapse-logo.svg',
    favicon: '/branding/services/azora-synapse-logo.svg',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#22d3ee',
      gradient: 'from-cyan-500 via-blue-600 to-purple-600',
    },
    description: 'Africa\'s First Full Software Infrastructure',
    tagline: 'Traditional communication drums meet digital interfaces',
  },

  // Elara IDE
  'elara-ide': {
    id: 'elara-ide',
    name: 'Elara IDE',
    logo: '/branding/services/elara-ide-logo.svg',
    favicon: '/branding/services/elara-ide-logo.svg',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      gradient: 'from-purple-600 via-indigo-600 to-pink-600',
    },
    description: 'AI-Powered Development Platform',
    tagline: 'Intelligent development environment',
  },

  // Azora UI
  'azora-ui': {
    id: 'azora-ui',
    name: 'Azora Sapiens',
    logo: '/branding/services/azora-sapiens-logo.svg',
    favicon: '/branding/services/azora-sapiens-logo.svg',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#c084fc',
      gradient: 'from-purple-500 via-purple-600 to-cyan-500',
    },
    description: 'Get Paid to Learn',
    tagline: 'Transform education from cost to paid work',
  },

  // UI
  'ui': {
    id: 'ui',
    name: 'Azora UI',
    logo: '/branding/logo-primary-pro.svg',
    favicon: '/favicon.svg',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    },
    description: 'Azora User Interface',
    tagline: 'Premium UI Components',
  },

  // Marketplace
  'marketplace-ui': {
    id: 'forge',
    name: 'Azora Forge',
    logo: '/branding/services/azora-forge-logo.svg',
    favicon: '/branding/services/azora-forge-logo.svg',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      gradient: 'from-orange-500 via-red-600 to-purple-600',
    },
    description: 'Decentralized Marketplace',
    tagline: 'Building prosperity through African creativity',
  },

  // Pay UI
  'pay-ui': {
    id: 'pay',
    name: 'Azora Pay',
    logo: '/branding/services/azora-pay-logo.svg',
    favicon: '/branding/services/azora-pay-logo.svg',
    colors: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#4ade80',
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
    },
    description: 'Seamless Payment Processing',
    tagline: 'Secure financial transactions',
  },

  // Cloud UI
  'cloud-ui': {
    id: 'cloud',
    name: 'Azora Cloud',
    logo: '/branding/services/azora-workspace-logo.svg',
    favicon: '/branding/services/azora-workspace-logo.svg',
    colors: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      accent: '#60a5fa',
      gradient: 'from-blue-500 via-sky-600 to-cyan-600',
    },
    description: 'Cloud Infrastructure',
    tagline: 'Enterprise-grade cloud solutions',
  },

  // Dev UI
  'dev-ui': {
    id: 'dev',
    name: 'Azora Dev',
    logo: '/branding/services/elara-ide-logo.svg',
    favicon: '/branding/services/elara-ide-logo.svg',
    colors: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#818cf8',
      gradient: 'from-indigo-600 via-purple-600 to-blue-600',
    },
    description: 'Development Tools',
    tagline: 'Developer productivity platform',
  },

  // Enterprise UI
  'enterprise-ui': {
    id: 'enterprise',
    name: 'Azora Enterprise',
    logo: '/branding/logo-primary-pro.svg',
    favicon: '/favicon.svg',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      gradient: 'from-blue-600 via-cyan-600 to-blue-700',
    },
    description: 'Enterprise Solutions',
    tagline: 'Enterprise-grade infrastructure',
  },

  // Learn UI
  'learn-ui': {
    id: 'learn',
    name: 'Azora Learn',
    logo: '/branding/services/azora-education-logo.svg',
    favicon: '/branding/services/azora-education-logo.svg',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    },
    description: 'Learning Platform',
    tagline: 'Continuous learning and growth',
  },

  // Compliance UI
  'compliance-ui': {
    id: 'compliance',
    name: 'Azora Compliance',
    logo: '/branding/services/azora-covenant-logo.svg',
    favicon: '/branding/services/azora-covenant-logo.svg',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#22d3ee',
      gradient: 'from-cyan-500 via-blue-600 to-purple-600',
    },
    description: 'Compliance Dashboard',
    tagline: 'Ensuring regulatory compliance',
  },
};

export function getServiceBrand(servicePath: string): ServiceBrand {
  // Try exact match first
  if (SERVICE_BRANDS[servicePath]) {
    return SERVICE_BRANDS[servicePath];
  }

  // Try matching by key parts
  const key = Object.keys(SERVICE_BRANDS).find(key =>
    servicePath.includes(key) || key.includes(servicePath.split('/').pop() || '')
  );

  if (key) {
    return SERVICE_BRANDS[key];
  }

  // Default to main app
  return SERVICE_BRANDS['app'];
}



