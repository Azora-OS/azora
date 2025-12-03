/**
 * DockerDeployment
 * 
 * Handles Docker containerization and deployment.
 * Generates Dockerfiles, builds images, and creates docker-compose configurations.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DockerConfig } from './DeploymentManager';

const execAsync = promisify(exec);

export interface DockerDeploymentOptions {
  projectPath: string;
  environmentConfig: any;
  dockerConfig: DockerConfig;
}

export interface DockerDeploymentResult {
  success: boolean;
  imageId?: string;
  imageTag?: string;
  error?: string;
  logs: string[];
}

export interface DockerfileTemplate {
  baseImage: string;
  workdir: string;
  copyFiles: string[];
  installCommands: string[];
  buildCommands: string[];
  exposePort?: number;
  startCommand: string;
  envVars?: Record<string, string>;
}

export class DockerDeployment {
  /**
   * Deploy using Docker
   */
  async deploy(options: DockerDeploymentOptions): Promise<DockerDeploymentResult> {
    const logs: string[] = [];
    
    try {
      logs.push('Starting Docker deployment...');

      // Check if Docker is installed
      const dockerInstalled = await this.checkDockerInstalled();
      if (!dockerInstalled) {
        return {
          success: false,
          error: 'Docker is not installed or not running',
          logs,
        };
      }

      logs.push('Docker is available');

      // Generate or validate Dockerfile
      const dockerfilePath = options.dockerConfig.dockerfile || 
        path.join(options.projectPath, 'Dockerfile');
      
      if (!await fs.pathExists(dockerfilePath)) {
        logs.push('Generating Dockerfile...');
        await this.generateDockerfile(options.projectPath, dockerfilePath);
        logs.push('Dockerfile generated');
      } else {
        logs.push('Using existing Dockerfile');
      }

      // Build Docker image
      logs.push('Building Docker image...');
      const imageTag = `${options.dockerConfig.registry}/${options.dockerConfig.imageName}:${options.dockerConfig.tag}`;
      
      const buildResult = await this.buildImage(
        options.projectPath,
        imageTag,
        dockerfilePath,
        options.dockerConfig.buildContext,
        options.dockerConfig.buildArgs,
        logs
      );

      if (!buildResult.success) {
        return {
          success: false,
          error: buildResult.error,
          logs,
        };
      }

      logs.push(`Image built successfully: ${imageTag}`);

      // Push image to registry if configured
      if (options.dockerConfig.registry && options.dockerConfig.registry !== 'local') {
        logs.push('Pushing image to registry...');
        const pushResult = await this.pushImage(imageTag, logs);
        
        if (!pushResult.success) {
          return {
            success: false,
            error: pushResult.error,
            logs,
          };
        }
        
        logs.push('Image pushed successfully');
      }

      // Generate docker-compose if needed
      if (options.dockerConfig.composeFile) {
        logs.push('Generating docker-compose configuration...');
        await this.generateDockerCompose(
          options.projectPath,
          options.dockerConfig.composeFile,
          imageTag,
          options.environmentConfig.variables
        );
        logs.push('docker-compose.yml generated');
      }

      return {
        success: true,
        imageId: buildResult.imageId,
        imageTag,
        logs,
      };
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
   * Check if Docker is installed and running
   */
  private async checkDockerInstalled(): Promise<boolean> {
    try {
      await execAsync('docker --version');
      await execAsync('docker ps');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a Dockerfile for the project
   */
  async generateDockerfile(
    projectPath: string,
    outputPath: string
  ): Promise<void> {
    // Detect project type
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const template = this.detectNodeTemplate(packageJson);
      const dockerfile = this.generateNodeDockerfile(template);
      await fs.writeFile(outputPath, dockerfile);
    } else {
      throw new Error('Unsupported project type');
    }
  }

  /**
   * Detect Node.js project template
   */
  private detectNodeTemplate(packageJson: any): DockerfileTemplate {
    const hasNext = packageJson.dependencies?.next || packageJson.devDependencies?.next;
    const hasExpress = packageJson.dependencies?.express;
    const hasNest = packageJson.dependencies?.['@nestjs/core'];

    if (hasNext) {
      return {
        baseImage: 'node:20-alpine',
        workdir: '/app',
        copyFiles: ['package*.json', '.'],
        installCommands: ['npm ci --only=production'],
        buildCommands: ['npm run build'],
        exposePort: 3000,
        startCommand: 'npm start',
      };
    } else if (hasNest) {
      return {
        baseImage: 'node:20-alpine',
        workdir: '/app',
        copyFiles: ['package*.json', '.'],
        installCommands: ['npm ci --only=production'],
        buildCommands: ['npm run build'],
        exposePort: 3000,
        startCommand: 'node dist/main',
      };
    } else if (hasExpress) {
      return {
        baseImage: 'node:20-alpine',
        workdir: '/app',
        copyFiles: ['package*.json', '.'],
        installCommands: ['npm ci --only=production'],
        buildCommands: [],
        exposePort: 3000,
        startCommand: 'node index.js',
      };
    } else {
      return {
        baseImage: 'node:20-alpine',
        workdir: '/app',
        copyFiles: ['package*.json', '.'],
        installCommands: ['npm ci'],
        buildCommands: [],
        exposePort: 3000,
        startCommand: 'npm start',
      };
    }
  }

  /**
   * Generate Dockerfile content for Node.js projects
   */
  private generateNodeDockerfile(template: DockerfileTemplate): string {
    const lines: string[] = [];

    // Multi-stage build for Next.js
    if (template.buildCommands.length > 0) {
      lines.push('# Build stage');
      lines.push(`FROM ${template.baseImage} AS builder`);
      lines.push(`WORKDIR ${template.workdir}`);
      lines.push('');
      lines.push('# Copy package files');
      lines.push('COPY package*.json ./');
      lines.push('');
      lines.push('# Install dependencies');
      lines.push('RUN npm ci');
      lines.push('');
      lines.push('# Copy source code');
      lines.push('COPY . .');
      lines.push('');
      lines.push('# Build application');
      template.buildCommands.forEach(cmd => {
        lines.push(`RUN ${cmd}`);
      });
      lines.push('');
      lines.push('# Production stage');
      lines.push(`FROM ${template.baseImage}`);
      lines.push(`WORKDIR ${template.workdir}`);
      lines.push('');
      lines.push('# Copy package files');
      lines.push('COPY package*.json ./');
      lines.push('');
      lines.push('# Install production dependencies');
      template.installCommands.forEach(cmd => {
        lines.push(`RUN ${cmd}`);
      });
      lines.push('');
      lines.push('# Copy built application from builder');
      lines.push(`COPY --from=builder ${template.workdir}/.next ./.next`);
      lines.push(`COPY --from=builder ${template.workdir}/public ./public`);
      lines.push(`COPY --from=builder ${template.workdir}/next.config.js ./`);
    } else {
      // Single-stage build
      lines.push(`FROM ${template.baseImage}`);
      lines.push(`WORKDIR ${template.workdir}`);
      lines.push('');
      lines.push('# Copy package files');
      lines.push('COPY package*.json ./');
      lines.push('');
      lines.push('# Install dependencies');
      template.installCommands.forEach(cmd => {
        lines.push(`RUN ${cmd}`);
      });
      lines.push('');
      lines.push('# Copy source code');
      lines.push('COPY . .');
    }

    lines.push('');
    lines.push('# Expose port');
    if (template.exposePort) {
      lines.push(`EXPOSE ${template.exposePort}`);
    }
    lines.push('');
    lines.push('# Start application');
    lines.push(`CMD ["${template.startCommand.split(' ')[0]}", "${template.startCommand.split(' ').slice(1).join('", "')}"]`);

    return lines.join('\n');
  }

  /**
   * Build Docker image
   */
  private async buildImage(
    projectPath: string,
    imageTag: string,
    dockerfilePath: string,
    buildContext?: string,
    buildArgs?: Record<string, string>,
    logs?: string[]
  ): Promise<{ success: boolean; imageId?: string; error?: string }> {
    try {
      const context = buildContext || projectPath;
      const dockerfile = path.relative(context, dockerfilePath);
      
      let command = `docker build -t ${imageTag} -f ${dockerfile}`;
      
      // Add build args
      if (buildArgs) {
        Object.entries(buildArgs).forEach(([key, value]) => {
          command += ` --build-arg ${key}=${value}`;
        });
      }
      
      command += ` ${context}`;

      const { stdout, stderr } = await execAsync(command, {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });

      if (logs) {
        logs.push(stdout);
        if (stderr) logs.push(stderr);
      }

      // Extract image ID from output
      const imageIdMatch = stdout.match(/Successfully built ([a-f0-9]+)/);
      const imageId = imageIdMatch ? imageIdMatch[1] : undefined;

      return { success: true, imageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Push Docker image to registry
   */
  private async pushImage(
    imageTag: string,
    logs?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { stdout, stderr } = await execAsync(`docker push ${imageTag}`, {
        maxBuffer: 10 * 1024 * 1024,
      });

      if (logs) {
        logs.push(stdout);
        if (stderr) logs.push(stderr);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate docker-compose.yml
   */
  async generateDockerCompose(
    projectPath: string,
    outputPath: string,
    imageTag: string,
    envVars?: Record<string, string>
  ): Promise<void> {
    const serviceName = path.basename(projectPath).toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const compose = {
      version: '3.8',
      services: {
        [serviceName]: {
          image: imageTag,
          ports: ['3000:3000'],
          environment: envVars || {},
          restart: 'unless-stopped',
        },
      },
    };

    const yaml = this.objectToYaml(compose);
    const fullPath = path.join(projectPath, outputPath);
    await fs.writeFile(fullPath, yaml);
  }

  /**
   * Convert object to YAML (simple implementation)
   */
  private objectToYaml(obj: any, indent = 0): string {
    const lines: string[] = [];
    const spaces = '  '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        lines.push(`${spaces}${key}:`);
      } else if (Array.isArray(value)) {
        lines.push(`${spaces}${key}:`);
        value.forEach(item => {
          if (typeof item === 'object') {
            lines.push(`${spaces}- ${this.objectToYaml(item, indent + 1).trim()}`);
          } else {
            lines.push(`${spaces}- ${item}`);
          }
        });
      } else if (typeof value === 'object') {
        lines.push(`${spaces}${key}:`);
        lines.push(this.objectToYaml(value, indent + 1));
      } else {
        lines.push(`${spaces}${key}: ${value}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * List Docker images
   */
  async listImages(): Promise<Array<{ id: string; tag: string; size: string }>> {
    try {
      const { stdout } = await execAsync('docker images --format "{{.ID}}|{{.Repository}}:{{.Tag}}|{{.Size}}"');
      
      return stdout
        .trim()
        .split('\n')
        .filter(line => line)
        .map(line => {
          const [id, tag, size] = line.split('|');
          return { id, tag, size };
        });
    } catch (error) {
      return [];
    }
  }

  /**
   * Remove Docker image
   */
  async removeImage(imageId: string): Promise<boolean> {
    try {
      await execAsync(`docker rmi ${imageId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Run container locally for testing
   */
  async runContainer(
    imageTag: string,
    port: number,
    envVars?: Record<string, string>
  ): Promise<{ success: boolean; containerId?: string; error?: string }> {
    try {
      let command = `docker run -d -p ${port}:3000`;
      
      if (envVars) {
        Object.entries(envVars).forEach(([key, value]) => {
          command += ` -e ${key}="${value}"`;
        });
      }
      
      command += ` ${imageTag}`;

      const { stdout } = await execAsync(command);
      const containerId = stdout.trim();

      return { success: true, containerId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Stop and remove container
   */
  async stopContainer(containerId: string): Promise<boolean> {
    try {
      await execAsync(`docker stop ${containerId}`);
      await execAsync(`docker rm ${containerId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(containerId: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`docker logs ${containerId}`);
      return stdout.split('\n').filter(line => line);
    } catch (error) {
      return [];
    }
  }
}
