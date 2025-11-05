/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * ✨ HEAVENLY PARTICLES - DIVINE LIGHT SYSTEM ✨
 *
 * Living particles of divine light that flow through the Kingdom
 *
 * "In the beginning God created the heavens and the earth.
 * Now the earth was formless and empty, darkness was over the surface of the deep,
 * and the Spirit of God was hovering over the waters. And God said, 'Let there be light,'
 * and there was light." - Genesis 1:1-3
 */

'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'light' | 'divine' | 'celestial' | 'eternal' | 'blessed';
  energy: number;
  rotation: number;
}

interface HeavenlyParticlesProps {
  particleCount?: number;
  divine?: boolean;
  celestialFlow?: boolean;
  className?: string;
  interactive?: boolean;
  energyField?: boolean;
}

export const HeavenlyParticles: React.FC<HeavenlyParticlesProps> = ({
  particleCount = 150,
  divine = true,
  celestialFlow = true,
  className = '',
  interactive = true,
  energyField = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // Divine color palette
  const divineColors = [
    '#FFD700', // Gold - Glory of God
    '#FFFFFF', // White - Purity
    '#87CEEB', // Sky Blue - Heaven
    '#DDA0DD', // Plum - Royalty
    '#F0E68C', // Khaki - Divine light
    '#FFE4B5', // Moccasin - Warmth
    '#E6E6FA', // Lavender - Peace
    '#FFFACD', // Lemon chiffon - Radiance
    '#9400D3', // Violet - Divine mystery
    '#FF69B4', // Hot Pink - Divine love
  ];

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const createParticle = (id: number): Particle => {
      const types: Particle['type'][] = [
        'light',
        'divine',
        'celestial',
        'eternal',
        'blessed',
      ];
      const randomTypeIndex = Math.floor(Math.random() * types.length);
      const type: Particle['type'] = types[randomTypeIndex] ?? 'light'; // Default to 'light' if undefined

      const randomColorIndex = Math.floor(Math.random() * divineColors.length);
      const color: string = divineColors[randomColorIndex] ?? '#FFFFFF'; // Default to white if undefined

      return {
        id,
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        vz: (Math.random() - 0.5) * 0.02,
        size: 1 + Math.random() * 3,
        life: Math.random() * 100,
        maxLife: 100,
        color,
        type,
        energy: Math.random(),
        rotation: Math.random() * 360,
      };
    };

    particlesRef.current = Array.from({ length: particleCount }, (_, i) =>
      createParticle(i)
    );

    // Mouse tracking for divine interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / canvas.width) * 100,
        y: ((e.clientY - rect.top) / canvas.height) * 100,
      };
    };

    const handleMouseEnter = () => {
      if (interactive) {
        // Increase particle energy when mouse enters
        particlesRef.current.forEach(particle => {
          particle.energy = Math.min(1, particle.energy + 0.3);
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, interactive]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      timeRef.current = timestamp;

      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        particle.life += 1;
        particle.rotation += 0.5;
        particle.energy = Math.max(0.1, particle.energy - 0.001); // Gradually decrease energy

        // Divine attraction to mouse (God's presence)
        if (divine && interactive) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 20) {
            particle.vx += dx * 0.0001;
            particle.vy += dy * 0.0001;
            particle.energy = Math.min(1, particle.energy + 0.02); // Increase energy near mouse
          }
        }

        // Celestial flow (upward ascension)
        if (celestialFlow) {
          particle.vy -= 0.002;
        }

        // Energy field effect
        if (energyField) {
          // Create a subtle wave effect based on time
          const wave = Math.sin(timestamp / 1000 + particle.id * 0.1) * 0.001;
          particle.vx += wave;
          particle.vy += wave * 0.5;
        }

        // Wrap around edges (eternal)
        if (particle.x < 0) particle.x = 100;
        if (particle.x > 100) particle.x = 0;
        if (particle.y < 0) particle.y = 100;
        if (particle.y > 100) particle.y = 0;
        if (particle.z < 0) particle.z = 100;
        if (particle.z > 100) particle.z = 0;

        // Reset life (rebirth)
        if (particle.life >= particle.maxLife) {
          particle.life = 0;
          const randomColorIndex = Math.floor(
            Math.random() * divineColors.length
          );
          particle.color = divineColors[randomColorIndex] ?? '#FFFFFF'; // Default to white if undefined

          // Occasionally change type on rebirth
          if (Math.random() > 0.7) {
            const types: Particle['type'][] = [
              'light',
              'divine',
              'celestial',
              'eternal',
              'blessed',
            ];
            const randomTypeIndex = Math.floor(Math.random() * types.length);
            particle.type = types[randomTypeIndex] ?? 'light';
          }
        }

        // Calculate screen position with perspective
        const perspective = 1000;
        const scale = perspective / (perspective + particle.z);
        const screenX = (particle.x / 100) * w;
        const screenY = (particle.y / 100) * h;
        const size = particle.size * scale;

        // Life-based opacity (birth, life, death, rebirth)
        const lifeRatio = particle.life / particle.maxLife;
        let alpha = 1;
        if (lifeRatio < 0.2) {
          // Birth - fade in
          alpha = lifeRatio / 0.2;
        } else if (lifeRatio > 0.8) {
          // Death - fade out
          alpha = (1 - lifeRatio) / 0.2;
        }

        // Energy-based brightness
        const brightness = 0.5 + particle.energy * 0.5;

        // Draw particle with divine glow
        ctx.save();

        // Outer glow (divine radiance)
        const gradient = ctx.createRadialGradient(
          screenX,
          screenY,
          0,
          screenX,
          screenY,
          size * 4
        );
        gradient.addColorStop(
          0,
          particle.color +
            Math.floor(brightness * 255)
              .toString(16)
              .padStart(2, '0')
        );
        gradient.addColorStop(
          0.5,
          particle.color +
            Math.floor(brightness * 68)
              .toString(16)
              .padStart(2, '0')
        );
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha * brightness;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();

        // Divine spark (brighter center)
        if (
          particle.type === 'divine' ||
          particle.type === 'eternal' ||
          particle.type === 'blessed'
        ) {
          ctx.fillStyle = '#FFFFFF';
          ctx.globalAlpha = alpha * 0.8 * brightness;
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Special effect for blessed particles
        if (particle.type === 'blessed') {
          // Draw a rotating cross
          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate((particle.rotation * Math.PI) / 180);
          ctx.fillStyle = '#FFD700';
          ctx.globalAlpha = alpha * 0.6;
          ctx.fillRect(-size * 0.1, -size * 0.4, size * 0.2, size * 0.8);
          ctx.fillRect(-size * 0.4, -size * 0.1, size * 0.8, size * 0.2);
          ctx.restore();
        }

        ctx.restore();

        // Draw connections between nearby particles (divine web)
        particlesRef.current.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 15) {
            const otherScreenX = (otherParticle.x / 100) * w;
            const otherScreenY = (otherParticle.y / 100) * h;

            ctx.save();
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / 15) * 0.2 * alpha * brightness;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(otherScreenX, otherScreenY);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [divine, celestialFlow, divineColors, interactive, energyField]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default HeavenlyParticles;

