# Azora Library Service

## Overview
The Azora Library Service provides a comprehensive digital library management system with book checkout, reservations, and digital resource access. This service is part of the Azora OS educational platform and follows the Ubuntu philosophy of collaborative learning.

## Features
- **Book Management**: Add, update, and manage physical books and their copies
- **Checkout System**: Check out and return physical books with due dates
- **Reservation System**: Reserve books that are currently checked out
- **Digital Resources**: Upload and manage digital resources (PDFs, videos, etc.)
- **Library Cards**: Issue and manage library cards for users
- **Search & Filtering**: Advanced search and filtering capabilities
- **RESTful API**: Well-documented API endpoints for integration

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Books Management
- `POST /api/books` - Add a new book to the library
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Book Copies
- `POST /api/books/:id/copy` - Add a copy of a book
- `GET /api/books/:id/copies` - Get all copies of a book

### Checkouts
- `POST /api/checkouts` - Checkout a book
- `GET /api/checkouts` - Get all checkouts
- `GET /api/checkouts/:id` - Get checkout by ID
- `PUT /api/checkouts/:id/return` - Return a book
- `PUT /api/checkouts/:id/renew` - Renew a checkout

### Reservations
- `POST /api/reservations` - Reserve a book
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/:id` - Get reservation by ID
- `PUT /api/reservations/:id/cancel` - Cancel a reservation

### Digital Resources
- `POST /api/digital-resources` - Upload a digital resource
- `GET /api/digital-resources` - Get all digital resources
- `GET /api/digital-resources/:id` - Get digital resource by ID
- `GET /api/digital-resources/:id/access` - Access a digital resource

### Library Cards
- `POST /api/cards` - Issue a library card
- `GET /api/cards/:userId` - Get library card by user ID
- `PUT /api/cards/:id/renew` - Renew library card

### User-Specific Endpoints
- `GET /api/users/:userId/checkouts` - Get checkouts for user
- `GET /api/users/:userId/reservations` - Get reservations for user

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the service
npm start

# For development
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3007
SERVICE_NAME=azora-library
DATABASE_URL=postgresql://user:password@localhost:5432/azora
NODE_ENV=development
```

## Database Schema

The service uses the following models:

### Book Model
```prisma
model Book {
  id          String   @id @default(uuid())
  title       String
  subtitle    String?
  description String?
  isbn        String?  @unique
  authors     String[]
  publisher   String?
  publishedDate DateTime?
  pageCount   Int?
  categories  String[]
  language    String?  @default("en")
  thumbnail   String?
  previewLink String?
  status      BookStatus @default(AVAILABLE)
  condition   BookCondition @default(GOOD)
  location    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### BookCopy Model
```prisma
model BookCopy {
  id          String   @id @default(uuid())
  bookId      String
  copyNumber  Int
  barcode     String   @unique
  status      CopyStatus @default(AVAILABLE)
  condition   BookCondition @default(GOOD)
  location    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Checkout Model
```prisma
model Checkout {
  id          String   @id @default(uuid())
  userId      String
  bookCopyId  String
  checkedOutAt DateTime @default(now())
  dueDate     DateTime
  returnedAt  DateTime?
  renewalCount Int      @default(0)
  status      CheckoutStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Reservation Model
```prisma
model Reservation {
  id          String   @id @default(uuid())
  userId      String
  bookId      String
  reservedAt  DateTime @default(now())
  expiryDate  DateTime
  status      ReservationStatus @default(PENDING)
  fulfilledAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### DigitalResource Model
```prisma
model DigitalResource {
  id          String   @id @default(uuid())
  title       String
  description String?
  fileType    String
  fileSize    Int?
  url         String
  accessLevel AccessLevel @default(PUBLIC)
  categories  String[]
  tags        String[]
  downloadCount Int @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### LibraryCard Model
```prisma
model LibraryCard {
  id          String   @id @default(uuid())
  userId      String   @unique
  cardNumber  String   @unique
  issuedAt    DateTime @default(now())
  expiryDate  DateTime
  status      CardStatus @default(ACTIVE)
  fineBalance Decimal  @db.Decimal(10, 2) @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Example Usage

### Adding a Book
```json
POST /api/books
{
  "title": "The Art of Computer Programming",
  "authors": ["Donald Knuth"],
  "isbn": "978-0321751041",
  "publisher": "Addison-Wesley",
  "publishedDate": "2011-03-01T00:00:00Z",
  "pageCount": 3168,
  "categories": ["Computer Science", "Mathematics"],
  "description": "The classic work on computer programming"
}
```

### Checking Out a Book
```json
POST /api/checkouts
{
  "userId": "user_123",
  "bookCopyId": "copy_456",
  "dueDate": "2023-12-15T00:00:00Z"
}
```

### Uploading a Digital Resource
```json
POST /api/digital-resources
{
  "title": "Introduction to Algorithms Lecture Notes",
  "description": "Comprehensive lecture notes for CS course",
  "fileType": "application/pdf",
  "url": "https://example.com/lecture-notes.pdf",
  "accessLevel": "STUDENT",
  "categories": ["Computer Science", "Algorithms"]
}
```

### Issuing a Library Card
```json
POST /api/cards
{
  "userId": "user_123",
  "cardNumber": "LC2023001"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is proprietary to Azora ES (Pty) Ltd.

## Support

For support, please contact the Azora development team.