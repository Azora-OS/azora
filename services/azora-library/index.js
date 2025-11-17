const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-library' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// In-memory storage for books and users (in production, use MongoDB)
const books = new Map();
const users = new Map();
const loans = new Map();
const reservations = new Map();

// Add a new Map to store course-book relationships
const courseBooks = new Map(); // Maps course IDs to book IDs
const bookCourses = new Map(); // Maps book IDs to course IDs

// AI Librarian integration
class AILibrarian {
  constructor() {
    this.name = 'Libra';
    this.capabilities = ['search', 'recommend', 'summarize', 'categorize'];
  }

  /**
   * Search books using AI-powered fuzzy matching
   */
  async searchBooks(query, filters = {}) {
    try {
      const results = [];

      // Simple search implementation
      for (const [id, book] of books) {
        const matchesQuery =
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase()) ||
          book.description.toLowerCase().includes(query.toLowerCase()) ||
          book.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        const matchesFilters = Object.keys(filters).every(key => {
          if (key === 'category') return book.category === filters[key];
          if (key === 'author') return book.author === filters[key];
          if (key === 'year') return book.year === parseInt(filters[key]);
          return true;
        });

        if (matchesQuery && matchesFilters) {
          results.push({ ...book, id });
        }
      }

      // Sort by relevance (simplified)
      return results.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
        return bTitleMatch - aTitleMatch;
      });
    } catch (error) {
      logger.error('AI Librarian search error:', error);
      throw error;
    }
  }

  /**
   * Recommend books based on user preferences
   */
  async recommendBooks(userId, count = 5) {
    try {
      const user = users.get(userId);
      if (!user) return [];

      // Simple recommendation based on user's borrowed books
      const userLoans = Array.from(loans.values()).filter(loan => loan.userId === userId);
      const categories = userLoans.map(loan => books.get(loan.bookId)?.category).filter(Boolean);

      // Count category frequencies
      const categoryCount = {};
      categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      // Find most popular category
      const topCategory = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a])[0];

      // Recommend books from the same category
      const recommendations = [];
      for (const [id, book] of books) {
        if (book.category === topCategory && !userLoans.some(loan => loan.bookId === id)) {
          recommendations.push({ ...book, id });
          if (recommendations.length >= count) break;
        }
      }

      return recommendations;
    } catch (error) {
      logger.error('AI Librarian recommendation error:', error);
      throw error;
    }
  }

  /**
   * Summarize book content
   */
  async summarizeBook(bookId) {
    try {
      const book = books.get(bookId);
      if (!book) return null;

      // Simple summary extraction (in reality, this would use NLP)
      const summary = {
        title: book.title,
        author: book.author,
        category: book.category,
        year: book.year,
        wordCount: book.content ? book.content.split(' ').length : 0,
        excerpt: book.content ? book.content.substring(0, 200) + '...' : ''
      };

      return summary;
    } catch (error) {
      logger.error('AI Librarian summarization error:', error);
      throw error;
    }
  }

  /**
   * Categorize books using AI
   */
  async categorizeBook(title, description) {
    try {
      // Simple rule-based categorization (in reality, this would use ML)
      const text = (title + ' ' + description).toLowerCase();

      if (text.includes('fiction') || text.includes('novel') || text.includes('story')) return 'Fiction';
      if (text.includes('science') || text.includes('technology') || text.includes('tech')) return 'Science & Technology';
      if (text.includes('history') || text.includes('historical')) return 'History';
      if (text.includes('biography') || text.includes('autobiography')) return 'Biography';
      if (text.includes('business') || text.includes('entrepreneur')) return 'Business';
      if (text.includes('health') || text.includes('medical')) return 'Health & Medicine';
      if (text.includes('art') || text.includes('design')) return 'Arts & Design';
      if (text.includes('cook') || text.includes('recipe')) return 'Cooking';

      return 'General';
    } catch (error) {
      logger.error('AI Librarian categorization error:', error);
      throw error;
    }
  }
}

// Initialize AI Librarian
const aiLibrarian = new AILibrarian();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Azora Library',
    timestamp: new Date().toISOString()
  });
});

// Get AI Librarian info
app.get('/ai-librarian', (req, res) => {
  res.json({
    name: aiLibrarian.name,
    capabilities: aiLibrarian.capabilities,
    greeting: `Hello! I'm ${aiLibrarian.name}, your AI librarian assistant. How can I help you today?`
  });
});

// Add a new book (admin only)
app.post('/books', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, author, description, content, category, tags = [], price = 0 } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    // Auto-categorize if not provided
    const bookCategory = category || await aiLibrarian.categorizeBook(title, description || '');

    const bookId = uuidv4();
    const newBook = {
      id: bookId,
      title,
      author,
      description: description || '',
      content: content || '',
      category: bookCategory,
      tags,
      price, // 0 means free, > 0 means paid
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    books.set(bookId, newBook);
    logger.info(`Book added: ${title} by ${author}`);

    res.status(201).json({
      success: true,
      data: newBook
    });
  } catch (error) {
    logger.error('Error adding book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all books with pagination and filtering
app.get('/books', (req, res) => {
  try {
    const { page = 1, limit = 20, category, author, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let filteredBooks = Array.from(books.values());

    // Apply filters
    if (category) {
      filteredBooks = filteredBooks.filter(book => book.category === category);
    }

    if (author) {
      filteredBooks = filteredBooks.filter(book => book.author === author);
    }

    if (search) {
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedBooks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(filteredBooks.length / limitNum),
        totalItems: filteredBooks.length,
        hasNext: endIndex < filteredBooks.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    logger.error('Error fetching books:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all courses that use a specific book
app.get('/books/:bookId/courses', (req, res) => {
  try {
    const { bookId } = req.params;

    if (!books.has(bookId)) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const courseIds = bookCourses.get(bookId) || new Set();
    const courses = []; // In a real implementation, this would fetch from the education service

    // For now, we'll return the course IDs
    res.json({
      success: true,
      data: {
        bookId,
        courseIds: Array.from(courseIds)
      }
    });
  } catch (error) {
    logger.error('Error fetching courses for book:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI-powered book summary
app.get('/books/:id/summary', async (req, res) => {
  try {
    const summary = await aiLibrarian.summarizeBook(req.params.id);

    if (!summary) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      success: true,
      data: summary,
      aiLibrarian: {
        name: aiLibrarian.name,
        message: `Here's a summary of "${summary.title}" by ${summary.author}.`
      }
    });
  } catch (error) {
    logger.error('Error summarizing book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific book by ID
app.get('/books/:id', (req, res) => {
  try {
    const book = books.get(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    logger.error('Error fetching book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a book (admin only)
app.put('/books/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const book = books.get(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const { title, author, description, content, category, tags, price } = req.body;

    // Update book fields
    if (title) book.title = title;
    if (author) book.author = author;
    if (description !== undefined) book.description = description;
    if (content !== undefined) book.content = content;
    if (category) book.category = category;
    if (tags) book.tags = tags;
    if (price !== undefined) book.price = price;
    book.updatedAt = new Date().toISOString();

    books.set(req.params.id, book);
    logger.info(`Book updated: ${book.title} by ${book.author}`);

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    logger.error('Error updating book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a book (admin only)
app.delete('/books/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const book = books.get(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    books.delete(req.params.id);
    logger.info(`Book deleted: ${book.title} by ${book.author}`);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting book:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI-powered book search
app.post('/search', async (req, res) => {
  try {
    const { query, filters = {} } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await aiLibrarian.searchBooks(query, filters);

    res.json({
      success: true,
      data: results,
      aiLibrarian: {
        name: aiLibrarian.name,
        message: `I found ${results.length} books matching your search for "${query}".`
      }
    });
  } catch (error) {
    logger.error('Error searching books:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI-powered book recommendations
app.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { count = 5 } = req.query;

    const recommendations = await aiLibrarian.recommendBooks(userId, parseInt(count));

    res.json({
      success: true,
      data: recommendations,
      aiLibrarian: {
        name: aiLibrarian.name,
        message: `Based on your reading history, I recommend these ${recommendations.length} books.`
      }
    });
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// User registration
app.post('/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    for (const user of users.values()) {
      if (user.email === email || user.username === username) {
        return res.status(409).json({ error: 'User already exists' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = uuidv4();
    const newUser = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      role: 'user', // 'user' or 'admin'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.set(userId, newUser);
    logger.info(`User registered: ${username} (${email})`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      token
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});

// User login
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    let user = null;
    for (const u of users.values()) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
      token
    });
  } catch (error) {
    logger.error('Error logging in:', error);
    res.status(500).json({ error: error.message });
  }
});

// Borrow a book
app.post('/loans', authenticateToken, (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.userId;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const book = books.get(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if book is available (not already borrowed)
    const existingLoan = Array.from(loans.values()).find(loan =>
      loan.bookId === bookId && loan.returnedAt === null
    );

    if (existingLoan) {
      return res.status(409).json({ error: 'Book is already borrowed' });
    }

    // Check if user needs to pay for the book
    if (book.price > 0) {
      // In a real implementation, this would integrate with a payment service
      // For now, we'll assume payment is handled elsewhere
      logger.info(`User ${userId} needs to pay $${book.price} for book ${bookId}`);
    }

    const loanId = uuidv4();
    const newLoan = {
      id: loanId,
      userId,
      bookId,
      borrowedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      returnedAt: null
    };

    loans.set(loanId, newLoan);
    logger.info(`Book borrowed: ${book.title} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: newLoan
    });
  } catch (error) {
    logger.error('Error borrowing book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Return a book
app.post('/loans/:id/return', authenticateToken, (req, res) => {
  try {
    const loan = loans.get(req.params.id);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to return this book' });
    }

    if (loan.returnedAt) {
      return res.status(400).json({ error: 'Book already returned' });
    }

    loan.returnedAt = new Date().toISOString();
    loans.set(req.params.id, loan);

    const book = books.get(loan.bookId);
    logger.info(`Book returned: ${book?.title} by user ${loan.userId}`);

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    logger.error('Error returning book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's borrowed books
app.get('/loans', authenticateToken, (req, res) => {
  try {
    const userLoans = Array.from(loans.values()).filter(loan =>
      loan.userId === req.user.userId
    );

    // Enrich with book details
    const enrichedLoans = userLoans.map(loan => ({
      ...loan,
      book: books.get(loan.bookId)
    }));

    res.json({
      success: true,
      data: enrichedLoans
    });
  } catch (error) {
    logger.error('Error fetching user loans:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reserve a book
app.post('/reservations', authenticateToken, (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.userId;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const book = books.get(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if book is available
    const existingLoan = Array.from(loans.values()).find(loan =>
      loan.bookId === bookId && loan.returnedAt === null
    );

    if (!existingLoan) {
      return res.status(400).json({ error: 'Book is currently available, no need to reserve' });
    }

    // Check if user already has a reservation for this book
    const existingReservation = Array.from(reservations.values()).find(res =>
      res.bookId === bookId && res.userId === userId && res.fulfilled === false
    );

    if (existingReservation) {
      return res.status(409).json({ error: 'You already have a reservation for this book' });
    }

    const reservationId = uuidv4();
    const newReservation = {
      id: reservationId,
      userId,
      bookId,
      reservedAt: new Date().toISOString(),
      fulfilled: false
    };

    reservations.set(reservationId, newReservation);
    logger.info(`Book reserved: ${book.title} by user ${userId}`);

    res.status(201).json({
      success: true,
      data: newReservation
    });
  } catch (error) {
    logger.error('Error reserving book:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a book to a course (admin only)
app.post('/courses/:courseId/books/:bookId', authenticateToken, isAdmin, (req, res) => {
  try {
    const { courseId, bookId } = req.params;

    // Check if book exists
    const book = books.get(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Create relationship
    const relationshipId = `${courseId}-${bookId}`;
    const relationship = {
      id: relationshipId,
      courseId,
      bookId,
      assignedAt: new Date().toISOString(),
      required: req.body.required || false // Whether the book is required for the course
    };

    courseBooks.set(relationshipId, relationship);

    // Add to reverse mapping
    if (!bookCourses.has(bookId)) {
      bookCourses.set(bookId, new Set());
    }
    bookCourses.get(bookId).add(courseId);

    logger.info(`Book ${bookId} assigned to course ${courseId}`);

    res.status(201).json({
      success: true,
      data: relationship
    });
  } catch (error) {
    logger.error('Error assigning book to course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all books for a course
app.get('/courses/:courseId/books', (req, res) => {
  try {
    const { courseId } = req.params;

    // Find all books assigned to this course
    const courseBookRelationships = Array.from(courseBooks.values()).filter(rel => rel.courseId === courseId);
    const bookList = courseBookRelationships.map(rel => {
      const book = books.get(rel.bookId);
      return {
        ...book,
        required: rel.required,
        assignmentId: rel.id
      };
    }).filter(book => book !== null);

    res.json({
      success: true,
      data: bookList
    });
  } catch (error) {
    logger.error('Error fetching books for course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove a book from a course (admin only)
app.delete('/courses/:courseId/books/:bookId', authenticateToken, isAdmin, (req, res) => {
  try {
    const { courseId, bookId } = req.params;
    const relationshipId = `${courseId}-${bookId}`;

    if (!courseBooks.has(relationshipId)) {
      return res.status(404).json({ error: 'Book not assigned to course' });
    }

    courseBooks.delete(relationshipId);

    // Update reverse mapping
    if (bookCourses.has(bookId)) {
      bookCourses.get(bookId).delete(courseId);
      if (bookCourses.get(bookId).size === 0) {
        bookCourses.delete(bookId);
      }
    }

    logger.info(`Book ${bookId} removed from course ${courseId}`);

    res.json({
      success: true,
      message: 'Book removed from course successfully'
    });
  } catch (error) {
    logger.error('Error removing book from course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get books recommended for a student based on their enrollments
app.get('/students/:studentId/recommendations', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // In a real implementation, this would call the education service to get student enrollments
    // For now, we'll simulate this with a simple approach

    // Get books from courses (simulated)
    const recommendedBooks = [];

    // Add some sample recommendations based on our sample books
    for (const book of books.values()) {
      recommendedBooks.push({
        ...book,
        recommendationReason: 'Popular in related courses'
      });
    }

    res.json({
      success: true,
      data: recommendedBooks,
      aiLibrarian: {
        name: aiLibrarian.name,
        message: `I found ${recommendedBooks.length} books that might be helpful for your courses.`
      }
    });
  } catch (error) {
    logger.error('Error getting student recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's reservations
app.get('/reservations', authenticateToken, (req, res) => {
  try {
    const userReservations = Array.from(reservations.values()).filter(res =>
      res.userId === req.user.userId
    );

    // Enrich with book details
    const enrichedReservations = userReservations.map(res => ({
      ...res,
      book: books.get(res.bookId)
    }));

    res.json({
      success: true,
      data: enrichedReservations
    });
  } catch (error) {
    logger.error('Error fetching user reservations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Azora Library Service listening on port ${PORT}`);

  // Add some sample data for testing
  const sampleBooks = [
    {
      id: uuidv4(),
      title: 'The Art of Computer Programming',
      author: 'Donald Knuth',
      description: 'Fundamental algorithms and mathematical techniques in computer science',
      content: 'This is a comprehensive overview of computer programming...',
      category: 'Science & Technology',
      tags: ['programming', 'algorithms', 'computer science'],
      price: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Design Patterns',
      author: 'Gang of Four',
      description: 'Elements of reusable object-oriented software',
      content: 'This book describes design patterns that help programmers...',
      category: 'Science & Technology',
      tags: ['software engineering', 'design patterns', 'oop'],
      price: 5.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  sampleBooks.forEach(book => {
    books.set(book.id, book);
  });

  logger.info(`Added ${sampleBooks.length} sample books to the library`);
});

module.exports = app;
