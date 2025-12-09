/**
 * Knowledge Ocean Client for BuildSpaces
 * 
 * Connects to the RAG (Retrieval-Augmented Generation) service
 * for semantic search and context enhancement.
 * 
 * Reuses the Knowledge Ocean service from services/knowledge-ocean/
 */

// Search result types
export interface KnowledgeResult {
    id: string;
    content: string;
    source: string;
    score: number;
    metadata?: {
        title?: string;
        url?: string;
        type?: string;
        language?: string;
    };
}

// Search query options
export interface SearchOptions {
    query: string;
    limit?: number;
    filters?: {
        type?: string[];
        language?: string[];
        source?: string[];
    };
    minScore?: number;
}

// Embedding request
export interface EmbeddingRequest {
    text: string;
    model?: string;
}

// Knowledge Ocean Client
export class KnowledgeOceanClient {
    private static instance: KnowledgeOceanClient;
    private baseUrl: string;
    private apiKey: string | null;

    private constructor() {
        this.baseUrl = process.env.KNOWLEDGE_OCEAN_URL || 'http://localhost:3006';
        this.apiKey = process.env.KNOWLEDGE_OCEAN_API_KEY || null;
    }

    static getInstance(): KnowledgeOceanClient {
        if (!KnowledgeOceanClient.instance) {
            KnowledgeOceanClient.instance = new KnowledgeOceanClient();
        }
        return KnowledgeOceanClient.instance;
    }

    /**
     * Search the knowledge base
     */
    async search(options: SearchOptions): Promise<KnowledgeResult[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({
                    query: options.query,
                    limit: options.limit || 10,
                    filters: options.filters,
                    minScore: options.minScore || 0.5
                })
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('[KnowledgeOcean] Search error:', error);
            return this.getFallbackResults(options.query);
        }
    }

    /**
     * Get embeddings for text
     */
    async embed(request: EmbeddingRequest): Promise<number[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({
                    text: request.text,
                    model: request.model || 'text-embedding-ada-002'
                })
            });

            if (!response.ok) {
                throw new Error(`Embedding failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.embedding || [];
        } catch (error) {
            console.error('[KnowledgeOcean] Embed error:', error);
            return [];
        }
    }

    /**
     * Index new content
     */
    async index(content: string, metadata: Record<string, unknown>): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({ content, metadata })
            });

            return response.ok;
        } catch (error) {
            console.error('[KnowledgeOcean] Index error:', error);
            return false;
        }
    }

    /**
     * Search code-specific knowledge
     */
    async searchCode(query: string, language?: string): Promise<KnowledgeResult[]> {
        return this.search({
            query,
            filters: {
                type: ['code', 'documentation'],
                ...(language && { language: [language] })
            },
            limit: 5
        });
    }

    /**
     * Search documentation
     */
    async searchDocs(query: string): Promise<KnowledgeResult[]> {
        return this.search({
            query,
            filters: { type: ['documentation', 'tutorial'] },
            limit: 10
        });
    }

    /**
     * Get context for AI conversations
     */
    async getContext(query: string, maxTokens: number = 2000): Promise<string> {
        const results = await this.search({ query, limit: 5 });

        let context = '';
        let tokens = 0;

        for (const result of results) {
            const resultTokens = Math.ceil(result.content.length / 4); // Rough estimate
            if (tokens + resultTokens > maxTokens) { break }

            context += `\n---\nSource: ${result.source}\n${result.content}\n`;
            tokens += resultTokens;
        }

        return context;
    }

    /**
     * Fallback results when service is unavailable
     */
    private getFallbackResults(_query: string): KnowledgeResult[] {
        // Return some helpful defaults
        return [
            {
                id: 'fallback-1',
                content: 'Knowledge Ocean service is currently offline. Try searching the docs at docs.azora.io',
                source: 'system',
                score: 1.0,
                metadata: { type: 'system' }
            }
        ];
    }

    /**
     * Check if Knowledge Ocean is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Export singleton getter
export function getKnowledgeOcean(): KnowledgeOceanClient {
    return KnowledgeOceanClient.getInstance();
}
