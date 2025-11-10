/**
 * SANKOFA ENGINE - The Living Philosophical Heart
 * "Sovereignty Amplification Network for Knowledge, Opportunity, Finance & Abundance"
 * 
 * Visual representation of the circular Ubuntu philosophy:
 * "What goes around, comes around amplified"
 */
import * as React from 'react';

export interface SankofaEngineProps {
  size?: number;
  animated?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  showMetrics?: boolean;
  className?: string;
}

export const SankofaEngine = React.forwardRef<HTMLDivElement, SankofaEngineProps>(
  ({ 
    size = 400,
    animated = true,
    speed = 'normal',
    showMetrics = false,
    className = '' 
  }, ref) => {
    const [metrics, setMetrics] = React.useState({
      sovereignty: 85,
      knowledge: 92,
      opportunity: 78,
      finance: 88,
      abundance: 95,
    });
    
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.42;
    const innerRadius = size * 0.25;
    
    const rotationSpeed = speed === 'fast' ? '15s' : speed === 'slow' ? '45s' : '30s';
    
    // Calculate positions for the 5 S.A.N.K.O.F.A. pillars
    const pillars = [
      { name: 'Sovereignty', angle: -90, color: '#8b5cf6', icon: '👑' },
      { name: 'Knowledge', angle: -18, color: '#3b82f6', icon: '📚' },
      { name: 'Opportunity', angle: 54, color: '#10b981', icon: '🚀' },
      { name: 'Finance', angle: 126, color: '#f59e0b', icon: '💰' },
      { name: 'Abundance', angle: 198, color: '#ec4899', icon: '✨' },
    ];
    
    const getPillarPosition = (angle: number, radius: number) => ({
      x: centerX + radius * Math.cos((angle * Math.PI) / 180),
      y: centerY + radius * Math.sin((angle * Math.PI) / 180),
    });
    
    return (
      <div 
        ref={ref}
        className={`sankofa-engine ${className}`}
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'inline-block',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            {/* Gradient for the circular flow */}
            <linearGradient id="sankofaFlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="20%" stopColor="#3b82f6" />
              <stop offset="40%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="sankofaGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Pulsing glow */}
            <filter id="pulseGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer ring - rotating */}
          <g transform={`rotate(0 ${centerX} ${centerY})`}>
            <circle
              cx={centerX}
              cy={centerY}
              r={outerRadius}
              fill="none"
              stroke="url(#sankofaFlow)"
              strokeWidth="3"
              opacity="0.4"
              filter="url(#sankofaGlow)"
            >
              {animated && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from={`0 ${centerX} ${centerY}`}
                  to={`360 ${centerX} ${centerY}`}
                  dur={rotationSpeed}
                  repeatCount="indefinite"
                />
              )}
            </circle>
            
            {/* Outer ring particles */}
            {animated && (
              <>
                <circle r="4" fill="#8b5cf6" opacity="0.8" filter="url(#sankofaGlow)">
                  <animateMotion
                    dur={rotationSpeed}
                    repeatCount="indefinite"
                    path={`M ${centerX + outerRadius},${centerY} A ${outerRadius},${outerRadius} 0 1,1 ${centerX + outerRadius},${centerY - 0.1}`}
                  />
                </circle>
                
                <circle r="4" fill="#10b981" opacity="0.8" filter="url(#sankofaGlow)">
                  <animateMotion
                    dur={rotationSpeed}
                    repeatCount="indefinite"
                    path={`M ${centerX - outerRadius},${centerY} A ${outerRadius},${outerRadius} 0 1,1 ${centerX - outerRadius},${centerY - 0.1}`}
                  />
                </circle>
              </>
            )}
          </g>
          
          {/* Inner ring - rotating opposite direction */}
          <g>
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="none"
              stroke="url(#sankofaFlow)"
              strokeWidth="2"
              opacity="0.3"
            >
              {animated && (
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from={`360 ${centerX} ${centerY}`}
                  to={`0 ${centerX} ${centerY}`}
                  dur={rotationSpeed}
                  repeatCount="indefinite"
                />
              )}
            </circle>
          </g>
          
          {/* Center core - pulsing */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius * 0.6}
            fill="url(#sankofaFlow)"
            opacity="0.3"
            filter="url(#pulseGlow)"
          >
            {animated && (
              <>
                <animate
                  attributeName="r"
                  values={`${innerRadius * 0.5};${innerRadius * 0.7};${innerRadius * 0.5}`}
                  dur="4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.2;0.5;0.2"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
          
          {/* Ubuntu symbol in center */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size * 0.15}
            fill="#fff"
            opacity="0.8"
            fontWeight="bold"
          >
            ⚡
            {animated && (
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </text>
          
          {/* The 5 S.A.N.K.O.F.A. pillars */}
          {pillars.map((pillar, index) => {
            const pos = getPillarPosition(pillar.angle, outerRadius);
            return (
              <g key={pillar.name}>
                {/* Connecting line to center */}
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={pillar.color}
                  strokeWidth="1.5"
                  opacity="0.2"
                >
                  {animated && (
                    <animate
                      attributeName="opacity"
                      values="0.1;0.4;0.1"
                      dur="3s"
                      repeatCount="indefinite"
                      begin={`${index * 0.6}s`}
                    />
                  )}
                </line>
                
                {/* Pillar node */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size * 0.06}
                  fill={pillar.color}
                  stroke="#fff"
                  strokeWidth="2"
                  filter="url(#sankofaGlow)"
                >
                  {animated && (
                    <animate
                      attributeName="r"
                      values={`${size * 0.05};${size * 0.07};${size * 0.05}`}
                      dur="2s"
                      repeatCount="indefinite"
                      begin={`${index * 0.4}s`}
                    />
                  )}
                </circle>
                
                {/* Icon */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={size * 0.04}
                >
                  {pillar.icon}
                </text>
                
                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + size * 0.08}
                  textAnchor="middle"
                  fontSize={size * 0.035}
                  fill="#fff"
                  fontWeight="600"
                  opacity="0.9"
                >
                  {pillar.name}
                </text>
              </g>
            );
          })}
          
          {/* Energy flow arrows */}
          {animated && pillars.map((pillar, index) => {
            const nextPillar = pillars[(index + 1) % pillars.length];
            const start = getPillarPosition(pillar.angle, outerRadius * 0.85);
            const end = getPillarPosition(nextPillar.angle, outerRadius * 0.85);
            
            return (
              <g key={`arrow-${index}`}>
                <circle r="3" fill={pillar.color} opacity="0.6">
                  <animateMotion
                    dur="5s"
                    repeatCount="indefinite"
                    begin={`${index * 1}s`}
                    path={`M ${start.x},${start.y} Q ${centerX},${centerY} ${end.x},${end.y}`}
                  />
                </circle>
              </g>
            );
          })}
        </svg>
        
        {showMetrics && (
          <div style={{
            position: 'absolute',
            bottom: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#fff',
            width: '100%',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              SANKOFA ENGINE STATUS
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {pillars.map((pillar, i) => (
                <div key={pillar.name} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  color: pillar.color 
                }}>
                  <span>{pillar.icon}</span>
                  <span>{Object.values(metrics)[i]}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SankofaEngine.displayName = 'SankofaEngine';

export default SankofaEngine;
