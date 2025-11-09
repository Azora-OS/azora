import React from 'react';

export type ServiceName = 
  | 'sapiens' | 'forge' | 'covenant' | 'aegis' | 'oracle' 
  | 'mint' | 'nexus' | 'synapse' | 'pay' | 'education'
  | 'scriptorium' | 'workspace' | 'careers' | 'classroom'
  | 'community' | 'innovation-hub' | 'library' | 'mint-mine'
  | 'research-center' | 'student-life';

export interface ServiceLogoProps {
  service: ServiceName;
  size?: number;
  animated?: boolean;
  showName?: boolean;
  className?: string;
}

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
 * Displays the logo for a specific Azora service.
 * Each service has its own unique branding and symbolism.
 * 
 * @example
 * ```tsx
 * <ServiceLogo service="sapiens" size={200} animated showName />
 * ```
 */
export const ServiceLogo: React.FC<ServiceLogoProps> = ({
  service,
  size = 200,
  animated = false,
  showName = false,
  className = '',
}) => {
  const logoPath = `/packages/public/branding/azora-${service}-logo.svg`;
  const serviceName = serviceNames[service];

  return (
    <div 
      className={`service-logo service-logo-${service} ${animated ? 'service-logo-animated' : ''} ${className}`}
      style={{ width: size, display: 'inline-block' }}
    >
      <img
        src={logoPath}
        alt={serviceName}
        width={size}
        height={size * 0.3} // Maintain aspect ratio (240/800)
        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
      />
      {showName && (
        <p className="service-logo-name" style={{
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#94a3b8',
          textAlign: 'center',
          fontWeight: 600,
        }}>
          {serviceName}
        </p>
      )}
    </div>
  );
};

export default ServiceLogo;
