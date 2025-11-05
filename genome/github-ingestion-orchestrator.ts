/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * GitHub Ingestion Orchestrator
 *
 * Continuously ingests code from GitHub repositories to grow the Azora organism.
 * Integrates with the Sovereign Ingestion Engine for safe ingestion.
 */

import { EventEmitter } from 'events';
import { SovereignIngestionEngine } from './sovereign-ingestion-engine';
import type { CodeArtifact } from './sovereign-ingestion-engine';

export interface RepositoryTarget {
  owner: string;
  repo: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  focus: string[];
  license: string;
  stars?: number;
  keyFiles?: string[];
}

export interface IngestionProgress {
  repository: string;
  status: 'pending' | 'ingesting' | 'completed' | 'failed';
  filesProcessed: number;
  filesTotal: number;
  errors: string[];
  startTime?: Date;
  endTime?: Date;
}

export class GitHubIngestionOrchestrator extends EventEmitter {
  private static instance: GitHubIngestionOrchestrator;
  private sie: SovereignIngestionEngine;
  private ingestionQueue: RepositoryTarget[] = [];
  private activeIngestions: Map<string, IngestionProgress> = new Map();
  private completedIngestions: IngestionProgress[] = [];
  private isRunning: boolean = false;
  private ingestionInterval?: NodeJS.Timeout;

  private constructor() {
    super();
    this.sie = SovereignIngestionEngine.getInstance();
    this.initializeQueue();
  }

  public static getInstance(): GitHubIngestionOrchestrator {
    if (!GitHubIngestionOrchestrator.instance) {
      GitHubIngestionOrchestrator.instance = new GitHubIngestionOrchestrator();
    }
    return GitHubIngestionOrchestrator.instance;
  }

  /**
   * Initialize the ingestion queue with priority repositories
   */
  private initializeQueue(): void {
    // Educational platforms (from CONTINUOUS-INGESTION.md)
    this.ingestionQueue = [
      {
        owner: 'khan',
        repo: 'khan-exercises',
        priority: 'critical',
        focus: ['exercise-engine', 'mastery-tracking', 'hint-systems'],
        license: 'MIT',
        keyFiles: ['src/exercises/exercise-engine.js']
      },
      {
        owner: 'openedx',
        repo: 'edx-platform',
        priority: 'critical',
        focus: ['lms-architecture', 'course-management', 'forums'],
        license: 'AGPL-3.0',
        keyFiles: ['lms/djangoapps/courseware/models.py']
      },
      {
        owner: 'freeCodeCamp',
        repo: 'freeCodeCamp',
        priority: 'critical',
        focus: ['interactive-coding', 'curriculum', 'certifications'],
        license: 'BSD-3-Clause',
        keyFiles: ['curriculum/challenges/english/index.js']
      },
      {
        owner: 'moodle',
        repo: 'moodle',
        priority: 'high',
        focus: ['activity-modules', 'gradebook', 'plugins'],
        license: 'GPL-3.0',
        keyFiles: ['lib/classes/grade/grade_item.php']
      },
      {
        owner: 'instructure',
        repo: 'canvas-lms',
        priority: 'high',
        focus: ['modern-ui', 'api-design', 'mobile-apps'],
        license: 'AGPL-3.0',
        keyFiles: ['app/models/assignment.rb']
      },
      {
        owner: 'jupyter',
        repo: 'notebook',
        priority: 'high',
        focus: ['interactive-notebooks', 'code-execution'],
        license: 'BSD-3-Clause',
        keyFiles: ['notebook/notebookapp.py']
      },
      {
        owner: 'ankitects',
        repo: 'anki',
        priority: 'medium',
        focus: ['spaced-repetition', 'flashcards'],
        license: 'AGPL-3.0',
        keyFiles: ['pylib/anki/scheduler.py']
      },
      {
        owner: 'oppia',
        repo: 'oppia',
        priority: 'medium',
        focus: ['interactive-lessons', 'feedback-system'],
        license: 'Apache-2.0',
        keyFiles: ['core/templates/components/exploration-editor/exploration-editor-tab.directive.html']
      },
      {
        owner: 'h5p',
        repo: 'h5p-php-library',
        priority: 'medium',
        focus: ['interactive-content-types'],
        license: 'MIT',
        keyFiles: ['src/ContentType/H5PContentType.php']
      },
      {
        owner: 'scratchfoundation',
        repo: 'scratch-gui',
        priority: 'medium',
        focus: ['visual-programming', 'creative-learning'],
        license: 'BSD-3-Clause',
        keyFiles: ['src/lib/blocks/index.js']
      }
    ];
  }

  /**
   * Start continuous ingestion
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Ingestion orchestrator already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting GitHub Ingestion Orchestrator');
    console.log(`📋 Queue: ${this.ingestionQueue.length} repositories`);

    // Process queue
    this.processQueue();

    // Set up continuous ingestion interval (every 6 hours)
    this.ingestionInterval = setInterval(() => {
      this.processQueue();
    }, 6 * 60 * 60 * 1000);

    this.emit('started');
  }

  /**
   * Stop continuous ingestion
   */
  public stop(): void {
    this.isRunning = false;
    if (this.ingestionInterval) {
      clearInterval(this.ingestionInterval);
    }
    console.log('⏸️ GitHub Ingestion Orchestrator stopped');
    this.emit('stopped');
  }

  /**
   * Process the ingestion queue
   */
  private async processQueue(): Promise<void> {
    if (this.ingestionQueue.length === 0) {
      console.log('✅ Ingestion queue empty');
      return;
    }

    // Sort by priority
    const sortedQueue = [...this.ingestionQueue].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    for (const target of sortedQueue) {
      if (!this.isRunning) break;

      const repoKey = `${target.owner}/${target.repo}`;

      // Skip if already processing or completed
      if (this.activeIngestions.has(repoKey) ||
          this.completedIngestions.some(c => c.repository === repoKey)) {
        continue;
      }

      await this.ingestRepository(target);

      // Rate limiting: wait between repositories
      await this.delay(5000);
    }
  }

  /**
   * Ingest a single repository
   */
  private async ingestRepository(target: RepositoryTarget): Promise<void> {
    const repoKey = `${target.owner}/${target.repo}`;

    const progress: IngestionProgress = {
      repository: repoKey,
      status: 'ingesting',
      filesProcessed: 0,
      filesTotal: target.keyFiles?.length || 0,
      errors: [],
      startTime: new Date()
    };

    this.activeIngestions.set(repoKey, progress);
    this.emit('ingestion-started', progress);

    console.log(`\n📦 Ingesting: ${repoKey}`);
    console.log(`   Priority: ${target.priority}`);
    console.log(`   Focus: ${target.focus.join(', ')}`);

    try {
      // Fetch repository files from GitHub API
      const files = await this.fetchRepositoryFiles(target);

      progress.filesTotal = files.length;
      this.activeIngestions.set(repoKey, progress);

      // Process each file
      for (const file of files) {
        if (!this.isRunning) break;

        try {
          const artifact: CodeArtifact = {
            id: `${repoKey}-${file.path}-${Date.now()}`,
            source: 'github',
            repository: repoKey,
            path: file.path,
            content: file.content,
            language: this.detectLanguage(file.path),
            license: target.license,
            dependencies: [],
            metadata: {
              author: target.owner,
              created: file.created || Date.now(),
              updated: file.updated || Date.now(),
              stars: target.stars || 0,
              forks: 0,
              contributors: 0,
              size: file.size || 0,
              complexity: 0
            }
          };

          const result = await this.sie.ingest(artifact);

          progress.filesProcessed++;
          this.activeIngestions.set(repoKey, progress);

          if ('baptized' in result) {
            console.log(`   ✅ Baptized: ${file.path}`);
          } else {
            console.log(`   🔮 Transmuted: ${file.path}`);
          }

          this.emit('file-processed', { repository: repoKey, file: file.path, result });

          // Rate limiting: wait between files
          await this.delay(1000);

        } catch (error: any) {
          progress.errors.push(`Error processing ${file.path}: ${error.message}`);
          console.error(`   ❌ Error processing ${file.path}: ${error.message}`);
        }
      }

      progress.status = 'completed';
      progress.endTime = new Date();

    } catch (error: any) {
      progress.status = 'failed';
      progress.errors.push(error.message);
      progress.endTime = new Date();
      console.error(`❌ Failed to ingest ${repoKey}: ${error.message}`);
    }

    this.activeIngestions.delete(repoKey);
    this.completedIngestions.push(progress);
    this.emit('ingestion-completed', progress);

    console.log(`✅ Completed: ${repoKey} (${progress.filesProcessed}/${progress.filesTotal} files)`);
  }

  /**
   * Fetch repository files from GitHub API
   * Note: In production, this would use the GitHub API
   */
  private async fetchRepositoryFiles(target: RepositoryTarget): Promise<Array<{
    path: string;
    content: string;
    size?: number;
    created?: number;
    updated?: number;
  }>> {
    // For now, return key files or generate sample content
    // In production, use GitHub API: GET /repos/{owner}/{repo}/contents/{path}

    const files: Array<{
      path: string;
      content: string;
      size?: number;
      created?: number;
      updated?: number;
    }> = [];

    if (target.keyFiles && target.keyFiles.length > 0) {
      for (const filePath of target.keyFiles) {
        files.push({
          path: filePath,
          content: `// Sample content from ${target.owner}/${target.repo}\n// ${filePath}\n// This would be fetched from GitHub API in production`,
          size: 1024,
          created: Date.now() - 365 * 24 * 60 * 60 * 1000,
          updated: Date.now()
        });
      }
    }

    return files;
  }

  /**
   * Detect programming language from file path
   */
  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'cpp': 'cpp',
      'c': 'c',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sh': 'shell',
      'sql': 'sql'
    };
    return languageMap[ext] || 'unknown';
  }

  /**
   * Get ingestion status
   */
  public getStatus(): {
    isRunning: boolean;
    queueLength: number;
    active: number;
    completed: number;
    progress: IngestionProgress[];
  } {
    return {
      isRunning: this.isRunning,
      queueLength: this.ingestionQueue.length,
      active: this.activeIngestions.size,
      completed: this.completedIngestions.length,
      progress: [...this.activeIngestions.values(), ...this.completedIngestions]
    };
  }

  /**
   * Add repository to queue
   */
  public addRepository(target: RepositoryTarget): void {
    this.ingestionQueue.push(target);
    this.emit('repository-added', target);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GitHubIngestionOrchestrator;


