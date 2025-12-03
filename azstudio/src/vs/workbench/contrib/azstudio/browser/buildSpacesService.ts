/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';

export interface IBuildSpace {
	id: string;
	name: string;
	type: 'web' | 'mobile' | 'desktop' | 'backend' | 'microservice';
	framework: string;
	technology: string[];
	status: 'active' | 'building' | 'deployed' | 'failed';
	createdAt: Date;
	updatedAt: Date;
	lastBuildAt?: Date;
	buildCount: number;
	deployUrl?: string;
	environment: 'development' | 'staging' | 'production';
}

export interface IBuildRequest {
	id: string;
	spaceId: string;
	type: 'build' | 'deploy' | 'test' | 'analyze';
	status: 'pending' | 'in_progress' | 'completed' | 'failed';
	startedAt?: Date;
	completedAt?: Date;
	duration?: number;
	logs: string[];
	result?: IBuildResult;
}

export interface IBuildResult {
	success: boolean;
	artifacts: Array<{
		name: string;
		path: string;
		size: number;
		type: string;
	}>;
	metrics: {
		buildTime: number;
		bundleSize: number;
		performanceScore?: number;
		coverage?: number;
	};
	errors?: string[];
	warnings?: string[];
}

export const IBuildSpacesService = createDecorator<IBuildSpacesService>('buildSpacesService');

export interface IBuildSpacesService {
	readonly _serviceBrand: undefined;
	
	// Events
	readonly onSpaceCreated: Event<IBuildSpace>;
	readonly onSpaceUpdated: Event<IBuildSpace>;
	readonly onBuildStarted: Event<IBuildRequest>;
	readonly onBuildCompleted: Event<IBuildRequest>;
	
	// Build Space Management
	createSpace(config: Omit<IBuildSpace, 'id' | 'createdAt' | 'updatedAt' | 'buildCount'>): IBuildSpace;
	getSpaces(): IBuildSpace[];
	getSpace(id: string): IBuildSpace | undefined;
	updateSpace(id: string, updates: Partial<IBuildSpace>): void;
	deleteSpace(id: string): void;
	
	// Build Management
	buildSpace(spaceId: string, type: IBuildRequest['type']): Promise<IBuildRequest>;
	getBuilds(spaceId?: string): IBuildRequest[];
	getBuild(id: string): IBuildRequest | undefined;
	
	// Deployment
	deploySpace(spaceId: string, environment: IBuildSpace['environment']): Promise<IBuildRequest>;
	getDeploymentStatus(spaceId: string): IBuildSpace['status'];
	
	// Analytics
	getBuildMetrics(spaceId: string): Promise<IBuildResult['metrics']>;
	getSpaceAnalytics(spaceId: string): Promise<{
		totalBuilds: number;
		successRate: number;
		averageBuildTime: number;
		lastBuildStatus: IBuildSpace['status'];
	}>;
}

export class BuildSpacesService extends Disposable implements IBuildSpacesService {
	readonly _serviceBrand: undefined;
	
	private readonly _onSpaceCreated = this._register(new Emitter<IBuildSpace>());
	readonly onSpaceCreated = this._onSpaceCreated.event;
	
	private readonly _onSpaceUpdated = this._register(new Emitter<IBuildSpace>());
	readonly onSpaceUpdated = this._onSpaceUpdated.event;
	
	private readonly _onBuildStarted = this._register(new Emitter<IBuildRequest>());
	readonly onBuildStarted = this._onBuildStarted.event;
	
	private readonly _onBuildCompleted = this._register(new Emitter<IBuildRequest>());
	readonly onBuildCompleted = this._onBuildCompleted.event;
	
	private spaces: Map<string, IBuildSpace> = new Map();
	private builds: Map<string, IBuildRequest> = new Map();
	
	constructor() {
		super();
		this.initializeDefaultSpaces();
	}
	
	// Build Space Management
	createSpace(config: Omit<IBuildSpace, 'id' | 'createdAt' | 'updatedAt' | 'buildCount'>): IBuildSpace {
		const space: IBuildSpace = {
			...config,
			id: this.generateId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			buildCount: 0
		};
		
		this.spaces.set(space.id, space);
		this._onSpaceCreated.fire(space);
		
		return space;
	}
	
	getSpaces(): IBuildSpace[] {
		return Array.from(this.spaces.values());
	}
	
	getSpace(id: string): IBuildSpace | undefined {
		return this.spaces.get(id);
	}
	
	updateSpace(id: string, updates: Partial<IBuildSpace>): void {
		const space = this.spaces.get(id);
		if (space) {
			Object.assign(space, updates, { updatedAt: new Date() });
			this._onSpaceUpdated.fire(space);
		}
	}
	
	deleteSpace(id: string): void {
		this.spaces.delete(id);
		// Also delete associated builds
		const spaceBuilds = Array.from(this.builds.values()).filter(build => build.spaceId === id);
		spaceBuilds.forEach(build => this.builds.delete(build.id));
	}
	
	// Build Management
	async buildSpace(spaceId: string, type: IBuildRequest['type']): Promise<IBuildRequest> {
		const space = this.getSpace(spaceId);
		if (!space) {
			throw new Error(`Build space ${spaceId} not found`);
		}
		
		const build: IBuildRequest = {
			id: this.generateId(),
			spaceId,
			type,
			status: 'pending',
			logs: []
		};
		
		this.builds.set(build.id, build);
		this._onBuildStarted.fire(build);
		
		// Update space status
		this.updateSpace(spaceId, { status: 'building' });
		
		// Execute build
		return this.executeBuild(build);
	}
	
	getBuilds(spaceId?: string): IBuildRequest[] {
		const allBuilds = Array.from(this.builds.values());
		return spaceId ? allBuilds.filter(build => build.spaceId === spaceId) : allBuilds;
	}
	
	getBuild(id: string): IBuildRequest | undefined {
		return this.builds.get(id);
	}
	
	// Deployment
	async deploySpace(spaceId: string, environment: IBuildSpace['environment']): Promise<IBuildRequest> {
		// First build the space
		const build = await this.buildSpace(spaceId, 'build');
		
		// Then deploy
		const deployBuild = await this.buildSpace(spaceId, 'deploy');
		
		// Update space with deployment info
		this.updateSpace(spaceId, { 
			environment,
			status: 'deployed',
			deployUrl: `https://${spaceId}.${environment}.azora.app`
		});
		
		return deployBuild;
	}
	
	getDeploymentStatus(spaceId: string): IBuildSpace['status'] {
		const space = this.getSpace(spaceId);
		return space?.status || 'failed';
	}
	
	// Analytics
	async getBuildMetrics(spaceId: string): Promise<IBuildResult['metrics']> {
		const spaceBuilds = this.getBuilds(spaceId);
		const completedBuilds = spaceBuilds.filter(build => build.status === 'completed' && build.result);
		
		if (completedBuilds.length === 0) {
			return {
				buildTime: 0,
				bundleSize: 0
			};
		}
		
		const latestBuild = completedBuilds[completedBuilds.length - 1];
		return latestBuild.result!.metrics;
	}
	
	async getSpaceAnalytics(spaceId: string): Promise<{
		totalBuilds: number;
		successRate: number;
		averageBuildTime: number;
		lastBuildStatus: IBuildSpace['status'];
	}> {
		const spaceBuilds = this.getBuilds(spaceId);
		const completedBuilds = spaceBuilds.filter(build => build.status === 'completed');
		const successfulBuilds = completedBuilds.filter(build => build.result?.success);
		
		const successRate = spaceBuilds.length > 0 ? (successfulBuilds.length / spaceBuilds.length) * 100 : 0;
		const averageBuildTime = successfulBuilds.length > 0 
			? successfulBuilds.reduce((sum, build) => sum + (build.result?.metrics.buildTime || 0), 0) / successfulBuilds.length
			: 0;
		
		const space = this.getSpace(spaceId);
		
		return {
			totalBuilds: spaceBuilds.length,
			successRate,
			averageBuildTime,
			lastBuildStatus: space?.status || 'failed'
		};
	}
	
	// Private Methods
	private initializeDefaultSpaces(): void {
		// Create some default build spaces for demonstration
		const defaultSpaces = [
			{
				name: 'AzStudio Web App',
				type: 'web' as const,
				framework: 'React',
				technology: ['React', 'TypeScript', 'Tailwind CSS'],
				status: 'active' as const,
				environment: 'development' as const
			},
			{
				name: 'AzStudio API',
				type: 'backend' as const,
				framework: 'Node.js',
				technology: ['Node.js', 'Express', 'TypeScript'],
				status: 'active' as const,
				environment: 'development' as const
			},
			{
				name: 'AzStudio Mobile',
				type: 'mobile' as const,
				framework: 'React Native',
				technology: ['React Native', 'TypeScript'],
				status: 'active' as const,
				environment: 'development' as const
			}
		];
		
		defaultSpaces.forEach(spaceConfig => {
			this.createSpace(spaceConfig);
		});
	}
	
	private async executeBuild(build: IBuildRequest): Promise<IBuildRequest> {
		const space = this.getSpace(build.spaceId);
		if (!space) {
			throw new Error(`Build space ${build.spaceId} not found`);
		}
		
		// Update build status
		build.status = 'in_progress';
		build.startedAt = new Date();
		build.logs.push(`Starting ${build.type} for ${space.name}...`);
		
		try {
			// Simulate build process
			await this.simulateBuildProcess(build);
			
			// Generate build result
			const result = this.generateBuildResult(space, build.type);
			build.result = result;
			build.status = result.success ? 'completed' : 'failed';
			build.completedAt = new Date();
			build.duration = build.completedAt.getTime() - build.startedAt!.getTime();
			
			build.logs.push(`Build ${result.success ? 'completed' : 'failed'} in ${build.duration}ms`);
			
			// Update space
			this.updateSpace(build.spaceId, {
				status: result.success ? 'deployed' : 'failed',
				lastBuildAt: build.completedAt,
				buildCount: space.buildCount + 1,
				deployUrl: result.success ? `https://${space.name.toLowerCase().replace(/\s+/g, '-')}.azora.app` : undefined
			});
			
		} catch (error) {
			build.status = 'failed';
			build.completedAt = new Date();
			build.logs.push(`Build failed: ${error}`);
			
			this.updateSpace(build.spaceId, { status: 'failed' });
		}
		
		this._onBuildCompleted.fire(build);
		return build;
	}
	
	private async simulateBuildProcess(build: IBuildRequest): Promise<void> {
		// Simulate different build times based on type
		const buildTimes = {
			build: 3000 + Math.random() * 5000,
			deploy: 2000 + Math.random() * 3000,
			test: 4000 + Math.random() * 6000,
			analyze: 1000 + Math.random() * 2000
		};
		
		const buildTime = buildTimes[build.type];
		await new Promise(resolve => setTimeout(resolve, buildTime));
	}
	
	private generateBuildResult(space: IBuildSpace, type: IBuildRequest['type']): IBuildResult {
		const success = Math.random() > 0.1; // 90% success rate
		
		return {
			success,
			artifacts: success ? [
				{
					name: `${space.name.replace(/\s+/g, '-')}-${type}.zip`,
					path: `/builds/${space.id}/${type}-artifacts.zip`,
					size: Math.floor(Math.random() * 10000000), // Random size up to 10MB
					type: 'application/zip'
				}
			] : [],
			metrics: {
				buildTime: Math.floor(Math.random() * 10000),
				bundleSize: Math.floor(Math.random() * 1000000),
				performanceScore: success ? Math.floor(Math.random() * 30) + 70 : undefined,
				coverage: type === 'test' ? Math.floor(Math.random() * 40) + 60 : undefined
			},
			errors: success ? undefined : ['Build failed due to compilation error'],
			warnings: success ? [Math.random() > 0.5 ? 'Minor warning about deprecated API' : null].filter(Boolean) : ['Multiple warnings detected']
		};
	}
	
	private generateId(): string {
		return `buildspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
