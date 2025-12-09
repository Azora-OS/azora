/**
 * RailwayDeployment
 * 
 * Handles deployment to Railway platform for services and databases.
 * Integrates with Railway API for deployment, environment variables, and monitoring.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { RailwayConfig, DeploymentHistory } from './DeploymentManager';

export interface RailwayDeploymentOptions {
  projectPath: string;
  environmentConfig: any;
  railwayConfig: RailwayConfig;
  railwayToken: string;
}

export interface RailwayDeploymentResult {
  success: boolean;
  deploymentId?: string;
  deploymentUrl?: string;
  error?: string;
  logs: string[];
}

export interface RailwayProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface RailwayEnvironment {
  id: string;
  name: string;
  projectId: string;
}

export interface RailwayService {
  id: string;
  name: string;
  projectId: string;
  environmentId: string;
}

export interface RailwayDeploymentInfo {
  id: string;
  status: 'BUILDING' | 'DEPLOYING' | 'SUCCESS' | 'FAILED' | 'CRASHED';
  createdAt: string;
  url?: string;
}

export class RailwayDeployment {
  private apiBaseUrl = 'https://backboard.railway.app/graphql/v2';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Deploy a service to Railway
   */
  async deploy(options: RailwayDeploymentOptions): Promise<RailwayDeploymentResult> {
    const logs: string[] = [];
    
    try {
      logs.push('Starting Railway deployment...');

      // Get or create project
      let projectId = options.railwayConfig.projectId;
      if (!projectId) {
        logs.push('Creating new Railway project...');
        const project = await this.createProject(path.basename(options.projectPath));
        projectId = project.id;
        logs.push(`Project created: ${project.name} (${projectId})`);
      }

      // Get or create environment
      let environmentId = options.railwayConfig.environmentId;
      if (!environmentId) {
        logs.push('Using default production environment...');
        const environments = await this.listEnvironments(projectId);
        const prodEnv = environments.find(e => e.name === 'production');
        if (prodEnv) {
          environmentId = prodEnv.id;
        } else {
          const env = await this.createEnvironment(projectId, 'production');
          environmentId = env.id;
        }
        logs.push(`Environment ID: ${environmentId}`);
      }

      // Get or create service
      let serviceId = options.railwayConfig.serviceId;
      if (!serviceId) {
        logs.push('Creating new service...');
        const service = await this.createService(
          projectId,
          environmentId,
          path.basename(options.projectPath)
        );
        serviceId = service.id;
        logs.push(`Service created: ${service.name} (${serviceId})`);
      }

      // Set environment variables
      if (options.environmentConfig.variables) {
        logs.push('Configuring environment variables...');
        await this.setEnvironmentVariables(
          projectId,
          environmentId,
          serviceId,
          options.environmentConfig.variables
        );
        logs.push('Environment variables configured');
      }

      // Configure service settings
      logs.push('Configuring service settings...');
      await this.configureService(serviceId, options.railwayConfig);
      logs.push('Service configured');

      // Trigger deployment
      logs.push('Triggering deployment...');
      const deployment = await this.triggerDeployment(serviceId, environmentId);
      logs.push(`Deployment started: ${deployment.id}`);

      // Wait for deployment to complete
      logs.push('Waiting for deployment to complete...');
      const finalState = await this.waitForDeployment(deployment.id, logs);

      if (finalState.status === 'SUCCESS') {
        const url = finalState.url || await this.getServiceUrl(serviceId);
        logs.push(`Deployment successful: ${url}`);
        return {
          success: true,
          deploymentId: finalState.id,
          deploymentUrl: url,
          logs,
        };
      } else {
        logs.push(`Deployment failed with status: ${finalState.status}`);
        return {
          success: false,
          error: `Deployment failed: ${finalState.status}`,
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
   * Create a new Railway project
   */
  private async createProject(name: string): Promise<RailwayProject> {
    const query = `
      mutation ProjectCreate($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          id
          name
          description
          createdAt
        }
      }
    `;

    const response = await this.graphqlRequest(query, {
      input: { name },
    });

    return response.projectCreate;
  }

  /**
   * Create a new environment
   */
  private async createEnvironment(
    projectId: string,
    name: string
  ): Promise<RailwayEnvironment> {
    const query = `
      mutation EnvironmentCreate($input: EnvironmentCreateInput!) {
        environmentCreate(input: $input) {
          id
          name
          projectId
        }
      }
    `;

    const response = await this.graphqlRequest(query, {
      input: { projectId, name },
    });

    return response.environmentCreate;
  }

  /**
   * List environments for a project
   */
  private async listEnvironments(projectId: string): Promise<RailwayEnvironment[]> {
    const query = `
      query Project($id: String!) {
        project(id: $id) {
          environments {
            edges {
              node {
                id
                name
                projectId
              }
            }
          }
        }
      }
    `;

    const response = await this.graphqlRequest(query, { id: projectId });
    return response.project.environments.edges.map((edge: any) => edge.node);
  }

  /**
   * Create a new service
   */
  private async createService(
    projectId: string,
    environmentId: string,
    name: string
  ): Promise<RailwayService> {
    const query = `
      mutation ServiceCreate($input: ServiceCreateInput!) {
        serviceCreate(input: $input) {
          id
          name
          projectId
        }
      }
    `;

    const response = await this.graphqlRequest(query, {
      input: { projectId, name },
    });

    return response.serviceCreate;
  }

  /**
   * Configure service settings
   */
  private async configureService(
    serviceId: string,
    config: RailwayConfig
  ): Promise<void> {
    const updates: any = {};

    if (config.region) {
      updates.region = config.region;
    }

    if (config.builder) {
      updates.builder = config.builder;
    }

    if (config.startCommand) {
      updates.startCommand = config.startCommand;
    }

    if (config.healthcheckPath) {
      updates.healthcheckPath = config.healthcheckPath;
      updates.healthcheckTimeout = config.healthcheckTimeout || 300;
    }

    if (Object.keys(updates).length > 0) {
      const query = `
        mutation ServiceUpdate($id: String!, $input: ServiceUpdateInput!) {
          serviceUpdate(id: $id, input: $input) {
            id
          }
        }
      `;

      await this.graphqlRequest(query, {
        id: serviceId,
        input: updates,
      });
    }
  }

  /**
   * Set environment variables for a service
   */
  private async setEnvironmentVariables(
    projectId: string,
    environmentId: string,
    serviceId: string,
    variables: Record<string, string>
  ): Promise<void> {
    for (const [key, value] of Object.entries(variables)) {
      const query = `
        mutation VariableUpsert($input: VariableUpsertInput!) {
          variableUpsert(input: $input)
        }
      `;

      await this.graphqlRequest(query, {
        input: {
          projectId,
          environmentId,
          serviceId,
          name: key,
          value,
        },
      });
    }
  }

  /**
   * Trigger a deployment
   */
  private async triggerDeployment(
    serviceId: string,
    environmentId: string
  ): Promise<RailwayDeploymentInfo> {
    const query = `
      mutation DeploymentTrigger($input: DeploymentTriggerInput!) {
        deploymentTrigger(input: $input) {
          id
          status
          createdAt
        }
      }
    `;

    const response = await this.graphqlRequest(query, {
      input: {
        serviceId,
        environmentId,
      },
    });

    return response.deploymentTrigger;
  }

  /**
   * Wait for deployment to complete
   */
  private async waitForDeployment(
    deploymentId: string,
    logs: string[],
    maxWaitTime = 600000 // 10 minutes
  ): Promise<RailwayDeploymentInfo> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const deployment = await this.getDeployment(deploymentId);
      
      logs.push(`Deployment status: ${deployment.status}`);

      if (deployment.status === 'SUCCESS') {
        return deployment;
      }

      if (deployment.status === 'FAILED' || deployment.status === 'CRASHED') {
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
  async getDeployment(deploymentId: string): Promise<RailwayDeploymentInfo> {
    const query = `
      query Deployment($id: String!) {
        deployment(id: $id) {
          id
          status
          createdAt
          url
        }
      }
    `;

    const response = await this.graphqlRequest(query, { id: deploymentId });
    return response.deployment;
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string): Promise<string[]> {
    try {
      const query = `
        query DeploymentLogs($deploymentId: String!) {
          deploymentLogs(deploymentId: $deploymentId) {
            logs
          }
        }
      `;

      const response = await this.graphqlRequest(query, { deploymentId });
      return response.deploymentLogs.logs || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get service URL
   */
  private async getServiceUrl(serviceId: string): Promise<string> {
    const query = `
      query Service($id: String!) {
        service(id: $id) {
          domains {
            edges {
              node {
                domain
              }
            }
          }
        }
      }
    `;

    const response = await this.graphqlRequest(query, { id: serviceId });
    const domains = response.service.domains.edges;
    
    if (domains.length > 0) {
      return `https://${domains[0].node.domain}`;
    }

    return '';
  }

  /**
   * Get project information
   */
  async getProject(projectId: string): Promise<RailwayProject> {
    const query = `
      query Project($id: String!) {
        project(id: $id) {
          id
          name
          description
          createdAt
        }
      }
    `;

    const response = await this.graphqlRequest(query, { id: projectId });
    return response.project;
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<RailwayProject[]> {
    const query = `
      query Projects {
        projects {
          edges {
            node {
              id
              name
              description
              createdAt
            }
          }
        }
      }
    `;

    const response = await this.graphqlRequest(query);
    return response.projects.edges.map((edge: any) => edge.node);
  }

  /**
   * Make a GraphQL request to Railway
   */
  private async graphqlRequest(query: string, variables: any = {}): Promise<any> {
    const response = await fetch(this.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Railway API error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`Railway GraphQL error: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  /**
   * Validate Railway token
   */
  async validateToken(): Promise<boolean> {
    try {
      const query = `
        query Me {
          me {
            id
          }
        }
      `;
      await this.graphqlRequest(query);
      return true;
    } catch (error) {
      return false;
    }
  }
}
