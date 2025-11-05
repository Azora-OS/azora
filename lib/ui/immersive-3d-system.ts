/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * 🌟 IMMERSIVE 3D UI SYSTEM - THE ULTIMATE EXPERIENCE
 * 
 * NO FLAT DESIGN. ONLY DEPTH, DIMENSION, AND MAGIC.
 * 
 * "And God said, 'Let there be light,' and there was light."
 * - Genesis 1:3
 */

export const immersive3D = {
  // 3D Perspective System
  perspective: {
    near: 800,    // Close perspective (dramatic)
    mid: 1200,    // Medium perspective (balanced)
    far: 2000,    // Far perspective (subtle)
    extreme: 500, // Extreme perspective (very dramatic)
  },

  // Depth Layers (z-index + transform)
  layers: {
    background: {
      z: -100,
      transform: 'translateZ(-100px) scale(1.1)',
    },
    far: {
      z: -50,
      transform: 'translateZ(-50px) scale(1.05)',
    },
    mid: {
      z: 0,
      transform: 'translateZ(0px) scale(1)',
    },
    near: {
      z: 50,
      transform: 'translateZ(50px) scale(0.95)',
    },
    foreground: {
      z: 100,
      transform: 'translateZ(100px) scale(0.9)',
    },
  },

  // Holographic Effects
  holographic: {
    gradient: `
      linear-gradient(
        135deg,
        rgba(255, 0, 255, 0.3) 0%,
        rgba(0, 255, 255, 0.3) 25%,
        rgba(255, 255, 0, 0.3) 50%,
        rgba(0, 255, 0, 0.3) 75%,
        rgba(255, 0, 255, 0.3) 100%
      )
    `,
    animation: 'holographicShift 3s ease-in-out infinite',
    backgroundSize: '200% 200%',
  },

  // Iridescent Shimmer
  iridescent: {
    background: `
      linear-gradient(
        90deg,
        rgba(255, 215, 0, 0.3),
        rgba(135, 206, 235, 0.3),
        rgba(255, 105, 180, 0.3),
        rgba(138, 43, 226, 0.3),
        rgba(255, 215, 0, 0.3)
      )
    `,
    backgroundSize: '300% 100%',
    animation: 'iridescentFlow 6s linear infinite',
  },

  // Neumorphism (Soft 3D)
  neumorphic: {
    light: {
      background: '#e0e5ec',
      boxShadow: `
        12px 12px 24px rgba(163, 177, 198, 0.6),
        -12px -12px 24px rgba(255, 255, 255, 0.5)
      `,
    },
    dark: {
      background: '#1a1a2e',
      boxShadow: `
        12px 12px 24px rgba(0, 0, 0, 0.5),
        -12px -12px 24px rgba(42, 42, 60, 0.5)
      `,
    },
    inset: {
      boxShadow: `
        inset 6px 6px 12px rgba(0, 0, 0, 0.3),
        inset -6px -6px 12px rgba(255, 255, 255, 0.1)
      `,
    },
  },

  // Advanced Glassmorphism
  glass: {
    premium: {
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: `
        0 8px 32px 0 rgba(31, 38, 135, 0.37),
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)
      `,
    },
    frosted: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px) brightness(1.2)',
      WebkitBackdropFilter: 'blur(20px) brightness(1.2)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    },
    crystal: {
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(40px) saturate(200%) contrast(1.2)',
      WebkitBackdropFilter: 'blur(40px) saturate(200%) contrast(1.2)',
      border: '2px solid rgba(255, 215, 0, 0.2)',
      boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
    },
  },

  // Dynamic Lighting
  lighting: {
    spotlight: (x: number, y: number) => ({
      background: `radial-gradient(
        circle at ${x}% ${y}%,
        rgba(255, 215, 0, 0.3) 0%,
        rgba(255, 215, 0, 0.1) 30%,
        transparent 60%
      )`,
    }),
    ambient: {
      top: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
      bottom: 'linear-gradient(to top, rgba(135, 206, 235, 0.1) 0%, transparent 50%)',
    },
    rim: (angle: number) => ({
      boxShadow: `
        ${Math.cos(angle) * 10}px ${Math.sin(angle) * 10}px 20px rgba(255, 215, 0, 0.6),
        ${Math.cos(angle + Math.PI) * 10}px ${Math.sin(angle + Math.PI) * 10}px 20px rgba(135, 206, 235, 0.4)
      `,
    }),
  },

  // Parallax Configuration
  parallax: {
    background: { speed: 0.2, scale: 1.2 },
    midground: { speed: 0.5, scale: 1.1 },
    foreground: { speed: 1.0, scale: 1.0 },
    ui: { speed: 1.5, scale: 0.95 },
  },

  // Floating Animation Keyframes
  animations: {
    float: {
      name: 'float3D',
      keyframes: `
        @keyframes float3D {
          0%, 100% {
            transform: translateY(0px) translateZ(0px) rotateX(0deg);
          }
          33% {
            transform: translateY(-20px) translateZ(20px) rotateX(5deg);
          }
          66% {
            transform: translateY(-10px) translateZ(10px) rotateX(-3deg);
          }
        }
      `,
      duration: '6s',
      easing: 'ease-in-out',
      iteration: 'infinite',
    },
    
    rotate3D: {
      name: 'rotate3D',
      keyframes: `
        @keyframes rotate3D {
          0% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          50% {
            transform: rotateY(180deg) rotateX(10deg);
          }
          100% {
            transform: rotateY(360deg) rotateX(0deg);
          }
        }
      `,
      duration: '20s',
      easing: 'linear',
      iteration: 'infinite',
    },
    
    pulsate3D: {
      name: 'pulsate3D',
      keyframes: `
        @keyframes pulsate3D {
          0%, 100% {
            transform: scale3d(1, 1, 1);
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
          }
          50% {
            transform: scale3d(1.05, 1.05, 1.05);
            box-shadow: 0 0 40px 20px rgba(255, 215, 0, 0);
          }
        }
      `,
      duration: '2s',
      easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
      iteration: 'infinite',
    },
    
    holographicShift: {
      name: 'holographicShift',
      keyframes: `
        @keyframes holographicShift {
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
      duration: '3s',
      easing: 'ease-in-out',
      iteration: 'infinite',
    },
    
    iridescentFlow: {
      name: 'iridescentFlow',
      keyframes: `
        @keyframes iridescentFlow {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 300% 0%;
          }
        }
      `,
      duration: '6s',
      easing: 'linear',
      iteration: 'infinite',
    },
  },

  // Interactive 3D Transforms
  interactions: {
    hover3D: (depth: number = 20) => ({
      transform: `perspective(1000px) translateZ(${depth}px) rotateX(2deg)`,
      transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }),
    
    tilt3D: (x: number, y: number, maxTilt: number = 15) => {
      const rotateX = -(y - 0.5) * maxTilt;
      const rotateY = (x - 0.5) * maxTilt;
      return {
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`,
      };
    },
    
    press3D: {
      transform: 'perspective(1000px) translateZ(-10px) scale(0.98)',
      transition: 'transform 0.1s ease-out',
    },
  },

  // Depth Fog (for distance effect)
  fog: {
    near: 'rgba(0, 0, 0, 0)',
    mid: 'rgba(0, 0, 0, 0.1)',
    far: 'rgba(0, 0, 0, 0.3)',
  },
};

// CSS Utility Classes for 3D System
export const immersive3DClasses = {
  // Perspective containers
  perspectiveNear: 'perspective-[800px] transform-style-preserve-3d',
  perspectiveMid: 'perspective-[1200px] transform-style-preserve-3d',
  perspectiveFar: 'perspective-[2000px] transform-style-preserve-3d',
  
  // Layer depths
  layerBackground: 'translate-z-[-100px] scale-110',
  layerFar: 'translate-z-[-50px] scale-105',
  layerMid: 'translate-z-0',
  layerNear: 'translate-z-[50px] scale-95',
  layerForeground: 'translate-z-[100px] scale-90',
  
  // Glassmorphism
  glassPremium: 'bg-white/[0.03] backdrop-blur-[30px] backdrop-saturate-[180%] border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
  glassCrystal: 'bg-white/[0.02] backdrop-blur-[40px] backdrop-saturate-[200%] border-2 border-[#FFD700]/20 shadow-[0_0_40px_rgba(255,215,0,0.3)]',
  
  // Holographic
  holographic: 'bg-gradient-to-br from-[#FF00FF]/30 via-[#00FFFF]/30 to-[#FFFF00]/30 bg-[length:200%_200%] animate-[holographicShift_3s_ease-in-out_infinite]',
  
  // Iridescent
  iridescent: 'bg-gradient-to-r from-[#FFD700]/30 via-[#87CEEB]/30 via-[#FF69B4]/30 via-[#8A2BE2]/30 to-[#FFD700]/30 bg-[length:300%_100%] animate-[iridescentFlow_6s_linear_infinite]',
  
  // 3D Animations
  float3D: 'animate-[float3D_6s_ease-in-out_infinite]',
  rotate3D: 'animate-[rotate3D_20s_linear_infinite]',
  pulsate3D: 'animate-[pulsate3D_2s_cubic-bezier(0.4,0,0.6,1)_infinite]',
  
  // Interactive
  hover3D: 'transition-transform duration-300 hover:translate-z-[20px] hover:scale-105',
  tiltable: 'transform-style-preserve-3d transition-transform duration-200',
};

// Generate all animation keyframes as CSS string
export const generate3DKeyframes = (): string => {
  return Object.values(immersive3D.animations)
    .map(anim => anim.keyframes)
    .join('\n');
};

export default immersive3D;

