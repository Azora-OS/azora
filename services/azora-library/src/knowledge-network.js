const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class KnowledgeNetwork {
  constructor() {
    this.networks = new Map();
    this.bookSources = new Map();
    this.cache = new Map();
    this.initializeNetworks();
  }

  initializeNetworks() {
    const networks = [
      {
        id: 'academic-network',
        name: 'Academic Research Network',
        sources: ['arxiv', 'pubmed', 'ieee', 'acm', 'springer'],
        specialty: 'Academic & Research',
        bookCount: 2500000
      },
      {
        id: 'public-library-network',
        name: 'Global Public Library Network',
        sources: ['openlibrary', 'hathitrust', 'worldcat', 'gutenberg'],
        specialty: 'General Knowledge',
        bookCount: 15000000
      },
      {
        id: 'commercial-network',
        name: 'Commercial Publishing Network',
        sources: ['googlebooks', 'amazon', 'kobo', 'apple'],
        specialty: 'Commercial Publications',
        bookCount: 8000000
      },
      {
        id: 'specialized-network',
        name: 'Specialized Knowledge Network',
        sources: ['jstor', 'wiley', 'elsevier', 'sage'],
        specialty: 'Professional & Technical',
        bookCount: 3500000
      }
    ];

    networks.forEach(network => {
      this.networks.set(network.id, {
        ...network,
        active: true,
        lastSync: new Date().toISOString(),
        accessLevel: 'premium'
      });
    });

    this.initializeBookSources();
  }

  initializeBookSources() {
    const sources = [
      { id: 'openlibrary', name: 'Open Library', url: 'https://openlibrary.org', free: true },
      { id: 'googlebooks', name: 'Google Books', url: 'https://books.google.com', free: false },
      { id: 'gutenberg', name: 'Project Gutenberg', url: 'https://gutenberg.org', free: true },
      { id: 'arxiv', name: 'arXiv', url: 'https://arxiv.org', free: true },
      { id: 'pubmed', name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov', free: true },
      { id: 'jstor', name: 'JSTOR', url: 'https://jstor.org', free: false },
      { id: 'springer', name: 'Springer', url: 'https://springer.com', free: false },
      { id: 'wiley', name: 'Wiley Online Library', url: 'https://onlinelibrary.wiley.com', free: false }
    ];

    sources.forEach(source => {
      this.bookSources.set(source.id, source);
    });
  }

  async searchAcrossNetworks(query, options = {}) {
    const { 
      networks = ['all'], 
      limit = 50, 
      category, 
      accessLevel = 'free',
      language = 'en'
    } = options;

    const results = [];
    const searchPromises = [];

    for (const [networkId, network] of this.networks) {
      if (networks.includes('all') || networks.includes(networkId)) {
        if (accessLevel === 'premium' || network.accessLevel === 'free') {
          searchPromises.push(this.searchNetwork(networkId, query, { limit: Math.ceil(limit / 4), category, language }));
        }
      }
    }

    const networkResults = await Promise.allSettled(searchPromises);
    
    networkResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      }
    });

    return this.deduplicateAndRank(results, query).slice(0, limit);
  }

  async searchNetwork(networkId, query, options = {}) {
    const network = this.networks.get(networkId);
    if (!network) return [];

    const cacheKey = `${networkId}:${query}:${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const results = [];
    const searchPromises = network.sources.map(sourceId => 
      this.searchSource(sourceId, query, options)
    );

    const sourceResults = await Promise.allSettled(searchPromises);
    
    sourceResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      }
    });

    this.cache.set(cacheKey, results);
    setTimeout(() => this.cache.delete(cacheKey), 300000); // 5 min cache

    return results;
  }

  async searchSource(sourceId, query, options = {}) {
    const source = this.bookSources.get(sourceId);
    if (!source) return [];

    try {
      switch (sourceId) {
        case 'openlibrary':
          return await this.searchOpenLibrary(query, options);
        case 'googlebooks':
          return await this.searchGoogleBooks(query, options);
        case 'gutenberg':
          return await this.searchGutenberg(query, options);
        case 'arxiv':
          return await this.searchArxiv(query, options);
        case 'pubmed':
          return await this.searchPubmed(query, options);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error searching ${sourceId}:`, error.message);
      return [];
    }
  }

  async searchOpenLibrary(query, options = {}) {
    const { limit = 10, category } = options;
    const params = { q: query, limit };
    if (category) params.subject = category;

    const response = await axios.get('https://openlibrary.org/search.json', { 
      params, 
      timeout: 5000 
    });
    
    return response.data.docs.map(book => ({
      id: `ol:${book.key}`,
      title: book.title,
      author: book.author_name?.[0] || 'Unknown',
      isbn: book.isbn?.[0],
      publishYear: book.first_publish_year,
      description: book.first_sentence?.[0],
      coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
      source: 'Open Library',
      network: 'public-library-network',
      accessType: 'free',
      format: 'digital',
      subjects: book.subject || []
    }));
  }

  async searchGoogleBooks(query, options = {}) {
    const { limit = 10 } = options;
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: { q: query, maxResults: limit },
      timeout: 5000
    });
    
    return (response.data.items || []).map(item => ({
      id: `gb:${item.id}`,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.[0] || 'Unknown',
      isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
      description: item.volumeInfo.description,
      publishYear: parseInt(item.volumeInfo.publishedDate?.substring(0, 4)),
      coverUrl: item.volumeInfo.imageLinks?.thumbnail,
      source: 'Google Books',
      network: 'commercial-network',
      accessType: 'premium',
      format: 'digital',
      subjects: item.volumeInfo.categories || []
    }));
  }

  async searchGutenberg(query, options = {}) {
    const { limit = 10 } = options;
    const response = await axios.get('https://gutendex.com/books', {
      params: { search: query },
      timeout: 5000
    });
    
    return (response.data.results || []).slice(0, limit).map(book => ({
      id: `pg:${book.id}`,
      title: book.title,
      author: book.authors?.[0]?.name || 'Unknown',
      description: book.subjects?.join(', '),
      downloadUrl: book.formats?.['text/html'] || book.formats?.['application/epub+zip'],
      source: 'Project Gutenberg',
      network: 'public-library-network',
      accessType: 'free',
      format: 'digital',
      subjects: book.subjects || []
    }));
  }

  async searchArxiv(query, options = {}) {
    // Simplified arXiv search - in production would use proper arXiv API
    return [{
      id: `arxiv:${uuidv4()}`,
      title: `Research Paper: ${query}`,
      author: 'Various Authors',
      description: `Academic research related to ${query}`,
      source: 'arXiv',
      network: 'academic-network',
      accessType: 'free',
      format: 'pdf',
      subjects: ['research', 'academic']
    }];
  }

  async searchPubmed(query, options = {}) {
    // Simplified PubMed search - in production would use proper PubMed API
    return [{
      id: `pubmed:${uuidv4()}`,
      title: `Medical Research: ${query}`,
      author: 'Medical Researchers',
      description: `Medical literature related to ${query}`,
      source: 'PubMed',
      network: 'academic-network',
      accessType: 'free',
      format: 'article',
      subjects: ['medicine', 'health', 'research']
    }];
  }

  deduplicateAndRank(books, query) {
    const seen = new Set();
    const unique = books.filter(book => {
      const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      
      // Title match
      if (a.title.toLowerCase().includes(query.toLowerCase())) scoreA += 3;
      if (b.title.toLowerCase().includes(query.toLowerCase())) scoreB += 3;
      
      // Author match
      if (a.author.toLowerCase().includes(query.toLowerCase())) scoreA += 2;
      if (b.author.toLowerCase().includes(query.toLowerCase())) scoreB += 2;
      
      // Free access bonus
      if (a.accessType === 'free') scoreA += 1;
      if (b.accessType === 'free') scoreB += 1;
      
      return scoreB - scoreA;
    });
  }

  getNetworkStats() {
    const stats = {
      totalNetworks: this.networks.size,
      totalSources: this.bookSources.size,
      estimatedBooks: 0,
      activeNetworks: 0
    };

    for (const network of this.networks.values()) {
      stats.estimatedBooks += network.bookCount;
      if (network.active) stats.activeNetworks++;
    }

    return stats;
  }

  getAvailableNetworks() {
    return Array.from(this.networks.values());
  }

  getBookSources() {
    return Array.from(this.bookSources.values());
  }
}

module.exports = { KnowledgeNetwork };