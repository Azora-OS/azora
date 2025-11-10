import React from 'react';
export type ServiceName = 'sapiens' | 'forge' | 'covenant' | 'aegis' | 'oracle' | 'mint' | 'nexus' | 'synapse' | 'pay' | 'education' | 'scriptorium' | 'workspace' | 'careers' | 'classroom' | 'community' | 'innovation-hub' | 'library' | 'mint-mine' | 'research-center' | 'student-life';
export interface ServiceLogoProps {
    service: ServiceName;
    size?: number;
    animated?: boolean;
    showName?: boolean;
    className?: string;
}
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
export declare const ServiceLogo: React.FC<ServiceLogoProps>;
export default ServiceLogo;
//# sourceMappingURL=ServiceLogo.d.ts.map