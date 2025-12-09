// Minimal stub of DesignFilterEngine for build-time
// TODO: Replace with full implementation
export interface DesignFilter {
	type: string;
	name: string;
	description?: string;
	tokens?: Partial<import('./DesignTokenManager').DesignTokens>;
	classTransforms?: Record<string, string>;
}

export type ClassMapping = Record<string, string>;

import * as fs from 'fs';
import * as path from 'path';

export class DesignFilterEngine {
	private root: string;
	private filters: DesignFilter[] | null = null;

	constructor(projectRoot?: string) {
		this.root = projectRoot || process.cwd();
	}

	async initialize(): Promise<void> {
		const file = path.join(this.root, '.azstudio', 'design-filters.json');
		if (fs.existsSync(file)) {
			try {
				const content = await fs.promises.readFile(file, 'utf-8');
				const parsed = JSON.parse(content);
				this.filters = parsed.filters as DesignFilter[];
			} catch (err) {
				// fallback to default
				this.filters = this.defaultFilters();
			}
		} else {
			this.filters = this.defaultFilters();
		}
	}

	getFilters(): DesignFilter[] {
		return this.filters || this.defaultFilters();
	}

	getFilterByType(type: string): DesignFilter | undefined {
		return this.getFilters().find(f => f.type === type);
	}

	addFilter(filter: DesignFilter): void {
		if (!this.filters) this.filters = this.defaultFilters();
		this.filters.push(filter);
	}

	private defaultFilters(): DesignFilter[] {
		return [
			({
				type: 'modern-saas',
				name: 'Modern SaaS',
				description: 'A clean modern SaaS theme',
				tokens: {
					colors: {
						primary: {
							50: '#f7fafc',
							100: '#edf2f7',
							200: '#e2e8f0',
							300: '#cbd5e1',
							400: '#94a3b8',
							500: '#64748b',
							600: '#475569',
							700: '#334155',
							800: '#1f2937',
							900: '#0f172a',
							950: '#020617'
						}
					}
				} as Partial<import('./DesignTokenManager').DesignTokens>,
				classTransforms: { 'btn-primary': 'btn--primary' }
			}),
			({
				type: 'enterprise',
				name: 'Enterprise',
				description: 'A stable design language for enterprise apps',
				tokens: {
					colors: {
						primary: {
							50: '#f8fafc',
							100: '#eef2ff',
							200: '#e0e7ff',
							300: '#c7d2fe',
							400: '#a5b4fc',
							500: '#818cf8',
							600: '#6366f1',
							700: '#4f46e5',
							800: '#4338ca',
							900: '#3730a3',
							950: '#312e81'
						}
					}
				} as Partial<import('./DesignTokenManager').DesignTokens>,
				classTransforms: { 'card-old': 'az-card' }
			})
		];
	}
}

export default DesignFilterEngine;
