/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAzStudioRulesEngine, AgentValidationContext } from './rules/azStudioRules.js';
import { AgentSpec, Requirement, PolicyConstraint, Priority } from '../coreTypes.js';
import { IAIProviderRouter, AIProviderType } from './aiProviderRouter.js';

export const ILeadArchitectService = createDecorator<ILeadArchitectService>('leadArchitectService');

export interface ILeadArchitectService {
	readonly _serviceBrand: undefined;

	// Converts a free-form user intent into a structured AgentSpec
	generateSpecFromIntent(intent: string): Promise<AgentSpec>;
	
	// Validates that a task complies with workspace rules before creating a spec
	validateTaskForAgents(intent: string, agentIds: string[]): Promise<boolean>;
	
	// Generate spec using AI providers with fallback
	generateSpecWithAI(intent: string, preferredProvider?: AIProviderType): Promise<AgentSpec>;
}

export class LeadArchitectService extends Disposable implements ILeadArchitectService {
	readonly _serviceBrand: undefined;

	constructor(
		@IAzStudioRulesEngine private readonly rulesEngine: IAzStudioRulesEngine,
		@IAIProviderRouter private readonly aiRouter: IAIProviderRouter
	) {
		super();
	}

	async generateSpecFromIntent(intent: string): Promise<AgentSpec> {
		// Apply AzStudio rules to normalize and constrain the instruction
		const normalized = await this.rulesEngine.applyRules(intent, {
			workspacePath: '',
			projectType: 'typescript',
			technologies: ['react', 'nodejs'],
			userPreferences: {},
			currentTask: intent
		});

		const requirements: Requirement[] = [
			{
				description: normalized,
				priority: 'high' as Priority,
				testCases: []
			}
		];

		const constraints: PolicyConstraint[] = [];

		return {
			id: this.generateId(),
			requirements,
			constraints,
			telemetryHooks: [],
			status: 'draft'
		};
	}
	
	async validateTaskForAgents(intent: string, agentIds: string[]): Promise<boolean> {
		for (const agentId of agentIds) {
			const validation = await this.rulesEngine.validateAgentTask({
				agentId,
				task: intent,
				workspacePath: '',
				projectType: 'typescript',
				technologies: ['react', 'nodejs']
			});
			
			if (!validation.allowed) {
				console.warn(`Task validation failed for agent ${agentId}: ${validation.reason}`);
				return false;
			}
		}
		return true;
	}
	
	async generateSpecWithAI(intent: string, preferredProvider?: AIProviderType): Promise<AgentSpec> {
		// First validate the task against rules
		const defaultAgents = ['azora-code', 'design-assistant', 'debug-agent', 'review-assistant'];
		const isValid = await this.validateTaskForAgents(intent, defaultAgents);
		
		if (!isValid) {
			// Fall back to rule-based generation if validation fails
			return this.generateSpecFromIntent(intent);
		}
		
		// Use AI providers to generate a structured spec
		const prompt = `As the Lead Architect for AzStudio, analyze this user intent and generate a structured specification:
		
User Intent: "${intent}"

Please provide:
1. A clear task description
2. Required agents to involve
3. Any constraints or requirements
4. Priority level (critical/high/medium)

Respond in a structured format that can be parsed into requirements.`;

		try {
			const aiResponse = await this.aiRouter.routeRequest({
				prompt,
				preferredProvider
			});
			
			// Parse AI response into structured requirements
			const requirements: Requirement[] = [
				{
					description: aiResponse.content,
					priority: 'high' as Priority,
					testCases: []
				}
			];
			
			const constraints: PolicyConstraint[] = [
				{
					type: 'style',
					ruleId: 'azora-standards'
				}
			];
			
			return {
				id: this.generateId(),
				requirements,
				constraints,
				telemetryHooks: [],
				status: 'draft'
			};
		} catch (error) {
			console.warn('AI provider failed, falling back to rule-based generation:', error);
			return this.generateSpecFromIntent(intent);
		}
	}

	private generateId(): string {
		return `lead_arch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
