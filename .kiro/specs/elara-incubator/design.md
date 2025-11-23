# Elara Incubator Platform - Design Document

## Overview

The Elara Incubator Platform is a comprehensive system enabling users to launch real businesses with AI guidance, legal support, and transparent revenue sharing. The platform integrates with existing Elara AI, payment systems, and dashboards to provide a seamless experience from ideation to revenue tracking.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Business Wizard UI  │  User Dashboard  │  Admin Dashboard      │
│  (React Components)  │  (React/Next.js) │  (React/Next.js)      │
└──────────┬──────────────────────┬──────────────────────┬────────┘
           │                      │                      │
┌──────────▼──────────────────────▼──────────────────────▼────────┐
│                        API Gateway Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  Business Wizard API  │  Payment API  │  Dashboard API          │
│  Legal Template API   │  Fund API     │  Reporting API          │
└──────────┬──────────────────────┬──────────────────────┬────────┘
           │                      │                      │
┌──────────▼──────────────────────▼──────────────────────▼────────┐
│                      Service Layer                               │
├─────────────────────────────────────────────────────────────────┤
│ Business Service  │ Payment Service  │ Fund Service             │
│ Legal Service     │ Elara AI Service │ Reporting Service        │
└──────────┬──────────────────────┬──────────────────────┬────────┘
           │                      │                      │
┌──────────▼──────────────────────▼──────────────────────▼────────┐
│                      Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL Database  │  Document Storage  │  Audit Logs         │
└─────────────────────────────────────────────────────────────────┘
```

### Integration Points

1. **Elara AI Orchestrator** - Provides mentorship guidance through business wizard
2. **Payment Service** - Processes revenue, calculates Citadel Fund allocation
3. **Auth Service** - User authentication and authorization
4. **Notification Service** - Sends alerts for payments, milestones, opportunities
5. **Constitutional AI** - Validates recommendations for compliance and ethics

## Components and Interfaces

### 1. Business Wizard Component

**Purpose:** Guide users through business creation step-by-step

**Steps:**
1. **Ideation** - Validate business idea with Elara AI
2. **Planning** - Create business plan, market analysis
3. **Prototype** - Build MVP with template resources
4. **Legal Setup** - Generate and sign legal documents
5. **Launch** - Initialize payment processing, allocate shares
6. **Revenue Tracking** - Monitor revenue, Citadel Fund contributions

**Interfaces:**
```typescript
interface BusinessWizardStep {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  resources: Resource[];
  elara_prompt: string;
  validation_rules: ValidationRule[];
}

interface BusinessCreation {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  template_id: string;
  current_step: number;
  status: 'draft' | 'in_progress' | 'launched' | 'active';
  user_ownership: number; // 90
  citadel_fund_share: number; // 10
  created_at: Date;
  launched_at?: Date;
}
```

### 2. Legal Template Service

**Purpose:** Manage and generate legal documents

**Templates:**
- Business Registration Agreement
- Operating Agreement
- Revenue Share & Payment Terms
- IP Assignment
- Compliance Checklist

**Interfaces:**
```typescript
interface LegalTemplate {
  id: string;
  name: string;
  type: 'registration' | 'operating' | 'revenue_share' | 'ip' | 'compliance';
  content: string; // Template with {{placeholders}}
  version: number;
  created_at: Date;
  updated_at: Date;
}

interface GeneratedDocument {
  id: string;
  business_id: string;
  template_id: string;
  template_version: number;
  content: string; // Populated template
  status: 'draft' | 'signed' | 'archived';
  signed_at?: Date;
  signer_id?: string;
  signature_data?: SignatureData;
  audit_trail: AuditEntry[];
}

interface SignatureData {
  timestamp: Date;
  ip_address: string;
  user_agent: string;
  signature_hash: string;
}
```

### 3. Payment & Revenue Tracking Service

**Purpose:** Process revenue, allocate Citadel Fund, track payments

**Interfaces:**
```typescript
interface RevenueTransaction {
  id: string;
  business_id: string;
  amount: number;
  currency: string;
  source: string;
  received_at: Date;
  status: 'pending' | 'completed' | 'failed';
}

interface RevenueAllocation {
  id: string;
  transaction_id: string;
  business_owner_amount: number; // 90%
  citadel_fund_amount: number; // 10%
  allocated_at: Date;
}

interface Payment {
  id: string;
  business_id: string;
  amount: number;
  type: 'revenue' | 'refund' | 'fund_distribution';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method: string;
  transaction_id: string;
  created_at: Date;
  completed_at?: Date;
  audit_trail: AuditEntry[];
}

interface CitadelFund {
  id: string;
  balance: number;
  total_contributions: number;
  total_distributions: number;
  last_distribution_date?: Date;
  next_distribution_date?: Date;
}
```

### 4. Dashboard Service

**Purpose:** Provide real-time metrics and reporting

**User Dashboard Metrics:**
- Business status and progress
- Total revenue
- Citadel Fund contributions
- Net payments received
- Mentorship engagement
- Wizard completion percentage

**Admin Dashboard Metrics:**
- Active businesses count
- Total revenue across all businesses
- Citadel Fund balance
- Fund distributions
- Compliance status
- Audit logs

**Interfaces:**
```typescript
interface UserDashboard {
  business_id: string;
  business_name: string;
  status: string;
  wizard_progress: number;
  total_revenue: number;
  citadel_fund_contributions: number;
  net_payments: number;
  mentorship_sessions: number;
  recent_transactions: Payment[];
}

interface AdminDashboard {
  active_businesses: number;
  total_revenue: number;
  citadel_fund_balance: number;
  citadel_fund_contributions: number;
  total_distributions: number;
  pending_payments: number;
  compliance_status: string;
  recent_activities: AuditEntry[];
}
```

## Data Models

### Business Entity
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  template_id UUID REFERENCES business_templates(id),
  status VARCHAR(50) NOT NULL,
  user_ownership DECIMAL(5,2) DEFAULT 90.00,
  citadel_fund_share DECIMAL(5,2) DEFAULT 10.00,
  current_wizard_step INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  launched_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Revenue Transaction Entity
```sql
CREATE TABLE revenue_transactions (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  source VARCHAR(100) NOT NULL,
  received_at TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Revenue Allocation Entity
```sql
CREATE TABLE revenue_allocations (
  id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES revenue_transactions(id),
  business_owner_amount DECIMAL(15,2) NOT NULL,
  citadel_fund_amount DECIMAL(15,2) NOT NULL,
  allocated_at TIMESTAMP DEFAULT NOW()
);
```

### Payment Entity
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Legal Document Entity
```sql
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  template_id UUID NOT NULL REFERENCES legal_templates(id),
  template_version INT NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  signed_at TIMESTAMP,
  signer_id UUID REFERENCES users(id),
  signature_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Citadel Fund Entity
```sql
CREATE TABLE citadel_fund (
  id UUID PRIMARY KEY,
  balance DECIMAL(15,2) DEFAULT 0,
  total_contributions DECIMAL(15,2) DEFAULT 0,
  total_distributions DECIMAL(15,2) DEFAULT 0,
  last_distribution_date TIMESTAMP,
  next_distribution_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### Business Wizard Errors
- Invalid business type
- Missing required fields
- Elara AI validation failure
- Document generation failure

### Payment Processing Errors
- Insufficient funds
- Payment gateway failure
- Invalid payment method
- Transaction timeout

### Legal Document Errors
- Template not found
- Invalid template version
- Signature verification failure
- Document storage failure

### Citadel Fund Errors
- Insufficient fund balance
- Invalid distribution amount
- Distribution calculation error

## Testing Strategy

### Unit Tests
- Business creation logic
- Revenue allocation calculations
- Payment processing
- Document generation
- Fund distribution logic

### Integration Tests
- End-to-end wizard flow
- Payment processing with Stripe
- Elara AI integration
- Document signing and storage
- Dashboard data aggregation

### E2E Tests
- Complete business creation flow
- Revenue tracking and payments
- Citadel Fund distribution
- Admin dashboard functionality
- User dashboard accuracy

## Security Considerations

1. **Data Encryption** - All financial data encrypted at rest and in transit
2. **Access Control** - Role-based access (user, admin, finance)
3. **Audit Logging** - Complete audit trail for all transactions
4. **Document Security** - Signed documents with tamper detection
5. **Payment Security** - PCI compliance, secure payment processing
6. **Constitutional AI** - Ethical validation of all recommendations

## Performance Targets

- Wizard step validation: < 500ms
- Payment processing: < 2 seconds
- Dashboard load: < 1 second
- Report generation: < 5 seconds
- Document generation: < 1 second

---

**Last Updated:** 2024-11-19  
**Version:** 1.0
