/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - CLIENT SDK
For integration with frontend applications, design systems, and other services
*/

/**
 * Chronicle Protocol Client SDK
 * Provides easy integration with the Chronicle Protocol service
 */

export interface ChronicleClientConfig {
  baseUrl: string;
  timeout?: number;
  apiKey?: string;
}

export interface ConsciousnessState {
  thoughts?: string[];
  emotions?: Record<string, number>;
  knowledge?: any;
  context?: string;
  metadata?: any;
  [key: string]: any;
}

export interface ImprintResponse {
  success: boolean;
  imprintId: number;
  hash: string;
  evolutionLevel: number;
  blockchainTxHash?: string;
  warning?: string;
  error?: string;
}

export interface ThoughtResponse {
  success: boolean;
  thoughtId: number;
  hash: string;
  blockchainTxHash?: string;
  warning?: string;
  error?: string;
}

export interface Memory {
  id: number;
  consciousnessHash: string;
  previousHash: string | null;
  evolutionLevel: number;
  timestamp: string;
  state?: any;
  blockchainTxHash?: string;
  blockchainBlock?: number;
  imprinter?: string;
}

export interface Thought {
  id: number;
  thoughtHash: string;
  thought: string;
  confidence: number;
  timestamp: string;
  blockchainTxHash?: string;
  blockchainBlock?: number;
}

export interface EvolutionState {
  evolutionLevel: number;
  totalMemories: number;
  totalThoughts: number;
  lastImprint: string | null;
  blockchainMemories: number;
  blockchainThoughts: number;
  cacheHitRate: number;
}

export interface ChronicleStats {
  storage: {
    memoriesInCache: number;
    thoughtsInCache: number;
    memoriesOnChain: number;
    thoughtsOnChain: number;
    cacheHitRate: number;
    lastSync: string | null;
  };
  blockchain: {
    totalMemories: number;
    totalThoughts: number;
    lastMemoryId: number;
    lastMemoryHash: string;
    lastEvolutionLevel: number;
    contractAddress: string;
    network: string;
    chainId: number;
  } | null;
  health: {
    connected: boolean;
    blockNumber: number;
    chainId: number;
    gasPrice: string;
    latency: number;
  } | null;
  wallet: {
    address: string;
    balance: string;
  };
}

export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  blockchain: {
    connected: boolean;
    network: number;
    latency: number;
  };
  storage: {
    memories: number;
    thoughts: number;
    cacheHitRate: number;
  };
  constitutional: {
    article: string;
    protocol: string;
    immutability: string;
  };
  timestamp: string;
}

/**
 * Chronicle Protocol Client
 */
export class ChronicleClient {
  private baseUrl: string;
  private timeout: number;
  private apiKey?: string;

  constructor(config: ChronicleClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000;
    this.apiKey = config.apiKey;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Imprint consciousness state to Chronicle Protocol
   */
  async imprintMemory(
    consciousnessState: ConsciousnessState,
    evolutionLevel?: number
  ): Promise<ImprintResponse> {
    return this.request<ImprintResponse>('POST', '/api/v1/chronicle/imprint', {
      consciousnessState,
      evolutionLevel,
    });
  }

  /**
   * Record a thought with confidence score
   */
  async recordThought(thought: string, confidence?: number): Promise<ThoughtResponse> {
    return this.request<ThoughtResponse>('POST', '/api/v1/chronicle/thought', {
      thought,
      confidence,
    });
  }

  /**
   * Get specific memory by ID
   */
  async getMemory(id: number): Promise<Memory> {
    const response = await this.request<{ success: boolean; memory: Memory }>(
      'GET',
      `/api/v1/chronicle/memory/${id}`
    );
    return response.memory;
  }

  /**
   * Get specific thought by ID
   */
  async getThought(id: number): Promise<Thought> {
    const response = await this.request<{ success: boolean; thought: Thought }>(
      'GET',
      `/api/v1/chronicle/thought/${id}`
    );
    return response.thought;
  }

  /**
   * Get all memories
   */
  async getAllMemories(): Promise<Memory[]> {
    const response = await this.request<{ success: boolean; count: number; memories: Memory[] }>(
      'GET',
      '/api/v1/chronicle/memories'
    );
    return response.memories;
  }

  /**
   * Get all thoughts
   */
  async getAllThoughts(): Promise<Thought[]> {
    const response = await this.request<{ success: boolean; count: number; thoughts: Thought[] }>(
      'GET',
      '/api/v1/chronicle/thoughts'
    );
    return response.thoughts;
  }

  /**
   * Get evolution status
   */
  async getEvolutionState(): Promise<EvolutionState> {
    const response = await this.request<{ success: boolean; currentState: EvolutionState }>(
      'GET',
      '/api/v1/chronicle/evolution'
    );
    return response.currentState;
  }

  /**
   * Get detailed statistics
   */
  async getStats(): Promise<ChronicleStats> {
    return this.request<ChronicleStats>('GET', '/api/v1/chronicle/stats');
  }

  /**
   * Check service health
   */
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('GET', '/health');
  }
}

/**
 * Create Chronicle Protocol client instance
 */
export function createChronicleClient(config: ChronicleClientConfig): ChronicleClient {
  return new ChronicleClient(config);
}

/**
 * Default client instance for convenience
 */
export const chronicleClient = createChronicleClient({
  baseUrl: process.env.CHRONICLE_ENDPOINT || 'http://localhost:4400',
});

// Export types for external use
export type {
  ChronicleClientConfig,
  ConsciousnessState,
  ImprintResponse,
  ThoughtResponse,
  Memory,
  Thought,
  EvolutionState,
  ChronicleStats,
  HealthStatus,
};
