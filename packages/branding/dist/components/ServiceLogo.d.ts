/**
 * Service Logo Component
 * Displays Azora OS service logos from packages/public/branding
 *
 * All 21 service logos available
 */
import * as React from 'react';
export type ServiceName = 'sapiens' | 'forge' | 'covenant' | 'aegis' | 'oracle' | 'mint' | 'nexus' | 'synapse' | 'pay' | 'education' | 'scriptorium' | 'workspace' | 'careers' | 'classroom' | 'community' | 'innovation-hub' | 'library' | 'mint-mine' | 'research-center' | 'student-life';
export type ServiceLogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;
export interface ServiceLogoProps {
    service: ServiceName;
    size?: ServiceLogoSize;
    showName?: boolean;
    animated?: boolean;
    className?: string;
}
/**
 * Service Logo Component
 *
 * @example
 * ```tsx
 * <ServiceLogo service="sapiens" size="lg" showName />
 * <ServiceLogo service="forge" size={150} animated />
 * ```
 */
export declare const ServiceLogo: React.ForwardRefExoticComponent<ServiceLogoProps & React.RefAttributes<HTMLDivElement>>;
export default ServiceLogo;
//# sourceMappingURL=ServiceLogo.d.ts.map