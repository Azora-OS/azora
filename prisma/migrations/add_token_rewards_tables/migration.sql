-- CreateEnum
CREATE TYPE "TokenTransactionType" AS ENUM ('EARN', 'REDEEM', 'TRANSFER', 'BONUS', 'PENALTY');

-- CreateEnum
CREATE TYPE "LeaderboardType" AS ENUM ('GLOBAL', 'FRIENDS', 'CLASS');

-- CreateEnum
CREATE TYPE "TokenRedemptionType" AS ENUM ('FEATURE_UNLOCK', 'PREMIUM_CONTENT', 'MERCHANDISE', 'DONATION');

-- CreateEnum
CREATE TYPE "TokenRedemptionStatus" AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "token_balances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balanceId" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "type" "TokenTransactionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "balance" DECIMAL(20,8) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DECIMAL(20,8) NOT NULL,
    "leaderboardType" "LeaderboardType" NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_redemptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "type" "TokenRedemptionType" NOT NULL,
    "status" "TokenRedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "token_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_balances_userId_key" ON "token_balances"("userId");

-- CreateIndex
CREATE INDEX "token_transactions_userId_idx" ON "token_transactions"("userId");

-- CreateIndex
CREATE INDEX "token_transactions_type_idx" ON "token_transactions"("type");

-- CreateIndex
CREATE INDEX "token_transactions_createdAt_idx" ON "token_transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_entries_userId_leaderboardType_period_key" ON "leaderboard_entries"("userId", "leaderboardType", "period");

-- CreateIndex
CREATE INDEX "leaderboard_entries_leaderboardType_idx" ON "leaderboard_entries"("leaderboardType");

-- CreateIndex
CREATE INDEX "leaderboard_entries_period_idx" ON "leaderboard_entries"("period");

-- CreateIndex
CREATE INDEX "leaderboard_entries_rank_idx" ON "leaderboard_entries"("rank");

-- CreateIndex
CREATE INDEX "token_redemptions_userId_idx" ON "token_redemptions"("userId");

-- CreateIndex
CREATE INDEX "token_redemptions_status_idx" ON "token_redemptions"("status");

-- AddForeignKey
ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "token_balances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_redemptions" ADD CONSTRAINT "token_redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
