# Marketplace Service

Manages the Azora OS course marketplace, including course uploads, listings, purchases, and instructor earnings.

## Overview

The marketplace service provides:
- Course upload and management
- Course search, filtering, and discovery
- Course purchases and enrollment
- Revenue split and earnings tracking
- Course reviews and ratings
- Instructor dashboard and analytics

## Architecture

### Components

1. **CourseUploadService** - Course creation and management
   - Upload new courses
   - Update course details
   - Publish/archive courses
   - Delete courses

2. **CourseListingService** - Course discovery
   - Search courses
   - Filter by category, level, price, rating
   - Sort by various criteria
   - Pagination support
   - Featured and trending courses

3. **CoursePurchaseService** - Purchase management
   - Process course purchases
   - Calculate revenue splits
   - Create enrollments
   - Track purchase history
   - Handle refunds

4. **InstructorEarningsService** - Earnings tracking
   - Track instructor earnings
   - Manage payouts
   - Generate earnings reports
   - Top instructor rankings

5. **CourseReviewsService** - Reviews and ratings
   - Submit and update reviews
   - Calculate course ratings
   - Manage review moderation
   - Review statistics

## Database Schema

### Courses Table
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  instructorId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  level CourseLevel NOT NULL,
  duration INTEGER NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  status CourseStatus DEFAULT 'DRAFT',
  thumbnail TEXT,
  rating DOUBLE PRECISION DEFAULT 0,
  enrollmentCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Course Reviews Table
```sql
CREATE TABLE course_reviews (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  userId TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(courseId, userId)
);
```

### Course Purchases Table
```sql
CREATE TABLE course_purchases (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  userId TEXT NOT NULL,
  paymentId TEXT,
  price DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  purchasedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(courseId, userId)
);
```

### Instructor Earnings Table
```sql
CREATE TABLE instructor_earnings (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  instructorId TEXT NOT NULL,
  totalEarnings DOUBLE PRECISION DEFAULT 0,
  paidEarnings DOUBLE PRECISION DEFAULT 0,
  pendingEarnings DOUBLE PRECISION DEFAULT 0,
  lastPaidAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(courseId, instructorId)
);
```

## Usage

### Upload a Course

```typescript
import { CourseUploadService } from '@/services/marketplace';

const uploadService = new CourseUploadService();
const course = await uploadService.uploadCourse({
  instructorId: 'instructor-123',
  title: 'Advanced TypeScript',
  description: 'Learn advanced TypeScript concepts...',
  category: 'Programming',
  level: 'ADVANCED',
  duration: 240, // 4 hours
  price: 49.99,
  currency: 'USD',
  thumbnail: 'https://...',
});
```

### List Courses

```typescript
import { CourseListingService } from '@/services/marketplace';

const listingService = new CourseListingService();
const result = await listingService.listCourses(
  {
    search: 'TypeScript',
    category: 'Programming',
    level: 'ADVANCED',
    minRating: 4.0,
  },
  {
    page: 1,
    limit: 20,
    sortBy: 'rating',
    sortOrder: 'desc',
  }
);
```

### Purchase a Course

```typescript
import { CoursePurchaseService } from '@/services/marketplace';

const purchaseService = new CoursePurchaseService();
const purchase = await purchaseService.purchaseCourse({
  userId: 'user-123',
  courseId: 'course-456',
  paymentId: 'payment-789',
});
```

### Get Instructor Earnings

```typescript
import { InstructorEarningsService } from '@/services/marketplace';

const earningsService = new InstructorEarningsService();
const earnings = await earningsService.getInstructorEarnings('instructor-123');
```

### Submit a Review

```typescript
import { CourseReviewsService } from '@/services/marketplace';

const reviewService = new CourseReviewsService();
const review = await reviewService.submitReview({
  courseId: 'course-456',
  userId: 'user-123',
  rating: 5,
  comment: 'Excellent course!',
});
```

## API Endpoints

### Course Upload

```bash
POST /api/courses/upload
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Advanced TypeScript",
  "description": "Learn advanced TypeScript concepts...",
  "category": "Programming",
  "level": "ADVANCED",
  "duration": 240,
  "price": 49.99,
  "thumbnail": "https://..."
}
```

### List Courses

```bash
GET /api/courses/list?search=TypeScript&category=Programming&level=ADVANCED&page=1&limit=20&sortBy=rating
Authorization: Bearer <token>
```

### Purchase Course

```bash
POST /api/courses/purchase
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": "course-456",
  "paymentId": "payment-789"
}
```

### Get Course Reviews

```bash
GET /api/courses/{courseId}/reviews?page=1&limit=10
Authorization: Bearer <token>
```

### Submit Review

```bash
POST /api/courses/{courseId}/reviews
Content-Type: application/json
Authorization: Bearer <token>

{
  "rating": 5,
  "comment": "Excellent course!"
}
```

### Get Instructor Earnings

```bash
GET /api/instructor/earnings
Authorization: Bearer <token>
```

## Revenue Split

The marketplace uses a revenue split model:

- **Free Tier Instructors**: 70% instructor, 30% platform
- **Pro Tier Instructors**: 70% instructor, 30% platform
- **Enterprise Tier Instructors**: 75% instructor, 25% platform

Example:
- Course price: $100
- Pro instructor: $70 to instructor, $30 to platform
- Enterprise instructor: $75 to instructor, $25 to platform

## Course Levels

- **BEGINNER**: Introductory content for new learners
- **INTERMEDIATE**: Content for learners with basic knowledge
- **ADVANCED**: Content for experienced learners

## Course Status

- **DRAFT**: Course is being created, not visible to students
- **PUBLISHED**: Course is live and available for purchase
- **ARCHIVED**: Course is no longer available for new purchases

## Features

### Course Discovery
- Full-text search
- Filter by category, level, price, rating
- Sort by rating, price, enrollments, date
- Featured courses (high rating + high enrollment)
- Trending courses (recent + high enrollment)

### Purchase Management
- One-time purchases
- Automatic enrollment creation
- Revenue split calculation
- Purchase history tracking
- Refund support

### Earnings Tracking
- Real-time earnings calculation
- Pending vs. paid earnings
- Payout management
- Top instructor rankings
- Earnings reports

### Reviews & Ratings
- 1-5 star ratings
- Text comments
- Average rating calculation
- Review moderation
- Review statistics

## Integration Points

1. **Payment Service**: Processes payments for course purchases
2. **Subscription Service**: Determines revenue split based on tier
3. **User Service**: Manages instructor and student accounts
4. **Enrollment Service**: Creates enrollments on purchase
5. **Logging**: All operations logged for monitoring

## Performance Considerations

- Indexes on frequently queried fields (instructorId, status, category, level)
- Pagination for large result sets
- Caching for featured/trending courses
- Batch operations for earnings calculations

## Security Considerations

- Verify user ownership before allowing course updates
- Verify purchase before allowing review submission
- Validate all input data
- Rate limit API endpoints
- Audit all financial transactions

## Testing

Run tests with:
```bash
npm test -- services/marketplace
```

Test coverage includes:
- Course upload and validation
- Course search and filtering
- Purchase processing and revenue split
- Earnings calculation
- Review submission and rating updates
- Error scenarios

## Future Enhancements

- [ ] Course bundles and discounts
- [ ] Affiliate program
- [ ] Course recommendations
- [ ] Student progress tracking
- [ ] Certificate generation
- [ ] Course analytics dashboard
- [ ] Bulk course operations
- [ ] Course versioning
- [ ] Instructor collaboration
- [ ] Course prerequisites
