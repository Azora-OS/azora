/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import fs from 'fs/promises';
import path from 'path';
import { KnowledgeGraph, KnowledgeNode } from './knowledge-graph.js';

export interface Pattern {
  id: string;
  name: string;
  description: string;
  examples: string[];
  frequency: number;
  confidence: number;
  category: 'architectural' | 'api-design' | 'performance' | 'security' | 'ui-ux';
}

export class PatternLearner {
  private knowledgeGraph: KnowledgeGraph;
  private patterns: Map<string, Pattern> = new Map();

  constructor(knowledgeGraph: KnowledgeGraph) {
    this.knowledgeGraph = knowledgeGraph;
  }

  async learnFromRepos(knowledgeDir: string): Promise<Pattern[]> {
    console.log('🔍 Learning patterns from repositories...');

    const reposDir = path.join(knowledgeDir, 'repos');
    
    try {
      const files = await fs.readdir(reposDir);
      let filesAnalyzed = 0;

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(reposDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const repoData = JSON.parse(content);
          
          await this.analyzeRepository(repoData);
          filesAnalyzed++;
        }
      }

      console.log(`📊 Analyzed ${filesAnalyzed} repositories`);
      
    } catch (error) {
      console.error('Error learning from repos:', error);
    }

    return Array.from(this.patterns.values());
  }

  private async analyzeRepository(repoData: any): Promise<void> {
    const readmeText = repoData.readmeText || '';
    const structure = repoData.structure || [];

    // Pattern 1: API Design Patterns
    if (readmeText.toLowerCase().includes('api') || readmeText.toLowerCase().includes('rest')) {
      this.recordPattern({
        id: 'api-design-rest',
        name: 'RESTful API Design',
        description: 'Repository implements RESTful API patterns',
        examples: [`${repoData.owner}/${repoData.repo}`],
        frequency: 1,
        confidence: 0.7,
        category: 'api-design'
      });
    }

    // Pattern 2: Docker Usage
    if (structure.some((item: string) => item.includes('Dockerfile') || item.includes('docker-compose'))) {
      this.recordPattern({
        id: 'containerization-docker',
        name: 'Docker Containerization',
        description: 'Repository uses Docker for containerization',
        examples: [`${repoData.owner}/${repoData.repo}`],
        frequency: 1,
        confidence: 0.9,
        category: 'architectural'
      });
    }

    // Pattern 3: TypeScript Usage
    if (structure.some((item: string) => item.includes('tsconfig.json') || item.includes('.ts'))) {
      this.recordPattern({
        id: 'typescript-usage',
        name: 'TypeScript Implementation',
        description: 'Repository uses TypeScript for type safety',
        examples: [`${repoData.owner}/${repoData.repo}`],
        frequency: 1,
        confidence: 0.8,
        category: 'architectural'
      });
    }

    // Pattern 4: Testing Patterns
    if (structure.some((item: string) => item.toLowerCase().includes('test') || item.toLowerCase().includes('spec'))) {
      this.recordPattern({
        id: 'testing-implementation',
        name: 'Automated Testing',
        description: 'Repository implements automated testing',
        examples: [`${repoData.owner}/${repoData.repo}`],
        frequency: 1,
        confidence: 0.8,
        category: 'architectural'
      });
    }

    // Pattern 5: Package.json (Node.js ecosystem)
    if (structure.some((item: string) => item.includes('package.json'))) {
      this.recordPattern({
        id: 'nodejs-ecosystem',
        name: 'Node.js Ecosystem',
        description: 'Repository is part of Node.js ecosystem',
        examples: [`${repoData.owner}/${repoData.repo}`],
        frequency: 1,
        confidence: 0.9,
        category: 'architectural'
      });
    }

    // Pattern 6: Documentation Patterns
    if (structure.some((item: string) => item.toLowerCase().includes('readme') || item.toLowerCase().includes('docs'))) {
      this.recordPattern({
        id: 'documentation-practices',
        name: 'Documentation Best Practices',
        description: 'Repository follows good documentation practices',
        examples: [`${repoData.owner}/${repoData.repo}`],
        frequency: 1,
        confidence: 0.7,
        category: 'architectural'
      });
    }

    // Pattern 7: License Usage
    if (structure.some((item: string) => item.toLowerCase().includes('license'))) {
      this.recordPattern({
        id: 'open-source-licensing',
        name: 'Open Source Licensing',
        description: 'Repository includes proper licensing',
        examples: [`${repoData.owner}/${repoData.repo}`],
        frequency: 1,
        confidence: 0.9,
        category: 'architectural'
      });
    }

    // Pattern 8: CI/CD Patterns
    if (structure.some((item: string) => item.includes('.github') || item.includes('.gitlab-ci') || item.includes('.travis'))) {
      this.recordPattern({
        id: 'cicd-automation',
        name: 'CI/CD Automation',
        description: 'Repository uses continuous integration/deployment',
        examples: [`${repoData.owner}/${repoData.repo}`],
        frequency: 1,
        confidence: 0.8,
        category: 'architectural'
      });
    }
  }

  private recordPattern(pattern: Pattern): void {
    const existing = this.patterns.get(pattern.id);
    
    if (existing) {
      // Merge with existing pattern
      existing.frequency += pattern.frequency;
      existing.examples.push(...pattern.examples);
      existing.confidence = Math.min(existing.confidence + 0.1, 1.0); // Increase confidence slightly
    } else {
      this.patterns.set(pattern.id, pattern);
    }
  }

  getPatterns(): Pattern[] {
    return Array.from(this.patterns.values()).sort((a, b) => b.frequency - a.frequency);
  }

  getPatternStats(): { total: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    
    for (const pattern of this.patterns.values()) {
      byCategory[pattern.category] = (byCategory[pattern.category] || 0) + 1;
    }

    return {
      total: this.patterns.size,
      byCategory
    };
  }
}