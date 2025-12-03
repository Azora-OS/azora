const express = require('express');
const { AgentLibrarianNetwork } = require('./agent-librarians');
const { BookNetworkAPI } = require('./book-network');
const { PersonalizedLibrary } = require('./personalized-library');

class EnhancedLibraryService {
  constructor() {
    this.agentNetwork = new AgentLibrarianNetwork();
    this.bookNetwork = new BookNetworkAPI();
    this.personalLibrary = new PersonalizedLibrary();
    this.localBooks = new Map();
  }

  async searchBooks(query, options = {}) {
    const { category, source = 'all', limit = 20, userId } = options;

    let results = [];

    if (source === 'local' || source === 'all') {
      results = Array.from(this.localBooks.values()).filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (source === 'network' || source === 'all') {
      const networkResults = await this.bookNetwork.searchAllSources(query, limit);
      results = [...results, ...networkResults];
    }

    if (category) {
      results = results.filter(book => book.category === category);
    }

    const routing = await this.agentNetwork.routeQuery(query, category);
    const curatedResults = await this.agentNetwork.curateBooks(results, routing.coordinator?.specialty);

    if (userId) {
      return this.personalLibrary.getPersonalizedRecommendations(userId, curatedResults, limit);
    }

    return curatedResults.slice(0, limit);
  }

  async getBookDetails(bookId, source = 'local') {
    if (source === 'local') {
      return this.localBooks.get(bookId);
    }
    
    const [sourceName, externalId] = bookId.split(':');
    return await this.bookNetwork.getBookDetails(sourceName, externalId);
  }

  addLocalBook(book) {
    const bookId = book.id || require('uuid').v4();
    this.localBooks.set(bookId, { ...book, id: bookId, source: 'local' });
    return this.localBooks.get(bookId);
  }

  getUserLibrary(userId) {
    return this.personalLibrary.getUserLibrary(userId);
  }

  createCollection(userId, name, description) {
    return this.personalLibrary.createCollection(userId, name, 'custom', '📚', description);
  }

  addToCollection(collectionId, bookId, metadata) {
    return this.personalLibrary.addBookToCollection(collectionId, bookId, metadata);
  }

  updateReadingProgress(userId, bookId, progress) {
    return this.personalLibrary.updateReadingProgress(userId, bookId, progress);
  }

  getAgents() {
    return this.agentNetwork.getAllAgents();
  }

  getNetworks() {
    return this.agentNetwork.getAllNetworks();
  }

  getReadingStats(userId) {
    return this.personalLibrary.getReadingStats(userId);
  }

  async getRecommendations(userId, count = 10) {
    const library = this.getUserLibrary(userId);
    const allBooks = Array.from(this.localBooks.values());
    
    const networkBooks = await this.bookNetwork.searchAllSources(
      library.preferences.interests.join(' '), 
      20
    );

    const combined = [...allBooks, ...networkBooks];
    return this.personalLibrary.getPersonalizedRecommendations(userId, combined, count);
  }
}

module.exports = { EnhancedLibraryService };
