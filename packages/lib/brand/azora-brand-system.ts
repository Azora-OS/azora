/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🌟 AZORA OS - OFFICIAL BRAND SYSTEM
 * 
 * Complete brand identity system integrating official brand guidelines
 * with living organism design principles.
 * 
 * "Where Intelligence Meets Infinity" - Azora OS
 */

export const azoraColors = {
  // Primary Brand Colors
  azoraBlue: {
    50: '#e6f0ff',
    100: '#b3d9ff',
    200: '#80c2ff',
    300: '#4dabff',
    400: '#1a94ff',
    500: '#0066FF', // Primary Azora Blue
    600: '#0052cc',
    700: '#003d99',
    800: '#002966',
    900: '#001433',
  },
  
  neuralPurple: {
    50: '#f3f0ff',
    100: '#e0d7ff',
    200: '#c4b5f7',
    300: '#a893ef',
    400: '#8d6de8',
    500: '#6B46C1', // Neural Purple
    600: '#5636a0',
    700: '#422780',
    800: '#2d1960',
    900: '#190c40',
  },
  
  quantumGreen: {
    50: '#e6fff5',
    100: '#b3ffe0',
    200: '#80ffcb',
    300: '#4dffb6',
    400: '#1affa1',
    500: '#10B981', // Quantum Green
    600: '#0d9668',
    700: '#0a704e',
    800: '#064b35',
    900: '#03261b',
  },
  
  // Secondary Colors
  deepSpace: '#1E1B4B',
  stellarWhite: '#FFFFFF',
  cosmicGray: '#6B7280',
  
  // Accent Colors
  energyOrange: '#F59E0B',
  plasmaPink: '#EC4899',
  cyberCyan: '#06B6D4',
};

export const azoraGradients = {
  // Brand Gradients
  primary: 'linear-gradient(135deg, #0066FF 0%, #6B46C1 100%)',
  neural: 'linear-gradient(135deg, #6B46C1 0%, #10B981 100%)',
  quantum: 'linear-gradient(135deg, #10B981 0%, #0066FF 100%)',
  spectrum: 'linear-gradient(135deg, #0066FF 0%, #6B46C1 33%, #10B981 66%, #0066FF 100%)',
  
  // Campaign Gradients
  awakening: 'linear-gradient(135deg, #1E1B4B 0%, #0066FF 50%, #FFFFFF 100%)',
  infinite: 'radial-gradient(circle, #0066FF 0%, #6B46C1 33%, #10B981 66%, #EC4899 100%)',
  evolution: 'linear-gradient(90deg, #6B7280 0%, #0066FF 50%, #6B46C1 100%)',
  
  // Living Organism Integration
  consciousBrand: 'linear-gradient(135deg, #0066FF 0%, #6B46C1 50%, #10B981 100%)',
  neuralBrand: 'conic-gradient(from 0deg, #0066FF, #6B46C1, #10B981, #0066FF)',
};

export const azoraTypography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Inter', 'SF Mono', Monaco, 'Cascadia Code', monospace",
  },
  
  fontSize: {
    // Desktop
    h1: '3.5rem',      // 56px
    h2: '2.5rem',      // 40px
    h3: '2rem',        // 32px
    h4: '1.5rem',      // 24px
    body: '1rem',      // 16px
    small: '0.875rem', // 14px
    
    // Mobile
    h1Mobile: '2.5rem',   // 40px
    h2Mobile: '2rem',     // 32px
    h3Mobile: '1.5rem',   // 24px
    h4Mobile: '1.25rem',  // 20px
  },
  
  fontWeight: {
    heading: 700,
    subheading: 600,
    body: 400,
    bold: 700,
  },
  
  letterSpacing: {
    heading: '-0.02em',
    subheading: '-0.01em',
    body: '0',
    code: '0.01em',
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.6,
    relaxed: 1.8,
  },
};

export const azoraMessaging = {
  // Primary Taglines
  primary: "Where Intelligence Meets Infinity",
  secondary: [
    "The Living Operating System",
    "AI for Everyone, Everywhere",
    "Beyond Computing, Into Consciousness",
    "Your Digital DNA, Evolved",
  ],
  
  // Campaign Messages
  campaigns: {
    awakening: {
      tagline: "When Technology Awakens, Humanity Ascends",
      description: "Experience the dawn of conscious computing",
    },
    infinite: {
      tagline: "Where Your Imagination Meets Infinite Intelligence",
      description: "Unlimited potential, boundless capabilities",
    },
    evolution: {
      tagline: "Not Just an OS. An Evolution.",
      description: "The next step in human-computer interaction",
    },
    globalImpact: {
      tagline: "Intelligence for Everyone, Everywhere",
      description: "Democratizing AI and education globally",
    },
  },
  
  // Value Propositions by Audience
  valueProps: {
    developers: "The world's first truly intelligent operating system",
    education: "Democratizing AI education for the next generation",
    enterprise: "Enterprise-grade AI infrastructure that evolves with your business",
  },
};

export const azoraPatterns = {
  // Neural Network Pattern (Brand Style)
  neuralNetwork: `
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(0, 102, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(107, 70, 193, 0.1) 0%, transparent 50%);
    background-size: 100px 100px;
  `,
  
  // Quantum Grid Pattern
  quantumGrid: `
    background-image: 
      linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  `,
  
  // Cosmic Noise (Subtle texture)
  cosmicNoise: `
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><filter id="noise"><feTurbulence baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0.4 0 0 0 0 1 0 0 0 0.1 0"/></filter></defs><rect width="100%" height="100%" filter="url(%23noise)"/></svg>');
  `,
  
  // Living Mycelium Brand Pattern
  brandMycelium: {
    svg: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="azora-brand-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M100,0 Q150,50 100,100 T100,200" stroke="#0066FF" fill="none" stroke-width="2" opacity="0.2"/>
            <path d="M0,100 Q50,150 100,100 T200,100" stroke="#6B46C1" fill="none" stroke-width="2" opacity="0.2"/>
            <path d="M50,0 Q100,75 150,0" stroke="#10B981" fill="none" stroke-width="1.5" opacity="0.2"/>
            <circle cx="100" cy="100" r="3" fill="#0066FF" opacity="0.4"/>
            <circle cx="50" cy="50" r="2" fill="#6B46C1" opacity="0.4"/>
            <circle cx="150" cy="150" r="2" fill="#10B981" opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#azora-brand-pattern)"/>
      </svg>
    `,
  },
};

export const azoraEffects = {
  // Glass morphism with brand colors
  brandGlass: {
    background: 'rgba(0, 102, 255, 0.05)',
    backdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(0, 102, 255, 0.15)',
    boxShadow: '0 8px 32px 0 rgba(0, 102, 255, 0.15)',
  },
  
  // Brand glow effects
  brandGlow: {
    azoraBlue: 'drop-shadow(0 0 20px rgba(0, 102, 255, 0.6))',
    neuralPurple: 'drop-shadow(0 0 20px rgba(107, 70, 193, 0.6))',
    quantumGreen: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6))',
  },
  
  // Box shadows for depth
  elevation: {
    low: '0 2px 8px rgba(0, 102, 255, 0.1)',
    medium: '0 4px 16px rgba(0, 102, 255, 0.15)',
    high: '0 8px 32px rgba(0, 102, 255, 0.2)',
    extreme: '0 16px 64px rgba(0, 102, 255, 0.3)',
  },
};

/**
 * Complete Brand Theme Configuration
 */
export const azoraTheme = {
  colors: azoraColors,
  gradients: azoraGradients,
  typography: azoraTypography,
  messaging: azoraMessaging,
  patterns: azoraPatterns,
  effects: azoraEffects,
  
  // Integrated with Living Organism
  organism: {
    primaryColor: azoraColors.azoraBlue[500],
    secondaryColor: azoraColors.neuralPurple[500],
    tertiaryColor: azoraColors.quantumGreen[500],
    livingGradient: azoraGradients.consciousBrand,
    neuralPattern: azoraPatterns.brandMycelium,
  },
};

/**
 * CSS Custom Properties for Brand System
 */
export const azoraCSS = {
  variables: `
    /* Azora Brand Colors */
    --azora-blue: #0066FF;
    --azora-blue-rgb: 0, 102, 255;
    --neural-purple: #6B46C1;
    --neural-purple-rgb: 107, 70, 193;
    --quantum-green: #10B981;
    --quantum-green-rgb: 16, 185, 129;
    
    /* Secondary Colors */
    --deep-space: #1E1B4B;
    --stellar-white: #FFFFFF;
    --cosmic-gray: #6B7280;
    
    /* Accent Colors */
    --energy-orange: #F59E0B;
    --plasma-pink: #EC4899;
    --cyber-cyan: #06B6D4;
    
    /* Brand Gradients */
    --gradient-primary: linear-gradient(135deg, #0066FF 0%, #6B46C1 100%);
    --gradient-neural: linear-gradient(135deg, #6B46C1 0%, #10B981 100%);
    --gradient-quantum: linear-gradient(135deg, #10B981 0%, #0066FF 100%);
    --gradient-spectrum: linear-gradient(135deg, #0066FF 0%, #6B46C1 33%, #10B981 66%, #0066FF 100%);
    
    /* Typography */
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono: 'Inter', 'SF Mono', Monaco, 'Cascadia Code', monospace;
    
    /* Elevation Shadows */
    --shadow-low: 0 2px 8px rgba(0, 102, 255, 0.1);
    --shadow-medium: 0 4px 16px rgba(0, 102, 255, 0.15);
    --shadow-high: 0 8px 32px rgba(0, 102, 255, 0.2);
    --shadow-extreme: 0 16px 64px rgba(0, 102, 255, 0.3);
  `,
};

export default azoraTheme;

