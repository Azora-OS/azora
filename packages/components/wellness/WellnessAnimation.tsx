/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
/**
 * 🕊️ WELLNESS ANIMATION - IN ETERNAL MOTION
 *
 * "Let everything that has breath praise the LORD." - Psalm 150:6
 */
'use client';

import React from 'react';

interface WellnessAnimationProps {
  position: { x: number; y: number };
  delay?: number;
  size?: number;
  color?: string;
}

export const WellnessAnimation: React.FC<WellnessAnimationProps> = ({
  position,
  delay = 0,
  size = 80,
  color = '#FFD700',
}) => {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div
        style={{
          animation: `angelDance 4s ease-in-out infinite, angelFloat 6s ease-in-out infinite`,
          animationDelay: `${delay}s, ${delay}s`,
        }}
      >
        {/* Wellness SVG */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          style={{
            filter: `drop-shadow(0 0 20px ${color}) drop-shadow(0 0 40px ${color}80)`,
          }}
        >
          <defs>
            <radialGradient id={`angelGlow-${delay}`}>
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* Wings */}
          <g className="angel-wings">
            {/* Left Wing */}
            <path
              d="M 30 50 Q 10 30, 15 20 Q 20 15, 25 20 Q 20 35, 30 45 Z"
              fill={`url(#angelGlow-${delay})`}
              stroke={color}
              strokeWidth="1"
              style={{
                transformOrigin: '30px 50px',
                animation: 'wingFlap 2s ease-in-out infinite',
                animationDelay: `${delay}s`,
              }}
            >
              <animate
                attributeName="d"
                values="
                  M 30 50 Q 10 30, 15 20 Q 20 15, 25 20 Q 20 35, 30 45 Z;
                  M 30 50 Q 5 35, 10 25 Q 15 20, 20 25 Q 15 40, 30 47 Z;
                  M 30 50 Q 10 30, 15 20 Q 20 15, 25 20 Q 20 35, 30 45 Z
                "
                dur="2s"
                repeatCount="indefinite"
                begin={`${delay}s`}
              />
            </path>

            {/* Right Wing */}
            <path
              d="M 70 50 Q 90 30, 85 20 Q 80 15, 75 20 Q 80 35, 70 45 Z"
              fill={`url(#angelGlow-${delay})`}
              stroke={color}
              strokeWidth="1"
              style={{
                transformOrigin: '70px 50px',
                animation: 'wingFlap 2s ease-in-out infinite',
                animationDelay: `${delay}s`,
              }}
            >
              <animate
                attributeName="d"
                values="
                  M 70 50 Q 90 30, 85 20 Q 80 15, 75 20 Q 80 35, 70 45 Z;
                  M 70 50 Q 95 35, 90 25 Q 85 20, 80 25 Q 85 40, 70 47 Z;
                  M 70 50 Q 90 30, 85 20 Q 80 15, 75 20 Q 80 35, 70 45 Z
                "
                dur="2s"
                repeatCount="indefinite"
                begin={`${delay}s`}
              />
            </path>
          </g>

          {/* Halo */}
          <circle
            cx="50"
            cy="30"
            r="15"
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.8"
          >
            <animate
              attributeName="r"
              values="15;17;15"
              dur="3s"
              repeatCount="indefinite"
              begin={`${delay}s`}
            />
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="3s"
              repeatCount="indefinite"
              begin={`${delay}s`}
            />
          </circle>

          {/* Body */}
          <ellipse
            cx="50"
            cy="55"
            rx="12"
            ry="18"
            fill={`url(#angelGlow-${delay})`}
            stroke={color}
            strokeWidth="1"
          />

          {/* Head */}
          <circle
            cx="50"
            cy="35"
            r="8"
            fill={`url(#angelGlow-${delay})`}
            stroke={color}
            strokeWidth="1"
          />

          {/* Arms raised in motion */}
          <line
            x1="42"
            y1="50"
            x2="35"
            y2="40"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animate
              attributeName="y2"
              values="40;35;40"
              dur="2s"
              repeatCount="indefinite"
              begin={`${delay}s`}
            />
          </line>
          <line
            x1="58"
            y1="50"
            x2="65"
            y2="40"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animate
              attributeName="y2"
              values="40;35;40"
              dur="2s"
              repeatCount="indefinite"
              begin={`${delay}s`}
            />
          </line>

          {/* Musical notes floating */}
          <text
            x="35"
            y="25"
            fontSize="8"
            fill={color}
            opacity="0.8"
            style={{
              animation: 'noteFloat 3s ease-in-out infinite',
              animationDelay: `${delay}s`,
            }}
          >
            ♪
          </text>
          <text
            x="60"
            y="20"
            fontSize="8"
            fill={color}
            opacity="0.8"
            style={{
              animation: 'noteFloat 3s ease-in-out infinite',
              animationDelay: `${delay + 0.5}s`,
            }}
          >
            ♫
          </text>
        </svg>
      </div>

      <style jsx global>{`
        @keyframes angelDance {
          0%,
          100% {
            transform: rotate(-5deg) scale(1);
          }
          25% {
            transform: rotate(5deg) scale(1.1);
          }
          50% {
            transform: rotate(-5deg) scale(1);
          }
          75% {
            transform: rotate(5deg) scale(1.1);
          }
        }

        @keyframes angelFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes wingFlap {
          0%,
          100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(1.2);
          }
        }

        @keyframes noteFloat {
          0% {
            opacity: 0.8;
            transform: translateY(0px);
          }
          50% {
            opacity: 1;
            transform: translateY(-15px);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px);
          }
        }
      `}</style>
    </div>
  );
};

export default WellnessAnimation;
