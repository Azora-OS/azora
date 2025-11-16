-- CreateEnum for BurnTransactionType
CREATE TYPE "BurnTransactionType" AS ENUM ('COURSE_SALE', 'EARNINGS_WITHDRAWAL', 'TOKEN_REDEMPTION');

-- CreateEnum for BlockchainStatus
CREATE TYPE "BlockchainStatus" AS ENUM ('PENDING', 'PROCESSING', 'CONFIRMED', 'FAILED');

-- CreateTable TokenSupply
CREATE TABLE "token_supply" (
    "id" TEXT NOT NULL,
    "totalSupply" DECIMAL(20,8) NOT NULL,
    "circulatingSupply" DECIMAL(20,8) NOT NULL,
    "burnedSupply" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_supply_pkey" PRIMARY KEY ("id")
);

-- CreateTable BurnTransaction
CREATE TABLE "burn_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "burnRate" DOUBLE PRECISION NOT NULL,
    "burnedAmount" DECIMAL(20,8) NOT NULL,
    "transactionType" "BurnTransactionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "blockchainTxHash" TEXT,
    "blockchainStatus" "BlockchainStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "burn_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProofOfKnowledge
CREATE TABLE "proof_of_knowledge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "certificateId" TEXT NOT NULL,
    "verificationHash" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proof_of_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for BurnTransaction
CREATE INDEX "burn_transactions_userId_idx" ON "burn_transactions"("userId");
CREATE INDEX "burn_transactions_transactionType_idx" ON "burn_transactions"("transactionType");
CREATE INDEX "burn_transactions_blockchainStatus_idx" ON "burn_transactions"("blockchainStatus");
CREATE INDEX "burn_transactions_createdAt_idx" ON "burn_transactions"("createdAt");

-- CreateIndex for ProofOfKnowledge
CREATE UNIQUE INDEX "proof_of_knowledge_certificateId_key" ON "proof_of_knowledge"("certificateId");
CREATE UNIQUE INDEX "proof_of_knowledge_verificationHash_key" ON "proof_of_knowledge"("verificationHash");
CREATE UNIQUE INDEX "proof_of_knowledge_userId_courseId_key" ON "proof_of_knowledge"("userId", "courseId");
CREATE INDEX "proof_of_knowledge_userId_idx" ON "proof_of_knowledge"("userId");
CREATE INDEX "proof_of_knowledge_courseId_idx" ON "proof_of_knowledge"("courseId");
CREATE INDEX "proof_of_knowledge_completionDate_idx" ON "proof_of_knowledge"("completionDate");

-- AddForeignKey for BurnTransaction
ALTER TABLE "burn_transactions" ADD CONSTRAINT "burn_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for ProofOfKnowledge
ALTER TABLE "proof_of_knowledge" ADD CONSTRAINT "proof_of_knowledge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
