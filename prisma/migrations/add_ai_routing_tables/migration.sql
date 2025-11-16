-- CreateEnum for QueryComplexity
CREATE TYPE "QueryComplexity" AS ENUM ('SIMPLE', 'MODERATE', 'COMPLEX');

-- CreateEnum for RoutingTier
CREATE TYPE "RoutingTier" AS ENUM ('LOCAL_LLM', 'RAP_SYSTEM', 'EXTERNAL_LLM');

-- CreateTable QueryClassification
CREATE TABLE "query_classifications" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "classifiedAs" "QueryComplexity" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "routedTo" "RoutingTier" NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "cost" DECIMAL(12,8) NOT NULL,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "query_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable RoutingMetrics
CREATE TABLE "routing_metrics" (
    "id" TEXT NOT NULL,
    "routingTier" "RoutingTier" NOT NULL,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "successfulRequests" INTEGER NOT NULL DEFAULT 0,
    "failedRequests" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" INTEGER NOT NULL,
    "averageCost" DECIMAL(12,8) NOT NULL,
    "cacheHits" INTEGER NOT NULL DEFAULT 0,
    "cacheMisses" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routing_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable AIRoutingCache
CREATE TABLE "ai_routing_cache" (
    "id" TEXT NOT NULL,
    "queryHash" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "routingTier" "RoutingTier" NOT NULL,
    "cost" DECIMAL(12,8) NOT NULL,
    "ttl" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_routing_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for QueryClassification
CREATE INDEX "query_classifications_classifiedAs_idx" ON "query_classifications"("classifiedAs");
CREATE INDEX "query_classifications_routedTo_idx" ON "query_classifications"("routedTo");
CREATE INDEX "query_classifications_userId_idx" ON "query_classifications"("userId");
CREATE INDEX "query_classifications_createdAt_idx" ON "query_classifications"("createdAt");

-- CreateIndex for RoutingMetrics
CREATE UNIQUE INDEX "routing_metrics_routingTier_key" ON "routing_metrics"("routingTier");
CREATE INDEX "routing_metrics_routingTier_idx" ON "routing_metrics"("routingTier");
CREATE INDEX "routing_metrics_lastUpdated_idx" ON "routing_metrics"("lastUpdated");

-- CreateIndex for AIRoutingCache
CREATE UNIQUE INDEX "ai_routing_cache_queryHash_key" ON "ai_routing_cache"("queryHash");
CREATE INDEX "ai_routing_cache_routingTier_idx" ON "ai_routing_cache"("routingTier");
CREATE INDEX "ai_routing_cache_expiresAt_idx" ON "ai_routing_cache"("expiresAt");
CREATE INDEX "ai_routing_cache_createdAt_idx" ON "ai_routing_cache"("createdAt");

-- AddForeignKey for QueryClassification
ALTER TABLE "query_classifications" ADD CONSTRAINT "query_classifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
