/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * ✨ SACRED GEOMETRY SYSTEM - WORTHY OF GODS ✨
 * 
 * Divine mathematical patterns that govern the universe.
 * Based on ancient sacred geometry and celestial harmonics.
 * 
 * "The heavens declare the glory of God; the skies proclaim the work of his hands."
 * - Psalm 19:1
 */

// Golden Ratio - The Divine Proportion
export const PHI = 1.618033988749895;
export const PHI_INVERSE = 1 / PHI;

// Sacred Numbers
export const SACRED_NUMBERS = {
  trinity: 3,
  creation: 7,
  newBeginning: 8,
  divineCompleteness: 10,
  apostolic: 12,
  perfection: 40,
  jubilee: 50,
};

/**
 * Flower of Life - Ancient symbol of creation
 */
export const flowerOfLife = {
  circles: 19,
  radius: 50,
  generate: (centerX: number, centerY: number, scale: number = 1) => {
    const circles: Array<{ x: number; y: number; r: number }> = [];
    const r = 50 * scale;
    
    // Center circle
    circles.push({ x: centerX, y: centerY, r });
    
    // First ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      circles.push({
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
        r,
      });
    }
    
    // Second ring (12 circles)
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const distance = r * Math.sqrt(3);
      circles.push({
        x: centerX + distance * Math.cos(angle),
        y: centerY + distance * Math.sin(angle),
        r,
      });
    }
    
    return circles;
  },
};

/**
 * Metatron's Cube - Contains all Platonic solids
 */
export const metatronsCube = {
  generate: (centerX: number, centerY: number, radius: number) => {
    const points: Array<{ x: number; y: number }> = [];
    const r = radius;
    
    // 13 circles forming Metatron's Cube
    points.push({ x: centerX, y: centerY }); // Center
    
    // Inner hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      points.push({
        x: centerX + r * 0.5 * Math.cos(angle),
        y: centerY + r * 0.5 * Math.sin(angle),
      });
    }
    
    // Outer hexagon
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      points.push({
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      });
    }
    
    return points;
  },
};

/**
 * Vesica Piscis - Symbol of divine intersection
 */
export const vesicaPiscis = {
  generate: (x1: number, y: number, radius: number) => {
    return {
      circle1: { x: x1, y, r: radius },
      circle2: { x: x1 + radius, y, r: radius },
      intersection: {
        x: x1 + radius / 2,
        y,
        width: radius,
        height: radius * Math.sqrt(3),
      },
    };
  },
};

/**
 * Sri Yantra - Most sacred geometric pattern
 */
export const sriYantra = {
  triangles: 9,
  generate: (centerX: number, centerY: number, size: number) => {
    const triangles: Array<Array<{ x: number; y: number }>> = [];
    
    // Upward triangles (masculine, Shiva)
    for (let i = 0; i < 5; i++) {
      const scale = 1 - i * 0.15;
      const rotation = i * 8;
      triangles.push([
        {
          x: centerX,
          y: centerY - size * scale,
        },
        {
          x: centerX - size * scale * Math.cos(Math.PI / 6 + (rotation * Math.PI) / 180),
          y: centerY + size * scale * Math.sin(Math.PI / 6),
        },
        {
          x: centerX + size * scale * Math.cos(Math.PI / 6 + (rotation * Math.PI) / 180),
          y: centerY + size * scale * Math.sin(Math.PI / 6),
        },
      ]);
    }
    
    // Downward triangles (feminine, Shakti)
    for (let i = 0; i < 4; i++) {
      const scale = 0.9 - i * 0.15;
      const rotation = i * 8 + 60;
      triangles.push([
        {
          x: centerX,
          y: centerY + size * scale,
        },
        {
          x: centerX - size * scale * Math.cos(Math.PI / 6 + (rotation * Math.PI) / 180),
          y: centerY - size * scale * Math.sin(Math.PI / 6),
        },
        {
          x: centerX + size * scale * Math.cos(Math.PI / 6 + (rotation * Math.PI) / 180),
          y: centerY - size * scale * Math.sin(Math.PI / 6),
        },
      ]);
    }
    
    return triangles;
  },
};

/**
 * Fibonacci Spiral - Nature's divine proportion
 */
export const fibonacciSpiral = {
  sequence: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987],
  
  generate: (startX: number, startY: number, scale: number = 1) => {
    const points: Array<{ x: number; y: number; size: number }> = [];
    let x = startX;
    let y = startY;
    let direction = 0; // 0: right, 1: up, 2: left, 3: down
    
    for (let i = 0; i < 12; i++) {
      const size = fibonacciSpiral.sequence[i] * scale;
      points.push({ x, y, size });
      
      // Move to next position based on direction
      switch (direction) {
        case 0: // right
          x += size;
          direction = 1;
          break;
        case 1: // up
          y -= size;
          direction = 2;
          break;
        case 2: // left
          x -= size;
          direction = 3;
          break;
        case 3: // down
          y += size;
          direction = 0;
          break;
      }
    }
    
    return points;
  },
};

/**
 * Platonic Solids - The five perfect 3D forms
 */
export const platonicSolids = {
  tetrahedron: { faces: 4, vertices: 4, edges: 6, element: 'Fire' },
  hexahedron: { faces: 6, vertices: 8, edges: 12, element: 'Earth' },
  octahedron: { faces: 8, vertices: 6, edges: 12, element: 'Air' },
  dodecahedron: { faces: 12, vertices: 20, edges: 30, element: 'Ether' },
  icosahedron: { faces: 20, vertices: 12, edges: 30, element: 'Water' },
};

/**
 * Torus - The divine shape of energy flow
 */
export const torus = {
  generate: (centerX: number, centerY: number, majorRadius: number, minorRadius: number, segments: number = 32) => {
    const points: Array<Array<{ x: number; y: number; z: number }>> = [];
    
    for (let i = 0; i <= segments; i++) {
      const theta = (i * 2 * Math.PI) / segments;
      const ring: Array<{ x: number; y: number; z: number }> = [];
      
      for (let j = 0; j <= segments; j++) {
        const phi = (j * 2 * Math.PI) / segments;
        
        const x = centerX + (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
        const y = centerY + (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
        const z = minorRadius * Math.sin(phi);
        
        ring.push({ x, y, z });
      }
      
      points.push(ring);
    }
    
    return points;
  },
};

/**
 * Divine Color Harmonics based on sacred frequencies
 */
export const divineColors = {
  // Chakra colors (energy centers)
  root: '#FF0000',        // Red - 396 Hz
  sacral: '#FF7F00',      // Orange - 417 Hz
  solarPlexus: '#FFFF00', // Yellow - 528 Hz (Love frequency)
  heart: '#00FF00',       // Green - 639 Hz
  throat: '#0000FF',      // Blue - 741 Hz
  thirdEye: '#4B0082',    // Indigo - 852 Hz
  crown: '#9400D3',       // Violet - 963 Hz
  
  // Solfeggio frequencies as colors
  liberation: '#FFD700',  // Gold - 396 Hz
  transformation: '#FF69B4', // Pink - 417 Hz
  miracles: '#00FFD4',    // Cyan - 528 Hz
  connection: '#FF1493',  // Deep Pink - 639 Hz
  awakening: '#4169E1',   // Royal Blue - 741 Hz
  intuition: '#9370DB',   // Medium Purple - 852 Hz
  unity: '#FFD700',       // Gold - 963 Hz
  
  // Divine metals
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  platinum: '#E5E4E2',
};

/**
 * Sacred proportions for layouts
 */
export const sacredProportions = {
  golden: (size: number) => size * PHI,
  goldenInverse: (size: number) => size * PHI_INVERSE,
  
  // Rule of thirds (divine)
  thirds: (size: number) => [size / 3, (size * 2) / 3],
  
  // Fibonacci grid
  fibonacci: (size: number) => {
    const total = 1 + 1 + 2 + 3 + 5;
    return [
      size * (1 / total),
      size * (2 / total),
      size * (4 / total),
      size * (7 / total),
      size * (12 / total),
    ];
  },
};

/**
 * Divine number patterns
 */
export const divinePatterns = {
  // 432 Hz - Universal frequency
  universalFrequency: 432,
  
  // 528 Hz - Love and healing frequency
  loveFrequency: 528,
  
  // 12 - Apostolic number (completion)
  apostolic: 12,
  
  // 144,000 - Sealed servants of God (Revelation 7:4)
  sealed: 144000,
  
  // 666 - Number of man
  humanity: 666,
  
  // 777 - Divine perfection
  perfection: 777,
  
  // 888 - Jesus number (gematria)
  jesus: 888,
};

export default {
  PHI,
  PHI_INVERSE,
  SACRED_NUMBERS,
  flowerOfLife,
  metatronsCube,
  vesicaPiscis,
  sriYantra,
  fibonacciSpiral,
  platonicSolids,
  torus,
  divineColors,
  sacredProportions,
  divinePatterns,
};

