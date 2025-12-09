import { IAzoraAgentRegistry, AzoraAgentMetadata, AzoraAgentImplementation } from './common';
import KnowledgeOceanService from './knowledgeOceanService';
import StorageService from './storageService';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/simpleExtensions';

export class AzoraAgentRegistryService implements IAzoraAgentRegistry {
  private agents: Map<string, { metadata: AzoraAgentMetadata; impl: AzoraAgentImplementation }> = new Map();
  private listeners: Array<(m: AzoraAgentMetadata) => void> = [];
  private storage: StorageService;

  constructor() {
    this.storage = new StorageService();
    this.initialize();
  }

  private async initialize() {
    const persisted = await this.storage.readJson<{ metadata: AzoraAgentMetadata }[]>('agentRegistry.json');
    if (persisted && Array.isArray(persisted)) {
      for (const it of persisted) {
        this.agents.set(it.metadata.id, { metadata: it.metadata, impl: (null as any) });
      }
    }
  }

  registerAgent(metadata: AzoraAgentMetadata, implementation: AzoraAgentImplementation): void {
    if (!metadata || !metadata.id) {
      throw new Error('Agent metadata must include an id');
    }
    this.agents.set(metadata.id, { metadata, impl: implementation });
    // Notify listeners
    for (const cb of this.listeners) cb(metadata);
    // Persist metadata only
    try {
      const items = Array.from(this.agents.values()).map(v => ({ metadata: v.metadata }));
      void this.storage.writeJson('agentRegistry.json', items);
    } catch (err) { /* ignore write failures */ }
  }

  listAgents(): AzoraAgentMetadata[] {
    return Array.from(this.agents.values()).map(v => v.metadata);
  }

  private knowledge: any = new KnowledgeOceanService();

  async invokeAgent(id: string, prompt: string, context?: any): Promise<{ content: string; agentId?: string; metadata?: any }> {
    const entry = this.agents.get(id);
    if (!entry) throw new Error(`Agent not found: ${id}`);
    // Check Knowledge Ocean for a fast, direct answer first
    try {
      const k = await this.knowledge.tryAnswer(prompt, id);
      if (k) return { content: k, agentId: id, metadata: { model: 'knowledge-ocean' } };
    } catch (_err) { /* ignore */ }
    if (!entry.impl) {
      return { content: `Agent ${id} registered, but not available in this runtime.` , agentId: id };
    }
    const mergedContext = { agentMetadata: entry.metadata, ...(context || {}) };
    return entry.impl.invoke(prompt, mergedContext);
  }

  // Utility for tests and runtime cleanup
  clear(): void {
    this.agents.clear();
    try { void this.storage.writeJson('agentRegistry.json', []); } catch (e) { /* ignore */ }
  }

  onDidRegisterAgent(cb: (m: AzoraAgentMetadata) => void): void {
    this.listeners.push(cb);
  }

  async invokeAgentStreaming(id: string, prompt: string, onChunk: (chunk: string, metadata?: any) => Promise<void> | void, context?: any): Promise<{ content?: string; metadata?: any } | null> {
    const entry = this.agents.get(id);
    if (!entry) throw new Error(`Agent not found: ${id}`);
    const impl = entry.impl;
    // Check Knowledge Ocean for a direct answer and short-circuit
    try {
      const k = await this.knowledge.tryAnswer(prompt, id);
      if (k) {
        await onChunk(k, { model: 'knowledge-ocean' });
        return { content: k, metadata: { model: 'knowledge-ocean' } };
      }
    } catch (_err) { /* ignore */ }
    if (!impl) {
      const placeholder = `Agent ${id} registered, but not available in this runtime.`;
      await onChunk(placeholder, { model: 'placeholder' });
      return { content: placeholder, metadata: { model: 'placeholder' } };
    }
    if (impl.invokeStreaming) {
      let finalContent = '';
      for await (const part of impl.invokeStreaming(prompt, { agentMetadata: entry.metadata, ...(context || {}) })) {
        finalContent += part.chunk;
        await onChunk(part.chunk, part.metadata);
      }
      return { content: finalContent, metadata: {} };
    }
    // Fallback: single response
    const resp = await impl.invoke(prompt, context);
    await onChunk(resp.content, resp.metadata);
    return { content: resp.content, metadata: resp.metadata };
  }

  async getFollowups(id: string, result: any): Promise<any[]> {
    const entry = this.agents.get(id);
    if (!entry) throw new Error(`Agent not found: ${id}`);
    const impl = entry.impl as any;
    if (impl.provideFollowups) return await impl.provideFollowups(result);
    return [];
  }
}

registerSingleton(IAzoraAgentRegistry as any, AzoraAgentRegistryService as any, InstantiationType.Delayed);

// Provide a global instance for use by extensions and lightweight callers that don't
// or can't access the workbench DI. This keeps usage straightforward during migration.
const globalAzoraAgentRegistry = new AzoraAgentRegistryService();
export function getAzoraAgentRegistry(): AzoraAgentRegistryService {
  return globalAzoraAgentRegistry;
}

export default AzoraAgentRegistryService;
