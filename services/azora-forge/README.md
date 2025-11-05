# Azora Forge - Skills & Services Marketplace

**Azora Forge** is a decentralized marketplace platform that connects skilled professionals with clients seeking services. From traditional trades like plumbing and welding to modern digital services like web development and graphic design, Azora Forge provides a comprehensive platform for the gig economy powered by the AZR token.

## ?? Features

### Skill Categories (25+)

#### ?? Trades & Construction
- **Plumbing** - Installation, repair, emergency services
- **Welding** - MIG, TIG, arc welding, metal fabrication
- **Electrical Services** - Residential, commercial, solar installation
- **Carpentry** - Custom furniture, cabinets, deck construction
- **HVAC** - Heating, cooling, energy efficiency
- **Masonry** - Brickwork, stonework, concrete
- **Roofing** - Installation, repair, waterproofing
- **Painting & Decorating** - Interior, exterior, commercial

#### ?? Education & Learning
- **Tutoring & Teaching** - Math, science, languages, test prep
- **Skills Training** - Professional development, certifications

#### ?? Automotive
- **Automotive Services** - Mechanics, auto electrical, body work

#### ?? Home Services
- **Cleaning Services** - Residential, commercial, deep cleaning
- **Landscaping & Gardening** - Lawn care, garden design, tree services
- **Pest Control** - General pest control, termite treatment

#### ?? Technology Services
- **IT Support** - Computer repair, network setup, cybersecurity
- **Web Development** - Websites, e-commerce, web applications

#### ?? Creative Services
- **Graphic Design** - Logos, branding, marketing materials
- **Photography & Videography** - Events, products, commercial

#### ?? Professional Services
- **Legal Services** - Consultation, document preparation, contract review
- **Accounting & Bookkeeping** - Tax prep, financial planning, auditing

#### ?? Health & Wellness
- **Fitness & Personal Training** - Personal training, yoga, nutrition
- **Beauty & Wellness** - Hair, makeup, massage, skincare

#### ?? Events & Entertainment
- **Event Planning** - Weddings, corporate events, party planning
- **Entertainment Services** - DJ, live music, MC services

## ?? Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
cd services/azora-forge
npm install
```

2. **Set up environment variables:**
```bash
# Create .env file
MONGODB_URI=mongodb://localhost:27017/azora-forge
PORT=12345
```

3. **Seed the database:**
```bash
# Seed categories and sample listings
npm run seed

# Or use the TypeScript file directly
npx ts-node scripts/seed-all.ts
```

4. **Start the server:**
```bash
npm start
```

The API will be available at `http://localhost:12345`

## ?? API Endpoints

### Categories

#### Get All Categories
```http
GET /api/categories
```

Returns all active categories with their subcategories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "Plumbing",
      "description": "Professional plumbing services...",
      "icon": "??",
      "subcategories": [...]
    }
  ],
  "total": 25
}
```

#### Search Categories
```http
GET /api/categories/search?q=plumbing
```

Search categories by name or description.

#### Get Category by ID
```http
GET /api/categories/:id
```

Get a specific category with its subcategories and parent.

#### Get Category Listings
```http
GET /api/categories/:id/listings?page=1&limit=20&sortBy=createdAt&order=desc
```

Get all active listings for a specific category with pagination.

#### Create Category (Admin)
```http
POST /api/categories
Content-Type: application/json

{
  "name": "New Category",
  "description": "Description of the category",
  "icon": "??",
  "parentCategory": "optional_parent_id"
}
```

#### Update Category (Admin)
```http
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "isActive": true
}
```

#### Delete Category (Admin)
```http
DELETE /api/categories/:id
```

Soft deletes (deactivates) a category.

#### Get Category Statistics
```http
GET /api/categories/stats/summary
```

Get statistics about categories and listings.

### Marketplace

Additional marketplace endpoints for listings, transactions, and user profiles coming soon.

## ?? UI Components

### SkillCategories Component

React component for displaying skill categories:

```tsx
import { SkillCategories } from './components/SkillCategories';

function App() {
  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    console.log('Selected:', categoryName);
    // Fetch listings for this category
  };

  return (
    <SkillCategories 
      onCategorySelect={handleCategorySelect}
      apiUrl="http://localhost:12345"
    />
  );
}
```

### SkillMarketplace Component

Full marketplace page with category browsing and listing display:

```tsx
import { SkillMarketplace } from './pages/SkillMarketplace';

function App() {
  return <SkillMarketplace />;
}
```

## ?? Database Models

### Category Model

```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  icon?: string,
  parentCategory?: ObjectId,
  subcategories: ObjectId[],
  isActive: boolean
}
```

### Listing Model

```typescript
{
  _id: ObjectId,
  sellerId: string,
  title: string,
  description: string,
  category: string,
  price: number, // in AZR
  images?: string[],
  tags?: string[],
  status: 'active' | 'sold' | 'inactive',
  deliveryMethod: 'digital' | 'service',
  requirements?: string,
  estimatedDelivery?: string,
  createdAt: Date,
  updatedAt: Date,
  expiresAt?: Date
}
```

## ?? Security

- CORS enabled for cross-origin requests
- Input validation on all endpoints
- Rate limiting (recommended for production)
- Authentication middleware (to be implemented)
- MongoDB injection prevention

## ?? Future Enhancements

- [ ] User authentication and authorization
- [ ] Service provider profiles and ratings
- [ ] Escrow system for secure transactions
- [ ] Dispute resolution system
- [ ] Advanced search and filtering
- [ ] Real-time chat between clients and providers
- [ ] Mobile app integration
- [ ] Payment gateway integration
- [ ] Smart contract integration for trustless transactions
- [ ] Multi-language support
- [ ] Location-based service discovery

## ?? Contributing

Contributions are welcome! Please follow the Azora OS contribution guidelines.

## ?? License

AZORA PROPRIETARY LICENSE
Copyright ? 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.

## ?? Support

For support and questions:
- GitHub Issues: [Azora OS Repository](https://github.com/Sizwe780/azora-os)
- Email: support@azora.es
- Documentation: [Azora OS Docs](/docs)

---

**Built with ?? by the Azora OS team**

*Empowering the gig economy with blockchain technology and decentralized infrastructure.*
