/**
 * DeploymentManager
 * 
 * Manages deployment configurations, environments, and deployment targets.
 * Handles environment variables, secrets, and deployment orchestration.
 */

export type EnvironmentType = 'development' | 'staging' | 'production';

export type DeploymentTarget = 'vercel' | 'railway' | 'docker' | 'custom';

export interface EnvironmentConfig {
  id: string;
  name: string;
  type: EnvironmentType;
  variables: Record<string, string>;
  secrets: Record<string, string>; // References to secrets in vault
  deploymentTarget?: DeploymentTarget;
  targetConfig?: VercelConfig | RailwayConfig | DockerConfig | CustomConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface VercelConfig {
  projectId: string;
  teamId?: string;
  framework?: string;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  rootDirectory?: string;
}

export interface RailwayConfig {
  projectId: string;
  environmentId?: string;
  serviceId?: string;
  region?: string;
  builder?: 'nixpacks' | 'dockerfile';
  startCommand?: string;
  healthcheckPath?: string;
  healthcheckTimeout?: number;
}

export interface DockerConfig {
  registry: string;
  imageName: string;
  tag: string;
  dockerfile?: string;
  buildContext?: string;
  buildArgs?: Record<string, string>;
  composeFile?: string;
}

export interface CustomConfig {
  type: string;
  config: Record<string, any>;
}

export interface DeploymentHistory {
  id: string;
  environmentId: string;
  target: DeploymentTarget;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  deploymentUrl?: string;
  logs: string[];
  error?: string;
  metadata?: Record<string, any>;
}

export interface DeploymentStatus {
  environmentId: string;
  target: DeploymentTarget;
  status: 'idle' | 'deploying' | 'deployed' | 'failed';
  lastDeployment?: DeploymentHistory;
  liveUrl?: string;
  health?: 'healthy' | 'unhealthy' | 'unknown';
}

export class DeploymentManager {
  private environments: Map<string, EnvironmentConfig> = new Map();
  private deploymentHistory: DeploymentHistory[] = [];
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.loadEnvironments();
  }

  /**
   * Create a new environment configuration
   */
  async createEnvironment(
    name: string,
    type: EnvironmentType,
    target?: DeploymentTarget
  ): Promise<EnvironmentConfig> {
    const id = `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const environment: EnvironmentConfig = {
      id,
      name,
      type,
      variables: {},
      secrets: {},
      deploymentTarget: target,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.environments.set(id, environment);
    await this.saveEnvironments();

    return environment;
  }

  /**
   * Update environment configuration
   */
  async updateEnvironment(
    id: string,
    updates: Partial<EnvironmentConfig>
  ): Promise<EnvironmentConfig> {
    const environment = this.environments.get(id);
    if (!environment) {
      throw new Error(`Environment ${id} not found`);
    }

    const updated = {
      ...environment,
      ...updates,
      id: environment.id, // Prevent ID change
      createdAt: environment.createdAt, // Prevent creation date change
      updatedAt: new Date(),
    };

    this.environments.set(id, updated);
    await this.saveEnvironments();

    return updated;
  }

  /**
   * Delete an environment
   */
  async deleteEnvironment(id: string): Promise<void> {
    if (!this.environments.has(id)) {
      throw new Error(`Environment ${id} not found`);
    }

    this.environments.delete(id);
    await this.saveEnvironments();
  }

  /**
   * Get all environments
   */
  getEnvironments(): EnvironmentConfig[] {
    return Array.from(this.environments.values());
  }

  /**
   * Get environment by ID
   */
  getEnvironment(id: string): EnvironmentConfig | undefined {
    return this.environments.get(id);
  }

  /**
   * Set environment variable
   */
  async setEnvironmentVariable(
    environmentId: string,
    key: string,
    value: string
  ): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    environment.variables[key] = value;
    environment.updatedAt = new Date();
    await this.saveEnvironments();
  }

  /**
   * Remove environment variable
   */
  async removeEnvironmentVariable(
    environmentId: string,
    key: string
  ): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    delete environment.variables[key];
    environment.updatedAt = new Date();
    await this.saveEnvironments();
  }

  /**
   * Set environment secret reference
   */
  async setEnvironmentSecret(
    environmentId: string,
    key: string,
    secretId: string
  ): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    environment.secrets[key] = secretId;
    environment.updatedAt = new Date();
    await this.saveEnvironments();
  }

  /**
   * Remove environment secret
   */
  async removeEnvironmentSecret(
    environmentId: string,
    key: string
  ): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    delete environment.secrets[key];
    environment.updatedAt = new Date();
    await this.saveEnvironments();
  }

  /**
   * Configure deployment target
   */
  async configureDeploymentTarget(
    environmentId: string,
    target: DeploymentTarget,
    config: VercelConfig | RailwayConfig | DockerConfig | CustomConfig
  ): Promise<void> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    environment.deploymentTarget = target;
    environment.targetConfig = config;
    environment.updatedAt = new Date();
    await this.saveEnvironments();
  }

  /**
   * Get deployment history for an environment
   */
  getDeploymentHistory(environmentId: string): DeploymentHistory[] {
    return this.deploymentHistory
      .filter(d => d.environmentId === environmentId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  /**
   * Get latest deployment for an environment
   */
  getLatestDeployment(environmentId: string): DeploymentHistory | undefined {
    const history = this.getDeploymentHistory(environmentId);
    return history[0];
  }

  /**
   * Add deployment to history
   */
  addDeploymentHistory(deployment: DeploymentHistory): void {
    this.deploymentHistory.push(deployment);
    
    // Keep only last 50 deployments per environment
    const envDeployments = this.getDeploymentHistory(deployment.environmentId);
    if (envDeployments.length > 50) {
      const toRemove = envDeployments.slice(50);
      this.deploymentHistory = this.deploymentHistory.filter(
        d => !toRemove.includes(d)
      );
    }
  }

  /**
   * Get deployment status for an environment
   */
  getDeploymentStatus(environmentId: string): DeploymentStatus {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    const lastDeployment = this.getLatestDeployment(environmentId);
    
    let status: DeploymentStatus['status'] = 'idle';
    if (lastDeployment) {
      if (lastDeployment.status === 'building' || lastDeployment.status === 'deploying') {
        status = 'deploying';
      } else if (lastDeployment.status === 'success') {
        status = 'deployed';
      } else if (lastDeployment.status === 'failed') {
        status = 'failed';
      }
    }

    return {
      environmentId,
      target: environment.deploymentTarget || 'custom',
      status,
      lastDeployment,
      liveUrl: lastDeployment?.deploymentUrl,
      health: 'unknown',
    };
  }

  /**
   * Load environments from disk
   */
  private loadEnvironments(): void {
    // In a real implementation, this would load from a config file
    // For now, we'll initialize with default environments
    const defaultEnvs: Array<{ name: string; type: EnvironmentType }> = [
      { name: 'Development', type: 'development' },
      { name: 'Staging', type: 'staging' },
      { name: 'Production', type: 'production' },
    ];

    defaultEnvs.forEach(({ name, type }) => {
      const id = `env_${type}`;
      if (!this.environments.has(id)) {
        this.environments.set(id, {
          id,
          name,
          type,
          variables: {},
          secrets: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
  }

  /**
   * Save environments to disk
   */
  private async saveEnvironments(): Promise<void> {
    // In a real implementation, this would save to a config file
    // For now, we'll just keep them in memory
  }

  /**
   * Export environment configuration for deployment
   */
  exportEnvironmentConfig(environmentId: string): Record<string, string> {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      throw new Error(`Environment ${environmentId} not found`);
    }

    // Return only the variables (secrets should be resolved separately)
    return { ...environment.variables };
  }

  /**
   * Validate environment configuration
   */
  validateEnvironment(environmentId: string): { valid: boolean; errors: string[] } {
    const environment = this.environments.get(environmentId);
    if (!environment) {
      return { valid: false, errors: ['Environment not found'] };
    }

    const errors: string[] = [];

    // Check if deployment target is configured
    if (!environment.deploymentTarget) {
      errors.push('No deployment target configured');
    }

    // Check if target config is present
    if (environment.deploymentTarget && !environment.targetConfig) {
      errors.push('Deployment target configuration is missing');
    }

    // Validate target-specific configuration
    if (environment.deploymentTarget === 'vercel' && environment.targetConfig) {
      const config = environment.targetConfig as VercelConfig;
      if (!config.projectId) {
        errors.push('Vercel project ID is required');
      }
    }

    if (environment.deploymentTarget === 'railway' && environment.targetConfig) {
      const config = environment.targetConfig as RailwayConfig;
      if (!config.projectId) {
        errors.push('Railway project ID is required');
      }
    }

    if (environment.deploymentTarget === 'docker' && environment.targetConfig) {
      const config = environment.targetConfig as DockerConfig;
      if (!config.registry) {
        errors.push('Docker registry is required');
      }
      if (!config.imageName) {
        errors.push('Docker image name is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
