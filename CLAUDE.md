# CLAUDE.md

This is the entry point for Claude Code in **The Clawd Family** product repo.

## Mandatory

Read and follow `governance/AGENT.md` — the master governance document for all AI agent behavior.

## Repo Structure

- `governance/` — Master governance (AGENT.md, JIRA.md, RELEASE.md, templates)
- `dashboard/` — Monitoring dashboard (Next.js 16, Prisma 6, PostgreSQL 16)
- `docker-compose.yml` — Root Docker Compose (PostgreSQL + pgvector + Dashboard)

## Quick Start

```bash
# Start the full stack
docker compose up -d

# Dashboard development
cd dashboard && npm install && npm run dev
```
