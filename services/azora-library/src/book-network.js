const axios = require('axios');

class BookNetworkAPI {
  constructor() {
    this.apiSources = [
      { name: 'OpenLibrary', baseUrl: 'https://openlibrary.org', enabled: true },
      { name: 'GoogleBooks', baseUrl: 'https://www.googleapis.com/books/v1', enabled: true },
      { name: 'ProjectGutenberg', baseUrl: 'https://gutendex.com', enabled: true }
    ];
  }

  async searchOpenLibrary(query, limit = 10) {
    try {
      const response = await axios.get(`https://openlibrary.org/search.json`, {
        params: { q: query, limit },
        timeout: 5000
      });
      
      return response.data.docs.map(book => ({
        title: book.title,
        author: book.author_name?.[0] || 'Unknown',
        isbn: book.isbn?.[0],
        publishYear: book.first_publish_year,
        publisher: book.publisher?.[0],
        pageCount: book.number_of_pages_median,
        coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
        source: 'OpenLibrary',
        externalId: book.key
      }));
    } catch (error) {
      console.error('OpenLibrary search error:', error.message);
      return [];
    }
  }

  async searchGoogleBooks(query, limit = 10) {
    try {
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes`, {
        params: { q: query, maxResults: limit },
        timeout: 5000
      });
      
      return (response.data.items || []).map(item => ({
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Unknown',
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
        description: item.volumeInfo.description,
        publishYear: parseInt(item.volumeInfo.publishedDate?.substring(0, 4)),
        publisher: item.volumeInfo.publisher,
        pageCount: item.volumeInfo.pageCount,
        coverUrl: item.volumeInfo.imageLinks?.thumbnail,
        category: item.volumeInfo.categories?.[0] || 'General',
        source: 'GoogleBooks',
        externalId: item.id
      }));
    } catch (error) {
      console.error('GoogleBooks search error:', error.message);
      return [];
    }
  }

  async searchGutenberg(query, limit = 10) {
    try {
      const response = await axios.get(`https://gutendex.com/books`, {
        params: { search: query },
        timeout: 5000
      });
      
      return (response.data.results || []).slice(0, limit).map(book => ({
        title: book.title,
        author: book.authors?.[0]?.name || 'Unknown',
        description: book.subjects?.join(', '),
        publishYear: book.copyright ? null : 1900,
        coverUrl: book.formats?.['image/jpeg'],
        fileUrl: book.formats?.['text/html'] || book.formats?.['application/epub+zip'],
        format: 'digital',
        price: 0,
        source: 'ProjectGutenberg',
        externalId: book.id.toString()
      }));
    } catch (error) {
      console.error('Gutenberg search error:', error.message);
      return [];
    }
  }

  async searchAllSources(query, limit = 30) {
    const results = await Promise.allSettled([
      this.searchOpenLibrary(query, Math.ceil(limit / 3)),
      this.searchGoogleBooks(query, Math.ceil(limit / 3)),
      this.searchGutenberg(query, Math.ceil(limit / 3))
    ]);

    const allBooks = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    return this.deduplicateBooks(allBooks).slice(0, limit);
  }

  deduplicateBooks(books) {
    const seen = new Set();
    return books.filter(book => {
      const key = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async getBookDetails(source, externalId) {
    try {
      switch (source) {
        case 'OpenLibrary':
          const olResponse = await axios.get(`https://openlibrary.org${externalId}.json`);
          return this.normalizeOpenLibraryBook(olResponse.data);
        
        case 'GoogleBooks':
          const gbResponse = await axios.get(`https://www.googleapis.com/books/v1/volumes/${externalId}`);
          return this.normalizeGoogleBook(gbResponse.data);
        
        case 'ProjectGutenberg':
          const pgResponse = await axios.get(`https://gutendex.com/books/${externalId}`);
          return this.normalizeGutenbergBook(pgResponse.data);
        
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error fetching book details from ${source}:`, error.message);
      return null;
    }
  }

  normalizeOpenLibraryBook(data) {
    return {
      title: data.title,
      author: data.authors?.[0]?.name || 'Unknown',
      description: data.description?.value || data.description,
      isbn: data.isbn_13?.[0] || data.isbn_10?.[0],
      publishYear: data.publish_date ? parseInt(data.publish_date) : null,
      source: 'OpenLibrary'
    };
  }

  normalizeGoogleBook(data) {
    return {
      title: data.volumeInfo.title,
      author: data.volumeInfo.authors?.[0] || 'Unknown',
      description: data.volumeInfo.description,
      isbn: data.volumeInfo.industryIdentifiers?.[0]?.identifier,
      publishYear: parseInt(data.volumeInfo.publishedDate?.substring(0, 4)),
      source: 'GoogleBooks'
    };
  }

  normalizeGutenbergBook(data) {
    return {
      title: data.title,
      author: data.authors?.[0]?.name || 'Unknown',
      description: data.subjects?.join(', '),
      fileUrl: data.formats?.['text/html'],
      source: 'ProjectGutenberg'
    };
  }
}

module.exports = { BookNetworkAPI };
