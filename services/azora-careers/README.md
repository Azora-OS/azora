# Azora Careers Service

A comprehensive career management and job listing service for the Azora ecosystem.

## Features

- **Job Listings**: Create, manage, and search job openings
- **Job Applications**: Submit and track job applications
- **Career Resources**: Access career development resources
- **Department Management**: Organize jobs by departments
- **RESTful API**: Well-documented API endpoints for all career functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Jobs
- `GET /api/jobs` - Get all job listings
- `GET /api/jobs/:jobId` - Get specific job listing
- `POST /api/jobs` - Create a new job listing
- `PUT /api/jobs/:jobId` - Update job listing
- `GET /api/jobs/search` - Search jobs by department or location

### Applications
- `POST /api/applications` - Submit a job application
- `GET /api/applications` - Get all job applications
- `GET /api/applications/:applicationId` - Get specific job application
- `PUT /api/applications/:applicationId` - Update application status

### Resources
- `GET /api/resources` - Get all career resources
- `GET /api/resources/:resourceId` - Get specific resource
- `POST /api/resources` - Create a new resource

### Departments
- `GET /api/departments` - Get all departments

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
PORT=3020
LOG_LEVEL=info
```

## Job Status Types

The service supports the following job status types:

1. **Open**: Job is currently accepting applications
2. **Closed**: Job is no longer accepting applications
3. **Filled**: Job has been filled
4. **On Hold**: Job posting is temporarily suspended

## Application Status Types

The service supports the following application status types:

1. **Submitted**: Application has been submitted
2. **Reviewed**: Application is under review
3. **Interview**: Candidate has been invited for interview
4. **Offered**: Job offer has been extended
5. **Accepted**: Candidate has accepted the offer
6. **Rejected**: Application has been rejected

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY