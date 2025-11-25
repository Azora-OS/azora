/**
 * VercelDeployment
 * 
 * Handles deployment to Vercel platform for Next.js applications.
 * Integrates with Vercel API for deployment, environment variables, and status monitoring.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { VercelConfig, DeploymentHistory } from './DeploymentManager';

export interface VercelDeploymentOptions {
  projectPath: string;
  environmentConfig: any;
  vercelConfig: VercelConfig;
  vercelToken: string;
}

export interface VercelDeploymentResult {
  success: boolean;
  deploymentId?: string;
  deploymentUrl?: string;
  error?: string;
  logs: string[];
}

export interface VercelProject {
  id: string;
  name: string;
  framework?: string;
  buildCommand?: string;
  outputDirectory?: string;
}

export interface VercelDeploymentInfo {
  id: string;
  url: string;
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  createdAt: number;
  readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
}

export class VercelDeployment {
  private apiBaseUrl = 'https://api.vercel.com';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Deploy a Next.js application to Vercel
   */
  async deploy(options: VercelDeploymentOptions): Promise<VercelDeploymentResult> {
    const logs: string[] = [];
    
    try {
      logs.push('Starting Vercel deployment...');

      // Validate project structure
      const isValid = await this.validateProject(options.projectPath);
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid Next.js project structure',
          logs,
        };
      }

      logs.push('Project validation passed');

      // Get or create Vercel project
      let projectId = options.vercelConfig.projectId;
      if (!projectId) {
        logs.push('Creating new Vercel project...');
        const project = await this.createProject(options);
        projectId = project.id;
        logs.push(`Project created: ${project.name} (${projectId})`);
      }

      // Set environment variables
      if (options.environmentConfig.variables) {
        logs.push('Configuring environment variables...');
        await this.setEnvironmentVariables(
          projectId,
          options.environmentConfig.variables,
          options.vercelConfig.teamId
        );
        logs.push('Environment variables configured');
      }

      // Trigger deployment
      logs.push('Triggering deployment...');
      const deployment = await this.triggerDeployment(options, projectId);
      logs.push(`Deployment started: ${deployment.id}`);

      // Wait for deployment to complete
      logs.push('Waiting for deployment to complete...');
      const finalState = await this.waitForDeployment(deployment.id, logs);

      if (finalState.state === 'READY') {
        logs.push(`Deployment successful: ${finalState.url}`);
        return {
          success: true,
          deploymentId: finalState.id,
          deploymentUrl: finalState.url,
          logs,
        };
      } else {
        logs.push(`Deployment failed with state: ${finalState.state}`);
        return {
          success: false,
          error: `Deployment failed: ${finalState.state}`,
          logs,
        };
      }
    } catch (error) {
      logs.push(`Error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        logs,
      };
    }
  }

  /**
   * Validate that the project is a valid Next.js application
   */
  private async validateProject(projectPath: string): Promise<boolean> {
    try {
      // Check for package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!await fs.pathExists(packageJsonPath)) {
        return false;
      }

      // Check for Next.js dependency
      const packageJson = await fs.readJson(packageJsonPath);
      const hasNext = packageJson.dependencies?.next || packageJson.devDependencies?.next;
      
      return !!hasNext;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a new Vercel project
   */
  private async createProject(options: VercelDeploymentOptions): Promise<VercelProject> {
    const projectName = path.basename(options.projectPath);
    
    const response = await this.apiRequest('/v9/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: projectName,
        framework: options.vercelConfig.framework || 'nextjs',
        buildCommand: options.vercelConfig.buildCommand,
        outputDirectory: options.vercelConfig.outputDirectory,
        installCommand: options.vercelConfig.installCommand,
        rootDirectory: options.vercelConfig.rootDirectory,
      }),
      teamId: options.vercelConfig.teamId,
    });

    return response;
  }

  /**
   * Set environment variables for a project
   */
  private async setEnvironmentVariables(
    projectId: string,
    variables: Record<string, string>,
    teamId?: string
  ): Promise<void> {
    // Get existing environment variables
    const existing = await this.getEnvironmentVariables(projectId, teamId);
    const existingKeys = new Set(existing.map((env: any) => env.key));

    // Add or update each variable
    for (const [key, value] of Object.entries(variables)) {
      if (existingKeys.has(key)) {
        // Update existing variable
        await this.updateEnvironmentVariable(projectId, key, value, teamId);
      } else {
        // Create new variable
        await this.createEnvironmentVariable(projectId, key, value, teamId);
      }
    }
  }

  /**
   * Get environment variables for a project
   */
  private async getEnvironmentVariables(
    projectId: string,
    teamId?: string
  ): Promise<any[]> {
    const response = await this.apiRequest(
      `/v9/projects/${projectId}/env`,
      { teamId }
    );
    return response.envs || [];
  }

  /**
   * Create an environment variable
   */
  private async createEnvironmentVariable(
    projectId: string,
    key: string,
    value: string,
    teamId?: string
  ): Promise<void> {
    await this.apiRequest(`/v9/projects/${projectId}/env`, {
      method: 'POST',
      body: JSON.stringify({
        key,
        value,
        type: 'encrypted',
        target: ['production', 'preview', 'development'],
      }),
      teamId,
    });
  }

  /**
   * Update an environment variable
   */
  private async updateEnvironmentVariable(
    projectId: string,
    key: string,
    value: string,
    teamId?: string
  ): Promise<void> {
    // Vercel requires deleting and recreating to update
    const envs = await this.getEnvironmentVariables(projectId, teamId);
    const env = envs.find((e: any) => e.key === key);
    
    if (env) {
      // Delete old variable
      await this.apiRequest(`/v9/projects/${projectId}/env/${env.id}`, {
        method: 'DELETE',
        teamId,
      });
      
      // Create new variable
      await this.createEnvironmentVariable(projectId, key, value, teamId);
    }
  }

  /**
   * Trigger a deployment
   */
  private async triggerDeployment(
    options: VercelDeploymentOptions,
    projectId: string
  ): Promise<VercelDeploymentInfo> {
    // Create deployment using file upload
    // In a real implementation, this would upload the project files
    // For now, we'll use a simplified approach
    
    const response = await this.apiRequest('/v13/deployments', {
      method: 'POST',
      body: JSON.stringify({
        name: path.basename(options.projectPath),
        project: projectId,
        target: 'production',
        gitSource: {
          type: 'github',
          // In a real implementation, this would use the actual git repo
        },
      }),
      teamId: options.vercelConfig.teamId,
    });

    return response;
  }

  /**
   * Wait for deployment to complete
   */
  private async waitForDeployment(
    deploymentId: string,
    logs: string[],
    maxWaitTime = 600000 // 10 minutes
  ): Promise<VercelDeploymentInfo> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const deployment = await this.getDeployment(deploymentId);
      
      logs.push(`Deployment state: ${deployment.readyState}`);

      if (deployment.readyState === 'READY') {
        return deployment;
      }

      if (deployment.readyState === 'ERROR' || deployment.readyState === 'CANCELED') {
        return deployment;
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Deployment timeout');
  }

  /**
   * Get deployment information
   */
  async getDeployment(deploymentId: string): Promise<VercelDeploymentInfo> {
    return await this.apiRequest(`/v13/deployments/${deploymentId}`);
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    try {
      const response = await this.apiRequest(`/v2/deployments/${deploymentId}/events`);
      return response.map((event: any) => event.text || event.payload?.text || '').filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  /**
   * Cancel a deployment
   */
  async cancelDeployment(deploymentId: string): Promise<void> {
    await this.apiRequest(`/v12/deployments/${deploymentId}/cancel`, {
      method: 'PATCH',
    });
  }

  /**
   * Get project information
   */
  async getProject(projectId: string, teamId?: string): Promise<VercelProject> {
    return await this.apiRequest(`/v9/projects/${projectId}`, { teamId });
  }

  /**
   * List all projects
   */
  async listProjects(teamId?: string): Promise<VercelProject[]> {
    const response = await this.apiRequest('/v9/projects', { teamId });
    return response.projects || [];
  }

  /**
   * Make an API request to Vercel
   */
  private async apiRequest(
    endpoint: string,
    options: {
      method?: string;
      body?: string;
      teamId?: string;
    } = {}
  ): Promise<any> {
    const url = new URL(endpoint, this.apiBaseUrl);
    
    if (options.teamId) {
      url.searchParams.set('teamId', options.teamId);
    }

    const response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: options.body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vercel API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  /**
   * Validate Vercel token
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.apiRequest('/v2/user');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get deployment URL
   */
  getDeploymentUrl(deployment: VercelDeploymentInfo): string {
    return `https://${deployment.url}`;
  }
}
