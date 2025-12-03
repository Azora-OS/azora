-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "knowledge_nodes" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" JSONB,
    "embeddingVector" vector(1536),
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "knowledge_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_edges" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "edgeType" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "knowledge_edges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_nodes_nodeType_idx" ON "knowledge_nodes"("nodeType");
CREATE INDEX "knowledge_nodes_path_idx" ON "knowledge_nodes"("path");
CREATE INDEX "knowledge_edges_fromId_idx" ON "knowledge_edges"("fromId");
CREATE INDEX "knowledge_edges_toId_idx" ON "knowledge_edges"("toId");
CREATE INDEX "knowledge_edges_edgeType_idx" ON "knowledge_edges"("edgeType");

-- Create vector similarity index
CREATE INDEX ON "knowledge_nodes" USING ivfflat (embeddingVector vector_cosine_ops) WITH (lists = 100);

-- AddForeignKey
ALTER TABLE "knowledge_edges" ADD CONSTRAINT "knowledge_edges_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "knowledge_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "knowledge_edges" ADD CONSTRAINT "knowledge_edges_toId_fkey" FOREIGN KEY ("toId") REFERENCES "knowledge_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
