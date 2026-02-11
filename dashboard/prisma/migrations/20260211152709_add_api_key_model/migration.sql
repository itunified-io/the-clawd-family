-- CreateEnum
CREATE TYPE "ApiKeyPermission" AS ENUM ('READ', 'WRITE', 'ADMIN');

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" VARCHAR(8) NOT NULL,
    "hashed_key" TEXT NOT NULL,
    "permissions" "ApiKeyPermission"[] DEFAULT ARRAY['READ']::"ApiKeyPermission"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hashed_key_key" ON "api_keys"("hashed_key");

-- CreateIndex
CREATE INDEX "api_keys_prefix_idx" ON "api_keys"("prefix");

-- CreateIndex
CREATE INDEX "api_keys_hashed_key_idx" ON "api_keys"("hashed_key");
