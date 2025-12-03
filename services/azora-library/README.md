# Azora Library Service

A world-class digital library service with AI librarian assistance, featuring book management, user accounts, borrowing/reservation systems, and AI-powered search and recommendations.

## Features

- **Comprehensive Book Management**: Add, update, delete, and categorize books
- **AI-Powered Librarian ("Libra")**: Intelligent search, recommendations, and book summarization
- **User Management**: Registration, authentication, and profile management
- **Borrowing System**: Check out and return books with due dates
- **Reservation System**: Reserve books that are currently borrowed
- **Payment Integration**: Support for paid content with pricing models
- **Advanced Search**: AI-powered fuzzy search with filtering capabilities
- **Education System Integration**: Connect books to courses and provide student recommendations
- **RESTful API**: Well-documented API endpoints for all library functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check
- `GET /ai-librarian` - Get AI librarian information

### Books
- `POST /books` - Add a new book (admin only)
- `GET /books` - Get all books with pagination and filtering
- `GET /books/:id` - Get a specific book by ID
- `PUT /books/:id` - Update a book (admin only)
- `DELETE /books/:id` - Delete a book (admin only)

### Search & AI Features
- `POST /search` - AI-powered book search
- `GET /recommendations/:userId` - AI-powered book recommendations
- `GET /books/:id/summary` - AI-powered book summary

### Users
- `POST /users/register` - Register a new user
- `POST /users/login` - Login existing user

### Library Functions
- `POST /loans` - Borrow a book
- `POST /loans/:id/return` - Return a book
- `GET /loans` - Get user's borrowed books
- `POST /reservations` - Reserve a book
- `GET /reservations` - Get user's reservations

### Education System Integration
- `POST /courses/:courseId/books/:bookId` - Assign a book to a course (admin only)
- `GET /courses/:courseId/books` - Get all books for a course
- `DELETE /courses/:courseId/books/:bookId` - Remove a book from a course (admin only)
- `GET /books/:bookId/courses` - Get all courses that use a specific book
- `GET /students/:studentId/recommendations` - Get books recommended for a student based on their enrollments

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3007
JWT_SECRET=your-super-secret-jwt-key
LOG_LEVEL=info
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the service:
   ```bash
   npm start
   ```

3. For development:
   ```bash
   npm run dev
   ```

## Testing

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## AI Librarian Capabilities

Our AI librarian "Libra" provides:

1. **Intelligent Search**: Finds books using natural language queries
2. **Personalized Recommendations**: Suggests books based on reading history
3. **Content Summarization**: Provides concise summaries of book content
4. **Automatic Categorization**: Classifies books into appropriate categories

## Education System Integration

The library service integrates with the Azora Education System to:

1. **Connect Books to Courses**: Assign books as required or recommended reading for courses
2. **Student Recommendations**: Provide personalized book recommendations based on student enrollments
3. **Course Materials**: Serve as a centralized repository for course-related reading materials

## Payment System

Books can be marked as free (price = 0) or paid (price > 0). The payment system is designed to integrate with external payment processors.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
