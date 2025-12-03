/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IView } from '../../../browser/parts/views/view.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICommandDeskService, ICommandDeskTask, CommandDeskTaskStatus } from './commandDeskService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { append, $, addDisposableListener, EventType, clearNode } from '../../../../base/browser/dom.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize } from '../../../../nls.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { Action } from '../../../../base/common/actions.js';
import { IAction } from '../../../../base/common/actions.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { InputBox } from '../../../../base/browser/ui/inputBox/inputBox.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { List } from '../../../../base/browser/ui/list/listWidget.js';
import { IListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { IPagedRenderer } from '../../../../base/browser/ui/list/listPaging.js';
import { ITreeNode, ITreeRenderer, ITreeDataSource } from '../../../../base/browser/ui/tree/tree.js';
import { ObjectTree } from '../../../../base/browser/ui/tree/objectTree.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextViewService.js';

// Register Command Desk Icons
const commandDeskIcon = registerIcon('commanddesk-view-icon', Codicon.gear, localize('commandDeskViewIcon', 'Command Desk view icon'));

export interface ICommandDeskView extends IView {
	// Command Desk specific methods
}

export class CommandDeskView extends Disposable implements ICommandDeskView {
	private readonly element: HTMLElement;
	private messageList: HTMLElement;
	private inputBox: InputBox;
	private sendButton: Button;
	private actionBar: ActionBar;
	private viewTabs: HTMLElement;
	private contentArea: HTMLElement;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ICommandDeskService private readonly commandDeskService: ICommandDeskService,
		@IThemeService private readonly themeService: IThemeService,
		@IContextViewService private readonly contextViewService: IContextViewService
	) {
		super();

		this.element = $('.commanddesk');
		this.createView();
		this.registerListeners();
	}

	getId(): string {
		return 'commandDesk';
	}

	getTitle(): string {
		return localize('commandDesk.title', 'Command Desk');
	}

	getIcon(): ThemeIcon {
		return commandDeskIcon;
	}

	render(container: HTMLElement): void {
		container.appendChild(this.element);
	}

	focus(): void {
		this.inputBox.focus();
	}

	private createView(): void {
		// Header with view tabs
		const header = append(this.element, $('.commanddesk-header'));
		this.viewTabs = append(header, $('.commanddesk-tabs'));
		this.createViewTabs();

		// Content area
		this.contentArea = append(this.element, $('.commanddesk-content'));
		this.createContentArea();

		// Input area
		const inputArea = append(this.element, $('.commanddesk-input'));
		this.createInputArea(inputArea);

		// Action bar
		const actionBarContainer = append(this.element, $('.commanddesk-actions'));
		this.actionBar = new ActionBar(actionBarContainer);
		this.updateActionBar();
	}

	private createViewTabs(): void {
		const views = this.commandDeskService.getViews();
		
		views.forEach(view => {
			const tab = append(this.viewTabs, $('.commanddesk-tab'));
			tab.textContent = view.title;
			tab.classList.toggle('active', view.isVisible);
			
			this._register(addDisposableListener(tab, EventType.CLICK, () => {
				this.switchView(view.id);
			}));
		});
	}

	private createContentArea(): void {
		const activeView = this.commandDeskService.getActiveView();
		if (!activeView) return;

		switch (activeView.type) {
			case 'chat':
				this.createChatView();
				break;
			case 'agent-tasks':
				this.createAgentTasksView();
				break;
			case 'knowledge':
				this.createKnowledgeView();
				break;
			case 'builds':
				this.createBuildsView();
				break;
		}
	}

	private createChatView(): void {
		this.messageList = append(this.contentArea, $('.commanddesk-messages'));
		this.renderMessages();
	}

	private createAgentTasksView(): void {
		const agentTasksContent = append(this.contentArea, $('.commanddesk-agent-tasks'));
		
		// Agent selection
		const agentSelection = append(agentTasksContent, $('.commanddesk-agent-selection'));
		const agentTitle = append(agentSelection, $('.commanddesk-section-title'));
		agentTitle.textContent = 'Select Agents';
		
		const agentsContainer = append(agentSelection, $('.commanddesk-agents-container'));
		const agents = this.commandDeskService['azStudioService'].getAgents();
		
		agents.forEach(agent => {
			const agentItem = append(agentsContainer, $('.commanddesk-agent-item'));
			const checkbox = append(agentItem, $('input'));
			checkbox.type = 'checkbox';
			checkbox.value = agent.id;
			
			const agentInfo = append(agentItem, $('.commanddesk-agent-info'));
			const agentName = append(agentInfo, $('.commanddesk-agent-name'));
			agentName.textContent = agent.name;
			const agentStatus = append(agentInfo, $('.commanddesk-agent-status'));
			agentStatus.textContent = agent.status;
			agentStatus.classList.add(agent.status);
		});
		
		// Task definition
		const taskDefinition = append(agentTasksContent, $('.commanddesk-task-definition'));
		const taskTitle = append(taskDefinition, $('.commanddesk-section-title'));
		taskTitle.textContent = 'Define Task';
		
		const taskInput = append(taskDefinition, $('textarea'));
		taskInput.placeholder = 'Describe the task you want the agents to collaborate on...';
		
		const executeButton = append(taskDefinition, $('.commanddesk-execute-button'));
		executeButton.textContent = 'Execute Task';
		executeButton.classList.add('primary');
		
		const taskBoard = append(agentTasksContent, $('.commanddesk-task-board'));
		const backlogColumn = append(taskBoard, $('.commanddesk-task-column.backlog'));
		const backlogHeader = append(backlogColumn, $('.commanddesk-task-column-header'));
		backlogHeader.textContent = 'Backlog';
		const backlogList = append(backlogColumn, $('.commanddesk-task-column-list'));
		
		const inProgressColumn = append(taskBoard, $('.commanddesk-task-column.in-progress'));
		const inProgressHeader = append(inProgressColumn, $('.commanddesk-task-column-header'));
		inProgressHeader.textContent = 'In Progress';
		const inProgressList = append(inProgressColumn, $('.commanddesk-task-column-list'));
		
		const doneColumn = append(taskBoard, $('.commanddesk-task-column.done'));
		const doneHeader = append(doneColumn, $('.commanddesk-task-column-header'));
		doneHeader.textContent = 'Done';
		const doneList = append(doneColumn, $('.commanddesk-task-column-list'));
		
		const getNextStatus = (status: CommandDeskTaskStatus): CommandDeskTaskStatus => {
			switch (status) {
				case 'backlog':
					return 'in-progress';
				case 'in-progress':
					return 'done';
				default:
					return 'done';
			}
		};
		
		const renderTasks = (tasks: ICommandDeskTask[]): void => {
			clearNode(backlogList);
			clearNode(inProgressList);
			clearNode(doneList);
			
			for (const task of tasks) {
				let targetList: HTMLElement;
				switch (task.status) {
					case 'in-progress':
						targetList = inProgressList;
						break;
					case 'done':
						targetList = doneList;
						break;
					case 'backlog':
					default:
						targetList = backlogList;
						break;
				}
				
				const card = append(targetList, $('.commanddesk-task-card'));
				const title = append(card, $('.commanddesk-task-title'));
				title.textContent = task.title;
				const meta = append(card, $('.commanddesk-task-meta'));
				meta.textContent = task.agents.join(', ');
				
				this._register(addDisposableListener(card, EventType.CLICK, () => {
					const nextStatus = getNextStatus(task.status);
					if (nextStatus !== task.status) {
						this.commandDeskService.updateTaskStatus(task.id, nextStatus);
					}
				}));
			}
		};
		
		renderTasks(this.commandDeskService.getTasks());
		
		this._register(this.commandDeskService.onTasksUpdated(tasks => {
			renderTasks(tasks);
		}));
		
		this._register(addDisposableListener(executeButton, EventType.CLICK, () => {
			const selectedAgents = Array.from(agentsContainer.querySelectorAll('input:checked'))
				.map((input: any) => input.value);
			const description = taskInput.value.trim();
			
			if (selectedAgents.length > 0 && description) {
				const title = description.split('\n')[0].substring(0, 80) || 'Agent Task';
				this.commandDeskService.createTask({
					title,
					description,
					agents: selectedAgents
				});
				this.commandDeskService.executeAgentTask({
					agents: selectedAgents,
					description
				});
				taskInput.value = '';
			}
		}));
	}

	private createKnowledgeView(): void {
		const knowledgeContent = append(this.contentArea, $('.commanddesk-knowledge'));
		
		// Search interface
		const searchInterface = append(knowledgeContent, $('.commanddesk-search'));
		const searchTitle = append(searchInterface, $('.commanddesk-section-title'));
		searchTitle.textContent = 'Search Knowledge Ocean';
		
		const searchInput = append(searchInterface, $('input'));
		searchInput.type = 'text';
		searchInput.placeholder = 'Search for knowledge, patterns, best practices...';
		
		const searchButton = append(searchInterface, $('.commanddesk-search-button'));
		searchButton.textContent = 'Search';
		
		this._register(addDisposableListener(searchButton, EventType.CLICK, () => {
			if (searchInput.value.trim()) {
				this.commandDeskService.performKnowledgeSearch(searchInput.value);
			}
		}));
		
		// Recent knowledge
		const recentKnowledge = append(knowledgeContent, $('.commanddesk-recent'));
		const recentTitle = append(recentKnowledge, $('.commanddesk-section-title'));
		recentTitle.textContent = 'Recent Knowledge';
		
		const recentList = append(recentKnowledge, $('.commanddesk-recent-list'));
		// This would be populated with actual knowledge items
	}

	private createBuildsView(): void {
		const buildsContent = append(this.contentArea, $('.commanddesk-builds'));
		
		// Build spaces
		const buildSpaces = append(buildsContent, $('.commanddesk-build-spaces'));
		const spacesTitle = append(buildSpaces, $('.commanddesk-section-title'));
		spacesTitle.textContent = 'Build Spaces';
		
		const spacesList = append(buildSpaces, $('.commanddesk-spaces-list'));
		const spaces = this.commandDeskService['buildSpacesService'].getSpaces();
		
		spaces.forEach(space => {
			const spaceItem = append(spacesList, $('.commanddesk-space-item'));
			const spaceName = append(spaceItem, $('.commanddesk-space-name'));
			spaceName.textContent = space.name;
			const spaceStatus = append(spaceItem, $('.commanddesk-space-status'));
			spaceStatus.textContent = space.status;
			spaceStatus.classList.add(space.status);
			
			const buildButton = append(spaceItem, $('.commanddesk-build-button'));
			buildButton.textContent = 'Build';
			
			this._register(addDisposableListener(buildButton, EventType.CLICK, () => {
				this.commandDeskService.initiateBuild('build');
			}));
		});
		
		// Recent builds
		const recentBuilds = append(buildsContent, $('.commanddesk-recent-builds'));
		const buildsTitle = append(recentBuilds, $('.commanddesk-section-title'));
		buildsTitle.textContent = 'Recent Builds';
		
		const buildsList = append(recentBuilds, $('.commanddesk-builds-list'));
		// This would be populated with actual build history
	}

	private createInputArea(container: HTMLElement): void {
		// Input box
		this.inputBox = this._register(this.instantiationService.createInstance(InputBox, container));
		this.inputBox.placeholder = 'Type your message or command...';
		
		// Send button
		this.sendButton = this._register(new Button(container));
		this.sendButton.label = 'Send';
		this.sendButton.element.classList.add('primary');
		
		this._register(addDisposableListener(this.sendButton.element, EventType.CLICK, () => {
			this.sendMessage();
		}));
		
		// Enter key to send
		this._register(addDisposableListener(this.inputBox.inputElement, EventType.KEY_DOWN, (e: KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		}));
	}

	private sendMessage(): void {
		const message = this.inputBox.value.trim();
		if (!message) return;
		
		const activeView = this.commandDeskService.getActiveView();
		if (!activeView) return;
		
		switch (activeView.type) {
			case 'chat':
				this.commandDeskService.sendChatMessage(message);
				break;
			case 'knowledge':
				this.commandDeskService.performKnowledgeSearch(message);
				break;
		}
		
		this.inputBox.value = '';
	}

	private switchView(viewId: string): void {
		const views = this.commandDeskService.getViews();
		views.forEach(view => {
			this.commandDeskService.setViewVisibility(view.id, view.id === viewId);
		});
		
		// Update tabs
		const tabs = this.viewTabs.querySelectorAll('.commanddesk-tab');
		tabs.forEach((tab, index) => {
			tab.classList.toggle('active', views[index].id === viewId);
		});
		
		// Recreate content
		clearNode(this.contentArea);
		this.createContentArea();
	}

	private renderMessages(): void {
		if (!this.messageList) return;
		
		clearNode(this.messageList);
		
		const activeSession = this.commandDeskService.getActiveSession();
		if (!activeSession) return;
		
		const messages = this.commandDeskService.getMessages(activeSession.id);
		
		messages.forEach(message => {
			const messageElement = append(this.messageList, $('.commanddesk-message'));
			messageElement.classList.add(message.type);
			
			const messageHeader = append(messageElement, $('.commanddesk-message-header'));
			const messageSender = append(messageHeader, $('.commanddesk-message-sender'));
			messageSender.textContent = this.getMessageSender(message);
			const messageTime = append(messageHeader, $('.commanddesk-message-time'));
			messageTime.textContent = message.timestamp.toLocaleTimeString();
			
			const messageContent = append(messageElement, $('.commanddesk-message-content'));
			messageContent.textContent = message.content;
		});
		
		// Scroll to bottom
		this.messageList.scrollTop = this.messageList.scrollHeight;
	}

	private getMessageSender(message: any): string {
		switch (message.type) {
			case 'user':
				return 'You';
			case 'assistant':
				const agent = this.commandDeskService['azStudioService'].getAgent(message.agentId);
				return agent?.name || 'Assistant';
			case 'system':
				return 'System';
			case 'agent':
				return message.agentId || 'Agent';
			default:
				return 'Unknown';
		}
	}

	private updateActionBar(): void {
		const actions: IAction[] = [
			new Action('newChat', 'New Chat', undefined, undefined, () => {
				this.commandDeskService.createNewChatSession();
			}),
			new Action('createTask', 'Create Task', undefined, undefined, () => {
				this.commandDeskService.createAgentTask();
			}),
			new Action('searchKnowledge', 'Search Knowledge', undefined, undefined, () => {
				this.commandDeskService.searchKnowledge();
			}),
			new Action('buildProject', 'Build Project', undefined, undefined, () => {
				this.commandDeskService.buildProject();
			})
		];
		
		this.actionBar.clear();
		this.actionBar.push(actions);
	}

	private registerListeners(): void {
		// Listen for message updates
		this._register(this.commandDeskService.onMessageAdded(() => {
			this.renderMessages();
		}));
		
		// Listen for session changes
		this._register(this.commandDeskService.onSessionCreated(() => {
			this.renderMessages();
		}));
		
		// Listen for view changes
		this._register(this.commandDeskService.onViewChanged(() => {
			// Update view tabs
			clearNode(this.viewTabs);
			this.createViewTabs();
		}));
		
		// Theme changes
		this._register(this.themeService.onDidColorThemeChange(() => {
			// Update styling if needed
		}));
	}
}
