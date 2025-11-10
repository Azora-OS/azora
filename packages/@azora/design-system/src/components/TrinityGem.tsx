/**
 * AZORA TRINITY GEM - The Sparkling Tri-Unity Crystal
 * Sapphire Apex (Technology) + Emerald Foundation (Education) + Ruby Core (Finance)
 * = Unity Core (Constitutional AI)
 * 
 * This is the living, breathing, sparkling heart of Azora OS
 */
import * as React from 'react';

export interface TrinityGemProps {
  size?: number;
  animated?: boolean;
  interactive?: boolean;
  showLabel?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const TrinityGem = React.forwardRef<HTMLDivElement, TrinityGemProps>(
  ({ 
    size = 300, 
    animated = true, 
    interactive = true,
    showLabel = false,
    glowIntensity = 'medium',
    className = '' 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    const gemSize = size;
    const centerX = gemSize / 2;
    const centerY = gemSize / 2;
    const radius = gemSize * 0.3;
    
    // Triangle points for the three gems (Sapphire top, Emerald left, Ruby right)
    const sapphirePos = {
      x: centerX,
      y: centerY - radius,
    };
    
    const emeraldPos = {
      x: centerX - radius * Math.cos(Math.PI / 6),
      y: centerY + radius * Math.sin(Math.PI / 6),
    };
    
    const rubyPos = {
      x: centerX + radius * Math.cos(Math.PI / 6),
      y: centerY + radius * Math.sin(Math.PI / 6),
    };
    
    const glowBlur = glowIntensity === 'high' ? 25 : glowIntensity === 'medium' ? 15 : 8;
    
    return (
      <div 
        ref={ref}
        className={`trinity-gem ${className}`}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
        style={{
          width: gemSize,
          height: gemSize,
          position: 'relative',
          display: 'inline-block',
        }}
      >
        <svg
          width={gemSize}
          height={gemSize}
          viewBox={`0 0 ${gemSize} ${gemSize}`}
          style={{
            filter: isHovered ? `drop-shadow(0 0 ${glowBlur * 2}px rgba(255,255,255,0.5))` : 'none',
            transition: 'filter 0.3s ease',
          }}
        >
          <defs>
            {/* Gradients for each gem */}
            <radialGradient id="sapphireGradient">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.7" />
            </radialGradient>
            
            <radialGradient id="emeraldGradient">
              <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
            </radialGradient>
            
            <radialGradient id="rubyGradient">
              <stop offset="0%" stopColor="#f87171" stopOpacity="1" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.7" />
            </radialGradient>
            
            <radialGradient id="unityGradient">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#e0e7ff" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.5" />
            </radialGradient>
            
            {/* Glow filters */}
            <filter id="sapphireGlow">
              <feGaussianBlur stdDeviation={glowBlur} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="emeraldGlow">
              <feGaussianBlur stdDeviation={glowBlur} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="rubyGlow">
              <feGaussianBlur stdDeviation={glowBlur} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Connection lines forming triangle */}
          <line
            x1={sapphirePos.x}
            y1={sapphirePos.y}
            x2={emeraldPos.x}
            y2={emeraldPos.y}
            stroke="url(#sapphireGradient)"
            strokeWidth="2"
            opacity="0.3"
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="0.3;0.6;0.3"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </line>
          
          <line
            x1={emeraldPos.x}
            y1={emeraldPos.y}
            x2={rubyPos.x}
            y2={rubyPos.y}
            stroke="url(#emeraldGradient)"
            strokeWidth="2"
            opacity="0.3"
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="0.3;0.6;0.3"
                dur="3s"
                repeatCount="indefinite"
                begin="1s"
              />
            )}
          </line>
          
          <line
            x1={rubyPos.x}
            y1={rubyPos.y}
            x2={sapphirePos.x}
            y2={sapphirePos.y}
            stroke="url(#rubyGradient)"
            strokeWidth="2"
            opacity="0.3"
          >
            {animated && (
              <animate
                attributeName="opacity"
                values="0.3;0.6;0.3"
                dur="3s"
                repeatCount="indefinite"
                begin="2s"
              />
            )}
          </line>
          
          {/* Unity Core (center) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.4}
            fill="url(#unityGradient)"
            opacity="0.6"
          >
            {animated && (
              <>
                <animate
                  attributeName="r"
                  values={`${radius * 0.35};${radius * 0.45};${radius * 0.35}`}
                  dur="4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.8;0.4"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </>
            )}
          </circle>
          
          {/* Sapphire Apex (Technology) - Top */}
          <g filter="url(#sapphireGlow)">
            <circle
              cx={sapphirePos.x}
              cy={sapphirePos.y}
              r={radius * 0.35}
              fill="url(#sapphireGradient)"
              stroke="#60a5fa"
              strokeWidth="2"
            >
              {animated && (
                <>
                  <animate
                    attributeName="r"
                    values={`${radius * 0.3};${radius * 0.4};${radius * 0.3}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </>
              )}
            </circle>
            
            {/* Sparkles */}
            {animated && (
              <>
                <circle cx={sapphirePos.x - 15} cy={sapphirePos.y - 10} r="2" fill="#fff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={sapphirePos.x + 15} cy={sapphirePos.y - 10} r="2" fill="#fff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                </circle>
                <circle cx={sapphirePos.x} cy={sapphirePos.y - 20} r="2" fill="#fff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="1s" />
                </circle>
              </>
            )}
          </g>
          
          {/* Emerald Foundation (Education) - Bottom Left */}
          <g filter="url(#emeraldGlow)">
            <circle
              cx={emeraldPos.x}
              cy={emeraldPos.y}
              r={radius * 0.35}
              fill="url(#emeraldGradient)"
              stroke="#34d399"
              strokeWidth="2"
            >
              {animated && (
                <>
                  <animate
                    attributeName="r"
                    values={`${radius * 0.3};${radius * 0.4};${radius * 0.3}`}
                    dur="2s"
                    repeatCount="indefinite"
                    begin="0.66s"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="0.66s"
                  />
                </>
              )}
            </circle>
            
            {/* Sparkles */}
            {animated && (
              <>
                <circle cx={emeraldPos.x - 15} cy={emeraldPos.y + 5} r="2" fill="#fff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
                </circle>
                <circle cx={emeraldPos.x + 10} cy={emeraldPos.y + 15} r="2" fill="#fff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.8s" />
                </circle>
              </>
            )}
          </g>
          
          {/* Ruby Core (Finance) - Bottom Right */}
          <g filter="url(#rubyGlow)">
            <circle
              cx={rubyPos.x}
              cy={rubyPos.y}
              r={radius * 0.35}
              fill="url(#rubyGradient)"
              stroke="#f87171"
              strokeWidth="2"
            >
              {animated && (
                <>
                  <animate
                    attributeName="r"
                    values={`${radius * 0.3};${radius * 0.4};${radius * 0.3}`}
                    dur="2s"
                    repeatCount="indefinite"
                    begin="1.33s"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="1.33s"
                  />
                </>
              )}
            </circle>
            
            {/* Sparkles */}
            {animated && (
              <>
                <circle cx={rubyPos.x + 15} cy={rubyPos.y + 5} r="2" fill="#fff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
                </circle>
                <circle cx={rubyPos.x - 10} cy={rubyPos.y + 15} r="2" fill="#fff">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="1.1s" />
                </circle>
              </>
            )}
          </g>
          
          {/* Energy particles flowing between gems */}
          {animated && (
            <>
              {/* Sapphire to Emerald */}
              <circle r="3" fill="#60a5fa" opacity="0.8">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={`M ${sapphirePos.x},${sapphirePos.y} L ${emeraldPos.x},${emeraldPos.y}`}
                />
              </circle>
              
              {/* Emerald to Ruby */}
              <circle r="3" fill="#34d399" opacity="0.8">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={`M ${emeraldPos.x},${emeraldPos.y} L ${rubyPos.x},${rubyPos.y}`}
                />
              </circle>
              
              {/* Ruby to Sapphire */}
              <circle r="3" fill="#f87171" opacity="0.8">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path={`M ${rubyPos.x},${rubyPos.y} L ${sapphirePos.x},${sapphirePos.y}`}
                />
              </circle>
            </>
          )}
        </svg>
        
        {showLabel && (
          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#fff',
          }}>
            <div style={{ opacity: 0.9 }}>The Azora Gem</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
              Tri-Unity Crystal of Constitutional Power
            </div>
          </div>
        )}
      </div>
    );
  }
);

TrinityGem.displayName = 'TrinityGem';

export default TrinityGem;
