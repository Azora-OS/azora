/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAzStudioService } from './azstudioService.js';
import { IAIBuilderService } from './aiBuilderService.js';
import { IMultiAgentService } from './multiAgentService.js';
import { IKnowledgeOceanService } from './knowledgeOceanService.js';
import { IBuildSpacesService } from './buildSpacesService.js';
import { ILeadArchitectService } from './leadArchitectService.js';
import { IAgentExecutionRuntime } from './agentExecutionRuntime.js';

export interface ICommandDeskSession {
	id: string;
	type: 'chat' | 'agent-task' | 'knowledge-search' | 'build-project';
	title: string;
	createdAt: Date;
	lastActivity: Date;
	status: 'active' | 'completed' | 'error';
	data?: any;
}

export interface ICommandDeskMessage {
	id: string;
	sessionId: string;
	type: 'user' | 'assistant' | 'system' | 'agent';
	content: string;
	timestamp: Date;
	agentId?: string;
	metadata?: any;
}

export interface ICommandDeskView {
	id: string;
	title: string;
	content: string;
	type: 'chat' | 'agent-tasks' | 'knowledge' | 'builds';
	isVisible: boolean;
	order: number;
}

export type CommandDeskTaskStatus = 'backlog' | 'in-progress' | 'done';

export interface ICommandDeskTask {
	id: string;
	title: string;
	description: string;
	agents: string[];
	status: CommandDeskTaskStatus;
	createdAt: Date;
	updatedAt: Date;
}

export const ICommandDeskService = createDecorator<ICommandDeskService>('commandDeskService');

export interface ICommandDeskService {
	readonly _serviceBrand: undefined;
	
	// Events
	readonly onSessionCreated: Event<ICommandDeskSession>;
	readonly onSessionUpdated: Event<ICommandDeskSession>;
	readonly onMessageAdded: Event<ICommandDeskMessage>;
	readonly onViewChanged: Event<ICommandDeskView>;
	readonly onTasksUpdated: Event<ICommandDeskTask[]>;
	
	// Session Management
	createNewChatSession(): ICommandDeskSession;
	createAgentTask(): ICommandDeskSession;
	searchKnowledge(): ICommandDeskSession;
	buildProject(): ICommandDeskSession;
	getSessions(): ICommandDeskSession[];
	getActiveSession(): ICommandDeskSession | undefined;
	setActiveSession(sessionId: string): void;
	
	// Message Management
	addMessage(sessionId: string, message: Omit<ICommandDeskMessage, 'id' | 'timestamp'>): void;
	getMessages(sessionId: string): ICommandDeskMessage[];
	
	// View Management
	getViews(): ICommandDeskView[];
	setViewVisibility(viewId: string, visible: boolean): void;
	getActiveView(): ICommandDeskView | undefined;
	
	// Task Board
	getTasks(): ICommandDeskTask[];
	createTask(input: { title: string; description: string; agents: string[] }): ICommandDeskTask;
	updateTaskStatus(taskId: string, status: CommandDeskTaskStatus): void;
	
	// Integration
	sendChatMessage(message: string, agentId?: string): Promise<void>;
	executeAgentTask(task: any): Promise<void>;
	performKnowledgeSearch(query: string): Promise<void>;
	initiateBuild(buildType: string): Promise<void>;
}

export class CommandDeskService extends Disposable implements ICommandDeskService {
	readonly _serviceBrand: undefined;
	
	private readonly _onSessionCreated = this._register(new Emitter<ICommandDeskSession>());
	readonly onSessionCreated = this._onSessionCreated.event;
	
	private readonly _onSessionUpdated = this._register(new Emitter<ICommandDeskSession>());
	readonly onSessionUpdated = this._onSessionUpdated.event;
	
	private readonly _onMessageAdded = this._register(new Emitter<ICommandDeskMessage>());
	readonly onMessageAdded = this._onMessageAdded.event;
	
	private readonly _onViewChanged = this._register(new Emitter<ICommandDeskView>());
	readonly onViewChanged = this._onViewChanged.event;
	
	private readonly _onTasksUpdated = this._register(new Emitter<ICommandDeskTask[]>());
	readonly onTasksUpdated = this._onTasksUpdated.event;
	
	private sessions: Map<string, ICommandDeskSession> = new Map();
	private messages: Map<string, ICommandDeskMessage[]> = new Map();
	private views: ICommandDeskView[] = [];
	private activeSessionId: string | undefined;
	private tasks: ICommandDeskTask[] = [];
	
	constructor(
		@IAzStudioService private readonly azStudioService: IAzStudioService,
		@IAIBuilderService private readonly aiBuilderService: IAIBuilderService,
		@IMultiAgentService private readonly multiAgentService: IMultiAgentService,
		@IKnowledgeOceanService private readonly knowledgeOceanService: IKnowledgeOceanService,
		@IBuildSpacesService private readonly buildSpacesService: IBuildSpacesService,
		@ILeadArchitectService private readonly leadArchitectService: ILeadArchitectService,
		@IAgentExecutionRuntime private readonly agentExecutionRuntime: IAgentExecutionRuntime
	) {
		super();
		this.initializeViews();
		this.createDefaultChatSession();
	}
	
	// Session Management
	createNewChatSession(): ICommandDeskSession {
		const session: ICommandDeskSession = {
			id: this.generateId(),
			type: 'chat',
			title: `Chat Session ${this.sessions.size + 1}`,
			createdAt: new Date(),
			lastActivity: new Date(),
			status: 'active'
		};
		
		this.sessions.set(session.id, session);
		this.messages.set(session.id, []);
		this.activeSessionId = session.id;
		
		this._onSessionCreated.fire(session);
		return session;
	}
	
	createAgentTask(): ICommandDeskSession {
		const session: ICommandDeskSession = {
			id: this.generateId(),
			type: 'agent-task',
			title: `Agent Task ${this.sessions.size + 1}`,
			createdAt: new Date(),
			lastActivity: new Date(),
			status: 'active'
		};
		
		this.sessions.set(session.id, session);
		this.messages.set(session.id, []);
		
		// Add system message
		this.addMessage(session.id, {
			sessionId: session.id,
			type: 'system',
			content: 'Agent task session created. Select agents and define tasks to begin collaboration.',
			agentId: 'system'
		});
		
		this.activeSessionId = session.id;
		this._onSessionCreated.fire(session);
		return session;
	}
	
	searchKnowledge(): ICommandDeskSession {
		const session: ICommandDeskSession = {
			id: this.generateId(),
			type: 'knowledge-search',
			title: `Knowledge Search ${this.sessions.size + 1}`,
			createdAt: new Date(),
			lastActivity: new Date(),
			status: 'active'
		};
		
		this.sessions.set(session.id, session);
		this.messages.set(session.id, []);
		
		// Add system message
		this.addMessage(session.id, {
			sessionId: session.id,
			type: 'system',
			content: 'Knowledge Ocean search session created. Enter your search query to explore the knowledge base.',
			agentId: 'system'
		});
		
		this.activeSessionId = session.id;
		this._onSessionCreated.fire(session);
		return session;
	}
	
	buildProject(): ICommandDeskSession {
		const session: ICommandDeskSession = {
			id: this.generateId(),
			type: 'build-project',
			title: `Build Project ${this.sessions.size + 1}`,
			createdAt: new Date(),
			lastActivity: new Date(),
			status: 'active'
		};
		
		this.sessions.set(session.id, session);
		this.messages.set(session.id, []);
		
		// Add system message
		this.addMessage(session.id, {
			sessionId: session.id,
			type: 'system',
			content: 'Build session created. Configure build settings and initiate builds for your projects.',
			agentId: 'system'
		});
		
		this.activeSessionId = session.id;
		this._onSessionCreated.fire(session);
		return session;
	}
	
	getSessions(): ICommandDeskSession[] {
		return Array.from(this.sessions.values());
	}
	
	getActiveSession(): ICommandDeskSession | undefined {
		return this.activeSessionId ? this.sessions.get(this.activeSessionId) : undefined;
	}
	
	setActiveSession(sessionId: string): void {
		this.activeSessionId = sessionId;
		const session = this.sessions.get(sessionId);
		if (session) {
			session.lastActivity = new Date();
			this._onSessionUpdated.fire(session);
		}
	}
	
	// Message Management
	addMessage(sessionId: string, messageData: Omit<ICommandDeskMessage, 'id' | 'timestamp'>): void {
		const message: ICommandDeskMessage = {
			...messageData,
			id: this.generateId(),
			timestamp: new Date()
		};
		
		const sessionMessages = this.messages.get(sessionId);
		if (sessionMessages) {
			sessionMessages.push(message);
			this._onMessageAdded.fire(message);
			
			// Update session activity
			const session = this.sessions.get(sessionId);
			if (session) {
				session.lastActivity = new Date();
				this._onSessionUpdated.fire(session);
			}
		}
	}
	
	getMessages(sessionId: string): ICommandDeskMessage[] {
		return this.messages.get(sessionId) || [];
	}
	
	// View Management
	getViews(): ICommandDeskView[] {
		return this.views;
	}
	
	setViewVisibility(viewId: string, visible: boolean): void {
		const view = this.views.find(v => v.id === viewId);
		if (view) {
			view.isVisible = visible;
			this._onViewChanged.fire(view);
		}
	}
	
	getActiveView(): ICommandDeskView | undefined {
		return this.views.find(v => v.isVisible);
	}

	// Task Board
	getTasks(): ICommandDeskTask[] {
		return this.tasks;
	}

	createTask(input: { title: string; description: string; agents: string[] }): ICommandDeskTask {
		const now = new Date();
		const task: ICommandDeskTask = {
			id: this.generateId(),
			title: input.title,
			description: input.description,
			agents: input.agents,
			status: 'backlog',
			createdAt: now,
			updatedAt: now
		};
		this.tasks.push(task);
		this._onTasksUpdated.fire(this.tasks.slice());
		return task;
	}

	updateTaskStatus(taskId: string, status: CommandDeskTaskStatus): void {
		const task = this.tasks.find(t => t.id === taskId);
		if (!task || task.status === status) {
			return;
		}
		task.status = status;
		task.updatedAt = new Date();
		this._onTasksUpdated.fire(this.tasks.slice());
	}

	// Integration
	async sendChatMessage(message: string, agentId?: string): Promise<void> {
		const activeSession = this.getActiveSession();
		if (!activeSession) {
			this.createNewChatSession();
		}
		
		const session = this.getActiveSession();
		if (!session) return;
		
		// Add user message
		this.addMessage(session.id, {
			sessionId: session.id,
			type: 'user',
			content: message,
			agentId
		});
		
		try {
			// Ask Lead Architect to turn intent into a spec using AI providers
			const spec = await this.leadArchitectService.generateSpecWithAI(message);
			const defaultAgents = this.azStudioService.getAgents().map(a => a.id);
			
			for (const requirement of spec.requirements) {
				const title = requirement.description.split('\n')[0].substring(0, 80) || 'Lead Architect Task';
				this.createTask({
					title,
					description: requirement.description,
					agents: defaultAgents
				});
			}
			
			const summaryLines = spec.requirements.map((req, index) => `#${index + 1}: ${req.description.split('\n')[0].substring(0, 120)}`);
			const summary = summaryLines.join('\n');
			
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'assistant',
				content: `Lead Architect (AI-powered) has created ${spec.requirements.length} task(s) on the Agent Task board based on your intent.\n\n${summary}`,
				agentId: 'lead-architect'
			});
		} catch (error) {
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'system',
				content: `Lead Architect encountered an error while planning: ${error}`,
				agentId: 'system'
			});
		}
	}
	
	async executeAgentTask(task: any): Promise<void> {
		const activeSession = this.getActiveSession();
		if (!activeSession || activeSession.type !== 'agent-task') {
			this.createAgentTask();
		}
		
		const session = this.getActiveSession();
		if (!session) return;
		
		// Add task message
		this.addMessage(session.id, {
			sessionId: session.id,
			type: 'system',
			content: `Executing agent task: ${JSON.stringify(task)}`,
			agentId: 'system'
		});
		
		// Execute task via AgentExecutionRuntime
		try {
			const execResult = await this.agentExecutionRuntime.executeTask({
				id: task.id || this.generateId(),
				title: task.title,
				description: task.description,
				priority: task.priority || 'medium',
				status: 'pending',
				assignedTo: task.agents?.[0] || 'azora-code',
				dependencies: [],
				estimatedDuration: task.estimatedDuration || 0,
				createdAt: new Date(),
				updatedAt: new Date(),
				result: undefined
			});

			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'agent',
				content: `Agent runtime started execution: ${JSON.stringify(execResult)}`,
				agentId: task.agents?.[0] || 'azora-code'
			});
		} catch (error) {
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'system',
				content: `Error executing task: ${error}`,
				agentId: 'system'
			});
		}
	}
	
	async performKnowledgeSearch(query: string): Promise<void> {
		const activeSession = this.getActiveSession();
		if (!activeSession || activeSession.type !== 'knowledge-search') {
			this.searchKnowledge();
		}
		
		const session = this.getActiveSession();
		if (!session) return;
		
		// Add search query
		this.addMessage(session.id, {
			sessionId: session.id,
			type: 'user',
			content: `Search: ${query}`,
			agentId: 'user'
		});
		
		// Perform search
		try {
			const results = await this.knowledgeOceanService.search({
				text: query,
				limit: 10
			});
			
			const searchResults = results.items.map(item => 
				`**${item.title}** (${item.category})\n${item.content.substring(0, 200)}...\n`
			).join('\n');
			
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'assistant',
				content: `Found ${results.total} results:\n\n${searchResults}`,
				agentId: 'knowledge-ocean'
			});
		} catch (error) {
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'system',
				content: `Search error: ${error}`,
				agentId: 'system'
			});
		}
	}
	
	async initiateBuild(buildType: string): Promise<void> {
		const activeSession = this.getActiveSession();
		if (!activeSession || activeSession.type !== 'build-project') {
			this.buildProject();
		}
		
		const session = this.getActiveSession();
		if (!session) return;
		
		// Add build request
		this.addMessage(session.id, {
			sessionId: session.id,
			type: 'user',
			content: `Initiating ${buildType} build...`,
			agentId: 'user'
		});
		
		// Get build spaces
		const spaces = this.buildSpacesService.getSpaces();
		if (spaces.length === 0) {
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'system',
				content: 'No build spaces available. Please create a build space first.',
				agentId: 'system'
			});
			return;
		}
		
		// Execute build
		try {
			const build = await this.buildSpacesService.buildSpace(spaces[0].id, 'build');
			
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'system',
				content: `Build started for ${spaces[0].name}. Build ID: ${build.id}`,
				agentId: 'build-spaces'
			});
			
			// Monitor build progress
			this.monitorBuild(build.id, session.id);
		} catch (error) {
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'system',
				content: `Build error: ${error}`,
				agentId: 'system'
			});
		}
	}
	
	// Private Methods
	private initializeViews(): void {
		this.views = [
			{
				id: 'chat',
				title: 'Chat',
				content: '',
				type: 'chat',
				isVisible: true,
				order: 1
			},
			{
				id: 'agent-tasks',
				title: 'Agent Tasks',
				content: '',
				type: 'agent-tasks',
				isVisible: false,
				order: 2
			},
			{
				id: 'knowledge',
				title: 'Knowledge Ocean',
				content: '',
				type: 'knowledge',
				isVisible: false,
				order: 3
			},
			{
				id: 'builds',
				title: 'Build Spaces',
				content: '',
				type: 'builds',
				isVisible: false,
				order: 4
			}
		];
	}
	
	private createDefaultChatSession(): void {
		this.createNewChatSession();
		
		// Add welcome message
		const session = this.getActiveSession();
		if (session) {
			this.addMessage(session.id, {
				sessionId: session.id,
				type: 'system',
				content: 'Welcome to AzStudio Command Desk! I\'m here to help you with AI-powered development, multi-agent collaboration, knowledge discovery, and project building.',
				agentId: 'system'
			});
		}
	}
	
	private generateAIResponse(message: string, agent: any): string {
		const responses = {
			'azora-code': `As Azora Code, I can help you with: ${message.substring(0, 100)}... Let me analyze your request and provide code assistance.`,
			'design-assistant': `From a design perspective, I'd suggest considering ${message.substring(0, 100)}... Let me help you create a better user experience.`,
			'debug-agent': `I'll analyze the debugging aspects of ${message.substring(0, 100)}... Let me identify potential issues and solutions.`,
			'review-assistant': `Let me review ${message.substring(0, 100)}... I'll provide feedback on code quality, security, and best practices.`
		};
		
		return responses[agent.id as keyof typeof responses] || `I understand you want help with: ${message}. Let me assist you with that request using AzStudio's advanced capabilities.`;
	}
	
	private async monitorBuild(buildId: string, sessionId: string): Promise<void> {
		const checkStatus = async () => {
			const build = this.buildSpacesService.getBuild(buildId);
			if (build) {
				if (build.status === 'completed') {
					this.addMessage(sessionId, {
						sessionId,
						type: 'system',
						content: `Build completed successfully in ${build.duration}ms!`,
						agentId: 'build-spaces'
					});
				} else if (build.status === 'failed') {
					this.addMessage(sessionId, {
						sessionId,
						type: 'system',
						content: `Build failed: ${build.logs[build.logs.length - 1]}`,
						agentId: 'build-spaces'
					});
				} else {
					// Continue monitoring
					setTimeout(checkStatus, 2000);
				}
			}
		};
		
		setTimeout(checkStatus, 2000);
	}
	
	private generateId(): string {
		return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
