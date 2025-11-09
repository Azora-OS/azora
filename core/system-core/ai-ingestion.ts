/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import fs from 'fs/promises';
import path from 'path';

export interface RepoTarget {
  owner: string;
  repo: string;
  focus: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  learningGoals: string[];
}

export interface RepoData {
  owner: string;
  repo: string;
  readmeText?: string;
  structure?: string[];
  lastUpdated: string;
}

export class AIIngestionService {
  private rootDir: string;
  private githubToken?: string;

  constructor(rootDir: string, githubToken?: string) {
    this.rootDir = rootDir;
    this.githubToken = githubToken;
  }

  async ingestRepository(target: RepoTarget): Promise<RepoData> {
    console.log(`📥 Ingesting ${target.owner}/${target.repo}...`);

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Azora-LLMora-Learner'
    };

    if (this.githubToken) {
      headers['Authorization'] = `token ${this.githubToken}`;
    }

    try {
      // Get README
      const readmeResponse = await fetch(
        `https://api.github.com/repos/${target.owner}/${target.repo}/readme`,
        { headers }
      );

      let readmeText = '';
      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();
        readmeText = Buffer.from(readmeData.content, 'base64').toString('utf-8');
      }

      // Get repository structure (top-level files)
      const contentsResponse = await fetch(
        `https://api.github.com/repos/${target.owner}/${target.repo}/contents`,
        { headers }
      );

      let structure: string[] = [];
      if (contentsResponse.ok) {
        const contents = await contentsResponse.json();
        structure = contents.map((item: any) => `${item.name} (${item.type})`);
      }

      const repoData: RepoData = {
        owner: target.owner,
        repo: target.repo,
        readmeText,
        structure,
        lastUpdated: new Date().toISOString()
      };

      // Save to knowledge directory
      const knowledgeDir = path.join(this.rootDir, '.elara', 'knowledge', 'repos');
      await fs.mkdir(knowledgeDir, { recursive: true });
      
      const filename = `${target.owner}__${target.repo}.json`;
      await fs.writeFile(
        path.join(knowledgeDir, filename),
        JSON.stringify(repoData, null, 2)
      );

      console.log(`✅ Saved ${filename}`);
      return repoData;

    } catch (error) {
      console.error(`❌ Failed to ingest ${target.owner}/${target.repo}:`, error);
      throw error;
    }
  }

  async ingestMultiple(targets: RepoTarget[]): Promise<RepoData[]> {
    const results: RepoData[] = [];
    
    for (const target of targets) {
      try {
        const data = await this.ingestRepository(target);
        results.push(data);
        
        // Rate limiting - be nice to GitHub API
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Skipping ${target.owner}/${target.repo} due to error`);
      }
    }

    return results;
  }
}