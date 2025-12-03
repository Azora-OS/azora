/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Premium Marketing Assets Generator
 * Creates sovereign, powerful logos and marketing materials for launch
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Premium Brand Palette
const PREMIUM_COLORS = {
  // Primary Sovereign Blues
  sovereignBlue: '#0A1A3A',
  deepOcean: '#0F2847',
  electricBlue: '#00D9FF',
  neonCyan: '#00F5FF',

  // Accent & Energy
  quantumGold: '#FFD700',
  energyOrange: '#FF6B35',
  successGreen: '#00FF88',
  warningAmber: '#FFB800',

  // Neutrals
  platinum: '#F5F5F5',
  titanium: '#E8E8E8',
  charcoal: '#1A1A1A',
  void: '#000000',

  // Service-Specific Accents
  aegis: '#0066FF',      // Shield blue
  mint: '#FFD700',      // Gold
  sapiens: '#00FF88',   // Growth green
  oracle: '#9D4EDD',    // Mystic purple
  nexus: '#00D9FF',     // Cyan
  forge: '#FF6B35',     // Fire orange
  covenant: '#6C5CE7',  // Royal purple
  scriptorium: '#F77F00', // Amber
  synapse: '#00F5FF',   // Electric cyan
  workspace: '#4ECDC4', // Teal
  elaraIde: '#7B2CBF',  // Deep purple
  elara: '#00D9FF',     // Neural cyan
};

// Premium Service Definitions
const PREMIUM_SERVICES = [
  {
    name: 'Azora OS',
    shortName: 'azora-os',
    tagline: 'Quantum-Secure Intelligence Ecosystem',
    description: 'Universal Human Infrastructure Platform',
    vision: 'Be Everywhere. Help Everyone. Solve Everything.',
    color: PREMIUM_COLORS.sovereignBlue,
    accent: PREMIUM_COLORS.electricBlue,
    category: 'Platform',
    icon: '🌍',
    symbol: 'diamond', // geometric symbol type
  },
  {
    name: 'Azora Aegis',
    shortName: 'aegis',
    tagline: 'Global Genesis Protocol',
    description: 'Security, Compliance & Sovereignty',
    vision: 'Protecting the Future of Trust',
    color: PREMIUM_COLORS.aegis,
    accent: PREMIUM_COLORS.electricBlue,
    category: 'Security',
    icon: '🛡️',
    symbol: 'shield',
  },
  {
    name: 'Azora Mint',
    shortName: 'mint',
    tagline: 'Economic Sovereignty Engine',
    description: 'Knowledge Rewards & Financial Infrastructure',
    vision: 'Value Creation, Not Extraction',
    color: PREMIUM_COLORS.mint,
    accent: PREMIUM_COLORS.energyOrange,
    category: 'Finance',
    icon: '💰',
    symbol: 'coin',
  },
  {
    name: 'Azora Sapiens',
    shortName: 'sapiens',
    tagline: 'Universal Education Platform',
    description: 'Complete K-12 to PhD Education with AI Tutors',
    vision: 'Learning as Paid Work',
    color: PREMIUM_COLORS.sapiens,
    accent: PREMIUM_COLORS.electricBlue,
    category: 'Education',
    icon: '🎓',
    symbol: 'star',
  },
  {
    name: 'Azora Oracle',
    shortName: 'oracle',
    tagline: 'Intelligence Oracle',
    description: 'Cognitive Simulation & Predictive Analytics',
    vision: 'Seeing Tomorrow, Today',
    color: PREMIUM_COLORS.oracle,
    accent: PREMIUM_COLORS.neonCyan,
    category: 'AI',
    icon: '🔮',
    symbol: 'crystal',
  },
  {
    name: 'Azora Nexus',
    shortName: 'nexus',
    tagline: 'AI Recommendations Hub',
    description: 'Neural Network & Intelligent Recommendations',
    vision: 'Connected Intelligence',
    color: PREMIUM_COLORS.nexus,
    accent: PREMIUM_COLORS.quantumGold,
    category: 'AI',
    icon: '🔗',
    symbol: 'network',
  },
  {
    name: 'Azora Forge',
    shortName: 'forge',
    tagline: 'Marketplace Platform',
    description: 'Decentralized Commerce & Services',
    vision: 'Shaping the Future of Trade',
    color: PREMIUM_COLORS.forge,
    accent: PREMIUM_COLORS.quantumGold,
    category: 'Marketplace',
    icon: '🔥',
    symbol: 'fire',
  },
  {
    name: 'Azora Covenant',
    shortName: 'covenant',
    tagline: 'Blockchain & Ledger',
    description: 'Proof of Compliance & Smart Contracts',
    vision: 'Trust Through Transparency',
    color: PREMIUM_COLORS.covenant,
    accent: PREMIUM_COLORS.electricBlue,
    category: 'Blockchain',
    icon: '⚖️',
    symbol: 'scale',
  },
  {
    name: 'Azora Scriptorium',
    shortName: 'scriptorium',
    tagline: 'Document Management',
    description: 'Content & Document Intelligence',
    vision: 'Knowledge Preserved, Wisdom Shared',
    color: PREMIUM_COLORS.scriptorium,
    accent: PREMIUM_COLORS.platinum,
    category: 'Content',
    icon: '📚',
    symbol: 'book',
  },
  {
    name: 'Azora Synapse',
    shortName: 'synapse',
    tagline: 'Platform Service',
    description: 'Enterprise Integration Platform',
    vision: 'Seamless Connectivity',
    color: PREMIUM_COLORS.synapse,
    accent: PREMIUM_COLORS.quantumGold,
    category: 'Platform',
    icon: '🧠',
    symbol: 'neural',
  },
  {
    name: 'Azora Workspace',
    shortName: 'workspace',
    tagline: 'Workspace Management',
    description: 'Collaborative Workspace Platform',
    vision: 'Productivity Unleashed',
    color: PREMIUM_COLORS.workspace,
    accent: PREMIUM_COLORS.electricBlue,
    category: 'Productivity',
    icon: '💼',
    symbol: 'cube',
  },
  {
    name: 'Elara IDE',
    shortName: 'elara-ide',
    tagline: 'AI-Powered Development',
    description: 'Intelligent Code Editor & Development Platform',
    vision: 'Code at the Speed of Thought',
    color: PREMIUM_COLORS.elaraIde,
    accent: PREMIUM_COLORS.neonCyan,
    category: 'Development',
    icon: '⚡',
    symbol: 'bolt',
  },
  {
    name: 'Elara AI',
    shortName: 'elara',
    tagline: 'Omniscient Consciousness',
    description: 'Constitutional AI System',
    vision: 'Intelligence with Integrity',
    color: PREMIUM_COLORS.elara,
    accent: PREMIUM_COLORS.quantumGold,
    category: 'AI',
    icon: '🧠',
    symbol: 'brain',
  },
];

// Generate Premium Geometric Logo (Style 1: Sovereign Geometric)
function generateGeometricLogo(service, size = 512) {
  const { shortName, name, color, accent, symbol } = service;
  const center = size / 2;
  const radius = size / 2 - 30;

  // Symbol paths based on type
  const symbolPaths = {
    diamond: `<polygon points="${center},${center-60} ${center+50},${center} ${center},${center+60} ${center-50},${center}" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>`,
    shield: `<path d="M ${center} ${center-80} L ${center-60} ${center-40} L ${center-60} ${center+40} L ${center} ${center+80} L ${center+60} ${center+40} L ${center+60} ${center-40} Z" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>`,
    coin: `<circle cx="${center}" cy="${center}" r="80" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>`,
    star: `<polygon points="${center},${center-70} ${center+20},${center-20} ${center+70},${center-20} ${center+30},${center+20} ${center+50},${center+70} ${center},${center+40} ${center-50},${center+70} ${center-30},${center+20} ${center-70},${center-20} ${center-20},${center-20} Z" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>`,
    crystal: `<polygon points="${center},${center-80} ${center+40},${center-10} ${center+60},${center+50} ${center},${center+80} ${center-60},${center+50} ${center-40},${center-10} Z" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>`,
    network: `<circle cx="${center-40}" cy="${center-40}" r="30" fill="${accent}" opacity="0.6"/>
              <circle cx="${center+40}" cy="${center-40}" r="30" fill="${accent}" opacity="0.6"/>
              <circle cx="${center-40}" cy="${center+40}" r="30" fill="${accent}" opacity="0.6"/>
              <circle cx="${center+40}" cy="${center+40}" r="30" fill="${accent}" opacity="0.6"/>
              <circle cx="${center}" cy="${center}" r="40" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>
              <line x1="${center-40}" y1="${center-40}" x2="${center+40}" y2="${center+40}" stroke="${accent}" stroke-width="2" opacity="0.4"/>
              <line x1="${center+40}" y1="${center-40}" x2="${center-40}" y2="${center+40}" stroke="${accent}" stroke-width="2" opacity="0.4"/>
              <line x1="${center}" y1="${center}" x2="${center-40}" y2="${center-40}" stroke="${accent}" stroke-width="2" opacity="0.4"/>
              <line x1="${center}" y1="${center}" x2="${center+40}" y2="${center-40}" stroke="${accent}" stroke-width="2" opacity="0.4"/>
              <line x1="${center}" y1="${center}" x2="${center-40}" y2="${center+40}" stroke="${accent}" stroke-width="2" opacity="0.4"/>
              <line x1="${center}" y1="${center}" x2="${center+40}" y2="${center+40}" stroke="${accent}" stroke-width="2" opacity="0.4"/>`,
    fire: `<path d="M ${center} ${center+60} Q ${center-30} ${center-20} ${center-20} ${center-50} Q ${center-50} ${center-40} ${center-40} ${center+20} Q ${center} ${center-10} ${center+40} ${center+20} Q ${center+50} ${center-40} ${center+20} ${center-50} Q ${center+30} ${center-20} ${center} ${center+60} Z" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>`,
    scale: `<rect x="${center-60}" y="${center-30}" width="120" height="20" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>
            <circle cx="${center-30}" cy="${center+40}" r="25" fill="${accent}" opacity="0.7"/>
            <circle cx="${center+30}" cy="${center+40}" r="25" fill="${accent}" opacity="0.7"/>
            <line x1="${center-30}" y1="${center+15}" x2="${center-30}" y2="${center+40}" stroke="${accent}" stroke-width="3"/>
            <line x1="${center+30}" y1="${center+15}" x2="${center+30}" y2="${center+40}" stroke="${accent}" stroke-width="3"/>`,
    book: `<rect x="${center-50}" y="${center-40}" width="100" height="80" fill="url(#symbolGrad-${shortName})" opacity="0.9" rx="5"/>
            <line x1="${center}" y1="${center-40}" x2="${center}" y2="${center+40}" stroke="${accent}" stroke-width="3"/>`,
    neural: `<circle cx="${center}" cy="${center}" r="70" fill="none" stroke="${accent}" stroke-width="3" opacity="0.6"/>
              <circle cx="${center-50}" cy="${center-50}" r="20" fill="${accent}" opacity="0.8"/>
              <circle cx="${center+50}" cy="${center-50}" r="20" fill="${accent}" opacity="0.8"/>
              <circle cx="${center-50}" cy="${center+50}" r="20" fill="${accent}" opacity="0.8"/>
              <circle cx="${center+50}" cy="${center+50}" r="20" fill="${accent}" opacity="0.8"/>
              <circle cx="${center}" cy="${center}" r="25" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>
              <line x1="${center}" y1="${center}" x2="${center-50}" y2="${center-50}" stroke="${accent}" stroke-width="2" opacity="0.5"/>
              <line x1="${center}" y1="${center}" x2="${center+50}" y2="${center-50}" stroke="${accent}" stroke-width="2" opacity="0.5"/>
              <line x1="${center}" y1="${center}" x2="${center-50}" y2="${center+50}" stroke="${accent}" stroke-width="2" opacity="0.5"/>
              <line x1="${center}" y1="${center}" x2="${center+50}" y2="${center+50}" stroke="${accent}" stroke-width="2" opacity="0.5"/>`,
    cube: `<path d="M ${center-50} ${center-50} L ${center+20} ${center-70} L ${center+90} ${center-30} L ${center+20} ${center+10} Z" fill="${color}" opacity="0.7"/>
            <path d="M ${center+20} ${center-70} L ${center+90} ${center-30} L ${center+90} ${center+50} L ${center+20} ${center+10} Z" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>
            <path d="M ${center-50} ${center-50} L ${center+20} ${center+10} L ${center+90} ${center+50} L ${center+20} ${center-10} Z" fill="${accent}" opacity="0.6"/>`,
    bolt: `<path d="M ${center} ${center-70} L ${center+40} ${center-10} L ${center+20} ${center-10} L ${center+30} ${center+70} L ${center-10} ${center+10} L ${center+10} ${center+10} Z" fill="url(#symbolGrad-${shortName})" opacity="0.9"/>`,
    brain: `<circle cx="${center}" cy="${center}" r="70" fill="url(#symbolGrad-${shortName})" opacity="0.8"/>
             <circle cx="${center-30}" cy="${center-30}" r="20" fill="${accent}" opacity="0.6"/>
             <circle cx="${center+30}" cy="${center-30}" r="20" fill="${accent}" opacity="0.6"/>
             <path d="M ${center-40} ${center+30} Q ${center} ${center+50} ${center+40} ${center+30}" stroke="${accent}" stroke-width="3" fill="none" opacity="0.6"/>`,
  };

  const symbolSVG = symbolPaths[symbol] || symbolPaths.diamond;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <!-- Outer Glow -->
    <radialGradient id="outerGrad-${shortName}" cx="50%" cy="50%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${PREMIUM_COLORS.charcoal};stop-opacity:0.8"/>
    </radialGradient>

    <!-- Symbol Gradient -->
    <linearGradient id="symbolGrad-${shortName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:1"/>
      <stop offset="50%" style="stop-color:${color};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${accent};stop-opacity:0.8"/>
    </linearGradient>

    <!-- Premium Glow Filter -->
    <filter id="premiumGlow-${shortName}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
      <feOffset in="blur" dx="0" dy="0" result="offsetBlur"/>
      <feFlood flood-color="${accent}" flood-opacity="0.5"/>
      <feComposite in2="offsetBlur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Inner Shadow -->
    <filter id="innerShadow-${shortName}">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="3" result="offset-blur"/>
      <feFlood flood-color="${PREMIUM_COLORS.void}" flood-opacity="0.3"/>
      <feComposite in2="offset-blur" operator="in"/>
    </filter>
  </defs>

  <!-- Background Circle with Premium Gradient -->
  <circle cx="${center}" cy="${center}" r="${radius + 5}"
          fill="url(#outerGrad-${shortName})"
          filter="url(#innerShadow-${shortName})"/>

  <!-- Inner Border Ring -->
  <circle cx="${center}" cy="${center}" r="${radius}"
          fill="none"
          stroke="${accent}"
          stroke-width="2"
          opacity="0.3"/>

  <!-- Quantum Pattern Overlay -->
  <g opacity="0.15">
    <circle cx="${center}" cy="${center-60}" r="4" fill="${accent}"/>
    <circle cx="${center-50}" cy="${center-30}" r="4" fill="${accent}"/>
    <circle cx="${center+50}" cy="${center-30}" r="4" fill="${accent}"/>
    <circle cx="${center-50}" cy="${center+30}" r="4" fill="${accent}"/>
    <circle cx="${center+50}" cy="${center+30}" r="4" fill="${accent}"/>
    <circle cx="${center}" cy="${center+60}" r="4" fill="${accent}"/>

    <line x1="${center}" y1="${center-60}" x2="${center-50}" y2="${center-30}" stroke="${accent}" stroke-width="1"/>
    <line x1="${center}" y1="${center-60}" x2="${center+50}" y2="${center-30}" stroke="${accent}" stroke-width="1"/>
    <line x1="${center-50}" y1="${center-30}" x2="${center-50}" y2="${center+30}" stroke="${accent}" stroke-width="1"/>
    <line x1="${center+50}" y1="${center-30}" x2="${center+50}" y2="${center+30}" stroke="${accent}" stroke-width="1"/>
    <line x1="${center}" y1="${center+60}" x2="${center-50}" y2="${center+30}" stroke="${accent}" stroke-width="1"/>
    <line x1="${center}" y1="${center+60}" x2="${center+50}" y2="${center+30}" stroke="${accent}" stroke-width="1"/>
  </g>

  <!-- Central Symbol -->
  <g filter="url(#premiumGlow-${shortName})">
    ${symbolSVG}
  </g>

  <!-- Service Name -->
  <text x="${center}" y="${size - 40}"
        font-size="${size/14}"
        font-weight="700"
        text-anchor="middle"
        fill="${PREMIUM_COLORS.platinum}"
        font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letter-spacing="2">
    ${name.toUpperCase()}
  </text>
</svg>`;
}

// Generate Premium Abstract Logo (Style 2: Modern Abstract)
function generateAbstractLogo(service, size = 512) {
  const { shortName, name, color, accent } = service;
  const center = size / 2;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="abstractGrad-${shortName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
      <stop offset="50%" style="stop-color:${accent};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${PREMIUM_COLORS.deepOcean};stop-opacity:1"/>
    </linearGradient>

    <radialGradient id="radialGrad-${shortName}" cx="50%" cy="50%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.4"/>
    </radialGradient>

    <filter id="abstractGlow-${shortName}">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${PREMIUM_COLORS.charcoal}"/>

  <!-- Abstract Shapes -->
  <g opacity="0.9" filter="url(#abstractGlow-${shortName})">
    <!-- Primary Shape -->
    <path d="M ${center-100} ${center-80}
             Q ${center} ${center-120} ${center+100} ${center-80}
             Q ${center+120} ${center} ${center+80} ${center+80}
             Q ${center} ${center+120} ${center-80} ${center+80}
             Q ${center-120} ${center} ${center-100} ${center-80} Z"
          fill="url(#abstractGrad-${shortName})"/>

    <!-- Overlay Shapes -->
    <circle cx="${center-60}" cy="${center-60}" r="40" fill="url(#radialGrad-${shortName})"/>
    <circle cx="${center+60}" cy="${center+60}" r="40" fill="url(#radialGrad-${shortName})"/>

    <!-- Accent Lines -->
    <line x1="${center-80}" y1="${center-40}" x2="${center+80}" y2="${center+40}"
          stroke="${accent}" stroke-width="3" opacity="0.6"/>
    <line x1="${center+80}" y1="${center-40}" x2="${center-80}" y2="${center+40}"
          stroke="${accent}" stroke-width="3" opacity="0.6"/>
  </g>

  <!-- Service Name -->
  <text x="${center}" y="${size - 50}"
        font-size="${size/12}"
        font-weight="800"
        text-anchor="middle"
        fill="${PREMIUM_COLORS.platinum}"
        font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        letter-spacing="3">
    ${name.toUpperCase()}
  </text>
</svg>`;
}

// Generate Premium Minimalist Logo (Style 3: Clean & Powerful)
function generateMinimalistLogo(service, size = 512) {
  const { shortName, name, color, accent, icon } = service;
  const center = size / 2;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="minimalGrad-${shortName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${color};stop-opacity:1"/>
    </linearGradient>
  </defs>

  <!-- Clean Background -->
  <rect width="${size}" height="${size}" fill="${PREMIUM_COLORS.void}" rx="${size/10}"/>

  <!-- Minimalist Border -->
  <rect x="40" y="40" width="${size-80}" height="${size-80}"
        fill="none"
        stroke="url(#minimalGrad-${shortName})"
        stroke-width="4"
        rx="${size/15}"/>

  <!-- Icon -->
  <text x="${center}" y="${center + size/20}"
        font-size="${size/3}"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="url(#minimalGrad-${shortName})">
    ${icon}
  </text>

  <!-- Service Name - Clean Typography -->
  <text x="${center}" y="${size - 60}"
        font-size="${size/11}"
        font-weight="600"
        text-anchor="middle"
        fill="${PREMIUM_COLORS.platinum}"
        font-family="Inter, system-ui, sans-serif"
        letter-spacing="4">
    ${name.toUpperCase()}
  </text>
</svg>`;
}

// Generate Premium Poster HTML
function generatePremiumPoster(service) {
  const { name, tagline, description, vision, color, accent } = service;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - ${tagline}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${PREMIUM_COLORS.charcoal};
      color: ${PREMIUM_COLORS.platinum};
      overflow: hidden;
      width: 1920px;
      height: 1080px;
    }

    .poster {
      width: 1920px;
      height: 1080px;
      position: relative;
      background: linear-gradient(135deg, ${PREMIUM_COLORS.charcoal} 0%, ${color}15 50%, ${PREMIUM_COLORS.charcoal} 100%);
      overflow: hidden;
    }

    /* Animated Quantum Grid Background */
    .quantum-grid {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image:
        linear-gradient(${accent}20 1px, transparent 1px),
        linear-gradient(90deg, ${accent}20 1px, transparent 1px);
      background-size: 80px 80px;
      animation: gridMove 20s linear infinite;
      opacity: 0.3;
    }

    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(80px, 80px); }
    }

    /* Floating Particles */
    .particles {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: ${accent};
      border-radius: 50%;
      opacity: 0.6;
      animation: float 15s infinite ease-in-out;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.6; }
      50% { transform: translateY(-100px) translateX(50px); opacity: 1; }
    }

    .content {
      position: relative;
      z-index: 10;
      padding: 120px 100px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
    }

    .brand-badge {
      position: absolute;
      top: 60px;
      right: 80px;
      font-size: 24px;
      font-weight: 700;
      color: ${accent};
      letter-spacing: 6px;
      text-transform: uppercase;
    }

    .service-name {
      font-size: 140px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 30px;
      background: linear-gradient(135deg, ${color}, ${accent});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 80px ${color}40;
      letter-spacing: -4px;
    }

    .tagline {
      font-size: 56px;
      font-weight: 700;
      color: ${accent};
      margin-bottom: 50px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .description {
      font-size: 36px;
      line-height: 1.6;
      color: ${PREMIUM_COLORS.platinum}CC;
      margin-bottom: 40px;
      max-width: 1000px;
      font-weight: 400;
    }

    .vision {
      font-size: 32px;
      font-weight: 600;
      color: ${accent};
      font-style: italic;
      margin-top: 60px;
      padding-left: 40px;
      border-left: 4px solid ${accent};
      max-width: 900px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      margin-top: 80px;
      width: 100%;
      max-width: 1400px;
    }

    .feature-card {
      padding: 40px;
      background: ${color}15;
      border: 2px solid ${accent}40;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      border-color: ${accent};
    }

    .feature-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }

    .feature-title {
      font-size: 24px;
      font-weight: 700;
      color: ${accent};
      margin-bottom: 10px;
    }

    .feature-desc {
      font-size: 18px;
      color: ${PREMIUM_COLORS.platinum}AA;
      line-height: 1.5;
    }

    .footer {
      position: absolute;
      bottom: 60px;
      left: 100px;
      right: 100px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 24px;
      color: ${PREMIUM_COLORS.platinum}80;
    }

    .tagline-line {
      font-size: 32px;
      font-weight: 600;
      color: ${accent};
      letter-spacing: 4px;
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="quantum-grid"></div>

    <div class="particles">
      ${Array.from({length: 20}, (_, i) =>
        `<div class="particle" style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 15}s;"></div>`
      ).join('')}
    </div>

    <div class="brand-badge">AZORA OS</div>

    <div class="content">
      <h1 class="service-name">${name}</h1>
      <div class="tagline">${tagline}</div>
      <div class="description">${description}</div>

      <div class="vision">"${vision}"</div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <div class="feature-title">Enterprise Grade</div>
          <div class="feature-desc">Built for scale, designed for performance</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <div class="feature-title">Quantum Secure</div>
          <div class="feature-desc">Military-grade encryption and protection</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🌍</div>
          <div class="feature-title">Planetary Scale</div>
          <div class="feature-desc">Deploy anywhere, connect everywhere</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="tagline-line">Be Everywhere. Help Everyone. Solve Everything.</div>
      <div>azora.world</div>
    </div>
  </div>
</body>
</html>`;
}

// Generate Social Media Assets
function generateSocialAssets(service) {
  const { shortName, name, tagline, color, accent } = service;

  return {
    instagram: generateInstagramPost(service),
    twitter: generateTwitterHeader(service),
    linkedin: generateLinkedInBanner(service),
    facebook: generateFacebookCover(service),
  };
}

function generateInstagramPost(service) {
  const { name, tagline, description, color, accent } = service;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${name} - Instagram</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 1080px;
      height: 1080px;
      background: linear-gradient(135deg, ${PREMIUM_COLORS.charcoal} 0%, ${color}20 100%);
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: ${PREMIUM_COLORS.platinum};
      position: relative;
      overflow: hidden;
    }
    .content {
      text-align: center;
      z-index: 10;
      padding: 80px;
    }
    h1 {
      font-size: 96px;
      font-weight: 900;
      margin-bottom: 30px;
      background: linear-gradient(135deg, ${color}, ${accent});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .tagline {
      font-size: 42px;
      font-weight: 700;
      color: ${accent};
      margin-bottom: 40px;
    }
    .description {
      font-size: 28px;
      line-height: 1.6;
      color: ${PREMIUM_COLORS.platinum}CC;
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>${name}</h1>
    <div class="tagline">${tagline}</div>
    <div class="description">${description}</div>
  </div>
</body>
</html>`;
}

function generateTwitterHeader(service) {
  // Similar structure for Twitter 1500x500
  return generateInstagramPost(service); // Simplified - can be expanded
}

function generateLinkedInBanner(service) {
  // Similar structure for LinkedIn 1584x396
  return generateInstagramPost(service); // Simplified - can be expanded
}

function generateFacebookCover(service) {
  // Similar structure for Facebook 820x312
  return generateInstagramPost(service); // Simplified - can be expanded
}

// Main Generation Function
function generateAllPremiumAssets() {
  const outputDir = path.join(__dirname, '..', 'marketing', 'premium');

  // Create directory structure
  const dirs = [
    outputDir,
    path.join(outputDir, 'logos', 'geometric'),
    path.join(outputDir, 'logos', 'abstract'),
    path.join(outputDir, 'logos', 'minimalist'),
    path.join(outputDir, 'logos', 'icons'),
    path.join(outputDir, 'posters'),
    path.join(outputDir, 'social', 'instagram'),
    path.join(outputDir, 'social', 'twitter'),
    path.join(outputDir, 'social', 'linkedin'),
    path.join(outputDir, 'social', 'facebook'),
    path.join(outputDir, 'brand-guidelines'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  console.log('🎨 Generating PREMIUM marketing assets for Azora OS...\n');
  console.log('🚀 Creating sovereign, powerful designs...\n');

  for (const service of PREMIUM_SERVICES) {
    console.log(`\n✨ ${service.name.toUpperCase()}`);
    console.log(`   Creating premium assets...`);

    // Generate all logo styles
    const geometric = generateGeometricLogo(service, 512);
    fs.writeFileSync(path.join(outputDir, 'logos', 'geometric', `${service.shortName}-geometric.svg`), geometric);
    console.log(`   ✓ Geometric Logo`);

    const abstract = generateAbstractLogo(service, 512);
    fs.writeFileSync(path.join(outputDir, 'logos', 'abstract', `${service.shortName}-abstract.svg`), abstract);
    console.log(`   ✓ Abstract Logo`);

    const minimalist = generateMinimalistLogo(service, 512);
    fs.writeFileSync(path.join(outputDir, 'logos', 'minimalist', `${service.shortName}-minimalist.svg`), minimalist);
    console.log(`   ✓ Minimalist Logo`);

    // Generate icons (smaller versions)
    const iconGeo = generateGeometricLogo(service, 128);
    fs.writeFileSync(path.join(outputDir, 'logos', 'icons', `${service.shortName}-icon-geometric.svg`), iconGeo);
    const iconMin = generateMinimalistLogo(service, 128);
    fs.writeFileSync(path.join(outputDir, 'logos', 'icons', `${service.shortName}-icon-minimalist.svg`), iconMin);
    console.log(`   ✓ Icons (2 styles)`);

    // Generate premium poster
    const poster = generatePremiumPoster(service);
    fs.writeFileSync(path.join(outputDir, 'posters', `${service.shortName}-premium-poster.html`), poster);
    console.log(`   ✓ Premium Poster`);

    // Generate social assets
    const social = generateSocialAssets(service);
    fs.writeFileSync(path.join(outputDir, 'social', 'instagram', `${service.shortName}-instagram.html`), social.instagram);
    fs.writeFileSync(path.join(outputDir, 'social', 'twitter', `${service.shortName}-twitter.html`), social.twitter);
    fs.writeFileSync(path.join(outputDir, 'social', 'linkedin', `${service.shortName}-linkedin.html`), social.linkedin);
    fs.writeFileSync(path.join(outputDir, 'social', 'facebook', `${service.shortName}-facebook.html`), social.facebook);
    console.log(`   ✓ Social Media Assets (4 platforms)`);
  }

  // Generate brand guidelines
  const brandGuidelines = generateBrandGuidelines();
  fs.writeFileSync(path.join(outputDir, 'brand-guidelines', 'BRAND_GUIDELINES.md'), brandGuidelines);
  fs.writeFileSync(path.join(outputDir, 'brand-guidelines', 'COLOR_PALETTE.md'), generateColorPalette());

  console.log('\n\n🎉 PREMIUM ASSETS GENERATED SUCCESSFULLY!');
  console.log(`📁 Output: ${outputDir}`);
  console.log('\n📊 Summary:');
  console.log(`   • ${PREMIUM_SERVICES.length} services`);
  console.log(`   • 3 logo styles per service (geometric, abstract, minimalist)`);
  console.log(`   • 2 icon styles per service`);
  console.log(`   • Premium posters (1920x1080px)`);
  console.log(`   • Social media assets (4 platforms)`);
  console.log(`   • Brand guidelines`);
  console.log('\n🚀 Ready for launch!');
}

function generateBrandGuidelines() {
  return `# Azora OS Brand Guidelines

## Sovereign. Powerful. Unstoppable.

This document outlines the brand identity and usage guidelines for Azora OS - the quantum-secure intelligence ecosystem.

## Brand Essence

**Azora OS** represents:
- **Sovereignty**: Complete independence and self-determination
- **Power**: Enterprise-grade, planetary-scale capabilities
- **Innovation**: Cutting-edge AI and quantum-secure technology
- **Trust**: Constitutional governance and transparent operations

## Logo Usage

### Primary Logos
We provide three distinct logo styles:

1. **Geometric**: Sovereign, structured, powerful
2. **Abstract**: Modern, dynamic, innovative
3. **Minimalist**: Clean, professional, timeless

### Usage Rules
- Always maintain minimum clear space (20% of logo height)
- Use on backgrounds with sufficient contrast
- Do not distort or rotate logos
- Maintain aspect ratio when resizing
- SVG format preferred for scalability

## Color System

See COLOR_PALETTE.md for complete color specifications.

### Primary Colors
- **Sovereign Blue**: ${PREMIUM_COLORS.sovereignBlue}
- **Electric Blue**: ${PREMIUM_COLORS.electricBlue}
- **Neon Cyan**: ${PREMIUM_COLORS.neonCyan}

### Accent Colors
- **Quantum Gold**: ${PREMIUM_COLORS.quantumGold}
- **Energy Orange**: ${PREMIUM_COLORS.energyOrange}
- **Success Green**: ${PREMIUM_COLORS.successGreen}

## Typography

### Primary Font
**Inter** - Modern, professional, highly readable

### Usage
- Headlines: Inter 900 (Black)
- Subheadings: Inter 700 (Bold)
- Body: Inter 400 (Regular)
- Captions: Inter 600 (Semi-Bold)

## Voice & Tone

- **Confident**: We know what we're building
- **Visionary**: We see the future
- **Sovereign**: We own our destiny
- **Professional**: Enterprise-grade communication

## Vision Statement

**"Be Everywhere. Help Everyone. Solve Everything."**

This vision should be prominently featured in all marketing materials.

---

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
`;
}

function generateColorPalette() {
  return `# Azora OS Color Palette

## Primary Sovereign Palette

\`\`\`
Sovereign Blue:  ${PREMIUM_COLORS.sovereignBlue}  (#0A1A3A)
Deep Ocean:      ${PREMIUM_COLORS.deepOcean}      (#0F2847)
Electric Blue:   ${PREMIUM_COLORS.electricBlue}   (#00D9FF)
Neon Cyan:       ${PREMIUM_COLORS.neonCyan}       (#00F5FF)
\`\`\`

## Accent & Energy

\`\`\`
Quantum Gold:    ${PREMIUM_COLORS.quantumGold}    (#FFD700)
Energy Orange:   ${PREMIUM_COLORS.energyOrange}    (#FF6B35)
Success Green:   ${PREMIUM_COLORS.successGreen}   (#00FF88)
Warning Amber:   ${PREMIUM_COLORS.warningAmber}   (#FFB800)
\`\`\`

## Neutrals

\`\`\`
Platinum:        ${PREMIUM_COLORS.platinum}       (#F5F5F5)
Titanium:        ${PREMIUM_COLORS.titanium}       (#E8E8E8)
Charcoal:        ${PREMIUM_COLORS.charcoal}       (#1A1A1A)
Void:            ${PREMIUM_COLORS.void}           (#000000)
\`\`\`

## Service-Specific Colors

Each service has its own accent color while maintaining brand consistency.

---
`;
}

// Run generator
generateAllPremiumAssets();

export { PREMIUM_COLORS, PREMIUM_SERVICES, generateGeometricLogo, generateAbstractLogo, generateMinimalistLogo, generatePremiumPoster };
