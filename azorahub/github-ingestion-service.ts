/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Azorahub GitHub Ingestion Service
 *
 * Continuously ingests repositories from GitHub to make Azorahub
 * a complete GitHub alternative with all features
 */

import { EventEmitter } from 'events';
import { GitHubIngestionOrchestrator } from '../genome/github-ingestion-orchestrator';
import { SovereignIngestionEngine } from '../genome/sovereign-ingestion-engine';

export interface Repository {
  id: string;
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  license: string;
  createdAt: Date;
  updatedAt: Date;
  ingested: boolean;
  ingestedAt?: Date;
}

export interface IngestionStats {
  totalRepositories: number;
  ingested: number;
  pending: number;
  failed: number;
  lastIngestion: Date;
}

export class AzorahubGitHubIngestion extends EventEmitter {
  private static instance: AzorahubGitHubIngestion;
  private orchestrator: GitHubIngestionOrchestrator;
  private sie: SovereignIngestionEngine;
  private repositories: Map<string, Repository> = new Map();
  private ingestionStats: IngestionStats = {
    totalRepositories: 0,
    ingested: 0,
    pending: 0,
    failed: 0,
    lastIngestion: new Date()
  };

  private constructor() {
    super();
    this.orchestrator = GitHubIngestionOrchestrator.getInstance();
    this.sie = SovereignIngestionEngine.getInstance();

    // Listen to ingestion events
    this.orchestrator.on('ingestion-completed', (progress) => {
      this.handleIngestionComplete(progress);
    });
  }

  public static getInstance(): AzorahubGitHubIngestion {
    if (!AzorahubGitHubIngestion.instance) {
      AzorahubGitHubIngestion.instance = new AzorahubGitHubIngestion();
    }
    return AzorahubGitHubIngestion.instance;
  }

  /**
   * Start continuous GitHub ingestion
   */
  public async startIngestion(): Promise<void> {
    console.log('🔄 Starting Azorahub GitHub ingestion...');

    // Add all major GitHub repositories to queue
    const majorRepos = [
      // Popular repos
      { owner: 'facebook', repo: 'react', priority: 'critical' as const },
      { owner: 'microsoft', repo: 'vscode', priority: 'critical' as const },
      { owner: 'google', repo: 'tensorflow', priority: 'high' as const },
      { owner: 'microsoft', repo: 'TypeScript', priority: 'high' as const },
      { owner: 'kubernetes', repo: 'kubernetes', priority: 'high' as const },
      { owner: 'pytorch', repo: 'pytorch', priority: 'high' as const },
      { owner: 'microsoft', repo: 'vscode', priority: 'high' as const },
      { owner: 'angular', repo: 'angular', priority: 'medium' as const },
      { owner: 'facebook', repo: 'jest', priority: 'medium' as const },
      { owner: 'aws', repo: 'aws-sdk-js-v3', priority: 'medium' as const },
    ];

    for (const repo of majorRepos) {
      this.orchestrator.addRepository({
        owner: repo.owner,
        repo: repo.repo,
        priority: repo.priority,
        focus: ['all'],
        license: 'MIT',
        keyFiles: []
      });
    }

    await this.orchestrator.start();
    this.emit('ingestion-started');
  }

  /**
   * Handle completed ingestion
   */
  private handleIngestionComplete(progress: any): void {
    const repoKey = progress.repository;
    const [owner, name] = repoKey.split('/');

    const repository: Repository = {
      id: repoKey,
      owner,
      name,
      description: `Ingested from GitHub: ${repoKey}`,
      stars: 0,
      forks: 0,
      language: 'mixed',
      license: 'MIT',
      createdAt: progress.startTime || new Date(),
      updatedAt: progress.endTime || new Date(),
      ingested: true,
      ingestedAt: progress.endTime
    };

    this.repositories.set(repoKey, repository);
    this.ingestionStats.ingested++;
    this.ingestionStats.lastIngestion = new Date();

    this.emit('repository-ingested', repository);
  }

  /**
   * Get all ingested repositories
   */
  public getRepositories(): Repository[] {
    return Array.from(this.repositories.values());
  }

  /**
   * Get ingestion statistics
   */
  public getStats(): IngestionStats {
    return { ...this.ingestionStats };
  }

  /**
   * Search repositories
   */
  public searchRepositories(query: string): Repository[] {
    const results: Repository[] = [];
    const lowerQuery = query.toLowerCase();

    for (const repo of this.repositories.values()) {
      if (
        repo.name.toLowerCase().includes(lowerQuery) ||
        repo.owner.toLowerCase().includes(lowerQuery) ||
        repo.description.toLowerCase().includes(lowerQuery) ||
        repo.language.toLowerCase().includes(lowerQuery)
      ) {
        results.push(repo);
      }
    }

    return results;
  }
}

export default AzorahubGitHubIngestion;


