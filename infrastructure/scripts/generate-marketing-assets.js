/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Marketing Assets Generator (JavaScript version)
 * Generates logos, posters, and marketing materials for all services
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Azora OS Brand Colors
const BRAND_COLORS = {
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  secondary: '#0369a1',
  accent: '#38bdf8',
  accentCyan: '#06b6d4',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#0c3d66',
  surface: '#075985',
  foreground: '#ffffff',
};

// Service Definitions with metadata
const SERVICES = [
  {
    name: 'Azora OS',
    shortName: 'azora',
    tagline: 'Quantum-Secure Intelligence Ecosystem',
    description: 'Universal Human Infrastructure Platform',
    icon: '🌍',
    color: BRAND_COLORS.primary,
    category: 'Platform',
  },
  {
    name: 'Azora Aegis',
    shortName: 'aegis',
    tagline: 'Global Genesis Protocol',
    description: 'Security, Compliance & Sovereignty',
    icon: '🛡️',
    color: BRAND_COLORS.primaryDark,
    category: 'Security',
  },
  {
    name: 'Azora Mint',
    shortName: 'mint',
    tagline: 'Economic Sovereignty Engine',
    description: 'Knowledge Rewards & Financial Infrastructure',
    icon: '💰',
    color: BRAND_COLORS.warning,
    category: 'Finance',
  },
  {
    name: 'Azora Sapiens',
    shortName: 'sapiens',
    tagline: 'Universal Education Platform',
    description: 'Complete K-12 to PhD Education with AI Tutors',
    icon: '🎓',
    color: BRAND_COLORS.success,
    category: 'Education',
  },
  {
    name: 'Azora Oracle',
    shortName: 'oracle',
    tagline: 'Intelligence Oracle',
    description: 'Cognitive Simulation & Predictive Analytics',
    icon: '🔮',
    color: BRAND_COLORS.accent,
    category: 'AI',
  },
  {
    name: 'Azora Nexus',
    shortName: 'nexus',
    tagline: 'AI Recommendations Hub',
    description: 'Neural Network & Intelligent Recommendations',
    icon: '🔗',
    color: BRAND_COLORS.accentCyan,
    category: 'AI',
  },
  {
    name: 'Azora Forge',
    shortName: 'forge',
    tagline: 'Marketplace Platform',
    description: 'Decentralized Commerce & Services',
    icon: '🔥',
    color: BRAND_COLORS.danger,
    category: 'Marketplace',
  },
  {
    name: 'Azora Covenant',
    shortName: 'covenant',
    tagline: 'Blockchain & Ledger',
    description: 'Proof of Compliance & Smart Contracts',
    icon: '⚖️',
    color: BRAND_COLORS.secondary,
    category: 'Blockchain',
  },
  {
    name: 'Azora Scriptorium',
    shortName: 'scriptorium',
    tagline: 'Document Management',
    description: 'Content & Document Intelligence',
    icon: '📚',
    color: BRAND_COLORS.secondary,
    category: 'Content',
  },
  {
    name: 'Azora Synapse',
    shortName: 'synapse',
    tagline: 'Platform Service',
    description: 'Enterprise Integration Platform',
    icon: '🧠',
    color: BRAND_COLORS.primary,
    category: 'Platform',
  },
  {
    name: 'Azora Workspace',
    shortName: 'workspace',
    tagline: 'Workspace Management',
    description: 'Collaborative Workspace Platform',
    icon: '💼',
    color: BRAND_COLORS.accent,
    category: 'Productivity',
  },
  {
    name: 'Elara IDE',
    shortName: 'elara-ide',
    tagline: 'AI-Powered Development',
    description: 'Intelligent Code Editor & Development Platform',
    icon: '⚡',
    color: BRAND_COLORS.accentCyan,
    category: 'Development',
  },
  {
    name: 'Elara AI',
    shortName: 'elara',
    tagline: 'Omniscient Consciousness',
    description: 'Constitutional AI System',
    icon: '🧠',
    color: BRAND_COLORS.primary,
    category: 'AI',
  },
];

// Generate SVG Logo
function generateSVGLogo(service, size = 512) {
  const { name, shortName, icon, color } = service;

  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${shortName}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${BRAND_COLORS.accent};stop-opacity:1" />
    </linearGradient>
    <filter id="glow-${shortName}">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background Circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 20}"
          fill="url(#grad-${shortName})"
          opacity="0.9"
          filter="url(#glow-${shortName})"/>

  <!-- Neural Network Pattern -->
  <g opacity="0.3">
    <circle cx="${size/2}" cy="${size/3}" r="8" fill="${BRAND_COLORS.foreground}"/>
    <circle cx="${size/3}" cy="${size/2}" r="8" fill="${BRAND_COLORS.foreground}"/>
    <circle cx="${size*2/3}" cy="${size/2}" r="8" fill="${BRAND_COLORS.foreground}"/>
    <circle cx="${size/2}" cy="${size*2/3}" r="8" fill="${BRAND_COLORS.foreground}"/>

    <line x1="${size/2}" y1="${size/3}" x2="${size/3}" y2="${size/2}"
          stroke="${BRAND_COLORS.foreground}" stroke-width="2"/>
    <line x1="${size/2}" y1="${size/3}" x2="${size*2/3}" y2="${size/2}"
          stroke="${BRAND_COLORS.foreground}" stroke-width="2"/>
    <line x1="${size/3}" y1="${size/2}" x2="${size/2}" y2="${size*2/3}"
          stroke="${BRAND_COLORS.foreground}" stroke-width="2"/>
    <line x1="${size*2/3}" y1="${size/2}" x2="${size/2}" y2="${size*2/3}"
          stroke="${BRAND_COLORS.foreground}" stroke-width="2"/>
  </g>

  <!-- Icon/Emoji (centered) -->
  <text x="${size/2}" y="${size/2 + size/10}"
        font-size="${size/3}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, sans-serif"
        fill="${BRAND_COLORS.foreground}">
    ${icon}
  </text>

  <!-- Service Name -->
  <text x="${size/2}" y="${size - size/6}"
        font-size="${size/12}"
        font-weight="bold"
        text-anchor="middle"
        fill="${BRAND_COLORS.foreground}"
        font-family="Inter, system-ui, sans-serif">
    ${name.toUpperCase()}
  </text>
</svg>`.trim();
}

// Generate Marketing Poster HTML
function generatePosterHTML(service) {
  const { name, tagline, description, icon, color } = service;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - ${tagline}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, ${BRAND_COLORS.background} 0%, ${BRAND_COLORS.surface} 100%);
      color: ${BRAND_COLORS.foreground};
      overflow: hidden;
    }

    .poster {
      width: 1920px;
      height: 1080px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, ${color}15 0%, ${BRAND_COLORS.background} 100%);
    }

    .neural-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.1;
      background-image:
        radial-gradient(circle at 20% 50%, ${color}40 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, ${BRAND_COLORS.accent}40 0%, transparent 50%);
    }

    .content {
      position: relative;
      z-index: 10;
      text-align: center;
      padding: 80px;
      max-width: 1200px;
    }

    .icon {
      font-size: 200px;
      margin-bottom: 40px;
      filter: drop-shadow(0 0 40px ${color}80);
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    h1 {
      font-size: 120px;
      font-weight: 900;
      margin-bottom: 30px;
      background: linear-gradient(135deg, ${color}, ${BRAND_COLORS.accent});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 60px ${color}40;
      letter-spacing: -2px;
    }

    .tagline {
      font-size: 48px;
      font-weight: 600;
      color: ${BRAND_COLORS.accent};
      margin-bottom: 40px;
      letter-spacing: 2px;
    }

    .description {
      font-size: 32px;
      line-height: 1.6;
      color: ${BRAND_COLORS.foreground}CC;
      margin-bottom: 60px;
    }

    .features {
      display: flex;
      gap: 40px;
      justify-content: center;
      margin-top: 60px;
    }

    .feature {
      padding: 30px;
      background: ${color}20;
      border: 2px solid ${color}40;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      min-width: 250px;
    }

    .feature-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .feature-text {
      font-size: 24px;
      font-weight: 600;
    }

    .footer {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24px;
      color: ${BRAND_COLORS.foreground}80;
      text-align: center;
    }

    .azora-logo {
      position: absolute;
      top: 40px;
      right: 40px;
      font-size: 32px;
      font-weight: 700;
      color: ${BRAND_COLORS.accent};
      letter-spacing: 4px;
    }
  </style>
</head>
<body>
  <div class="poster">
    <div class="neural-bg"></div>
    <div class="azora-logo">AZORA OS</div>

    <div class="content">
      <div class="icon">${icon}</div>
      <h1>${name}</h1>
      <div class="tagline">${tagline}</div>
      <div class="description">${description}</div>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">🚀</div>
          <div class="feature-text">Enterprise Grade</div>
        </div>
        <div class="feature">
          <div class="feature-icon">🔒</div>
          <div class="feature-text">Quantum Secure</div>
        </div>
        <div class="feature">
          <div class="feature-icon">🌍</div>
          <div class="feature-text">Planetary Scale</div>
        </div>
      </div>
    </div>

    <div class="footer">
      Be Everywhere. Help Everyone. Solve Everything.
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Generate Video Script
function generateVideoScript(service) {
  const { name, tagline, description, icon, category } = service;

  return `
# ${name} - Video Script

## Video Metadata
- **Duration**: 60-90 seconds
- **Style**: Modern, Tech-forward, Inspirational
- **Target Audience**: Enterprise Decision Makers, Developers, Innovators

## Script Structure

### OPENING (0-10s)
[VISUAL: Animated neural network with ${icon} icon emerging]
[NARRATION]
"In a world of complexity, ${name} brings clarity."

### PROBLEM (10-20s)
[VISUAL: Split screen showing challenges in ${category.toLowerCase()})
[NARRATION]
"${category} shouldn't be complicated. But outdated systems, security gaps, and fragmented solutions create barriers to innovation."

### SOLUTION (20-50s)
[VISUAL: ${name} interface animations, key features]
[NARRATION]
"${name} — ${tagline}. ${description}"

[VISUAL: Feature highlights]
"Enterprise-grade security. Quantum-secure infrastructure. Planetary-scale deployment."

### BENEFITS (50-70s)
[VISUAL: Success metrics, user testimonials, integration flows]
[NARRATION]
"Join thousands of organizations transforming their operations with ${name}. Built for today. Ready for tomorrow."

### CLOSING (70-90s)
[VISUAL: Azora OS logo, call-to-action]
[NARRATION]
"${name} by Azora OS. Constitutional AI for Planetary Economic Flourishing."
[CTA]
"Visit azora.world to learn more."

## Visual Elements
- Neural network animations
- ${icon} icon as central motif
- Modern UI mockups
- Data visualization
- Integration diagrams
- Success stories/use cases

## Music/Sound
- Upbeat, tech-forward electronic music
- Subtle neural network sounds
- Professional voiceover (neutral, confident)

## Call-to-Action
"Start your transformation today at azora.world/${name.toLowerCase().replace(/\s+/g, '-')}"

---
Generated by Azora OS Marketing Assets Generator
  `.trim();
}

// Main Generation Function
function generateAllAssets() {
  const outputDir = path.join(__dirname, '..', 'marketing', 'generated');

  // Create directories
  const dirs = [
    outputDir,
    path.join(outputDir, 'logos'),
    path.join(outputDir, 'posters'),
    path.join(outputDir, 'video-scripts'),
    path.join(outputDir, 'social'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  console.log('🎨 Generating marketing assets for Azora OS services...\n');

  for (const service of SERVICES) {
    console.log(`📦 Generating assets for ${service.name}...`);

    // Generate SVG Logo
    const svgLogo = generateSVGLogo(service, 512);
    const logoPath = path.join(outputDir, 'logos', `${service.shortName}-logo.svg`);
    fs.writeFileSync(logoPath, svgLogo);
    console.log(`   ✓ Logo: ${logoPath}`);

    // Generate Icon (smaller version)
    const iconSvg = generateSVGLogo(service, 128);
    const iconPath = path.join(outputDir, 'logos', `${service.shortName}-icon.svg`);
    fs.writeFileSync(iconPath, iconSvg);
    console.log(`   ✓ Icon: ${iconPath}`);

    // Generate Poster HTML
    const posterHTML = generatePosterHTML(service);
    const posterPath = path.join(outputDir, 'posters', `${service.shortName}-poster.html`);
    fs.writeFileSync(posterPath, posterHTML);
    console.log(`   ✓ Poster: ${posterPath}`);

    // Generate Video Script
    const videoScript = generateVideoScript(service);
    const scriptPath = path.join(outputDir, 'video-scripts', `${service.shortName}-video-script.md`);
    fs.writeFileSync(scriptPath, videoScript);
    console.log(`   ✓ Video Script: ${scriptPath}`);
  }

  // Generate main Azora OS assets
  console.log(`\n🌍 Generating main Azora OS assets...`);
  const mainService = SERVICES[0];

  const mainLogo = generateSVGLogo(mainService, 512);
  fs.writeFileSync(path.join(outputDir, 'logos', 'azora-os-logo.svg'), mainLogo);

  const mainPoster = generatePosterHTML(mainService);
  fs.writeFileSync(path.join(outputDir, 'posters', 'azora-os-poster.html'), mainPoster);

  console.log('\n✅ All marketing assets generated successfully!');
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('\n📝 Next Steps:');
  console.log('   1. Convert SVG logos to PNG/WebP for web use');
  console.log('   2. Render poster HTML to images using puppeteer or similar');
  console.log('   3. Use video scripts to create promotional videos');
  console.log('   4. Customize assets as needed for specific campaigns');
}

// Run the generator
generateAllAssets();

export { BRAND_COLORS, generateAllAssets, generatePosterHTML, generateSVGLogo, generateVideoScript, SERVICES };

