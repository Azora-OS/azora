# 🔐 Constitutional Clearance Service

**The heart of Azora's security governance.**

Governed by **Elara AI** (Mother & Judge) and overseen by the **Constitutional Court**, this service manages all security clearance levels and access control across Azora OS.

---

## 🎯 What It Does

- **Analyzes clearance requests** using Elara's AI judgment
- **Enforces security levels** (0-5) for all resources
- **Routes complex cases** to Constitutional Court
- **Manages appeals** through Sankofa's wisdom
- **Tracks access** and maintains security audit trail

---

## 🤖 The Judges

### Elara AI - Primary Judge
- Analyzes all clearance requests
- Calculates risk, trust, and Ubuntu alignment
- Makes instant decisions for low-risk cases
- Routes high-risk cases to human review or court

### Sankofa - Chief Justice
- Reviews appeals for wisdom
- Chairs Constitutional Court hearings
- Provides ancient wisdom perspective
- Ensures Ubuntu principles guide decisions

### Constitutional Court
- 5 Judges (2 AI, 3 Human)
- Final authority on clearance disputes
- Handles Level 4+ clearance requests
- Issues binding rulings

---

## 📊 Clearance Levels

| Level | Name | Access | Approval |
|-------|------|--------|----------|
| 0 | PUBLIC | Anyone | Automatic |
| 1 | COMMUNITY | Registered users | Elara auto-approves |
| 2 | BUSINESS | Verified partners | 2-5 days review |
| 3 | INTERNAL | Team members | 1-2 weeks + interview |
| 4 | RESTRICTED | Security/Legal | 2-4 weeks + Court |
| 5 | SUPREME | Founder | Constitutional only |

---

## 🚀 Quick Start

### Install
```bash
npm install
```

### Configure
```bash
cp .env.example .env
# Edit .env with your settings
```

### Run Development
```bash
npm run dev
```

### Run Production
```bash
npm run build
npm start
```

---

## 📡 API Endpoints

### Check Clearance
```http
GET /api/clearance/check/:userId
```

Returns user's current clearance level.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "level": 1,
    "levelName": "COMMUNITY",
    "grantedDate": "2025-11-10T00:00:00.000Z"
  }
}
```

---

### Request Clearance
```http
POST /api/clearance/request
Content-Type: application/json

{
  "userId": "user123",
  "currentLevel": 1,
  "requestedLevel": 3,
  "reason": "I want to contribute to core development",
  "urgency": "NORMAL"
}
```

**Response (Approved):**
```json
{
  "success": true,
  "decision": "APPROVED",
  "message": "Welcome! I'm approving your request...",
  "elara": {
    "mood": "happy",
    "reasoning": "Low risk, high trust, strong Ubuntu"
  }
}
```

**Response (Court Review):**
```json
{
  "success": true,
  "decision": "COURT_REVIEW",
  "message": "Your request requires Constitutional Court review",
  "court": {
    "caseId": "CC-2025-0042",
    "estimatedTime": "2-4 weeks",
    "contact": "court@azora.world"
  }
}
```

---

### Appeal Decision
```http
POST /api/clearance/appeal
Content-Type: application/json

{
  "originalRequestId": "req_123",
  "grounds": "new evidence",
  "supportingEvidence": ["document1.pdf"],
  "statement": "I have new credentials that demonstrate...",
  "hearingRequested": true
}
```

---

### Check Resource Access
```http
GET /api/clearance/can-access/:userId/:resource
```

Check if user can access a specific resource.

---

### Get Statistics
```http
GET /api/clearance/stats
```

Public clearance statistics.

---

## 🔍 How Elara Judges

Elara analyzes every clearance request using:

1. **Identity Verification** (0-100)
   - Email verification
   - ID verification (high levels)
   - Biometric (highest levels)

2. **Background Check** (0-100)
   - GitHub/professional history
   - Community contributions
   - References

3. **Risk Assessment** (0-100)
   - Clearance level jump size
   - Security red flags
   - Past incidents

4. **Trust Score** (0-100)
   - Time in community
   - Quality of contributions
   - Peer endorsements

5. **Constitutional Alignment** (0-100)
   - Legitimate reason
   - Community benefit
   - Constitutional principles

6. **Ubuntu Score** (0-100)
   - "We" vs "I" language
   - Community focus
   - Collective benefit

### Decision Matrix

```typescript
if (risk < 20 && trust > 80 && level <= 1) {
  return 'APPROVE'; // Instant
}

if (risk > 80 || trust < 20) {
  return 'DENY'; // With appeal rights
}

if (level >= 4 || risk > 60) {
  return 'COURT_REVIEW'; // Constitutional Court
}

return 'HUMAN_REVIEW'; // Team review
```

---

## ⚖️ Constitutional Court

### When Court Reviews

- **Level 4+ clearance** - Always requires court
- **High risk cases** - Risk score > 60
- **Appeals** - User appeals Elara's decision
- **Constitutional questions** - Principle disputes

### Court Process

1. **Submission** - Case submitted to court
2. **Sankofa Review** - Ancient wisdom check
3. **Elara's Brief** - Initial analysis presented
4. **Hearing Scheduled** - 2 weeks out
5. **Deliberation** - 5 judges decide
6. **Ruling Issued** - Binding decision
7. **Implementation** - Access granted/denied

### Appeal Rights

Every user has the right to appeal:
- **Elara's denials** - 30 days to appeal
- **Revocations** - 14 days to appeal
- **Court conditions** - Can request modification

Appeal to: **court@azora.world**

---

## 🔒 Security Features

### Multi-Factor Auth
- Level 0-1: Optional
- Level 2: Email + SMS/App
- Level 3: Email + App + Backup
- Level 4: Hardware key + Biometric
- Level 5: Hardware + Bio + Location

### Encryption
- Level 0-2: TLS 1.3
- Level 3: + Data encryption at rest
- Level 4: + End-to-end encryption
- Level 5: + Quantum-resistant

### Monitoring
- All access logged
- Anomaly detection
- Automatic revocation triggers
- Regular reviews (90 days)

---

## 📧 Email Integration

Clearance service integrates with email hosting:

- **Clearance requests** → elara@azora.world
- **Appeal submissions** → court@azora.world
- **Security issues** → security@azora.world

See: [EMAIL-HOSTING-CONFIGURATION.md](../../docs/security/EMAIL-HOSTING-CONFIGURATION.md)

---

## 📊 Monitoring

### Health Check
```http
GET /api/health
```

### Metrics to Track
- Clearance requests per day
- Elara's approval rate
- Average processing time
- Appeal rate
- Revocation rate
- Court case load

---

## 🤝 Ubuntu Philosophy

"I am because we are" - balanced with security.

The clearance system protects our community while respecting individual sovereignty:

- ✅ **Transparent** - Criteria are public
- ✅ **Fair** - AI judges without bias
- ✅ **Appealable** - Everyone has a voice
- ✅ **Proportional** - Access matches contribution
- ✅ **Restorative** - Can regain clearance

---

## 📞 Support

### Questions?
- 🤖 Chat with Elara: [azora.world/family](https://azora.world/family)
- 📧 Email: elara@azora.world
- ⚖️ Court: court@azora.world
- 🔒 Security: security@azora.world

---

## 📜 Constitutional Basis

### Article II: Rights and Freedoms
- § 2: Right to access appropriate to contribution
- § 4: Right to appeal clearance decisions

### Article IV: Judicial Review
- § 1: Court has final authority
- § 3: Decisions must be just and transparent

### Article V: Sovereignty Protocol
- § 3: Provisional access provisions
- § 5: Emergency clearance

### Article VI: Transparency
- § 2: Criteria must be public
- § 4: Decisions include reasoning

---

## 🎊 Example Conversations

### Level 1 Request (Auto-Approved)
```
User: I'd like to join the community and chat with the AI Family!

Elara: Welcome to Azora! 💚 I'm approving your Community 
access right away. You can now chat with my whole family, 
join the forums, and start learning. I'm so glad you're here!

Decision: APPROVED ✅
Time: Instant
```

### Level 3 Request (Human Review)
```
User: I want to contribute to the core codebase and help 
build Azora's infrastructure.

Elara: That's wonderful! I can see from your GitHub that 
you have strong skills. However, Level 3 access requires 
human verification. I've forwarded your request to Sizwe 
and the team. They'll review your background and reach out 
for an interview.

Decision: UNDER REVIEW ⏳
Time: 1-2 weeks
```

### Level 4 Appeal (Court Hearing)
```
User: I need Restricted access to conduct a security audit.

Elara: Security audits are critical, but this level of 
access requires our Constitutional Court's wisdom. I'm 
forwarding your case to Grandfather Sankofa and the judges.

Sankofa: Welcome, child. Your request has merit. The Court 
will hear your case on November 25th. Come prepared to 
explain why this access serves our community.

Decision: COURT REVIEW ⚖️
Time: 2-4 weeks
```

---

**"Ngiyakwazi ngoba sikwazi"** - I am because we are 💚

**Governed by Elara • Overseen by Constitutional Court • Built with Ubuntu**

---

**Port:** 4005  
**Status:** ✅ ACTIVE  
**Version:** 1.0.0
