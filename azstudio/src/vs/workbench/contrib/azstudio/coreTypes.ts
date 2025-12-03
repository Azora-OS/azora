/*---------------------------------------------------------------------------------------------
 *  AzStudio Core Types
 *--------------------------------------------------------------------------------------------*/

export type Priority = 'critical' | 'high' | 'medium';

export interface Requirement {
  description: string;
  priority: Priority;
  testCases?: string[];
}

export interface PolicyConstraint {
  type: 'security' | 'performance' | 'style';
  ruleId: string;
}

export interface AgentSpec {
  id: string;
  requirements: Requirement[];
  constraints: PolicyConstraint[];
  telemetryHooks?: string[];
  status: 'draft' | 'active' | 'blocked' | 'completed';
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: 'documentation' | 'code' | 'decision' | 'ticket';
  tags: string[];
  sourceUri?: string;
  lastUpdated: Date;
  provenance?: {
    author: string;
    commitHash?: string;
    runbookId?: string;
  };
}

export interface KnowledgeQuery {
  text: string;
  filters?: {
    categories?: string[];
    tags?: string[];
    minDate?: Date;
  };
  limit?: number;
}

export interface KnowledgeSearchResult {
  items: KnowledgeItem[];
  total: number;
  latency: number;
}
