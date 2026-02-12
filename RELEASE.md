# Release Management

## Current Version

| Field | Value |
|-------|-------|
| **Version** | 0.2.0-beta |
| **Release Date** | 2026-02-12 |
| **Product** | The Clawd Family |
| **Jira Releases** | https://itunified.atlassian.net/projects/JCF/versions |

## Versioning Strategy

The Clawd Family uses a **beta-to-GA** release track:

- **v0.x.0-beta** — Pre-GA feature releases. Each minor bump adds one epic's worth of functionality.
- **v1.0.0** — General Availability. Reached after Memory RAG (the last core feature) is complete.
- **v1.x.0** — Post-GA enhancements and integrations.

| Bump | When |
|------|------|
| **MAJOR** | GA milestone (0.x → 1.0.0) or breaking changes post-GA |
| **MINOR** | New epic / feature set (backward compatible) |
| **PATCH** | Clarifications, bug fixes, minor updates |

## Roadmap

### Pre-GA (Beta Track)

| Version | Target Date | Epic | Description | Status |
|---------|-------------|------|-------------|--------|
| v0.1.0-beta | 2026-02-11 | JCF-1 | Product Launch — monorepo, governance, dashboard, Docker | Released |
| v0.2.0-beta | 2026-02-12 | JCF-146 | Governance RAG — embeddings, vector search, dashboard | Released |
| v0.3.0-beta | 2026-03-14 | JCF-59 | Governance Operations | Planned |
| v0.4.0-beta | 2026-03-28 | JCF-60 | Agent Persona Enhancements | Planned |
| v0.5.0-beta | 2026-04-11 | JCF-61 | API Security & Authentication | Planned |
| v0.6.0-beta | 2026-04-25 | JCF-62 | Dashboard Analytics & Reporting | Planned |
| v0.7.0-beta | 2026-05-09 | JCF-63 | Real-Time Agent Activity Updates | Planned |
| v0.8.0-beta | 2026-05-23 | JCF-64 | Alert & Notification System | Planned |
| v0.9.0-beta | 2026-06-06 | JCF-65 | Memory RAG API — pgvector + hybrid embeddings | Planned |

### GA and Post-GA

| Version | Target Date | Epic | Description | Status |
|---------|-------------|------|-------------|--------|
| v1.0.0 | 2026-06-20 | — | General Availability — production-ready agent platform | Planned |
| v1.1.0 | 2026-07-04 | JCF-66 | Dashboard Features — leaderboard + org chart | Planned |
| v1.2.0 | 2026-07-18 | JCF-67 | External Integrations — Slack + GitHub Bots | Planned |

## Release History

### v0.2.0-beta — Governance RAG Completion (2026-02-12)

**Jira:** JCF-146 | **Stories:** JCF-6 through JCF-9, JCF-147 through JCF-157

- Multi-provider embedding abstraction (Ollama, Voyage AI, OpenAI)
- Prisma migration for governance_chunks table with pgvector HNSW index
- Enhanced ingest pipeline with embedding generation and ### sub-chunking
- pgvector cosine similarity search with keyword fallback
- Dedicated /api/governance/version and /api/governance/sections endpoints
- Functional GitHub Action with error handling and verification
- Dashboard governance page with sections browser and search tester
- Sidebar rebrand: "Jean-Clawd" → "The Clawd Family"
- Updated sub-repo AGENT.md template with RAG API connection details

### v0.1.0-beta — Product Launch (2026-02-11)

**Jira:** JCF-1 | **Stories:** JCF-2 through JCF-14

- Merged governance (agent repo) + dashboard (jean-clawd repo) into single product
- Monorepo structure: `governance/` + `dashboard/`
- Governance RAG architecture via pgvector
- tcf-* Component Registry (9 components)
- JCF Jira project replaces OC + JC
- TCF Confluence space
- Docker Compose: PostgreSQL 16 + pgvector + Dashboard
- 9 AI agent personas defined in Identity Registry
- GitHub Actions: commit-lint, jira-sync, release-automation

### Legacy Releases (agent repo, v1.x — historical)

| Version | Date | Jira | Notes |
|---------|------|------|-------|
| 1.28.0 | 2026-02-11 | OC-46 | Agent Identity (persona names, Co-Authored-By) |
| 1.27.0 | 2026-02-11 | OC-45 | Component Registry |
| 1.26.x | 2026-02-11 | OC-43, OC-44 | Central Memory System + enhancements |
| 1.25.x | 2026-02-11 | OC-39, OC-42 | Story branching, autonomous ops, release mode |
| 1.24.x | 2026-02-11 | OC-39 | Infrastructure protocol, Jean-Clawd dashboard |
| 1.0.0 | 2026-02-05 | OC-1 | Initial governance |

## Release Process

1. Create Jira issue for release preparation
2. Create release branch: `release/JCF-<ID>-v<VERSION>`
3. Update this file with new version entry
4. Update `AGENT.md` version header
5. Update `CHANGELOG.md` with user-facing changes
6. Create PR, review, merge to main
7. Tag release: `git tag v<VERSION> && git push origin v<VERSION>`
8. Mark Fix Version as Released in Jira
9. Close related Jira issues
10. Create Confluence release notes page in TCF space

## Migration Notes

All open issues from legacy projects (OC, JC) were migrated to JCF on 2026-02-12:
- **OC → JCF:** 12 stories + 26 subtasks (governance, persona enhancements)
- **JC → JCF:** 24 stories + 16 subtasks (API, dashboard, integrations)
- Source issues retain migration comments; statuses left as-is for historical reference

### Version Renaming (2026-02-12)

The original v2.x.0 versioning was inherited from the legacy agent repo (v1.28.0 → v2.0.0). Since The Clawd Family is a new product that hasn't reached production maturity, all versions were renamed to a proper beta track:

- v2.0.0 → v0.1.0-beta, v2.1.0 → v0.2.0-beta, ..., v2.8.0 → v0.9.0-beta
- v1.0.0 = GA milestone (after Memory RAG)
- v2.9.0 → v1.1.0, v2.10.0 → v1.2.0 (post-GA)
