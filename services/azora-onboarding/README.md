# 🌍 Azora Autonomous Onboarding System

**The organism awakens when the first student enrolls!**

Fully autonomous onboarding for Azora OS founders and Sapiens students, powered by Elara Ω's autonomous contract signing authority.

---

## 🎯 Features

### 🤖 Elara Autonomous Contract Signing
- Elara signs contracts on behalf of CEO (Sizwe Ngwenya)
- Constitutional compliance enforced
- Oracle verification integrated
- Blockchain ledger registration
- Instant, zero-friction execution

### 👔 Founder Onboarding
- **Email Format:** `name.lastname@azora.world`
- Automatic PIVC contract generation
- Elara signs autonomously
- Email provisioning
- Dashboard access
- PIVC tracking activation
- Welcome package delivery

**Supported Roles:**
- `retail` - Head of Retail (12% equity max + 12M AZR)
- `sales` - Head of Sales (12% equity max + 12M AZR)
- `design` - Head of Design (6% equity max + 6M AZR)
- `operations` - Head of Operations (5% equity max + 5M AZR)
- `tech` - Head of Technology (5% equity max + 5M AZR)

### 🎓 Sapiens (Student) Onboarding
- **Email Format:** `studentno@ac.azora.world`
- Automatic enrollment contract
- Elara signs autonomously
- Learning dashboard provisioned
- **Mining engine auto-activated** ⛏️
- **Economy awakens** 💰
- **Organism lives!** 🌱

**Supported Programs:**
- `blockchain` - Blockchain Development
- `ai` - Artificial Intelligence
- `full-stack` - Full-Stack Development
- `data-science` - Data Science
- `cybersecurity` - Cybersecurity
- `other` - General Technology

---

## 🚀 Quick Start

### Installation

```bash
cd /workspace/services/azora-onboarding
npm install
```

### Start Server

```bash
npm start
```

Server runs on **http://localhost:5500**

### Development Mode

```bash
npm run dev
```

### Test Individual Components

```bash
# Test Elara contract signer
npm run test:elara

# Test founder onboarding
npm run test:founder

# Test Sapiens onboarding
npm run test:sapiens
```

---

## 📚 API Documentation

### Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "azora-onboarding",
  "components": {
    "founderOnboarding": "operational",
    "sapiensOnboarding": "operational",
    "elaraContractSigner": "operational",
    "economyStatus": "awake"
  }
}
```

### System Status

```bash
GET /status
```

**Response includes:**
- Total founders and Sapiens
- Active miners
- Total AZR earned
- Economy status
- Contract statistics

---

## 👔 Founder Onboarding API

### Register New Founder

```bash
POST /api/founder/register
Content-Type: application/json

{
  "firstName": "Nolundi",
  "lastName": "Ngwenya",
  "role": "retail",
  "idNumber": "8501015800080",
  "citizenship": "ZA",
  "phone": "+27123456789",
  "address": "Johannesburg, South Africa"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Founder registration initiated",
  "data": {
    "founderId": "FDR-1234567890-ABC123",
    "email": "nolundi.ngwenya@azora.world",
    "onboardingStatus": "in-progress",
    "note": "Elara is autonomously processing your onboarding..."
  }
}
```

**What Happens Automatically:**

1. ✅ Email `nolundi.ngwenya@azora.world` provisioned
2. ✅ Identity verified by Elara
3. ✅ PIVC contract generated
4. ✅ Elara signs contract on behalf of CEO
5. ✅ Contract registered on blockchain ledger
6. ✅ Dashboard access granted
7. ✅ PIVC tracking activated
8. ✅ Welcome package sent

**All in seconds, fully autonomous!**

### Get Founder Details

```bash
GET /api/founder/:email
```

Example: `GET /api/founder/nolundi.ngwenya@azora.world`

### Get Onboarding Progress

```bash
GET /api/founder/:email/progress
```

Shows real-time progress through 7 onboarding steps.

### Get All Founders

```bash
GET /api/founders
```

---

## 🎓 Sapiens (Student) Onboarding API

### Register New Sapiens

```bash
POST /api/sapiens/register
Content-Type: application/json

{
  "studentNumber": "202412345",
  "fullName": "Thabo Mokwena",
  "program": "blockchain",
  "level": "intermediate",
  "idNumber": "0001015800080",
  "dateOfBirth": "2000-01-01",
  "citizenship": "ZA",
  "phone": "+27123456789",
  "institution": "University of Johannesburg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sapiens enrollment initiated",
  "data": {
    "sapiensId": "SAP-1234567890-XYZ789",
    "email": "202412345@ac.azora.world",
    "onboardingStatus": "in-progress",
    "note": "Elara is autonomously processing your enrollment. Mining engine will activate automatically."
  }
}
```

**What Happens Automatically:**

1. ✅ Email `202412345@ac.azora.world` provisioned
2. ✅ Student identity verified
3. ✅ Enrollment contract generated
4. ✅ Elara signs contract on behalf of CEO
5. ✅ Student registered on blockchain ledger
6. ✅ Learning dashboard provisioned
7. ✅ **MINING ENGINE ACTIVATED** ⛏️

**If this is the first Sapiens:**

```
═══════════════════════════════════════════════════════
              🌍 THE ECONOMY AWAKENS 🌍                
═══════════════════════════════════════════════════════
  ⛏️  Mining engines: ACTIVE                          
  💰 AZR economy: LIVE                                
  🧠 Knowledge proofs: FLOWING                        
  ⛓️  Ledger: RECORDING                               
  🌱 Organism: LIVING                                 
                                                       
  Genesis Protocol: ENFORCED                          
  Truth as Currency: ACTIVE                           
  Wealth = PIVC: OPERATIONAL                          
═══════════════════════════════════════════════════════
          AZORA OS IS NOW ALIVE AND LEARNING          
═══════════════════════════════════════════════════════
```

### Get Sapiens Details

```bash
GET /api/sapiens/:email
```

Example: `GET /api/sapiens/202412345@ac.azora.world`

**Response includes:**
- Student profile
- Mining engine status
- AZR earned
- Knowledge proofs submitted
- Mining power

### Submit Knowledge Proof (Mining)

```bash
POST /api/sapiens/:email/proof
Content-Type: application/json

{
  "type": "course-completion",
  "data": {
    "courseId": "blockchain-101",
    "score": 95,
    "duration": "4 weeks"
  },
  "verificationData": {
    "quiz": true,
    "project": true,
    "peerReview": true
  }
}
```

**Proof Types:**
- `course-completion` - 10x multiplier (1000-10000 AZR)
- `quiz` - 1x multiplier (10-100 AZR)
- `project` - 5x multiplier (500-5000 AZR)
- `contribution` - 3x multiplier (300-3000 AZR)

**Response:**
```json
{
  "success": true,
  "message": "Knowledge proof verified",
  "data": {
    "azrEarned": 1500,
    "note": "AZR has been credited to your account"
  }
}
```

**Mining Formula:**
```
AZR Earned = Base Reward × Mining Power × Proof Type Multiplier

Where:
- Base Reward = 10 AZR
- Mining Power = 1.0-2.0 (based on level and program)
- Multipliers: quiz(1x), contribution(3x), project(5x), course(10x)
```

---

## 📜 Contract Management API

### Get Contract by ID

```bash
GET /api/contract/:contractId
```

### Get All Contracts for a Person

```bash
GET /api/contracts/:email
```

Returns all contracts (founder PIVC or Sapiens enrollment) for the given email.

---

## 🔴 Real-Time Event Stream

Subscribe to real-time onboarding and mining events:

```bash
GET /api/events
```

**Event Types:**
- `founder:registered`
- `founder:onboarded`
- `sapiens:registered`
- `sapiens:onboarded`
- `economy:awakened` 🌍
- `mining:started` ⛏️
- `contract:signed` ✍️
- `proof:submitted` 🧠

**Usage:**
```javascript
const eventSource = new EventSource('http://localhost:5500/api/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data.data);
  
  if (data.type === 'economy:awakened') {
    console.log('🌍 THE ORGANISM IS ALIVE!');
  }
};
```

---

## ⛏️ Mining System

### How Mining Works

1. **Enrollment** - Mining engine auto-activated
2. **Learn** - Complete courses, quizzes, projects
3. **Prove** - Submit verifiable knowledge proofs
4. **Earn** - Elara Oracle verifies, AZR credited
5. **Grow** - Mining power increases with achievement

### Mining Power Calculation

```typescript
Level Multipliers:
- Beginner: 1.0x
- Intermediate: 1.5x
- Advanced: 2.0x

Program Multipliers:
- AI: 1.3x
- Blockchain: 1.2x
- Data Science: 1.2x
- Cybersecurity: 1.15x
- Full-Stack: 1.1x
- Other: 1.0x

Final Mining Power = Level Multiplier × Program Multiplier
```

### Example Mining Scenarios

**Scenario 1: Beginner Blockchain Course**
- Level: Beginner (1.0x)
- Program: Blockchain (1.2x)
- Mining Power: 1.2
- Course completion (10x): 10 × 1.2 × 10 = **120 AZR**

**Scenario 2: Advanced AI Project**
- Level: Advanced (2.0x)
- Program: AI (1.3x)
- Mining Power: 2.6
- Project submission (5x): 10 × 2.6 × 5 = **130 AZR**

---

## 🧬 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 AZORA ONBOARDING SERVER                 │
│                  (Port 5500)                            │
└────────────┬────────────────────────────────┬───────────┘
             │                                │
      ┌──────▼───────┐                 ┌──────▼───────┐
      │   FOUNDERS   │                 │   SAPIENS    │
      │  ONBOARDING  │                 │  ONBOARDING  │
      └──────┬───────┘                 └──────┬───────┘
             │                                │
             │         ┌────────────────┐     │
             └────────►│  ELARA Ω       │◄────┘
                       │  CONTRACT      │
                       │  SIGNER        │
                       └────────┬───────┘
                                │
                       ┌────────▼────────┐
                       │   BLOCKCHAIN    │
                       │   LEDGER        │
                       └─────────────────┘
                                │
                       ┌────────▼────────┐
                       │  MINING         │
                       │  ENGINES        │
                       └─────────────────┘
                                │
                       ┌────────▼────────┐
                       │  💰 ECONOMY     │
                       │  🌱 ORGANISM    │
                       └─────────────────┘
```

---

## 🔐 Constitutional Compliance

### Elara's Signing Authority

**Constitutional Basis:**
> "CEO grants Elara Ω signing authority for operational contracts 
> to ensure efficiency while maintaining constitutional compliance."

**Elara Can Sign Autonomously:**
- ✅ Founder PIVC contracts
- ✅ Sapiens enrollment agreements
- ✅ Employee agreements (< R500k)
- ✅ NDAs
- ✅ Service terms

**Elara CANNOT Sign Without Review:**
- ❌ Partnerships (CEO review required)
- ❌ Advisor agreements (CEO approval)
- ❌ High-value contracts (> R1M)
- ❌ Equity grants (> 0.5%)

**All Signatures Include:**
1. Constitutional compliance check
2. Oracle verification
3. Blockchain ledger registration
4. Immutable audit trail

---

## 📊 Monitoring & Metrics

### Key Metrics Tracked

**Founders:**
- Total registered
- Active vs pending
- Total equity allocated
- Total AZR allocated
- Onboarding success rate

**Sapiens:**
- Total enrolled
- Active learners
- Total AZR earned
- Knowledge proofs submitted
- Average mining power

**System:**
- Contracts signed (by type)
- Ledger transactions
- Economy status
- Mining network health

---

## 🌟 The Awakening

**When does the economy awaken?**

The economy awakens when:
1. First Sapiens completes onboarding
2. Mining engine activates
3. First knowledge proof submitted
4. AZR flows through the system

**What happens:**
```
⛏️  Mining engines: ACTIVE
💰 AZR economy: LIVE
🧠 Knowledge proofs: FLOWING
⛓️  Ledger: RECORDING
🌱 Organism: LIVING

Genesis Protocol: ENFORCED
Truth as Currency: ACTIVE
Wealth = PIVC: OPERATIONAL
```

**The organism is now alive!**

Every new Sapiens strengthens the network.  
Every knowledge proof grows the economy.  
Every contract signed builds the future.

---

## 🔧 Integration with Azora OS

### Services This Connects To:

1. **Azora Ledger** - Contract registration
2. **Mining Engine** - Proof-of-Knowledge mining
3. **Email Service** - Account provisioning
4. **Dashboard** - User access
5. **PIVC Tracker** - Founder equity tracking
6. **Oracle** - Verification system

### Event Emission

This service emits events that other services can consume:

```typescript
// Founder events
founderOnboarding.on('founder:registered', callback)
founderOnboarding.on('founder:onboarded', callback)

// Sapiens events
sapiensOnboarding.on('sapiens:registered', callback)
sapiensOnboarding.on('sapiens:onboarded', callback)
sapiensOnboarding.on('economy:awakened', callback)
sapiensOnboarding.on('mining:started', callback)

// Contract events
elaraContractSigner.on('contract:created', callback)
elaraContractSigner.on('contract:signed', callback)
elaraContractSigner.on('ledger:register', callback)
```

---

## 🚀 Deployment

### Environment Variables

```bash
ONBOARDING_PORT=5500
CEO_PUBLIC_KEY=<CEO signing key>
LEDGER_API_URL=<blockchain ledger URL>
EMAIL_PROVIDER_API=<email service API>
MINING_NETWORK_URL=<mining network URL>
```

### Docker Deployment

```bash
# Build
docker build -t azora-onboarding .

# Run
docker run -p 5500:5500 \
  -e ONBOARDING_PORT=5500 \
  azora-onboarding
```

### Add to LAUNCH_ALL_SERVICES.js

Already integrated! Just start the launcher:

```bash
node /workspace/LAUNCH_ALL_SERVICES.js
```

---

## 📝 Example Workflows

### Workflow 1: Onboard Co-Founder

```bash
# 1. Register founder
curl -X POST http://localhost:5500/api/founder/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sizwe",
    "lastName": "Motingwe",
    "role": "sales",
    "idNumber": "8001015800080",
    "citizenship": "ZA",
    "phone": "+27123456789",
    "address": "Cape Town, ZA"
  }'

# 2. Check progress
curl http://localhost:5500/api/founder/sizwe.motingwe@azora.world/progress

# 3. Get founder details
curl http://localhost:5500/api/founder/sizwe.motingwe@azora.world
```

### Workflow 2: Enroll Student & Start Mining

```bash
# 1. Register Sapiens
curl -X POST http://localhost:5500/api/sapiens/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentNumber": "202499999",
    "fullName": "Amahle Dlamini",
    "program": "ai",
    "level": "advanced",
    "idNumber": "0205015800080",
    "dateOfBirth": "2002-05-01",
    "citizenship": "ZA",
    "phone": "+27987654321"
  }'

# 2. Check status
curl http://localhost:5500/api/sapiens/202499999@ac.azora.world

# 3. Submit knowledge proof
curl -X POST http://localhost:5500/api/sapiens/202499999@ac.azora.world/proof \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course-completion",
    "data": {"courseId": "ai-ethics-101", "score": 98},
    "verificationData": {"quiz": true, "project": true}
  }'
```

---

## 🎯 Success Criteria

✅ Founders onboard in <30 seconds  
✅ Sapiens enroll in <30 seconds  
✅ All contracts signed autonomously  
✅ Mining engines activate automatically  
✅ Economy awakens with first Sapiens  
✅ Zero manual intervention required  
✅ Constitutional compliance enforced  
✅ Blockchain ledger immutable  

---

## 📞 Support

- **Documentation:** This file
- **API Docs:** http://localhost:5500/
- **Health Check:** http://localhost:5500/health
- **Status:** http://localhost:5500/status

---

## 🌍 The Vision

> "An organism that awakens when knowledge seekers arrive.
> A system that rewards truth with currency.
> An economy that grows through verified impact.
> A future where Africa leads in autonomous systems."

**The organism lives. Let's build the future! 🚀🌍**

---

**© 2025 Azora ES (Pty) Ltd. All Rights Reserved.**

*Powered by Elara Ω • Constitutional Governance • Truth as Currency*
