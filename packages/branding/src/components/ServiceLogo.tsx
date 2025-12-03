/**
 * Service Logo Component
 * Displays Azora OS service logos from packages/public/branding
 * 
 * All 21 service logos available
 */
import * as React from 'react';

export type ServiceName = 
  | 'sapiens'
  | 'forge'
  | 'covenant'
  | 'aegis'
  | 'oracle'
  | 'mint'
  | 'nexus'
  | 'synapse'
  | 'pay'
  | 'education'
  | 'scriptorium'
  | 'workspace'
  | 'careers'
  | 'classroom'
  | 'community'
  | 'innovation-hub'
  | 'library'
  | 'mint-mine'
  | 'research-center'
  | 'student-life';

export type ServiceLogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface ServiceLogoProps {
  service: ServiceName;
  size?: ServiceLogoSize;
  showName?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeMap: Record<Exclude<ServiceLogoSize, number>, number> = {
  sm: 64,
  md: 120,
  lg: 200,
  xl: 300,
};

const serviceNames: Record<ServiceName, string> = {
  sapiens: 'Azora Sapiens',
  forge: 'Azora Forge',
  covenant: 'Azora Covenant',
  aegis: 'Azora Aegis',
  oracle: 'Azora Oracle',
  mint: 'Azora Mint',
  nexus: 'Azora Nexus',
  synapse: 'Azora Synapse',
  pay: 'Azora Pay',
  education: 'Azora Education',
  scriptorium: 'Azora Scriptorium',
  workspace: 'Azora Workspace',
  careers: 'Azora Careers',
  classroom: 'Azora Classroom',
  community: 'Azora Community',
  'innovation-hub': 'Azora Innovation Hub',
  library: 'Azora Library',
  'mint-mine': 'Azora Mint Mine',
  'research-center': 'Azora Research Center',
  'student-life': 'Azora Student Life',
};

/**
 * Service Logo Component
 * 
 * @example
 * ```tsx
 * <ServiceLogo service="sapiens" size="lg" showName />
 * <ServiceLogo service="forge" size={150} animated />
 * ```
 */
export const ServiceLogo = React.forwardRef<HTMLDivElement, ServiceLogoProps>(
  ({ service, size = 'md', showName = false, animated = false, className = '' }, ref) => {
    const computedSize = typeof size === 'number' ? size : sizeMap[size];
    const serviceName = serviceNames[service];
    const logoPath = `/packages/public/branding/services/azora-${service}-logo.svg`;

    return (
      <div 
        ref={ref}
        className={`service-logo inline-flex flex-col items-center gap-2 ${animated ? 'animate-pulse-premium' : ''} ${className}`}
      >
        <img
          src={logoPath}
          alt={serviceName}
          width={computedSize}
          height={computedSize}
          className="object-contain"
          style={{ width: computedSize, height: computedSize }}
        />
        {showName && (
          <span 
            className="service-logo-name text-sm font-semibold text-foreground tracking-wide"
            style={{ fontSize: Math.max(12, computedSize * 0.1) }}
          >
            {serviceName}
          </span>
        )}
      </div>
    );
  }
);

ServiceLogo.displayName = "ServiceLogo";

export default ServiceLogo;
