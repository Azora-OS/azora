/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import fs from 'fs/promises';
import path from 'path';

export interface KnowledgeNode {
  id: string;
  type: 'repo' | 'file' | 'concept' | 'pattern';
  content: string;
  metadata: Record<string, any>;
  connections: string[];
  confidence: number;
}

export class KnowledgeGraph {
  private rootDir: string;
  private nodes: Map<string, KnowledgeNode> = new Map();
  private initialized = false;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🧠 Initializing Knowledge Graph...');
    
    const knowledgeDir = path.join(this.rootDir, '.elara', 'knowledge');
    await fs.mkdir(knowledgeDir, { recursive: true });

    // Load existing knowledge
    await this.loadExistingKnowledge();
    
    this.initialized = true;
    console.log(`✅ Knowledge Graph initialized with ${this.nodes.size} nodes`);
  }

  private async loadExistingKnowledge(): Promise<void> {
    const reposDir = path.join(this.rootDir, '.elara', 'knowledge', 'repos');
    
    try {
      const files = await fs.readdir(reposDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(reposDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const repoData = JSON.parse(content);
          
          // Create knowledge node from repo data
          const nodeId = `repo:${repoData.owner}/${repoData.repo}`;
          const node: KnowledgeNode = {
            id: nodeId,
            type: 'repo',
            content: repoData.readmeText || '',
            metadata: {
              owner: repoData.owner,
              repo: repoData.repo,
              structure: repoData.structure,
              lastUpdated: repoData.lastUpdated
            },
            connections: [],
            confidence: 0.8
          };
          
          this.nodes.set(nodeId, node);
        }
      }
    } catch (error) {
      // Directory doesn't exist yet, that's fine
    }
  }

  async retrieve(query: string, options: { topK: number }): Promise<{ text: string; sources?: string[] }> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Simple keyword matching for now
    const queryLower = query.toLowerCase();
    const matches: Array<{ node: KnowledgeNode; score: number }> = [];

    for (const node of this.nodes.values()) {
      const contentLower = node.content.toLowerCase();
      let score = 0;

      // Basic scoring based on keyword matches
      const queryWords = queryLower.split(/\s+/);
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          score += 1;
        }
      }

      if (score > 0) {
        matches.push({ node, score: score * node.confidence });
      }
    }

    // Sort by score and take top K
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, options.topK);

    if (topMatches.length === 0) {
      return { text: 'No relevant context found in knowledge graph.' };
    }

    // Combine content from top matches
    const contextParts = topMatches.map(match => {
      const node = match.node;
      const preview = node.content.substring(0, 500);
      return `From ${node.id}:\n${preview}${node.content.length > 500 ? '...' : ''}`;
    });

    const sources = topMatches.map(match => match.node.id);

    return {
      text: contextParts.join('\n\n---\n\n'),
      sources
    };
  }

  getStats(): { totalNodes: number; nodeTypes: Record<string, number>; avgConfidence: number } {
    const nodeTypes: Record<string, number> = {};
    let totalConfidence = 0;

    for (const node of this.nodes.values()) {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
      totalConfidence += node.confidence;
    }

    return {
      totalNodes: this.nodes.size,
      nodeTypes,
      avgConfidence: this.nodes.size > 0 ? totalConfidence / this.nodes.size : 0
    };
  }
}