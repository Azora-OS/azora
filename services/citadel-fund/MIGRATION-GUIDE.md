# CitadelFund Database Migration - Setup Guide

## 🎯 Objective
Migrate CitadelFund service from in-memory mock data to PostgreSQL database, achieving No Mock Protocol compliance (Article VIII Section 8.3).

---

## ✅ Completed

1. **Prisma Schema** - 6 models created:
   - `CitadelBalance` - Main fund tracking
   - `RevenueDistribution` - 10% revenue collection
   - `Scholarship` - Student financial aid
   - `AllocationHistory` - Audit trail
   - `CommunityImpact` - Ubuntu metrics
   - `ConstitutionalAudit` - Compliance tracking

2. **Database Repository** - `citadel-repository.ts`
   - All CRUD operations
   - Transparency report generation
   - Constitutional compliance tracking

3. **Service Refactor** - `citadel-service.ts`
   - Replaced all in-memory arrays with database calls
   - Graceful blockchain fallback
   - Constitutional audit logging

4. **Seed Data** - `prisma/seed.ts`
   - Sample revenue distributions
   - Sample scholarships
   - Community impact metrics
   - Constitutional audit records

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd services/citadel-fund
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
DATABASE_URL="postgresql://azora:your_password@localhost:5432/citadel_fund"
PORT=3010
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Optional: Blockchain (for future)
BLOCKCHAIN_PRIVATE_KEY=
AZR_CONTRACT_ADDRESS=
```

### 3. Run Database Migrations
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create database schema
```

### 4. Seed Database
```bash
npm run db:seed      # Populate with sample data
```

### 5. Start Service
```bash
npm run dev          # Development mode
# or
npm run build && npm start  # Production mode
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3010/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "citadel-fund",
  "timestamp": "2025-12-02T...",
  "ubuntu": "I serve because we prosper together"
}
```

### Get Balance
```bash
curl http://localhost:3010/api/balance
```

### Get Transparency Report
```bash
curl http://localhost:3010/api/transparency
```

### Record Revenue (10% collection)
```bash
curl -X POST http://localhost:3010/api/revenue/collect \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "source": "azora-pay",
    "category": "education",
    "txHash": "0x123..."
  }'
```

### Grant Scholarship
```bash
curl -X POST http://localhost:3010/api/scholarships/grant \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-123",
    "amount": 50,
    "reason": "Academic Excellence"
  }'
```

---

## 📊 Database Schema

### CitadelBalance
- `id` - UUID
- `totalBalance` - Total AZR in fund
- `totalDistributed` - Total distributed
- `totalScholarships` - Total scholarships awarded
- `lastUpdated` - Auto-updated timestamp

### RevenueDistribution
- `id` - UUID
- `sourceService` - Service name (e.g., "azora-pay")
- `sourceReference` - Transaction ID
- `amount` - AZR amount
- `percentage` - Always 10%
- `distributedAt` - Timestamp
- `metadata` - JSON for additional context

### Scholarship
- `id` - UUID
- `studentId` - Student identifier
- `studentName` - Optional
- `studentEmail` - Optional
- `amount` - Scholarship amount
- `reason` - Justification
- `status` - PENDING, APPROVED, DISBURSED, REJECTED
- `awardedAt` - Timestamp
- `disbursedAt` - Optional
- `approvedBy` - Admin user ID
- `metadata` - JSON

### AllocationHistory
- `id` - UUID
- `allocationType` - SCHOLARSHIP, PUBLIC_GOODS, COMMUNITY_FUND, etc.
- `amount` - Amount allocated
- `recipient` - Student/project ID
- `description` - Purpose
- `allocatedAt` - Timestamp
- `allocatedBy` - Admin user ID
- `transactionHash` - Blockchain tx hash
- `metadata` - JSON

### CommunityImpact
- `id` - UUID
- `period` - e.g., "2025-Q1"
- `studentsSupported` - Count
- `totalDisbursed` - Total amount
- `averageScholarship` - Average per student
- `ubuntuScore` - 0-100 alignment score
- `collectiveImpact` - 0-100 impact score
- `calculatedAt` - Timestamp

### ConstitutionalAudit
- `id` - UUID
- `auditType` - NO_MOCK_PROTOCOL, UBUNTU_ALIGNMENT, etc.
- `complianceScore` - 0-100
- `violations` - JSON array
- `recommendations` - JSON array
- `auditedAt` - Timestamp
- `auditedBy` - Default: "constitutional-ai"

---

## 🛡️ Constitutional Compliance

### No Mock Protocol (Article VIII Section 8.3)
✅ **COMPLIANT** - All data stored in PostgreSQL database

### Ubuntu Philosophy (Article I Section 1.1)
✅ **COMPLIANT** - 50% scholarships, 30% public goods, 20% grants

### Transparency (Article V Section 5.2)
✅ **COMPLIANT** - Full transparency report endpoint

### Audit Trail (Article IX Section 9.1)
✅ **COMPLIANT** - Constitutional audit logging

---

## 🔄 Migration from Mock Data

**Before:**
```typescript
private totalRevenue: number = 0;  // In-memory
private revenueRecords: RevenueRecord[] = [];  // In-memory array
```

**After:**
```typescript
await citadelRepository.recordRevenue({ ... });  // PostgreSQL
await citadelRepository.getRevenueHistory(limit);  // From DB
```

**Key Changes:**
1. All revenue → `RevenueDistribution` table
2. All scholarships → `Scholarship` table
3. All allocations → `AllocationHistory` table
4. Balance tracking → `CitadelBalance` table
5. Metrics → `CommunityImpact` table
6. Audits → `ConstitutionalAudit` table

---

## 🎉 Benefits

1. **No Mock Protocol Compliance** - Constitutional requirement met
2. **Data Persistence** - Survives service restarts
3. **Audit Trail** - Complete history of all transactions
4. **Scalability** - PostgreSQL handles growth
5. **Transparency** - Full reporting capabilities
6. **Constitutional Compliance** - Automated tracking

---

## 📝 Next Steps

1. ✅ CitadelFund database migration complete
2. ⏭️ Add Ubuntu Philosophy Card to all frontend apps
3. ⏭️ Integrate blockchain for real token transfers
4. ⏭️ Build Constitutional Metrics Dashboard
5. ⏭️ Implement Privacy Protection System

---

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

🛡️ **Constitutional AI Operating System**  
**Azora ES (Pty) Ltd**
