-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "staked" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "earned" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fromId" TEXT,
    "toId" TEXT,
    "amount" DECIMAL(18,8) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stake" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "rewardRate" DECIMAL(5,4) NOT NULL DEFAULT 0.05,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiningRecord" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "tokensEarned" DECIMAL(18,8) NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "minedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MiningRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomicMetrics" (
    "id" TEXT NOT NULL,
    "totalSupply" DECIMAL(18,8) NOT NULL,
    "circulatingSupply" DECIMAL(18,8) NOT NULL,
    "totalStaked" DECIMAL(18,8) NOT NULL,
    "totalMinted" DECIMAL(18,8) NOT NULL,
    "activeWallets" INTEGER NOT NULL,
    "dailyVolume" DECIMAL(18,8) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EconomicMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_address_idx" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Transaction_fromId_idx" ON "Transaction"("fromId");

-- CreateIndex
CREATE INDEX "Transaction_toId_idx" ON "Transaction"("toId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Stake_walletId_idx" ON "Stake"("walletId");

-- CreateIndex
CREATE INDEX "Stake_status_idx" ON "Stake"("status");

-- CreateIndex
CREATE INDEX "MiningRecord_walletId_idx" ON "MiningRecord"("walletId");

-- CreateIndex
CREATE INDEX "MiningRecord_activityType_idx" ON "MiningRecord"("activityType");

-- CreateIndex
CREATE INDEX "MiningRecord_minedAt_idx" ON "MiningRecord"("minedAt");

-- CreateIndex
CREATE INDEX "EconomicMetrics_recordedAt_idx" ON "EconomicMetrics"("recordedAt");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiningRecord" ADD CONSTRAINT "MiningRecord_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
