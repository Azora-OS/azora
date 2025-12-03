# Azora Judiciary Service

A legal case management and document service for the Azora ecosystem.

## Features

- **Case Management**: Create, track, and manage legal cases
- **Document Management**: Store and manage legal documents
- **Case Filing**: Submit new legal cases with detailed information
- **Status Tracking**: Monitor the progress of legal cases
- **RESTful API**: Well-documented API endpoints for all legal functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Cases
- `GET /api/cases` - Get all legal cases
- `GET /api/cases/:caseId` - Get specific case
- `POST /api/cases` - File a new legal case
- `PUT /api/cases/:caseId` - Update case status

### Documents
- `GET /api/documents` - Get all legal documents
- `GET /api/documents/:documentId` - Get specific document
- `POST /api/documents` - Upload a new legal document
- `PUT /api/documents/:documentId` - Update document metadata

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

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3026
LOG_LEVEL=info
```

## Case Types

The service supports various types of legal cases:

1. **Civil Cases**: Disputes between individuals or organizations
2. **Administrative Cases**: Regulatory and compliance matters
3. **Contract Cases**: Issues related to contractual agreements
4. **Intellectual Property Cases**: Patent, trademark, and copyright matters

## Document Types

The service supports various types of legal documents:

1. **Contracts**: Agreements between parties
2. **Policies**: Organizational policies and procedures
3. **Legal Briefs**: Case arguments and legal analysis
4. **Court Filings**: Official court documents
5. **Correspondence**: Legal communications

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY