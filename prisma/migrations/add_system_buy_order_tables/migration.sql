-- CreateEnum for RevenueSource
CREATE TYPE "RevenueSource" AS ENUM ('course_sale', 'subscription', 'other');

-- CreateEnum for BuyOrderStatus
CREATE TYPE "BuyOrderStatus" AS ENUM ('pending', 'completed', 'failed');

-- CreateTable SystemBuyOrderRevenue
CREATE TABLE "system_buy_order_revenue" (
    "id" TEXT NOT NULL,
    "source" "RevenueSource" NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_buy_order_revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable SystemBuyOrderHistory
CREATE TABLE "system_buy_order_history" (
    "id" TEXT NOT NULL,
    "revenueUsed" DECIMAL(20,8) NOT NULL,
    "tokensAcquired" DECIMAL(20,8) NOT NULL,
    "pricePerToken" DECIMAL(20,8) NOT NULL,
    "executionTime" TIMESTAMP(3) NOT NULL,
    "blockchainTxHash" TEXT,
    "status" "BuyOrderStatus" NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_buy_order_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for SystemBuyOrderRevenue
CREATE INDEX "system_buy_order_revenue_source_idx" ON "system_buy_order_revenue"("source");
CREATE INDEX "system_buy_order_revenue_recordedAt_idx" ON "system_buy_order_revenue"("recordedAt");
CREATE INDEX "system_buy_order_revenue_createdAt_idx" ON "system_buy_order_revenue"("createdAt");

-- CreateIndex for SystemBuyOrderHistory
CREATE INDEX "system_buy_order_history_status_idx" ON "system_buy_order_history"("status");
CREATE INDEX "system_buy_order_history_executionTime_idx" ON "system_buy_order_history"("executionTime");
CREATE INDEX "system_buy_order_history_createdAt_idx" ON "system_buy_order_history"("createdAt");
CREATE UNIQUE INDEX "system_buy_order_history_blockchainTxHash_key" ON "system_buy_order_history"("blockchainTxHash") WHERE "blockchainTxHash" IS NOT NULL;
