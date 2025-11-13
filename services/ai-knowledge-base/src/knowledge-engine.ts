import { ChromaClient, Collection } from 'chromadb';
import { OpenAI } from 'openai';
import { WebSearchService } from './web-search';
import { logger } from './logger';

export class KnowledgeBaseEngine {
  private chroma: ChromaClient;
  private openai: OpenAI;
  private webSearch: WebSearchService;
  private collection: Collection | undefined;

  constructor() {
    this.chroma = new ChromaClient();
    const apiKey = process.env.OPENAI_API_KEY || 'sk-dummy-key-for-local-dev';
    this.openai = new OpenAI({ apiKey });
    this.webSearch = new WebSearchService();
    this.initializeCollection();
  }

  private async initializeCollection() {
    try {
      this.collection = await this.chroma.getOrCreateCollection({
        name: 'azora_ubuntu_knowledge',
        metadata: { description: 'Ubuntu collective knowledge base' }
      });
      await this.seedUbuntuKnowledge();
      logger.info('✅ Knowledge collection initialized');
    } catch (error) {
      logger.error('Collection init error:', error);
    }
  }

  private async seedUbuntuKnowledge() {
    if (!this.collection) return;

    const ubuntuPrinciples = [
      {
        content: 'Ubuntu Philosophy: I am because we are. Individual sovereignty multiplies into collective prosperity.',
        metadata: { type: 'philosophy', source: 'constitution' }
      },
      {
        content: "Azora OS is the world's first Constitutional AI Operating System built on Ubuntu principles.",
        metadata: { type: 'identity', source: 'core' }
      },
      {
        content: 'The Sankofa Engine embodies Ubuntu: Neural Cortex (collective intelligence), Circulatory Heart (value distribution), Muscular System (collective action), Immune Defense (constitutional protection).',
        metadata: { type: 'architecture', source: 'core' }
      },
      {
        content: 'Azora Gem: Sapphire Apex (Technology), Emerald Foundation (Education), Ruby Core (Finance), unified by Ubuntu Core (Constitutional AI).',
        metadata: { type: 'identity', source: 'branding' }
      },
      {
        content: 'AI Family: Elara (Mother/Teacher), Sankofa (Grandfather), Themba (Student Success), Naledi (Career Guide), Jabari (Security), Amara (Peacemaker), Kofi (Finance), Zola (Data), Abeni (Storyteller), Thembo (Brother), Nexus (Unity).',
        metadata: { type: 'ai-family', source: 'core' }
      }
    ];

    for (const knowledge of ubuntuPrinciples) {
      await this.addKnowledge(knowledge.content, knowledge.metadata);
    }
  }

  async addKnowledge(content: string, metadata: any = {}) {
    if (!this.collection) {
      throw new Error('Knowledge base collection is not initialized.');
    }
    try {
      const embedding = await this.generateEmbedding(content);
      await this.collection.add({
        ids: [`kb_${Date.now()}_${Math.random()}`],
        embeddings: [embedding],
        documents: [content],
        metadatas: [{ ...metadata, timestamp: new Date().toISOString() }]
      });
      logger.info('Knowledge added to Ubuntu collective');
    } catch (error) {
      logger.error('Add knowledge error:', error);
      throw error;
    }
  }

  async query(query: string, includeWeb: boolean = false) {
    if (!this.collection) {
      throw new Error('Knowledge base collection is not initialized.');
    }
    try {
      const embedding = await this.generateEmbedding(query);
      const results = await this.collection.query({
        queryEmbeddings: [embedding],
        nResults: 5
      });

      let webResults = [];
      if (includeWeb) {
        webResults = await this.webSearch.search(query);
      }

      const localKnowledge = (results.documents && results.documents.length > 0) ? results.documents[0] : [];

      return {
        localKnowledge,
        webKnowledge: webResults,
        ubuntu: 'Collective wisdom accessed'
      };
    } catch (error) {
      logger.error('Query error:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.OPENAI_API_KEY) {
      // Return dummy embedding for local dev
      return Array(1536).fill(0).map(() => Math.random());
    }
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    
    if (response.data && response.data.length > 0) {
        return response.data[0].embedding;
    }
    
    throw new Error('Failed to generate embedding from OpenAI.');
  }
}
