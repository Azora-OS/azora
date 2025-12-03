const { v4: uuidv4 } = require('uuid');

class PersonalizedLibrary {
  constructor() {
    this.userLibraries = new Map();
    this.collections = new Map();
  }

  createUserLibrary(userId, preferences = {}) {
    const library = {
      id: uuidv4(),
      userId,
      preferences: {
        favoriteGenres: preferences.favoriteGenres || [],
        readingLevel: preferences.readingLevel || 'intermediate',
        interests: preferences.interests || [],
        language: preferences.language || 'en'
      },
      collections: [],
      readingHistory: [],
      wishlist: [],
      currentlyReading: [],
      createdAt: new Date().toISOString()
    };

    this.userLibraries.set(userId, library);
    this.createDefaultCollections(userId);
    return library;
  }

  createDefaultCollections(userId) {
    const defaultCollections = [
      { name: 'Currently Reading', type: 'system', icon: '📖' },
      { name: 'Want to Read', type: 'system', icon: '⭐' },
      { name: 'Finished', type: 'system', icon: '✅' },
      { name: 'Favorites', type: 'system', icon: '❤️' }
    ];

    defaultCollections.forEach(col => {
      this.createCollection(userId, col.name, col.type, col.icon);
    });
  }

  createCollection(userId, name, type = 'custom', icon = '📚', description = '') {
    const collectionId = uuidv4();
    const collection = {
      id: collectionId,
      userId,
      name,
      type,
      icon,
      description,
      books: [],
      isPublic: false,
      createdAt: new Date().toISOString()
    };

    this.collections.set(collectionId, collection);
    
    const library = this.userLibraries.get(userId);
    if (library) {
      library.collections.push(collectionId);
    }

    return collection;
  }

  addBookToCollection(collectionId, bookId, metadata = {}) {
    const collection = this.collections.get(collectionId);
    if (!collection) return null;

    const bookEntry = {
      bookId,
      addedAt: new Date().toISOString(),
      notes: metadata.notes || '',
      rating: metadata.rating || null,
      progress: metadata.progress || 0
    };

    collection.books.push(bookEntry);
    return bookEntry;
  }

  getUserLibrary(userId) {
    let library = this.userLibraries.get(userId);
    if (!library) {
      library = this.createUserLibrary(userId);
    }
    return library;
  }

  getUserCollections(userId) {
    const library = this.getUserLibrary(userId);
    return library.collections.map(id => this.collections.get(id)).filter(Boolean);
  }

  getCollection(collectionId) {
    return this.collections.get(collectionId);
  }

  updateReadingProgress(userId, bookId, progress) {
    const library = this.getUserLibrary(userId);
    const existing = library.currentlyReading.find(b => b.bookId === bookId);
    
    if (existing) {
      existing.progress = progress;
      existing.lastRead = new Date().toISOString();
    } else {
      library.currentlyReading.push({
        bookId,
        progress,
        startedAt: new Date().toISOString(),
        lastRead: new Date().toISOString()
      });
    }

    if (progress >= 100) {
      this.markAsFinished(userId, bookId);
    }

    return library;
  }

  markAsFinished(userId, bookId) {
    const library = this.getUserLibrary(userId);
    library.currentlyReading = library.currentlyReading.filter(b => b.bookId !== bookId);
    
    if (!library.readingHistory.some(b => b.bookId === bookId)) {
      library.readingHistory.push({
        bookId,
        finishedAt: new Date().toISOString()
      });
    }
  }

  addToWishlist(userId, bookId) {
    const library = this.getUserLibrary(userId);
    if (!library.wishlist.includes(bookId)) {
      library.wishlist.push(bookId);
    }
    return library;
  }

  getPersonalizedRecommendations(userId, books, count = 10) {
    const library = this.getUserLibrary(userId);
    const { favoriteGenres, interests } = library.preferences;
    const readBookIds = new Set(library.readingHistory.map(b => b.bookId));

    const scored = books
      .filter(book => !readBookIds.has(book.id))
      .map(book => {
        let score = 0;
        
        if (favoriteGenres.includes(book.category)) score += 3;
        
        interests.forEach(interest => {
          if (book.title.toLowerCase().includes(interest.toLowerCase()) ||
              book.description?.toLowerCase().includes(interest.toLowerCase())) {
            score += 2;
          }
        });

        if (book.tags) {
          book.tags.forEach(tag => {
            if (interests.includes(tag)) score += 1;
          });
        }

        return { ...book, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scored.slice(0, count);
  }

  getReadingStats(userId) {
    const library = this.getUserLibrary(userId);
    return {
      totalBooksRead: library.readingHistory.length,
      currentlyReading: library.currentlyReading.length,
      wishlistCount: library.wishlist.length,
      collectionsCount: library.collections.length,
      favoriteGenres: library.preferences.favoriteGenres,
      readingStreak: this.calculateReadingStreak(library)
    };
  }

  calculateReadingStreak(library) {
    if (library.readingHistory.length === 0) return 0;
    
    const sortedHistory = library.readingHistory
      .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
    
    let streak = 1;
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = new Date(sortedHistory[i].finishedAt);
      const next = new Date(sortedHistory[i + 1].finishedAt);
      const daysDiff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
}

module.exports = { PersonalizedLibrary };
