# Azora Research Center Service

## Overview
The Azora Research Center Service provides a comprehensive research project management system with publication tracking, document management, and collaboration tools. This service is part of the Azora OS educational platform and follows the Ubuntu philosophy of collaborative learning.

## Features
- **Research Project Management**: Create and manage research projects with detailed metadata
- **Team Collaboration**: Add and manage research team members with roles
- **Document Management**: Upload and manage research documents with version control
- **Publication Tracking**: Track research publications through the publication pipeline
- **Research Data Management**: Store and manage research datasets
- **Milestone Tracking**: Track project milestones and progress
- **Collaboration Management**: Manage external collaborations and partnerships
- **RESTful API**: Well-documented API endpoints for integration

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Research Projects
- `POST /api/projects` - Create a new research project
- `GET /api/projects` - Get all research projects
- `GET /api/projects/:id` - Get research project by ID
- `PUT /api/projects/:id` - Update research project
- `DELETE /api/projects/:id` - Delete research project

### Project Teams
- `POST /api/projects/:id/team` - Add team member to project
- `GET /api/projects/:id/team` - Get project team members
- `DELETE /api/projects/:id/team/:userId` - Remove team member from project

### Project Documents
- `POST /api/projects/:id/documents` - Upload document to project
- `GET /api/projects/:id/documents` - Get project documents
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Publications
- `POST /api/publications` - Create a new publication
- `GET /api/publications` - Get all publications
- `GET /api/publications/:id` - Get publication by ID
- `PUT /api/publications/:id` - Update publication
- `DELETE /api/publications/:id` - Delete publication

### Research Data
- `POST /api/projects/:id/data` - Upload research data
- `GET /api/projects/:id/data` - Get project data
- `GET /api/data/:id` - Get data by ID

### Project Milestones
- `POST /api/projects/:id/milestones` - Create project milestone
- `GET /api/projects/:id/milestones` - Get project milestones
- `PUT /api/milestones/:id` - Update milestone
- `PUT /api/milestones/:id/complete` - Mark milestone as complete

### Collaborations
- `POST /api/projects/:id/collaborations` - Add collaboration
- `GET /api/projects/:id/collaborations` - Get project collaborations

### User-Specific Endpoints
- `GET /api/users/:userId/projects` - Get projects for user
- `GET /api/users/:userId/publications` - Get publications for user

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
PORT=3008
SERVICE_NAME=azora-research-center
DATABASE_URL=postgresql://user:password@localhost:5432/azora
NODE_ENV=development
```

## Database Schema

The service uses the following models:

### ResearchProject Model
```prisma
model ResearchProject {
  id          String   @id @default(uuid())
  title       String
  description String?
  abstract    String?
  keywords    String[]
  status      ProjectStatus @default(PROPOSED)
  startDate   DateTime?
  endDate     DateTime?
  funding     Decimal? @db.Decimal(12, 2)
  fundingSource String?
  leadResearcherId String
  collaborators Json?
  tags        String[]
  visibility  Visibility @default(PUBLIC)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ResearchTeam Model
```prisma
model ResearchTeam {
  id          String   @id @default(uuid())
  projectId   String
  userId      String
  role        TeamRole
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ResearchDocument Model
```prisma
model ResearchDocument {
  id          String   @id @default(uuid())
  projectId   String
  title       String
  description String?
  fileType    String
  fileSize    Int?
  url         String
  version     String   @default("1.0")
  status      DocumentStatus @default(DRAFT)
  authors     Json?
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ResearchPublication Model
```prisma
model ResearchPublication {
  id          String   @id @default(uuid())
  projectId   String?
  title       String
  abstract    String?
  authors     Json
  journal     String?
  volume      String?
  issue       String?
  pages       String?
  publicationDate DateTime?
  doi         String?  @unique
  url         String?
  status      PublicationStatus @default(DRAFT)
  keywords    String[]
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ResearchData Model
```prisma
model ResearchData {
  id          String   @id @default(uuid())
  projectId   String
  name        String
  description String?
  dataType    String
  fileSize    Int?
  url         String
  version     String   @default("1.0")
  license     String?
  accessLevel AccessLevel @default(PUBLIC)
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ResearchMilestone Model
```prisma
model ResearchMilestone {
  id          String   @id @default(uuid())
  projectId   String
  title       String
  description String?
  dueDate     DateTime?
  completedAt DateTime?
  status      MilestoneStatus @default(PENDING)
  priority    Priority @default(MEDIUM)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### ResearchCollaboration Model
```prisma
model ResearchCollaboration {
  id          String   @id @default(uuid())
  projectId   String
  collaboratorId String
  institution String?
  role        String?
  startDate   DateTime @default(now())
  endDate     DateTime?
  status      CollaborationStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Example Usage

### Creating a Research Project
```json
POST /api/projects
{
  "title": "Machine Learning Approaches to Climate Change Prediction",
  "description": "Investigating novel ML techniques for climate modeling",
  "abstract": "This project explores the application of deep learning models to predict climate patterns...",
  "keywords": ["machine learning", "climate change", "deep learning"],
  "leadResearcherId": "user_123",
  "funding": 50000.00,
  "fundingSource": "National Science Foundation",
  "tags": ["AI", "Environmental Science"]
}
```

### Adding a Team Member
```json
POST /api/projects/project_123/team
{
  "userId": "user_456",
  "role": "RESEARCH_ASSISTANT"
}
```

### Uploading a Document
```json
POST /api/projects/project_123/documents
{
  "title": "Initial Research Findings",
  "description": "Preliminary results from our experiments",
  "fileType": "application/pdf",
  "url": "https://example.com/research-findings.pdf",
  "version": "1.0"
}
```

### Creating a Publication
```json
POST /api/publications
{
  "projectId": "project_123",
  "title": "Novel Approaches to Climate Modeling Using Neural Networks",
  "abstract": "In this paper, we present a new approach to climate modeling...",
  "authors": [
    {"name": "John Doe", "affiliation": "University of Cape Town"},
    {"name": "Jane Smith", "affiliation": "Stellenbosch University"}
  ],
  "journal": "Journal of Climate Research",
  "publicationDate": "2023-11-15T00:00:00Z",
  "doi": "10.1234/climate.2023.001"
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