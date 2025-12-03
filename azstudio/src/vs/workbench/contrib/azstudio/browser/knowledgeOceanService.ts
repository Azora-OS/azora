/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Azora Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IAIProviderRouter } from './aiProviderRouter.js';
import { VectorEngine } from './vectorSearch.js';
import { URI } from '../../../../base/common/uri.js';
import * as path from 'path';
import { KnowledgeItem, KnowledgeQuery, KnowledgeSearchResult } from '../coreTypes.js';

export interface IKnowledgeItem extends KnowledgeItem {
	author: string;
	createdAt: Date;
	updatedAt: Date;
	accessCount: number;
	rating: number;
}

export interface ISearchQuery extends KnowledgeQuery {
	author?: string;
}

export interface ISearchResult {
	items: IKnowledgeItem[];
	total: number;
	query: ISearchQuery;
	duration: number;
}

export const IKnowledgeOceanService = createDecorator<IKnowledgeOceanService>('knowledgeOceanService');

export interface IKnowledgeOceanService {
	readonly _serviceBrand: undefined;
	
	// Events
	readonly onKnowledgeAdded: Event<IKnowledgeItem>;
	readonly onKnowledgeUpdated: Event<IKnowledgeItem>;
	readonly onKnowledgeSearched: Event<ISearchResult>;
	
	// Knowledge Management
	addKnowledge(item: Omit<IKnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'accessCount'>): IKnowledgeItem;
	getKnowledge(id: string): IKnowledgeItem | undefined;
	updateKnowledge(id: string, updates: Partial<IKnowledgeItem>): void;
	deleteKnowledge(id: string): void;
	
	// Search and Discovery
	search(query: ISearchQuery): Promise<ISearchResult>;
	getCategories(): string[];
	getTags(): string[];
	getPopularKnowledge(limit?: number): IKnowledgeItem[];
	getRecentKnowledge(limit?: number): IKnowledgeItem[];
	
	// Integration
	indexWorkspace(): Promise<void>;
	syncWithElara(): Promise<void>;
	extractKnowledgeFromCode(code: string, language: string): Promise<IKnowledgeItem[]>;
}

export class KnowledgeOceanService extends Disposable implements IKnowledgeOceanService {
	readonly _serviceBrand: undefined;
	
	private readonly _onKnowledgeAdded = this._register(new Emitter<IKnowledgeItem>());
	readonly onKnowledgeAdded = this._onKnowledgeAdded.event;
	
	private readonly _onKnowledgeUpdated = this._register(new Emitter<IKnowledgeItem>());
	readonly onKnowledgeUpdated = this._onKnowledgeUpdated.event;
	
	private readonly _onKnowledgeSearched = this._register(new Emitter<ISearchResult>());
	readonly onKnowledgeSearched = this._onKnowledgeSearched.event;
	
	private knowledge: Map<string, IKnowledgeItem> = new Map();
	private categories: Set<string> = new Set();
	private tags: Set<string> = new Set();
	
	private vectorEngine: VectorEngine;
	constructor(@IAIProviderRouter private readonly aiRouter: IAIProviderRouter, @IConfigurationService private readonly configurationService: IConfigurationService) {
		super();
		this.initializeKnowledgeBase();
		// Vector engine removed, using service now
	}
	
	// Knowledge Management
	addKnowledge(itemData: Omit<IKnowledgeItem, 'id' | 'createdAt' | 'updatedAt' | 'accessCount'>): IKnowledgeItem {
		const item: IKnowledgeItem = {
			...itemData,
			id: this.generateId(),
			createdAt: new Date(),
			updatedAt: new Date(),
			accessCount: 0
		};
		
		this.knowledge.set(item.id, item);
		this.updateCategoriesAndTags(item);
		this._onKnowledgeAdded.fire(item);
		
		return item;
	}
	
	getKnowledge(id: string): IKnowledgeItem | undefined {
		const item = this.knowledge.get(id);
		if (item) {
			item.accessCount++;
		}
		return item;
	}
	
	updateKnowledge(id: string, updates: Partial<IKnowledgeItem>): void {
		const item = this.knowledge.get(id);
		if (item) {
			Object.assign(item, updates, { updatedAt: new Date() });
			this.updateCategoriesAndTags(item);
			this._onKnowledgeUpdated.fire(item);
		}
	}
	
	deleteKnowledge(id: string): void {
		this.knowledge.delete(id);
	}
	
	// Search and Discovery
	async search(query: ISearchQuery): Promise<ISearchResult> {
		const startTime = Date.now();
		
		// Call the knowledge-ocean service for semantic search
		try {
			const resp = await fetch(`http://localhost:4003/search?q=${encodeURIComponent(query.text || '')}`);
			if (!resp.ok) throw new Error('Service unavailable');
			const results = await resp.json();
			
			// Convert to IKnowledgeItem format
			const items: IKnowledgeItem[] = results.map((r: any) => ({
				id: r.id,
				title: r.title || 'Untitled',
				content: r.content,
				category: r.metadata?.category || 'General',
				tags: r.metadata?.tags || [],
				author: 'AzStudio AI',
				createdAt: new Date(r.createdAt),
				updatedAt: new Date(r.updatedAt),
				accessCount: 0,
				rating: 4.0
			}));
			
			const searchResult: ISearchResult = {
				items,
				total: items.length,
				query,
				duration: Date.now() - startTime
			};
			
			this._onKnowledgeSearched.fire(searchResult);
			return searchResult;
		} catch (error) {
			console.warn('Knowledge Ocean service unavailable, falling back to local search', error);
			// Fallback to local search
			let results = Array.from(this.knowledge.values());
			
			if (query.filters?.categories) {
				results = results.filter(item => query.filters!.categories!.includes(item.category));
			}
			if (query.filters?.tags) {
				results = results.filter(item => 
					query.filters!.tags!.some(tag => item.tags.includes(tag))
				);
			}
			
			if (query.author) {
				results = results.filter(item => item.author === query.author);
			}
			
			if (query.text) {
				const searchTerm = query.text.toLowerCase();
				results = results.filter(item =>
					item.title.toLowerCase().includes(searchTerm) ||
					item.content.toLowerCase().includes(searchTerm)
				);
			}
			
			results.sort((a, b) => {
				let scoreA = a.rating * 0.3 + a.accessCount * 0.7;
				let scoreB = b.rating * 0.3 + b.accessCount * 0.7;
				return scoreB - scoreA;
			});
			
			const limit = query.limit || 50;
			results = results.slice(0, limit);
			
			const searchResult: ISearchResult = {
				items: results,
				total: results.length,
				query,
				duration: Date.now() - startTime
			};
			
			this._onKnowledgeSearched.fire(searchResult);
			return searchResult;
		}
	}
	
	getCategories(): string[] {
		return Array.from(this.categories);
	}
	
	getTags(): string[] {
		return Array.from(this.tags);
	}
	
	getPopularKnowledge(limit: number = 10): IKnowledgeItem[] {
		return Array.from(this.knowledge.values())
			.sort((a, b) => b.accessCount - a.accessCount)
			.slice(0, limit);
	}
	
	getRecentKnowledge(limit: number = 10): IKnowledgeItem[] {
		return Array.from(this.knowledge.values())
			.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
			.slice(0, limit);
	}
	
	// Integration
	async indexWorkspace(): Promise<void> {
		// Index workspace files and extract knowledge
		console.log('Indexing workspace for Knowledge Ocean...');
		
		// This would integrate with VS Code's workspace service
		// to scan files and extract knowledge items
		
		// For now, add some sample knowledge
		this.addSampleKnowledge();
		// Attempt to send the current knowledge items to the knowledge-ocean service for indexing
		try {
			const items = Array.from(this.knowledge.values()).map(i => ({
				id: i.id,
				path: 'vscode',
				type: 'text',
				title: i.title,
				content: i.content,
				metadata: { category: i.category, tags: i.tags }
			}));
			const svcUrl = this.configurationService.getValue<string>('azstudio.knowledgeOceanUrl') || 'http://localhost:4003';
			const apiKey = this.configurationService.getValue<string>('azstudio.knowledgeOceanApiKey') || undefined;
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (apiKey) headers['x-api-key'] = apiKey;
			await fetch(`${svcUrl}/index`, {
				method: 'POST',
				headers,
				body: JSON.stringify(items)
			});
		} catch (err) {
			console.warn('Failed to push workspace index to knowledge-ocean', err);
		}
	}
	
	async syncWithElara(): Promise<void> {
		// Sync with Elara Orchestrator
		console.log('Syncing Knowledge Ocean with Elara...');
		// Implementation would connect to Elara service
	}
	
	async extractKnowledgeFromCode(code: string, language: string): Promise<IKnowledgeItem[]> {
		const items: IKnowledgeItem[] = [];
		
		// Extract patterns, best practices, and documentation from code
		// This is a simplified implementation
		
		if (language === 'typescript' || language === 'javascript') {
			// Extract function patterns
			const functionMatches = code.match(/(?:function|const|let)\s+(\w+)/g);
			if (functionMatches) {
				const item = this.addKnowledge({
					title: `Code Patterns: ${language}`,
					content: `Found patterns: ${functionMatches.join(', ')}`,
					category: 'Code Patterns',
					tags: [language, 'patterns', 'functions'],
					author: 'AzStudio AI',
					rating: 3.5
				});
				items.push(item);
			}
		}
		
		return items;
	}
	
	// Private Methods
	private initializeKnowledgeBase(): void {
		// Initialize with some default knowledge
		this.addSampleKnowledge();
	}
	
	private addSampleKnowledge(): void {
		const sampleKnowledge = [
			{
				title: 'React Best Practices',
				content: 'Use functional components with hooks, avoid class components unless necessary. Keep components small and focused on a single responsibility.',
				category: 'React',
				tags: ['react', 'best-practices', 'frontend'],
				author: 'AzStudio Team',
				rating: 4.5
			},
			{
				title: 'TypeScript Configuration',
				content: 'Enable strict mode in tsconfig.json for better type safety. Use proper type definitions and avoid using "any" type.',
				category: 'TypeScript',
				tags: ['typescript', 'configuration', 'types'],
				author: 'AzStudio Team',
				rating: 4.8
			},
			{
				title: 'Node.js Performance',
				content: 'Use clustering for CPU-intensive tasks. Implement proper error handling and use async/await for better control flow.',
				category: 'Node.js',
				tags: ['nodejs', 'performance', 'backend'],
				author: 'AzStudio Team',
				rating: 4.2
			},
			{
				title: 'CSS Architecture',
				content: 'Follow BEM methodology for CSS naming. Use CSS variables for theming and maintainability. Consider CSS-in-JS for component-based styling.',
				category: 'CSS',
				tags: ['css', 'architecture', 'styling'],
				author: 'AzStudio Team',
				rating: 4.0
			}
		];
		
		sampleKnowledge.forEach(knowledge => {
			this.addKnowledge(knowledge);
		});
	}
	
	private updateCategoriesAndTags(item: IKnowledgeItem): void {
		this.categories.add(item.category);
		item.tags.forEach(tag => this.tags.add(tag));
	}
	
	private generateId(): string {
		return `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
