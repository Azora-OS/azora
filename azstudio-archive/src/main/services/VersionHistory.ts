import * as fs from 'fs/promises';
import * as path from 'path';

export interface User {
	id: string;
	name?: string;
	email?: string;
}

export interface FileChange {
	path: string;
	type: 'add' | 'modify' | 'delete';
	content?: string;
}

export interface Version {
	id: string;
	message: string;
	author: User;
	date: string; // ISO
	changes: FileChange[];
	branch?: string;
	tags?: string[];
}

export interface VersionHistoryConfig {
	workspaceId: string;
	storagePath: string;
}

interface StoredData {
	branches: Record<string, { id: string; name: string; description?: string; isDefault?: boolean }>;
	versions: Record<string, Version>;
	branchHistory: Record<string, string[]>; // branchId -> versionIds
}

export class VersionHistory {
	private config: VersionHistoryConfig;
	private data: StoredData = { branches: {}, versions: {}, branchHistory: {} };
	private initialized = false;

	constructor(config: VersionHistoryConfig) {
		this.config = config;
	}

	private get storageDir(): string {
		return this.config.storagePath || path.join(process.cwd(), '.azstudio', 'version-history', this.config.workspaceId);
	}

	private get storePath(): string {
		return path.join(this.storageDir, 'versions.json');
	}

	async initialize(): Promise<void> {
		// Ensure storage folder and load store if present
		try {
			await fs.mkdir(this.storageDir, { recursive: true });
			const content = await fs.readFile(this.storePath, 'utf-8');
			this.data = JSON.parse(content) as StoredData;
		} catch (err) {
			// Initialize with default branch 'main'
			if (!this.data || Object.keys(this.data.branches).length === 0) {
				const mainId = 'branch-main';
				this.data.branches[mainId] = { id: mainId, name: 'main', description: 'Default branch', isDefault: true };
				this.data.branchHistory[mainId] = [];
				await this.save();
			}
		}

		this.initialized = true;
	}

	private async save(): Promise<void> {
		await fs.mkdir(this.storageDir, { recursive: true });
		await fs.writeFile(this.storePath, JSON.stringify(this.data, null, 2), 'utf-8');
	}

	private ensureInitialized(): void {
		if (!this.initialized) {
			throw new Error('VersionHistory not initialized');
		}
	}

	async createVersion(user: User, branchId: string, message: string, changes: FileChange[], tags: string[] = []): Promise<Version> {
		this.ensureInitialized();
		const id = String(Date.now());
		const version: Version = { id, message, author: user, date: new Date().toISOString(), changes, branch: branchId, tags };
		this.data.versions[id] = version;
		if (!this.data.branchHistory[branchId]) this.data.branchHistory[branchId] = [];
		this.data.branchHistory[branchId].push(id);
		await this.save();
		return version;
	}

	getVersion(versionId: string): Version | null {
		this.ensureInitialized();
		return this.data.versions[versionId] ?? null;
	}

	getFileHistory(fileId: string, limit?: number): Version[] {
		this.ensureInitialized();
		const all = Object.values(this.data.versions).filter(v => v.changes.some(c => c.path === fileId));
		const sorted = all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return limit ? sorted.slice(0, limit) : sorted;
	}

	getBranchHistory(branchId: string, limit?: number): Version[] {
		this.ensureInitialized();
		const ids = this.data.branchHistory[branchId] || [];
		const versions = ids.map(id => this.data.versions[id]).filter(Boolean);
		const sorted = versions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return limit ? sorted.slice(0, limit) : sorted;
	}

	getAllVersions(limit?: number): Version[] {
		this.ensureInitialized();
		const all = Object.values(this.data.versions).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return limit ? all.slice(0, limit) : all;
	}

	async revertToVersion(versionId: string, user: User, branchId: string, message?: string): Promise<Version | null> {
		this.ensureInitialized();
		const v = this.data.versions[versionId];
		if (!v) return null;
		const revertMsg = message || `Revert to ${versionId}`;
		const newVersion = await this.createVersion(user, branchId, revertMsg, v.changes.map(c => ({ ...c })), []);
		return newVersion;
	}

	async createBranch(name: string, user: User, description?: string, isDefault = false): Promise<{ id: string; name: string } | null> {
		this.ensureInitialized();
		const id = `branch-${name.replace(/\s+/g, '-').toLowerCase()}`;
		if (this.data.branches[id]) return null;
		this.data.branches[id] = { id, name, description, isDefault };
		this.data.branchHistory[id] = [];
		await this.save();
		return { id, name };
	}

	getBranch(branchId: string): { id: string; name: string } | null {
		this.ensureInitialized();
		const b = this.data.branches[branchId];
		return b ? { id: b.id, name: b.name } : null;
	}

	getBranchByName(name: string): { id: string; name: string } | null {
		this.ensureInitialized();
		for (const id of Object.keys(this.data.branches)) {
			const b = this.data.branches[id];
			if (b.name === name) return { id: b.id, name: b.name };
		}
		return null;
	}

	getAllBranches(): { id: string; name: string }[] {
		this.ensureInitialized();
		return Object.values(this.data.branches).map(b => ({ id: b.id, name: b.name }));
	}

	async deleteBranch(branchId: string): Promise<void> {
		this.ensureInitialized();
		delete this.data.branches[branchId];
		delete this.data.branchHistory[branchId];
		await this.save();
	}

	async mergeBranches(sourceBranchId: string, targetBranchId: string, _user: User, _message?: string) {
		this.ensureInitialized();
		const srcIds = this.data.branchHistory[sourceBranchId] || [];
		const tgtIds = this.data.branchHistory[targetBranchId] || [];
		const added: string[] = [];
		for (const id of srcIds) {
			if (!tgtIds.includes(id)) {
				this.data.branchHistory[targetBranchId].push(id);
				added.push(id);
			}
		}
		await this.save();
		return { success: true, added, conflicts: [] };
	}

	async resolveMergeConflicts(_sourceBranch: string, _targetBranch: string, _user: User, _resolvedChanges: FileChange[], _message?: string) {
		// Simplified: apply resolved changes as a new version on target
		const id = String(Date.now());
		const version: Version = { id, message: _message || 'Resolve merge conflicts', author: _user, date: new Date().toISOString(), changes: _resolvedChanges };
		this.data.versions[id] = version;
		// Add to default branch
		const defaultBranch = this.getAllBranches()[0];
		if (defaultBranch) this.data.branchHistory[defaultBranch.id].push(id);
		await this.save();
		return version;
	}

	compareVersions(versionId1: string, versionId2: string) {
		this.ensureInitialized();
		const v1 = this.data.versions[versionId1];
		const v2 = this.data.versions[versionId2];
		if (!v1 || !v2) return [];
		const paths1 = new Set(v1.changes.map(c => c.path));
		const paths2 = new Set(v2.changes.map(c => c.path));
		const added: string[] = [];
		const removed: string[] = [];
		const changed: string[] = [];
		for (const p of paths2) {
			if (!paths1.has(p)) added.push(p);
			else changed.push(p);
		}
		for (const p of paths1) if (!paths2.has(p)) removed.push(p);
		return { added, removed, changed };
	}

	async cleanup(olderThanDays: number) {
		this.ensureInitialized();
		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - olderThanDays);
		let removedCount = 0;
		for (const [id, version] of Object.entries(this.data.versions)) {
			if (new Date(version.date) < cutoff) {
				delete this.data.versions[id];
				// remove from branches
				for (const branchId of Object.keys(this.data.branchHistory)) {
					this.data.branchHistory[branchId] = this.data.branchHistory[branchId].filter(v => v !== id);
				}
				removedCount++;
			}
		}
		await this.save();
		return removedCount;
	}

	getStats() {
		this.ensureInitialized();
		return { versions: Object.keys(this.data.versions).length, branches: Object.keys(this.data.branches).length };
	}
}
