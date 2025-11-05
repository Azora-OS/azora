# Azora Sapiens - Universal Education Platform

**Azora Sapiens** is the global education infrastructure of Azora OS, featuring the world's most comprehensive **Global Qualifications Database** covering every major educational credential, certification, and degree on Earth.

## 🌟 Features

### Global Qualifications Database
- **100+ Initial Qualifications** (expandable to 50,000+)
- **25+ Categories** covering all fields
- **180+ Countries** represented
- **10 Qualification Levels** from entry to post-doctoral
- **Blockchain Verification** for credentials
- **AZR Token Rewards** for achievements

### Coverage Includes

#### 🎓 Academic Education
- Primary & Secondary Education (GCSE, High School, Matric, IB)
- Undergraduate Degrees (BA, BSc, BEng, BCom)
- Postgraduate Degrees (MA, MSc, MBA)
- Doctoral Degrees (PhD, MD, JD)

#### 💻 Technology & IT
- IT Certifications (CompTIA, Cisco, Microsoft)
- Cloud Computing (AWS, Azure, Google Cloud)
- Cybersecurity (CISSP, CEH, Security+)
- Software Development (Java, Python, .NET)

#### 💼 Business & Finance
- Project Management (PMP, Scrum, PRINCE2)
- Accounting (CPA, ACCA, CFA, CIMA)
- Business Management (Six Sigma, MBA)

#### ⚕️ Healthcare
- Medical Degrees (MD, MBBS)
- Nursing (RN, NP)
- Allied Health (Physical Therapy, Pharmacy)

#### ⚖️ Legal
- Law Degrees (JD, LLB, LLM)
- Bar Examinations
- Legal Practice Certifications

#### ⚙️ Engineering
- Professional Engineer (PE)
- Chartered Engineer (CEng)
- Engineering Specializations

#### 🌍 Languages
- IELTS, TOEFL (English)
- DELE (Spanish), DELF/DALF (French)
- HSK (Chinese), JLPT (Japanese)
- And many more...

#### 🔧 Trade Certifications
- Electrical, Plumbing, HVAC
- Welding, Carpentry
- Automotive (ASE)

## 🚀 Quick Start

### Installation

```bash
cd services/azora-sapiens
npm install
```

### Start the Server

```bash
npm start
```

Server runs on `http://localhost:3001`

### API Documentation

Access the API documentation at: `http://localhost:3001/`

## 📡 API Endpoints

### Qualifications

```bash
# Get all qualifications (with filters)
GET /api/qualifications?category=IT+Certification&country=US

# Search qualifications
GET /api/qualifications/search?q=python

# Get specific qualification
GET /api/qualifications/:id

# Get categories
GET /api/qualifications/categories

# Get levels
GET /api/qualifications/levels

# Get countries
GET /api/qualifications/countries

# Get statistics
GET /api/qualifications/stats/summary

# Verify qualification
POST /api/qualifications/verify

# Get recommendations
POST /api/qualifications/recommend
```

## 💎 Key Features

### 1. **Comprehensive Search**
- Full-text search across names, descriptions, and tags
- Filter by category, level, country, type
- Advanced filtering and pagination

### 2. **Blockchain Verification**
- Verify credentials on-chain
- Immutable proof of achievement
- Integration with Azora Covenant

### 3. **AZR Rewards**
- Earn tokens for completing qualifications
- Automatic rewards upon verification
- 100 AZR (primary) to 25,000 AZR (MD)

### 4. **Smart Recommendations**
- AI-powered qualification suggestions
- Career path guidance
- Personalized learning paths

### 5. **Global Recognition**
- International qualifications identified
- Recognition regions specified
- Equivalent qualifications linked

## 🔧 API Examples

### Search for MBA Programs

```bash
curl "http://localhost:3001/api/qualifications/search?q=MBA"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "qual-mba",
      "name": "Master of Business Administration",
      "shortName": "MBA",
      "category": "Business Management",
      "level": "Master Level",
      "azrReward": 10000,
      "verifiable": true,
      ...
    }
  ],
  "total": 1
}
```

### Get IT Certifications

```bash
curl "http://localhost:3001/api/qualifications?category=IT+Certification&limit=5"
```

### Verify a Qualification

```bash
curl -X POST http://localhost:3001/api/qualifications/verify \
  -H "Content-Type: application/json" \
  -d '{
    "qualificationId": "qual-phd",
    "userId": "user123",
    "certificateNumber": "CERT-123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "qualificationId": "qual-phd",
    "userId": "user123",
    "azrReward": 20000,
    "blockchainTxHash": "0x...",
    "verificationId": "VER-1730476800000"
  },
  "message": "Qualification verified! You've earned 20000 AZR"
}
```

## 📊 Database Structure

### Qualification Object

```typescript
{
  id: string;                  // Unique identifier
  name: string;                // Full qualification name
  shortName?: string;          // Common abbreviation (MBA, PhD, etc.)
  category: string;            // Qualification category
  level: string;               // Qualification level (1-10)
  type: string;                // Degree, Certificate, License, etc.
  country?: string;            // ISO country code or "International"
  issuingBody: string;         // Organization that issues the qualification
  description: string;         // Detailed description
  duration?: string;           // Time to complete
  prerequisites?: string[];    // Required prior qualifications
  recognizedIn?: string[];     // Countries/regions that recognize it
  equivalents?: string[];      // Equivalent qualifications
  azrReward?: number;         // AZR tokens earned
  verifiable: boolean;        // Can be verified on blockchain
  tags: string[];             // Search tags
}
```

## 🌐 Integration

### With Azora Mint
- Automatic AZR token distribution upon verification
- Proof-of-Knowledge rewards
- Education-to-earnings pipeline

### With Azora Covenant
- Blockchain-based certificates
- Smart contract verification
- Immutable credential records

### With Azora Forge
- Connect learners with educators
- List educational services
- Marketplace for courses and tutoring

### With Azora Nexus
- AI-powered recommendations
- Learning path optimization
- Career guidance system

## 📈 Roadmap

- **Phase 1** ✅ - Initial 100+ qualifications, API, UI (Complete)
- **Phase 2** - Expand to 1,000+ qualifications, institution partnerships
- **Phase 3** - 10,000+ qualifications, automated verification
- **Phase 4** - 50,000+ qualifications, global education passport

## 🎯 Use Cases

### For Students
- Discover qualifications in your field
- Plan your education journey
- Verify credentials on blockchain
- Earn AZR tokens for achievements

### For Educators
- List courses and programs
- Issue verifiable credentials
- Connect with global students
- Integrate with learning platform

### For Employers
- Verify candidate qualifications instantly
- Search for qualified candidates
- Trust blockchain-verified credentials
- Post job requirements

### For Institutions
- Register qualifications globally
- Issue blockchain certificates
- Verify transfer credits
- Attract international students

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Verification**: Blockchain (via Azora Covenant)
- **Tokens**: AZR (via Azora Mint)
- **API**: RESTful JSON API
- **Frontend**: React components available

## 📝 License

AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.

## 🆘 Support

For support and questions:
- API Docs: http://localhost:3001/
- GitHub: Azora OS Repository
- Email: education@azora.es

---

**Empowering Global Education with Blockchain Technology**

Built with ❤️ by the Azora OS team
