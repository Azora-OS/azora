// Simple in-memory vector store for document embeddings
export class VectorStore {
  constructor() {
    this.documents = [];
    this.embeddings = [];
  }

  // Add document with embedding
  async addDocument(text, metadata = {}) {
    const embedding = await this.generateEmbedding(text);
    this.documents.push({ text, metadata, id: this.documents.length });
    this.embeddings.push(embedding);
    return this.documents.length - 1;
  }

  // Search similar documents
  async search(query, topK = 5) {
    const queryEmbedding = await this.generateEmbedding(query);
    
    const scores = this.embeddings.map((emb, idx) => ({
      id: idx,
      score: this.cosineSimilarity(queryEmbedding, emb),
      document: this.documents[idx]
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(s => s.document);
  }

  // Simple embedding (TF-IDF-like)
  async generateEmbedding(text) {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const vocab = [...new Set(words)];
    const embedding = new Array(100).fill(0);
    
    words.forEach((word, idx) => {
      const hash = this.hashCode(word) % 100;
      embedding[hash] += 1 / (idx + 1);
    });
    
    return this.normalize(embedding);
  }

  // Cosine similarity
  cosineSimilarity(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  // Normalize vector
  normalize(vec) {
    const mag = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return vec.map(v => v / mag);
  }

  // Hash string to number
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // Get stats
  getStats() {
    return {
      totalDocuments: this.documents.length,
      embeddingDimension: 100
    };
  }
}
