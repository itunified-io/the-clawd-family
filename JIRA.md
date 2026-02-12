# Jira Integration

## Project

| Field | Value |
|-------|-------|
| **Project Key** | JCF |
| **Project Name** | The Clawd Family |
| **Project URL** | https://itunified.atlassian.net/browse/JCF |
| **Board** | https://itunified.atlassian.net/jira/software/c/projects/JCF/boards/705 |
| **Board ID** | 705 |

## Confluence

| Field | Value |
|-------|-------|
| **Space Key** | TCF |
| **Space URL** | https://itunified.atlassian.net/wiki/spaces/TCF/overview |

## Epics

| Key | Epic | Status | Fix Version |
|-----|------|--------|-------------|
| JCF-1 | The Clawd Family — Product Launch v2.0.0 | Done | v2.0.0 |
| JCF-59 | Governance Operations | To Do | v2.9.0 |
| JCF-60 | The Clawd Family — Agent Persona Enhancements | To Do | v2.4.0 |
| JCF-61 | API Security and Authentication | To Do | v2.5.0 |
| JCF-62 | Dashboard Analytics and Reporting | To Do | v2.5.0 |
| JCF-63 | Real-Time Agent Activity Updates | To Do | v2.6.0 |
| JCF-64 | Alert and Notification System | To Do | v2.6.0 |
| JCF-65 | Memory RAG API — pgvector + Voyager embeddings + semantic query | To Do | v2.7.0 |
| JCF-66 | Clawd Family Dashboard Features | To Do | v2.8.0 |
| JCF-67 | External Integrations — Slack + GitHub Bots | To Do | v2.8.0 |

## Sprints

| Sprint | Dates | Goal |
|--------|-------|------|
| TCF Sprint 1 — Foundation | 17 Feb – 28 Feb 2026 | Working monorepo with Docker Compose running |
| TCF Sprint 2 — Governance RAG | 2 Mar – 13 Mar 2026 | Governance policies queryable via API |
| TCF Sprint 3 — Integration | 16 Mar – 27 Mar 2026 | Sub-repos can query governance; registry + JIRA updated |
| TCF Sprint 4 — Polish | 30 Mar – 10 Apr 2026 | Workflows, versioning, product README |
| JCF Sprint 5 - Personas | 27 Apr – 11 May 2026 | Persona Enhancements |
| JCF Sprint 6 - Security | 11 May – 25 May 2026 | API Security, Analytics, Real-Time |
| JCF Sprint 7 - Alerts | 25 May – 8 Jun 2026 | Alerts, Memory RAG |
| JCF Sprint 8 - Dashboard | 8 Jun – 22 Jun 2026 | Dashboard Features, Integrations, Governance Ops |

## Fix Versions

| Version | Description | Release Date | Status |
|---------|-------------|--------------|--------|
| v2.0.0 | Product Launch | 2026-02-11 | Released |
| v2.1.0 | Governance RAG | 2026-02-28 | Unreleased |
| v2.2.0 | Registry & Tooling | 2026-03-13 | Unreleased |
| v2.3.0 | Documentation | 2026-03-27 | Unreleased |
| v2.4.0 | Persona Enhancements | 2026-05-11 | Unreleased |
| v2.5.0 | API Security & Analytics | 2026-05-25 | Unreleased |
| v2.6.0 | Real-Time & Alerts | 2026-06-08 | Unreleased |
| v2.7.0 | Memory RAG | 2026-06-08 | Unreleased |
| v2.8.0 | Dashboard Features & Integrations | 2026-06-22 | Unreleased |
| v2.9.0 | Governance Operations | 2026-06-22 | Unreleased |

## Issue Types

| Type | ID | Usage |
|------|----|-------|
| Epic | 10000 | Feature grouping |
| Story | 10013 | User-facing deliverables |
| Task | 10006 | Technical work items |
| Sub-task | 10007 | Breakdown of stories/tasks |

## GitHub Integration

| Field | Value |
|-------|-------|
| **Repository** | itunified-io/the-clawd-family |
| **Workflows** | commit-lint, jira-sync, release-automation |
| **Branch Pattern** | `feature/JCF-<ID>-description` |
| **Commit Pattern** | `type(JCF-<ID>): description` |

## Legacy Projects (historical — no new work)

| Project | Key | URL | Purpose |
|---------|-----|-----|---------|
| claude | OC | https://itunified.atlassian.net/browse/OC | Governance (agent repo) |
| jean-clawd | JC | https://itunified.atlassian.net/browse/JC | Dashboard (jean-clawd repo) |
| Legacy Confluence | — | https://itunified.atlassian.net/wiki/spaces/jeanclawd/overview | jean-clawd docs |

All open OC and JC issues have been migrated to JCF. Source issues remain as historical reference with migration comments.

## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/rest/api/2/issue` | POST | Create issues |
| `/rest/api/2/issue/{key}` | PUT | Update issues |
| `/rest/api/2/issue/{key}/transitions` | POST | Transition status |
| `/rest/api/2/version` | POST | Create fix versions (global) |
| `/rest/agile/1.0/sprint` | POST | Create sprints (global, originBoardId in body) |
| `/rest/agile/1.0/sprint/{id}/issue` | POST | Assign issues to sprint |
| `/rest/agile/1.0/board/705/sprint` | GET | List board sprints |

## Custom Fields

| Field | ID | Usage |
|-------|-----|-------|
| Start Date | customfield_10015 | Timeline start |
| Story Point Estimate | customfield_10016 | Estimation |
| Sprint | customfield_10020 | Sprint assignment (read via Agile API) |
