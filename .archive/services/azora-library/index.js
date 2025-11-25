const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3007;
const SERVICE_NAME = process.env.SERVICE_NAME || 'azora-library';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    description: 'Azora Library Service - Digital library, book checkout, research resources',
    endpoints: {
      'POST /api/books': 'Add a new book to the library',
      'GET /api/books': 'Get all books',
      'GET /api/books/:id': 'Get book by ID',
      'PUT /api/books/:id': 'Update book',
      'DELETE /api/books/:id': 'Delete book',
      'POST /api/books/:id/copy': 'Add a copy of a book',
      'GET /api/books/:id/copies': 'Get all copies of a book',
      'POST /api/checkouts': 'Checkout a book',
      'GET /api/checkouts': 'Get all checkouts',
      'GET /api/checkouts/:id': 'Get checkout by ID',
      'PUT /api/checkouts/:id/return': 'Return a book',
      'PUT /api/checkouts/:id/renew': 'Renew a checkout',
      'POST /api/reservations': 'Reserve a book',
      'GET /api/reservations': 'Get all reservations',
      'GET /api/reservations/:id': 'Get reservation by ID',
      'PUT /api/reservations/:id/cancel': 'Cancel a reservation',
      'POST /api/digital-resources': 'Upload a digital resource',
      'GET /api/digital-resources': 'Get all digital resources',
      'GET /api/digital-resources/:id': 'Get digital resource by ID',
      'GET /api/digital-resources/:id/access': 'Access a digital resource',
      'POST /api/cards': 'Issue a library card',
      'GET /api/cards/:userId': 'Get library card by user ID',
      'PUT /api/cards/:id/renew': 'Renew library card',
      'GET /api/users/:userId/checkouts': 'Get checkouts for user',
      'GET /api/users/:userId/reservations': 'Get reservations for user'
    }
  });
});

// Add a new book to the library
app.post('/api/books', async (req, res) => {
  try {
    const bookData = req.body;
    
    const book = await prisma.book.create({
      data: bookData
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Book added successfully',
      data: book 
    });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add book',
      message: error.message 
    });
  }
});

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const { category, author, status, search } = req.query;
    const where = {};
    
    if (category) {
      where.categories = {
        has: category
      };
    }
    
    if (author) {
      where.authors = {
        has: author
      };
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const books = await prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: books 
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch books',
      message: error.message 
    });
  }
});

// Get book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const book = await prisma.book.findUnique({
      where: { id }
    });
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: book 
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch book',
      message: error.message 
    });
  }
});

// Update book
app.put('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const book = await prisma.book.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Book updated successfully',
      data: book 
    });
  } catch (error) {
    console.error('Error updating book:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update book',
      message: error.message 
    });
  }
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.book.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Book deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete book',
      message: error.message 
    });
  }
});

// Add a copy of a book
app.post('/api/books/:id/copy', async (req, res) => {
  try {
    const { id } = req.params;
    const { copyNumber, barcode, location } = req.body;
    
    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id }
    });
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }
    
    // Create book copy
    const bookCopy = await prisma.bookCopy.create({
      data: {
        bookId: id,
        copyNumber: copyNumber || 1,
        barcode: barcode || `BC${Date.now()}`,
        location
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Book copy added successfully',
      data: bookCopy 
    });
  } catch (error) {
    console.error('Error adding book copy:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add book copy',
      message: error.message 
    });
  }
});

// Get all copies of a book
app.get('/api/books/:id/copies', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id }
    });
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }
    
    const copies = await prisma.bookCopy.findMany({
      where: { bookId: id },
      include: {
        book: true
      }
    });
    
    res.json({ 
      success: true, 
      data: copies 
    });
  } catch (error) {
    console.error('Error fetching book copies:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch book copies',
      message: error.message 
    });
  }
});

// Checkout a book
app.post('/api/checkouts', async (req, res) => {
  try {
    const { userId, bookCopyId, dueDate } = req.body;
    
    // Check if book copy exists and is available
    const bookCopy = await prisma.bookCopy.findUnique({
      where: { id: bookCopyId }
    });
    
    if (!bookCopy) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book copy not found' 
      });
    }
    
    if (bookCopy.status !== 'AVAILABLE') {
      return res.status(400).json({ 
        success: false, 
        error: 'Book copy is not available for checkout' 
      });
    }
    
    // Create checkout
    const checkout = await prisma.checkout.create({
      data: {
        userId,
        bookCopyId,
        dueDate: new Date(dueDate)
      }
    });
    
    // Update book copy status
    await prisma.bookCopy.update({
      where: { id: bookCopyId },
      data: { status: 'CHECKED_OUT' }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Book checked out successfully',
      data: checkout 
    });
  } catch (error) {
    console.error('Error checking out book:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to checkout book',
      message: error.message 
    });
  }
});

// Get all checkouts
app.get('/api/checkouts', async (req, res) => {
  try {
    const { userId, status } = req.query;
    const where = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    const checkouts = await prisma.checkout.findMany({
      where,
      include: {
        bookCopy: {
          include: {
            book: true
          }
        }
      },
      orderBy: { checkedOutAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: checkouts 
    });
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch checkouts',
      message: error.message 
    });
  }
});

// Get checkout by ID
app.get('/api/checkouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const checkout = await prisma.checkout.findUnique({
      where: { id },
      include: {
        bookCopy: {
          include: {
            book: true
          }
        }
      }
    });
    
    if (!checkout) {
      return res.status(404).json({ 
        success: false, 
        error: 'Checkout not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: checkout 
    });
  } catch (error) {
    console.error('Error fetching checkout:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch checkout',
      message: error.message 
    });
  }
});

// Return a book
app.put('/api/checkouts/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find checkout
    const checkout = await prisma.checkout.findUnique({
      where: { id }
    });
    
    if (!checkout) {
      return res.status(404).json({ 
        success: false, 
        error: 'Checkout not found' 
      });
    }
    
    if (checkout.status !== 'ACTIVE') {
      return res.status(400).json({ 
        success: false, 
        error: 'Checkout is not active' 
      });
    }
    
    // Update checkout
    const returnedCheckout = await prisma.checkout.update({
      where: { id },
      data: {
        returnedAt: new Date(),
        status: 'RETURNED'
      }
    });
    
    // Update book copy status
    await prisma.bookCopy.update({
      where: { id: checkout.bookCopyId },
      data: { status: 'AVAILABLE' }
    });
    
    res.json({ 
      success: true, 
      message: 'Book returned successfully',
      data: returnedCheckout 
    });
  } catch (error) {
    console.error('Error returning book:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Checkout not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to return book',
      message: error.message 
    });
  }
});

// Renew a checkout
app.put('/api/checkouts/:id/renew', async (req, res) => {
  try {
    const { id } = req.params;
    const { newDueDate } = req.body;
    
    // Find checkout
    const checkout = await prisma.checkout.findUnique({
      where: { id }
    });
    
    if (!checkout) {
      return res.status(404).json({ 
        success: false, 
        error: 'Checkout not found' 
      });
    }
    
    if (checkout.status !== 'ACTIVE') {
      return res.status(400).json({ 
        success: false, 
        error: 'Checkout is not active' 
      });
    }
    
    // Check renewal limit
    if (checkout.renewalCount >= 3) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maximum renewal limit reached' 
      });
    }
    
    // Update checkout
    const renewedCheckout = await prisma.checkout.update({
      where: { id },
      data: {
        dueDate: new Date(newDueDate),
        renewalCount: checkout.renewalCount + 1
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Checkout renewed successfully',
      data: renewedCheckout 
    });
  } catch (error) {
    console.error('Error renewing checkout:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Checkout not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to renew checkout',
      message: error.message 
    });
  }
});

// Reserve a book
app.post('/api/reservations', async (req, res) => {
  try {
    const { userId, bookId, expiryDate } = req.body;
    
    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });
    
    if (!book) {
      return res.status(404).json({ 
        success: false, 
        error: 'Book not found' 
      });
    }
    
    // Check if user already has a reservation for this book
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        userId,
        bookId,
        status: 'PENDING'
      }
    });
    
    if (existingReservation) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have a reservation for this book' 
      });
    }
    
    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        bookId,
        expiryDate: new Date(expiryDate)
      }
    });
    
    // Update book status if needed
    if (book.status === 'AVAILABLE') {
      await prisma.book.update({
        where: { id: bookId },
        data: { status: 'RESERVED' }
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Book reserved successfully',
      data: reservation 
    });
  } catch (error) {
    console.error('Error reserving book:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to reserve book',
      message: error.message 
    });
  }
});

// Get all reservations
app.get('/api/reservations', async (req, res) => {
  try {
    const { userId, status } = req.query;
    const where = {};
    
    if (userId) where.userId = userId;
    if (status) where.status = status;
    
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        book: true
      },
      orderBy: { reservedAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: reservations 
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch reservations',
      message: error.message 
    });
  }
});

// Get reservation by ID
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        book: true
      }
    });
    
    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reservation not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: reservation 
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch reservation',
      message: error.message 
    });
  }
});

// Cancel a reservation
app.put('/api/reservations/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    });
    
    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reservation not found' 
      });
    }
    
    if (reservation.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        error: 'Reservation cannot be cancelled' 
      });
    }
    
    // Update reservation
    const cancelledReservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    
    res.json({ 
      success: true, 
      message: 'Reservation cancelled successfully',
      data: cancelledReservation 
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Reservation not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to cancel reservation',
      message: error.message 
    });
  }
});

// Upload a digital resource
app.post('/api/digital-resources', async (req, res) => {
  try {
    const resourceData = req.body;
    
    const resource = await prisma.digitalResource.create({
      data: resourceData
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Digital resource uploaded successfully',
      data: resource 
    });
  } catch (error) {
    console.error('Error uploading digital resource:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload digital resource',
      message: error.message 
    });
  }
});

// Get all digital resources
app.get('/api/digital-resources', async (req, res) => {
  try {
    const { category, accessLevel, search } = req.query;
    const where = {};
    
    if (category) {
      where.categories = {
        has: category
      };
    }
    
    if (accessLevel) {
      where.accessLevel = accessLevel;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const resources = await prisma.digitalResource.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: resources 
    });
  } catch (error) {
    console.error('Error fetching digital resources:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch digital resources',
      message: error.message 
    });
  }
});

// Get digital resource by ID
app.get('/api/digital-resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await prisma.digitalResource.findUnique({
      where: { id }
    });
    
    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        error: 'Digital resource not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: resource 
    });
  } catch (error) {
    console.error('Error fetching digital resource:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch digital resource',
      message: error.message 
    });
  }
});

// Access a digital resource
app.get('/api/digital-resources/:id/access', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    // Find resource
    const resource = await prisma.digitalResource.findUnique({
      where: { id }
    });
    
    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        error: 'Digital resource not found' 
      });
    }
    
    // Check access permissions (simplified for this example)
    // In a real implementation, you would check user roles and subscriptions
    
    // Record access
    if (userId) {
      await prisma.resourceAccess.create({
        data: {
          userId,
          resourceId: id,
          accessedAt: new Date()
        }
      });
    }
    
    // Increment download count
    await prisma.digitalResource.update({
      where: { id },
      data: {
        downloadCount: resource.downloadCount + 1
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Access granted',
      data: {
        url: resource.url,
        title: resource.title
      }
    });
  } catch (error) {
    console.error('Error accessing digital resource:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to access digital resource',
      message: error.message 
    });
  }
});

// Issue a library card
app.post('/api/cards', async (req, res) => {
  try {
    const { userId, cardNumber } = req.body;
    
    // Check if user already has a card
    const existingCard = await prisma.libraryCard.findUnique({
      where: { userId }
    });
    
    if (existingCard) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already has a library card' 
      });
    }
    
    // Create library card
    const card = await prisma.libraryCard.create({
      data: {
        userId,
        cardNumber: cardNumber || `LC${Date.now()}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Library card issued successfully',
      data: card 
    });
  } catch (error) {
    console.error('Error issuing library card:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to issue library card',
      message: error.message 
    });
  }
});

// Get library card by user ID
app.get('/api/cards/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const card = await prisma.libraryCard.findUnique({
      where: { userId }
    });
    
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        error: 'Library card not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: card 
    });
  } catch (error) {
    console.error('Error fetching library card:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch library card',
      message: error.message 
    });
  }
});

// Renew library card
app.put('/api/cards/:id/renew', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find card
    const card = await prisma.libraryCard.findUnique({
      where: { id }
    });
    
    if (!card) {
      return res.status(404).json({ 
        success: false, 
        error: 'Library card not found' 
      });
    }
    
    // Update expiry date
    const renewedCard = await prisma.libraryCard.update({
      where: { id },
      data: {
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Library card renewed successfully',
      data: renewedCard 
    });
  } catch (error) {
    console.error('Error renewing library card:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Library card not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to renew library card',
      message: error.message 
    });
  }
});

// Get checkouts for user
app.get('/api/users/:userId/checkouts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    const where = { userId };
    if (status) where.status = status;
    
    const checkouts = await prisma.checkout.findMany({
      where,
      include: {
        bookCopy: {
          include: {
            book: true
          }
        }
      },
      orderBy: { checkedOutAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: checkouts 
    });
  } catch (error) {
    console.error('Error fetching user checkouts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user checkouts',
      message: error.message 
    });
  }
});

// Get reservations for user
app.get('/api/users/:userId/reservations', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    const where = { userId };
    if (status) where.status = status;
    
    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        book: true
      },
      orderBy: { reservedAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: reservations 
    });
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user reservations',
      message: error.message 
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;