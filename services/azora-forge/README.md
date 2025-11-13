# Azora Forge - Job Matching & Skills Assessment

AI-powered job matching and skills marketplace

## Features

### Job Matching Algorithm
- Skill-based matching
- Automatic scoring (0-100%)
- Top matches ranking
- Real-time calculations

### Skills Assessment Engine
- Multi-level evaluation (beginner to expert)
- Experience weighting
- Overall profile scoring
- Detailed breakdowns

## API Endpoints

### Jobs
```bash
POST   /api/jobs                    # Create job
GET    /api/jobs                    # List jobs
GET    /api/jobs/:jobId             # Get job
POST   /api/jobs/:jobId/apply       # Apply to job
```

### Skills
```bash
POST   /api/skills/assess           # Assess skills
GET    /api/skills/profile/:userId  # Get profile
```

### Matching
```bash
POST   /api/match                   # Find matches
POST   /api/match/calculate         # Calculate score
```

## Example Usage

### Create Job
```bash
curl -X POST http://localhost:3200/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "company": "Azora",
    "requirements": ["JavaScript", "React", "Node.js"],
    "salary": "R50000",
    "location": "Remote"
  }'
```

### Assess Skills
```bash
curl -X POST http://localhost:3200/api/skills/assess \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "skills": [
      {"name": "JavaScript", "level": "advanced", "experience": 5},
      {"name": "React", "level": "expert", "experience": 4}
    ]
  }'
```

### Find Matches
```bash
curl -X POST http://localhost:3200/api/match \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "maxResults": 5}'
```

## Quick Start

```bash
npm install
npm start
```

Health check: `curl http://localhost:3200/health`
