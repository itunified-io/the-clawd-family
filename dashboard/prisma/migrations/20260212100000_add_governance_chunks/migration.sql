-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "governance_chunks" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "heading_level" INTEGER NOT NULL,
    "section_index" INTEGER NOT NULL,
    "roles_affected" TEXT[],
    "gate_type" TEXT,
    "embedding" vector(1024),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "governance_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "governance_chunks_version_idx" ON "governance_chunks"("version");

-- CreateIndex
CREATE INDEX "governance_chunks_section_idx" ON "governance_chunks"("section");

-- CreateIndex (HNSW for fast approximate nearest-neighbor cosine search)
CREATE INDEX "governance_chunks_embedding_idx" ON "governance_chunks" USING hnsw (embedding vector_cosine_ops);
