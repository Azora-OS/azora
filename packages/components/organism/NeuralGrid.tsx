/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🧬 Neural Grid Component
 * 
 * Grid layout with neural connections between cells
 */

'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NeuralGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  showConnections?: boolean;
  className?: string;
}

export const NeuralGrid: React.FC<NeuralGridProps> = ({
  children,
  columns = 3,
  gap = 6,
  showConnections = true,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {/* Background mycelium network */}
      {showConnections && (
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-30">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00c2ff" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#33ff92" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8a2aff" stopOpacity="0.6" />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal connections */}
            {[...Array(Math.ceil(React.Children.count(children) / columns))].map((_, row) => (
              <g key={`h-${row}`}>
                {[...Array(columns - 1)].map((_, col) => (
                  <path
                    key={col}
                    d={`M ${(col + 1) * (100 / columns)},${(row + 0.5) * (100 / Math.ceil(React.Children.count(children) / columns))} 
                        Q ${(col + 1.5) * (100 / columns)},${(row + 0.5) * (100 / Math.ceil(React.Children.count(children) / columns))} 
                        ${(col + 2) * (100 / columns)},${(row + 0.5) * (100 / Math.ceil(React.Children.count(children) / columns))}`}
                    stroke="url(#neural-gradient)"
                    strokeWidth="2"
                    fill="none"
                    filter="url(#glow)"
                    className="animate-[neuralFlow_3s_ease-in-out_infinite]"
                    style={{ animationDelay: `${(row * columns + col) * 0.2}s` }}
                  />
                ))}
              </g>
            ))}

            {/* Vertical connections */}
            {[...Array(columns)].map((_, col) => (
              <g key={`v-${col}`}>
                {[...Array(Math.ceil(React.Children.count(children) / columns) - 1)].map((_, row) => (
                  <path
                    key={row}
                    d={`M ${(col + 0.5) * (100 / columns)},${(row + 1) * (100 / Math.ceil(React.Children.count(children) / columns))} 
                        Q ${(col + 0.5) * (100 / columns)},${(row + 1.5) * (100 / Math.ceil(React.Children.count(children) / columns))} 
                        ${(col + 0.5) * (100 / columns)},${(row + 2) * (100 / Math.ceil(React.Children.count(children) / columns))}`}
                    stroke="url(#neural-gradient)"
                    strokeWidth="2"
                    fill="none"
                    filter="url(#glow)"
                    className="animate-[neuralFlow_3s_ease-in-out_infinite]"
                    style={{ animationDelay: `${(row * columns + col) * 0.2 + 0.5}s` }}
                  />
                ))}
              </g>
            ))}

            {/* Node points */}
            {[...Array(Math.ceil(React.Children.count(children) / columns))].map((_, row) => (
              <g key={`nodes-${row}`}>
                {[...Array(columns)].map((_, col) => (
                  <circle
                    key={col}
                    cx={`${(col + 0.5) * (100 / columns)}%`}
                    cy={`${(row + 0.5) * (100 / Math.ceil(React.Children.count(children) / columns))}%`}
                    r="4"
                    fill="url(#neural-gradient)"
                    filter="url(#glow)"
                    className="animate-pulse"
                    style={{ animationDelay: `${(row * columns + col) * 0.1}s` }}
                  />
                ))}
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Grid */}
      <div
        className={cn('grid gap-' + gap)}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="relative group"
            style={{
              animation: `organicFloat 5s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export const neuralGridStyles = `
  @keyframes neuralFlow {
    0%, 100% { 
      stroke-dasharray: 10, 10;
      stroke-dashoffset: 0;
      opacity: 0.6;
    }
    50% { 
      stroke-dashoffset: 20;
      opacity: 1;
    }
  }

  @keyframes organicFloat {
    0%, 100% { 
      transform: translateY(0px);
    }
    50% { 
      transform: translateY(-10px);
    }
  }
`;

export default NeuralGrid;

