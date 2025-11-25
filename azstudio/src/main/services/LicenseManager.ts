/**
 * AzStudio License Manager
 * Detects workspace type and enables/disables features accordingly
 */

import * as path from 'path';
import * as fs from 'fs-extra';

export enum LicenseType {
    FREE = 'free',
    PRO = 'pro',
    AZORA_INTERNAL = 'azora-internal',
}

export interface AzoraWorkspace {
    version: string;
    license: string;
    ecosystem: string;
    features: {
        microservices: boolean;
        payments: boolean;
        blockchain: boolean;
        ai: boolean;
        premiumUI: boolean;
        fullStack: boolean;
        kubernetes: boolean;
        monitoring: boolean;
    };
}

export interface LicenseFeatures {
    visualBuilder: boolean;
    basicTemplates: boolean;
    advancedTemplates: boolean;
    microservices: boolean;
    payments: boolean;
    blockchain: boolean;
    aiOrchestration: boolean;
    premiumUI: boolean;
    azoraTemplates: boolean;
    dockerCompose: boolean;
    kubernetes: boolean;
    codeExport: boolean;
    aiAssistance: 'basic' | 'advanced' | 'unlimited';
}

export class LicenseManager {
    private licenseType: LicenseType = LicenseType.FREE;
    private azoraWorkspace: AzoraWorkspace | null = null;

    /**
     * Detect license type from workspace
     */
    async detectLicense(workspacePath: string): Promise<LicenseType> {
        // Check for .azora-workspace file
        const azoraWorkspaceFile = path.join(workspacePath, '.azora-workspace');
        if (await fs.pathExists(azoraWorkspaceFile)) {
            this.azoraWorkspace = await fs.readJSON(azoraWorkspaceFile);
            if (this.azoraWorkspace?.license === 'AZORA_INTERNAL') {
                this.licenseType = LicenseType.AZORA_INTERNAL;
                return LicenseType.AZORA_INTERNAL;
            }
        }

        // Check environment variables
        if (process.env.AZORA_LICENSE_KEY === 'azora-internal-full-access-2024') {
            this.licenseType = LicenseType.AZORA_INTERNAL;
            return LicenseType.AZORA_INTERNAL;
        }

        // Check package.json
        const packageJsonPath = path.join(workspacePath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJSON(packageJsonPath);
            if (packageJson.azora?.internal === true) {
                this.licenseType = LicenseType.AZORA_INTERNAL;
                return LicenseType.AZORA_INTERNAL;
            }
        }

        // Check for Pro license (would validate against server)
        const proLicenseKey = await this.getStoredLicenseKey();
        if (proLicenseKey && await this.validateProLicense(proLicenseKey)) {
            this.licenseType = LicenseType.PRO;
            return LicenseType.PRO;
        }

        // Default to free
        this.licenseType = LicenseType.FREE;
        return LicenseType.FREE;
    }

    /**
     * Get available features for current license
     */
    getFeatures(): LicenseFeatures {
        const features: Record<LicenseType, LicenseFeatures> = {
            [LicenseType.FREE]: {
                visualBuilder: true,
                basicTemplates: true,
                advancedTemplates: false,
                microservices: false,
                payments: false,
                blockchain: false,
                aiOrchestration: false,
                premiumUI: false,
                azoraTemplates: false,
                dockerCompose: false,
                kubernetes: false,
                codeExport: true,
                aiAssistance: 'basic',
            },
            [LicenseType.PRO]: {
                visualBuilder: true,
                basicTemplates: true,
                advancedTemplates: true,
                microservices: false,
                payments: false,
                blockchain: false,
                aiOrchestration: false,
                premiumUI: false,
                azoraTemplates: false,
                dockerCompose: true,
                kubernetes: false,
                codeExport: true,
                aiAssistance: 'advanced',
            },
            [LicenseType.AZORA_INTERNAL]: {
                visualBuilder: true,
                basicTemplates: true,
                advancedTemplates: true,
                microservices: true,
                payments: true,
                blockchain: true,
                aiOrchestration: true,
                premiumUI: true,
                azoraTemplates: true,
                dockerCompose: true,
                kubernetes: true,
                codeExport: true,
                aiAssistance: 'unlimited',
            },
        };

        return features[this.licenseType];
    }

    /**
     * Check if feature is available
     */
    hasFeature(feature: keyof LicenseFeatures): boolean {
        const features = this.getFeatures();
        return !!features[feature];
    }

    /**
     * Get license type
     */
    getLicenseType(): LicenseType {
        return this.licenseType;
    }

    /**
     * Get license display name
     */
    getLicenseName(): string {
        const names = {
            [LicenseType.FREE]: 'Free',
            [LicenseType.PRO]: 'Pro',
            [LicenseType.AZORA_INTERNAL]: 'Azora Internal',
        };
        return names[this.licenseType];
    }

    /**
     * Validate Pro license key (would call Azora server)
     */
    private async validateProLicense(key: string): Promise<boolean> {
        // TODO: Implement server validation
        return false;
    }

    /**
     * Get stored license key
     */
    private async getStoredLicenseKey(): Promise<string | null> {
        // TODO: Implement secure storage
        return null;
    }
}

export const licenseManager = new LicenseManager();
