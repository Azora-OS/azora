/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🌿 AZORA OS - LIVING ORGANISM DESIGN SYSTEM 🧬
 * 
 * Bio-inspired design system that makes the entire platform feel like
 * a living, breathing organism with mycelium-like neural connections.
 * 
 * "I am the vine; you are the branches." - John 15:5
 */

export const organicColors = {
  // Primary: Bioluminescent Blues & Cyans (Neural pathways)
  neuralBlue: {
    50: '#e0f7ff',
    100: '#b3ecff',
    200: '#80e0ff',
    300: '#4dd4ff',
    400: '#26cbff',
    500: '#00c2ff', // Primary neural glow
    600: '#00b4f0',
    700: '#00a0d9',
    800: '#008dc2',
    900: '#006d9a',
  },
  
  // Secondary: Organic Greens (Growth & Life)
  myceliumGreen: {
    50: '#e8fff4',
    100: '#c2ffe0',
    200: '#99ffca',
    300: '#70ffb4',
    400: '#52ffa3',
    500: '#33ff92', // Mycelium glow
    600: '#2ef08a',
    700: '#26d97c',
    800: '#1fc26e',
    900: '#0f9d54',
  },
  
  // Tertiary: Bioluminescent Purples (Consciousness)
  consciousPurple: {
    50: '#f3e5ff',
    100: '#debeff',
    200: '#c793ff',
    300: '#af67ff',
    400: '#9c47ff',
    500: '#8a2aff', // Consciousness pulse
    600: '#7d25f0',
    700: '#6d1fd9',
    800: '#5e19c2',
    900: '#460f9a',
  },
  
  // Organism: Living Amber (Energy flow)
  energyAmber: {
    50: '#fff8e5',
    100: '#ffecbf',
    200: '#ffe095',
    300: '#ffd369',
    400: '#ffc947',
    500: '#ffbf26', // Energy pulse
    600: '#f5b121',
    700: '#e59f1a',
    800: '#d48d14',
    900: '#b86f09',
  },
  
  // Background: Deep Ocean (Primordial)
  primordialDark: {
    50: '#1a1f2e',
    100: '#141824',
    200: '#0f121a',
    300: '#0a0d12',
    400: '#06080d',
    500: '#030508', // Deep background
  },
};

export const organicGradients = {
  neuralFlow: 'linear-gradient(135deg, #00c2ff 0%, #8a2aff 50%, #33ff92 100%)',
  myceliumNetwork: 'radial-gradient(circle, #33ff92 0%, #00c2ff 50%, #8a2aff 100%)',
  consciousnessWave: 'linear-gradient(90deg, #8a2aff 0%, #00c2ff 50%, #8a2aff 100%)',
  energyPulse: 'linear-gradient(180deg, #ffbf26 0%, #ffd369 50%, #ffbf26 100%)',
  lifeForce: 'conic-gradient(from 0deg, #33ff92, #00c2ff, #8a2aff, #ffbf26, #33ff92)',
};

export const organicAnimations = {
  breathe: {
    name: 'breathe',
    keyframes: `
      @keyframes breathe {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
      }
    `,
    duration: '4s',
    easing: 'ease-in-out',
    iteration: 'infinite',
  },
  
  pulse: {
    name: 'organicPulse',
    keyframes: `
      @keyframes organicPulse {
        0%, 100% { 
          transform: scale(1); 
          box-shadow: 0 0 0 0 rgba(0, 194, 255, 0.7);
        }
        50% { 
          transform: scale(1.02); 
          box-shadow: 0 0 20px 10px rgba(0, 194, 255, 0);
        }
      }
    `,
    duration: '3s',
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iteration: 'infinite',
  },
  
  neuralGlow: {
    name: 'neuralGlow',
    keyframes: `
      @keyframes neuralGlow {
        0%, 100% { filter: brightness(1) drop-shadow(0 0 5px rgba(0, 194, 255, 0.5)); }
        50% { filter: brightness(1.3) drop-shadow(0 0 15px rgba(0, 194, 255, 0.8)); }
      }
    `,
    duration: '2s',
    easing: 'ease-in-out',
    iteration: 'infinite',
  },
  
  myceliumGrow: {
    name: 'myceliumGrow',
    keyframes: `
      @keyframes myceliumGrow {
        0% { 
          transform: scaleX(0); 
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        100% { 
          transform: scaleX(1); 
          opacity: 0.8;
        }
      }
    `,
    duration: '1.5s',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    iteration: '1',
  },
  
  consciousnessWave: {
    name: 'consciousnessWave',
    keyframes: `
      @keyframes consciousnessWave {
        0% { 
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% { 
          background-position: 0% 50%;
        }
      }
    `,
    duration: '6s',
    easing: 'ease-in-out',
    iteration: 'infinite',
  },
  
  organicFloat: {
    name: 'organicFloat',
    keyframes: `
      @keyframes organicFloat {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg);
        }
        33% {
          transform: translateY(-10px) rotate(2deg);
        }
        66% {
          transform: translateY(-5px) rotate(-2deg);
        }
      }
    `,
    duration: '5s',
    easing: 'ease-in-out',
    iteration: 'infinite',
  },
};

export const myceliumPatterns = {
  // SVG pattern for mycelium network background
  networkPattern: `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="mycelium-network" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M100,0 Q150,50 100,100 T100,200" stroke="rgba(51, 255, 146, 0.1)" fill="none" stroke-width="2"/>
          <path d="M0,100 Q50,150 100,100 T200,100" stroke="rgba(0, 194, 255, 0.1)" fill="none" stroke-width="2"/>
          <path d="M50,0 Q100,75 150,0" stroke="rgba(138, 42, 255, 0.1)" fill="none" stroke-width="1.5"/>
          <circle cx="100" cy="100" r="3" fill="rgba(51, 255, 146, 0.3)"/>
          <circle cx="50" cy="50" r="2" fill="rgba(0, 194, 255, 0.3)"/>
          <circle cx="150" cy="150" r="2" fill="rgba(138, 42, 255, 0.3)"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mycelium-network)"/>
    </svg>
  `,
  
  // CSS for neural connections
  neuralConnection: `
    position: relative;
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(0, 194, 255, 0.6), 
        transparent
      );
      animation: neuralPulse 2s ease-in-out infinite;
    }
    @keyframes neuralPulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `,
};

export const organicShapes = {
  // Blob-like organic shapes using CSS
  blob1: {
    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
    animation: 'morphBlob1 8s ease-in-out infinite',
  },
  blob2: {
    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
    animation: 'morphBlob2 10s ease-in-out infinite',
  },
  blob3: {
    borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%',
    animation: 'morphBlob3 12s ease-in-out infinite',
  },
};

export const blobMorphKeyframes = `
  @keyframes morphBlob1 {
    0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
    25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
    50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
    75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
  }
  
  @keyframes morphBlob2 {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
    50% { border-radius: 45% 55% 40% 60% / 55% 45% 55% 45%; }
    75% { border-radius: 70% 30% 50% 50% / 30% 65% 35% 70%; }
  }
  
  @keyframes morphBlob3 {
    0%, 100% { border-radius: 40% 60% 70% 30% / 40% 70% 30% 60%; }
    33% { border-radius: 70% 30% 50% 50% / 60% 40% 60% 40%; }
    66% { border-radius: 50% 50% 33% 67% / 45% 65% 35% 55%; }
  }
`;

/**
 * Utility function to apply breathing animation to elements
 */
export const applyBreathe = (element: HTMLElement) => {
  element.style.animation = `breathe ${organicAnimations.breathe.duration} ${organicAnimations.breathe.easing} ${organicAnimations.breathe.iteration}`;
};

/**
 * Utility function to create mycelium connection between two elements
 */
export const createMyceliumConnection = (
  from: HTMLElement,
  to: HTMLElement,
  color: string = organicColors.myceliumGreen[500]
) => {
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  
  const x1 = fromRect.left + fromRect.width / 2;
  const y1 = fromRect.top + fromRect.height / 2;
  const x2 = toRect.left + toRect.width / 2;
  const y2 = toRect.top + toRect.height / 2;
  
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  // Create organic curve
  const d = `M ${x1} ${y1} Q ${midX} ${midY - 50} ${x2} ${y2}`;
  line.setAttribute('d', d);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '2');
  line.setAttribute('fill', 'none');
  line.setAttribute('opacity', '0.6');
  
  return line;
};

/**
 * Organism theme configuration
 */
export const organismTheme = {
  colors: organicColors,
  gradients: organicGradients,
  animations: organicAnimations,
  patterns: myceliumPatterns,
  shapes: organicShapes,
  effects: {
    glassmorph: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 194, 255, 0.15)',
    },
    neuralGlow: {
      boxShadow: `
        0 0 20px rgba(0, 194, 255, 0.3),
        0 0 40px rgba(0, 194, 255, 0.2),
        0 0 60px rgba(0, 194, 255, 0.1)
      `,
    },
    myceliumGlow: {
      boxShadow: `
        0 0 20px rgba(51, 255, 146, 0.3),
        0 0 40px rgba(51, 255, 146, 0.2),
        0 0 60px rgba(51, 255, 146, 0.1)
      `,
    },
    consciousnessGlow: {
      boxShadow: `
        0 0 20px rgba(138, 42, 255, 0.3),
        0 0 40px rgba(138, 42, 255, 0.2),
        0 0 60px rgba(138, 42, 255, 0.1)
      `,
    },
  },
};

export default organismTheme;

