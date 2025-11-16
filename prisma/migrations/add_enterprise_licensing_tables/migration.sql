-- CreateEnum
CREATE TYPE "EnterpriseTier" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EnterpriseStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CustomizationType" AS ENUM ('BRANDING', 'DOMAIN', 'SSO', 'API', 'FEATURE', 'INTEGRATION');

-- CreateTable
CREATE TABLE "enterprise_licenses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "tier" "EnterpriseTier" NOT NULL,
    "status" "EnterpriseStatus" NOT NULL DEFAULT 'ACTIVE',
    "licenseKey" TEXT NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxCourses" INTEGER,
    "maxApiCalls" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "customDomain" TEXT,
    "whiteLabel" BOOLEAN NOT NULL DEFAULT false,
    "ssoEnabled" BOOLEAN NOT NULL DEFAULT false,
    "apiAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_organizations" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "country" TEXT,
    "city" TEXT,
    "address" TEXT,
    "adminUserId" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_usage_tracking" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "coursesCreated" INTEGER NOT NULL DEFAULT 0,
    "apiCallsUsed" INTEGER NOT NULL DEFAULT 0,
    "storageUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "enterprise_usage_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_support_tickets" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "SupportPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "enterprise_support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_customizations" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "type" "CustomizationType" NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_licenses_organizationId_key" ON "enterprise_licenses"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_licenses_licenseKey_key" ON "enterprise_licenses"("licenseKey");

-- CreateIndex
CREATE INDEX "enterprise_licenses_organizationId_idx" ON "enterprise_licenses"("organizationId");

-- CreateIndex
CREATE INDEX "enterprise_licenses_status_idx" ON "enterprise_licenses"("status");

-- CreateIndex
CREATE INDEX "enterprise_licenses_expiryDate_idx" ON "enterprise_licenses"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_organizations_licenseId_key" ON "enterprise_organizations"("licenseId");

-- CreateIndex
CREATE INDEX "enterprise_usage_tracking_licenseId_idx" ON "enterprise_usage_tracking"("licenseId");

-- CreateIndex
CREATE INDEX "enterprise_usage_tracking_date_idx" ON "enterprise_usage_tracking"("date");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_support_tickets_ticketNumber_key" ON "enterprise_support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "enterprise_support_tickets_licenseId_idx" ON "enterprise_support_tickets"("licenseId");

-- CreateIndex
CREATE INDEX "enterprise_support_tickets_status_idx" ON "enterprise_support_tickets"("status");

-- CreateIndex
CREATE INDEX "enterprise_support_tickets_priority_idx" ON "enterprise_support_tickets"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_customizations_licenseId_type_key_key" ON "enterprise_customizations"("licenseId", "type", "key");

-- CreateIndex
CREATE INDEX "enterprise_customizations_licenseId_idx" ON "enterprise_customizations"("licenseId");

-- AddForeignKey
ALTER TABLE "enterprise_organizations" ADD CONSTRAINT "enterprise_organizations_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "enterprise_licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_usage_tracking" ADD CONSTRAINT "enterprise_usage_tracking_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "enterprise_licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_support_tickets" ADD CONSTRAINT "enterprise_support_tickets_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "enterprise_licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_customizations" ADD CONSTRAINT "enterprise_customizations_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "enterprise_licenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
