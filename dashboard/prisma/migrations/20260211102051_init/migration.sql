-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('CLOUDFLARE', 'HOSTINGER');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('DNS_RECORD', 'TUNNEL', 'ZERO_TRUST', 'WAF_RULE', 'VPS', 'FIREWALL', 'DOMAIN');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('DEV', 'UAT', 'PROD');

-- CreateEnum
CREATE TYPE "Lifecycle" AS ENUM ('PENDING', 'ACTIVE', 'DEPRECATED', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "GapType" AS ENUM ('UNDER_PROVISIONED', 'OVER_PROVISIONED', 'DRIFTED', 'STALE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('REQUIREMENTS', 'ARCHITECTURE', 'PLANNING', 'FRONTEND', 'BACKEND', 'QA', 'SECURITY', 'DOCUMENTATION', 'DEVOPS', 'IMPLEMENTATION_AUDIT');

-- CreateTable
CREATE TABLE "infrastructure_resources" (
    "id" TEXT NOT NULL,
    "sub_repo" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "resource_type" "ResourceType" NOT NULL,
    "environment" "Environment" NOT NULL,
    "lifecycle" "Lifecycle" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "oc_task" TEXT,
    "provisioned_at" TIMESTAMP(3),
    "last_verified" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infrastructure_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_sessions" (
    "id" TEXT NOT NULL,
    "correlation_id" TEXT NOT NULL,
    "sub_repo" TEXT NOT NULL,
    "agent_role" "AgentRole" NOT NULL,
    "jira_issue" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "model" TEXT,
    "token_usage" JSONB,
    "description" TEXT,

    CONSTRAINT "agent_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_entries" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlation_id" TEXT NOT NULL,
    "jira_issue" TEXT NOT NULL,
    "agent_role" "AgentRole" NOT NULL,
    "action_type" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "human_approved" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT,
    "token_usage" JSONB,
    "session_id" TEXT,

    CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gap_detections" (
    "id" TEXT NOT NULL,
    "sub_repo" TEXT NOT NULL,
    "gap_type" "GapType" NOT NULL,
    "provider" "Provider" NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "oc_task" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "gap_detections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "infrastructure_resources_sub_repo_idx" ON "infrastructure_resources"("sub_repo");

-- CreateIndex
CREATE INDEX "infrastructure_resources_provider_idx" ON "infrastructure_resources"("provider");

-- CreateIndex
CREATE INDEX "infrastructure_resources_environment_idx" ON "infrastructure_resources"("environment");

-- CreateIndex
CREATE INDEX "infrastructure_resources_lifecycle_idx" ON "infrastructure_resources"("lifecycle");

-- CreateIndex
CREATE INDEX "agent_sessions_sub_repo_idx" ON "agent_sessions"("sub_repo");

-- CreateIndex
CREATE INDEX "agent_sessions_status_idx" ON "agent_sessions"("status");

-- CreateIndex
CREATE INDEX "agent_sessions_agent_role_idx" ON "agent_sessions"("agent_role");

-- CreateIndex
CREATE INDEX "audit_entries_correlation_id_idx" ON "audit_entries"("correlation_id");

-- CreateIndex
CREATE INDEX "audit_entries_jira_issue_idx" ON "audit_entries"("jira_issue");

-- CreateIndex
CREATE INDEX "audit_entries_agent_role_idx" ON "audit_entries"("agent_role");

-- CreateIndex
CREATE INDEX "audit_entries_timestamp_idx" ON "audit_entries"("timestamp");

-- CreateIndex
CREATE INDEX "gap_detections_sub_repo_idx" ON "gap_detections"("sub_repo");

-- CreateIndex
CREATE INDEX "gap_detections_gap_type_idx" ON "gap_detections"("gap_type");

-- CreateIndex
CREATE INDEX "gap_detections_resolved_idx" ON "gap_detections"("resolved");

-- AddForeignKey
ALTER TABLE "audit_entries" ADD CONSTRAINT "audit_entries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "agent_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
