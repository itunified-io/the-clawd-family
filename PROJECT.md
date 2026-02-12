# Project Overview

## The Clawd Family

A fully governed AI coding assistant platform with an AI Agent Family of 9 personas.

| Field | Value |
|-------|-------|
| **Product** | The Clawd Family |
| **Organization** | ITUnified.io |
| **Repository** | [itunified-io/the-clawd-family](https://github.com/itunified-io/the-clawd-family) |
| **Jira Project** | [JCF](https://itunified.atlassian.net/browse/JCF) |
| **Confluence** | [TCF Space](https://itunified.atlassian.net/wiki/spaces/TCF/overview) |
| **Current Version** | 2.0.0 |
| **License** | Proprietary |

## What It Does

The Clawd Family combines three pillars into a single product:

1. **Governance** — Master AGENT.md with mandatory gates, role-based permissions, memory system, and conflict resolution rules for AI coding agents
2. **Monitoring Dashboard** — Next.js 16 dashboard for tracking agent sessions, infrastructure resources, audit trails, and gap detection
3. **Governance RAG** — Semantic retrieval of governance policies via pgvector, enabling sub-repos to query governance without local copies

## Architecture

```
the-clawd-family/
├── governance/          ← Master governance (AGENT.md, templates, policies)
├── dashboard/           ← Next.js 16 + Prisma 6 + PostgreSQL 16
├── docker-compose.yml   ← Full stack: PostgreSQL + pgvector + Dashboard
├── AGENT.md             ← Master governance document
├── JIRA.md              ← Jira project details and board info
├── RELEASE.md           ← Version history and roadmap
├── PROJECT.md           ← This file
├── CLAUDE.md            ← Claude Code entry point
├── README.md            ← Getting started guide
└── CHANGELOG.md         ← User-facing changelog
```

## The Agent Family (9 Personas)

| Persona | Emoji | Role | Specialty |
|---------|-------|------|-----------|
| Reqa Clawd | :clipboard: | Requirements Analyst | User stories, acceptance criteria |
| Archi Clawd | :building_construction: | Solution Architect | System design, tech decisions |
| Planna Clawd | :calendar: | Implementation Planner | Task breakdown, sprint planning |
| Frenna Clawd | :art: | Frontend Developer | UI/UX, React, Next.js |
| Jean Clawd | :gear: | Backend Developer | APIs, database, business logic |
| Tessa Clawd | :test_tube: | QA Engineer | Testing, quality gates |
| Secu Clawd | :shield: | Security Analyst | Security review, compliance |
| Docu Clawd | :books: | Technical Writer | Documentation, changelogs |
| Opsa Clawd | :rocket: | DevOps Engineer | CI/CD, infrastructure, deployment |

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 16 |
| ORM | Prisma | 6 |
| Database | PostgreSQL + pgvector | 16 |
| Runtime | Node.js (Alpine) | 22 |
| Container | Docker Compose | latest |
| Embeddings | Voyager (voyage-3) | 1024-dim |
| CI/CD | GitHub Actions | — |

## Key Documents

| Document | Purpose |
|----------|---------|
| [AGENT.md](AGENT.md) | Master governance — all agent rules, roles, gates, memory |
| [JIRA.md](JIRA.md) | Jira project, board, sprints, fix versions |
| [RELEASE.md](RELEASE.md) | Version history, roadmap, release process |
| [CLAUDE.md](CLAUDE.md) | Claude Code entry point and quick start |
| [README.md](README.md) | Getting started, architecture overview |
| [CHANGELOG.md](CHANGELOG.md) | User-facing change history |

## Governance Distribution

Sub-repos do **not** maintain local copies of governance. Instead:

1. Master governance lives in `AGENT.md` (this repo)
2. On commit, AGENT.md is chunked, embedded, and stored in pgvector
3. Sub-repos query governance semantically via `POST /api/governance/search`
4. Sub-repo AGENT.md files are lightweight — only RAG connection + repo-specific rules
5. When RAG is unavailable: **STOP — ASK HUMAN**

## Active Epics

| Epic | Description | Target Version |
|------|-------------|---------------|
| JCF-59 | Governance Operations | v2.9.0 |
| JCF-60 | Agent Persona Enhancements | v2.4.0 |
| JCF-61 | API Security and Authentication | v2.5.0 |
| JCF-62 | Dashboard Analytics and Reporting | v2.5.0 |
| JCF-63 | Real-Time Agent Activity Updates | v2.6.0 |
| JCF-64 | Alert and Notification System | v2.6.0 |
| JCF-65 | Memory RAG API | v2.7.0 |
| JCF-66 | Clawd Family Dashboard Features | v2.8.0 |
| JCF-67 | External Integrations — Slack + GitHub Bots | v2.8.0 |

## Legacy Repos (historical — no new work)

| Repo | Purpose | Jira |
|------|---------|------|
| [agent](https://github.com/itunified-io/agent) | Original governance repo | OC |
| [jclawd](https://github.com/itunified-io/jclawd) | Original dashboard repo | JC |

Both repos remain as historical archives. All active development happens in `the-clawd-family`.
