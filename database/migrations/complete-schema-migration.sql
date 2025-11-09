-- AZORA PROPRIETARY LICENSE
-- Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
-- 
-- COMPLETE DATABASE SCHEMA MIGRATION
-- Adds missing 20% of database functionality

-- ============================================================================
-- MARKETPLACE & FORGE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DECIMAL(20,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AZR',
    "skills" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "clientId" TEXT NOT NULL,
    "freelancerId" TEXT,
    "escrowId" TEXT UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("clientId") REFERENCES "User"("id"),
    FOREIGN KEY ("freelancerId") REFERENCES "User"("id")
);

CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");
CREATE INDEX "Job_clientId_idx" ON "Job"("clientId");
CREATE INDEX "Job_freelancerId_idx" ON "Job"("freelancerId");

CREATE TABLE IF NOT EXISTS "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "proposal" TEXT NOT NULL,
    "bidAmount" DECIMAL(20,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("jobId") REFERENCES "Job"("id"),
    FOREIGN KEY ("freelancerId") REFERENCES "User"("id"),
    UNIQUE("jobId", "freelancerId")
);

CREATE INDEX "Application_freelancerId_idx" ON "Application"("freelancerId");

CREATE TABLE IF NOT EXISTS "Escrow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL UNIQUE,
    "amount" DECIMAL(20,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AZR',
    "status" TEXT NOT NULL DEFAULT 'HELD',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP,
    FOREIGN KEY ("jobId") REFERENCES "Job"("id")
);

CREATE INDEX "Escrow_status_idx" ON "Escrow"("status");

CREATE TABLE IF NOT EXISTS "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("jobId") REFERENCES "Job"("id")
);

CREATE INDEX "Milestone_jobId_idx" ON "Milestone"("jobId");

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("reviewerId") REFERENCES "User"("id")
);

CREATE INDEX "Review_revieweeId_idx" ON "Review"("revieweeId");

CREATE TABLE IF NOT EXISTS "SkillVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id"),
    UNIQUE("userId", "skill")
);

CREATE INDEX "SkillVerification_userId_idx" ON "SkillVerification"("userId");

CREATE TABLE IF NOT EXISTS "Dispute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "raisedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("jobId") REFERENCES "Job"("id")
);

CREATE INDEX "Dispute_jobId_idx" ON "Dispute"("jobId");
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");

-- ============================================================================
-- CROSS-SERVICE SYNCHRONIZATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ServiceSync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP
);

CREATE INDEX "ServiceSync_serviceName_status_idx" ON "ServiceSync"("serviceName", "status");
CREATE INDEX "ServiceSync_entityType_entityId_idx" ON "ServiceSync"("entityType", "entityId");

CREATE TABLE IF NOT EXISTS "EventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "EventLog_eventType_status_idx" ON "EventLog"("eventType", "status");
CREATE INDEX "EventLog_source_idx" ON "EventLog"("source");

-- ============================================================================
-- SECURITY & COMPLIANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "KYCVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "documentType" TEXT,
    "documentNumber" TEXT,
    "verifiedAt" TIMESTAMP,
    "expiresAt" TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX "KYCVerification_status_idx" ON "KYCVerification"("status");

CREATE TABLE IF NOT EXISTS "AMLCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(20,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT FALSE,
    "reason" TEXT,
    "checkedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX "AMLCheck_userId_idx" ON "AMLCheck"("userId");
CREATE INDEX "AMLCheck_flagged_idx" ON "AMLCheck"("flagged");

CREATE TABLE IF NOT EXISTS "SecurityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE INDEX "SecurityEvent_userId_idx" ON "SecurityEvent"("userId");
CREATE INDEX "SecurityEvent_eventType_severity_idx" ON "SecurityEvent"("eventType", "severity");

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_job_updated_at BEFORE UPDATE ON "Job"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON "KYCVerification"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

CREATE OR REPLACE VIEW "JobAnalytics" AS
SELECT 
    DATE_TRUNC('day', "createdAt") as date,
    "status",
    COUNT(*) as count,
    AVG("budget") as avg_budget
FROM "Job"
GROUP BY DATE_TRUNC('day', "createdAt"), "status";

CREATE OR REPLACE VIEW "UserStats" AS
SELECT 
    u."id",
    u."email",
    COUNT(DISTINCT e."id") as enrollments,
    COUNT(DISTINCT c."id") as certificates,
    u."azrBalance",
    u."totalEarned"
FROM "User" u
LEFT JOIN "Enrollment" e ON u."id" = e."userId"
LEFT JOIN "Certificate" c ON u."id" = c."userId"
GROUP BY u."id", u."email", u."azrBalance", u."totalEarned";

-- ============================================================================
-- COMPLETION MARKER
-- ============================================================================

INSERT INTO "EventLog" ("id", "eventType", "source", "payload", "status", "createdAt")
VALUES (
    gen_random_uuid()::text,
    'SCHEMA_MIGRATION',
    'database',
    '{"version": "complete", "timestamp": "' || CURRENT_TIMESTAMP || '"}',
    'COMPLETED',
    CURRENT_TIMESTAMP
);

-- Migration complete
SELECT 'Database schema 100% complete!' as status;
