export interface KnowledgeNode {
  id: string;
  path: string;
  type: string;
  title?: string;
  content: string;
  embedding?: number[];
  embeddingJson?: number[];
  metadata?: Record<string, any>;
}

export interface KnowledgeIndexer {
  indexFile(filePath: string): Promise<KnowledgeNode[]>;
  search(query: string, limit?: number): Promise<KnowledgeNode[]>;
}
