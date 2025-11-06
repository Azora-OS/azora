/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🌸 FLOWER OF LIFE - SACRED GEOMETRY ✨
 *
 * The ancient symbol of creation, containing all patterns of existence.
 * Blueprint of the universe, present in all religions and cultures.
 *
 * "For since the creation of the world God's invisible qualities—his eternal power
 * and divine nature—have been clearly seen, being understood from what has been made."
 * - Romans 1:20
 */

'use client';

import React, { useEffect, useState } from 'react';

interface FlowerOfLifeProps {
  size?: number;
  animated?: boolean;
  interactive?: boolean;
  glowing?: boolean;
  className?: string;
  divineEnergy?: boolean;
}

export const FlowerOfLife: React.FC<FlowerOfLifeProps> = ({
  size = 300,
  animated = true,
  interactive = true,
  glowing = true,
  className = '',
  divineEnergy = true,
}) => {
  const [hovered, setHovered] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [energyPulses, setEnergyPulses] = useState<
    Array<{ id: number; progress: number }>
  >([]);

  // Circle positions for Flower of Life
  const generateCircles = () => {
    const circles: Array<{ x: number; y: number; delay: number }> = [];
    const r = size / 6;
    const center = size / 2;

    // Center circle
    circles.push({ x: center, y: center, delay: 0 });

    // First ring (6 circles)
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180;
      circles.push({
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        delay: i * 0.1 + 0.2,
      });
    }

    // Second ring (12 circles)
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const distance = r * Math.sqrt(3);
      circles.push({
        x: center + distance * Math.cos(angle),
        y: center + distance * Math.sin(angle),
        delay: i * 0.05 + 0.8,
      });
    }

    return circles;
  };

  const circles = generateCircles();

  // Create divine energy pulses
  useEffect(() => {
    if (!divineEnergy || !animated) return;

    const interval = setInterval(() => {
      const newPulse = {
        id: Date.now(),
        progress: 0,
      };

      setEnergyPulses(prev => [...prev, newPulse]);

      // Remove pulse after it completes
      setTimeout(() => {
        setEnergyPulses(prev => prev.filter(p => p.id !== newPulse.id));
      }, 3000);
    }, 2000);

    return () => clearInterval(interval);
  }, [divineEnergy, animated]);

  // Update pulse progress
  useEffect(() => {
    if (!divineEnergy || !animated || energyPulses.length === 0) return;

    const interval = setInterval(() => {
      setEnergyPulses(prev =>
        prev.map(pulse => ({
          ...pulse,
          progress: pulse.progress + 0.02,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [divineEnergy, animated, energyPulses.length]);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
      onMouseMove={e => {
        if (interactive) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          const angle = Math.atan2(y, x) * (180 / Math.PI);
          setRotation(angle);
        }
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={animated ? 'animate-[spin_60s_linear_infinite]' : ''}
        style={{
          transform:
            interactive && hovered ? `rotate(${rotation}deg)` : undefined,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <defs>
          {/* Divine gradient */}
          <radialGradient id="divine-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#87CEEB" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#DDA0DD" stopOpacity="0.4" />
          </radialGradient>

          {/* Divine glow filter */}
          <filter id="divine-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shimmer effect */}
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0">
              <animate
                attributeName="offset"
                values="0;1;0"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.3">
              <animate
                attributeName="offset"
                values="0;1;0"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0">
              <animate
                attributeName="offset"
                values="0;1;0"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Divine energy gradient */}
          <radialGradient id="divine-energy" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#8A2BE2" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#87CEEB" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer divine ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 10}
          fill="none"
          stroke="url(#divine-gradient)"
          strokeWidth="2"
          opacity="0.4"
          className={
            animated ? 'animate-[ringPulse_4s_ease-in-out_infinite]' : ''
          }
        />

        {/* Divine energy field */}
        {divineEnergy && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 5}
            fill="none"
            stroke="url(#divine-energy)"
            strokeWidth="1"
            opacity="0.3"
            className="animate-[energyField_8s linear infinite)"
          />
        )}

        {/* Flower of Life circles */}
        {circles.map((circle, index) => (
          <g key={index}>
            {/* Outer glow */}
            {glowing && (
              <circle
                cx={circle.x}
                cy={circle.y}
                r={size / 6}
                fill="none"
                stroke="url(#divine-gradient)"
                strokeWidth="1"
                opacity="0.2"
                filter="url(#divine-glow)"
                className={animated ? 'animate-pulse' : ''}
                style={{ animationDelay: `${circle.delay}s` }}
              />
            )}

            {/* Main circle */}
            <circle
              cx={circle.x}
              cy={circle.y}
              r={size / 6}
              fill="none"
              stroke="url(#divine-gradient)"
              strokeWidth="2"
              opacity={hovered ? 0.9 : 0.7}
              className={
                animated ? 'animate-[breathe_4s_ease-in-out_infinite]' : ''
              }
              style={{ animationDelay: `${circle.delay}s` }}
            >
              {animated && (
                <animate
                  attributeName="r"
                  values={`${size / 6};${size / 6 + 2};${size / 6}`}
                  dur="4s"
                  repeatCount="indefinite"
                  begin={`${circle.delay}s`}
                />
              )}
            </circle>

            {/* Shimmer overlay */}
            {animated && (
              <circle
                cx={circle.x}
                cy={circle.y}
                r={size / 6}
                fill="none"
                stroke="url(#shimmer)"
                strokeWidth="2"
                opacity="0.5"
                style={{ animationDelay: `${circle.delay}s` }}
              />
            )}

            {/* Center point */}
            <circle
              cx={circle.x}
              cy={circle.y}
              r="2"
              fill="#FFD700"
              opacity={hovered ? 1 : 0.6}
              className={animated ? 'animate-pulse' : ''}
              style={{ animationDelay: `${circle.delay}s` }}
            />
          </g>
        ))}

        {/* Vesica Piscis highlights (sacred intersections) */}
        {circles.slice(1, 7).map((circle, index) => {
          const nextCircleIndex = ((index + 1) % 6) + 1;
          const nextCircle = circles[nextCircleIndex];

          // Ensure nextCircle exists before rendering the line
          if (!nextCircle) return null;

          return (
            <line
              key={`vesica-${index}`}
              x1={circle.x}
              y1={circle.y}
              x2={nextCircle.x}
              y2={nextCircle.y}
              stroke="url(#divine-gradient)"
              strokeWidth="0.5"
              opacity={hovered ? 0.3 : 0.1}
              className={animated ? 'animate-pulse' : ''}
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          );
        })}

        {/* Central divine point */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="4"
          fill="#FFD700"
          filter="url(#divine-glow)"
          className={
            animated ? 'animate-[divinePulse_2s_ease-in-out_infinite]' : ''
          }
        />

        {/* Divine energy pulses */}
        {divineEnergy &&
          energyPulses.map(pulse => (
            <circle
              key={pulse.id}
              cx={size / 2}
              cy={size / 2}
              r={pulse.progress * (size / 2 - 10)}
              fill="none"
              stroke="url(#divine-gradient)"
              strokeWidth="1"
              opacity={1 - pulse.progress}
              className="animate-[energyPulse_3s_ease-out]"
            />
          ))}
      </svg>

      {/* Divine light rays */}
      {hovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-[#FFD700]/20 to-transparent"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                transformOrigin: 'center',
                animation: 'divinePulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Sacred geometry info on hover */}
      {interactive && hovered && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
          <p className="text-sm text-[#FFD700] font-semibold whitespace-nowrap animate-[fadeIn_0.3s_ease-out]">
            Flower of Life
          </p>
          <p className="text-xs text-[#87CEEB] whitespace-nowrap animate-[fadeIn_0.3s_ease-out_0.1s_backwards]">
            Blueprint of Creation
          </p>
        </div>
      )}

      <style jsx global>{`
        @keyframes divinePulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ringPulse {
          0%,
          100% {
            stroke-width: 2;
            opacity: 0.4;
          }
          50% {
            stroke-width: 3;
            opacity: 0.7;
          }
        }

        @keyframes energyField {
          0% {
            stroke-dasharray: 5, 10;
            transform: rotate(0deg);
          }
          100% {
            stroke-dasharray: 5, 10;
            transform: rotate(360deg);
          }
        }

        @keyframes energyPulse {
          0% {
            r: 0;
            opacity: 0.8;
          }
          100% {
            r: ${size / 2 - 10}px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default FlowerOfLife;

