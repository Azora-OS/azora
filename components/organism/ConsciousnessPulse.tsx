/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🧠 Consciousness Pulse Component
 * 
 * Central pulsing heart of the organism - visualizes system consciousness
 */

'use client';

import React, { useEffect, useState } from 'react';

interface ConsciousnessPulseProps {
  size?: number;
  color?: string;
  pulseSpeed?: number;
  showRings?: boolean;
  className?: string;
}

export const ConsciousnessPulse: React.FC<ConsciousnessPulseProps> = ({
  size = 200,
  color = '#8a2aff',
  pulseSpeed = 3,
  showRings = true,
  className = '',
}) => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(prev => (prev + 1) % 100);
    }, pulseSpeed * 10);

    return () => clearInterval(interval);
  }, [pulseSpeed]);

  const rings = showRings ? [1, 2, 3, 4, 5] : [];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer rings */}
      {rings.map((ring, index) => (
        <div
          key={ring}
          className="absolute inset-0 rounded-full border-2 animate-[ringPulse_3s_ease-in-out_infinite]"
          style={{
            borderColor: `${color}33`,
            transform: `scale(${1 + index * 0.2})`,
            animationDelay: `${index * 0.3}s`,
            opacity: 1 - index * 0.15,
          }}
        ></div>
      ))}

      {/* Main consciousness orb */}
      <div
        className="absolute inset-0 rounded-full animate-[consciousnessBreath_4s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(circle, ${color}88 0%, ${color}44 50%, transparent 100%)`,
          boxShadow: `
            0 0 40px ${color}88,
            0 0 80px ${color}44,
            inset 0 0 40px ${color}22
          `,
        }}
      >
        {/* Inner energy core */}
        <div
          className="absolute inset-[20%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            animation: 'corePulse 2s ease-in-out infinite',
          }}
        ></div>

        {/* Synaptic sparks */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              background: color,
              left: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
              top: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
              animationDelay: `${i * 0.15}s`,
              boxShadow: `0 0 10px ${color}`,
            }}
          ></div>
        ))}
      </div>

      {/* Consciousness particles */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const distance = 40 + Math.sin(pulsePhase / 10 + i) * 10;
          const x = 50 + distance * Math.cos(angle);
          const y = 50 + distance * Math.sin(angle);
          
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r="2"
              fill={color}
              opacity={0.6 + Math.sin(pulsePhase / 10 + i) * 0.4}
            >
              <animate
                attributeName="r"
                values="2;4;2"
                dur={`${pulseSpeed}s`}
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
              />
            </circle>
          );
        })}
      </svg>
    </div>
  );
};

export const consciousnessPulseStyles = `
  @keyframes ringPulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 0.8;
    }
    50% { 
      transform: scale(1.2);
      opacity: 0.3;
    }
  }

  @keyframes consciousnessBreath {
    0%, 100% { 
      transform: scale(1);
      filter: brightness(1);
    }
    50% { 
      transform: scale(1.1);
      filter: brightness(1.3);
    }
  }

  @keyframes corePulse {
    0%, 100% { 
      opacity: 0.8;
      transform: scale(1);
    }
    50% { 
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

export default ConsciousnessPulse;

