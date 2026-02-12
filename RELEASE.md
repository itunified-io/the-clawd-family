# Release Management

## Current Version

| Field | Value |
|-------|-------|
| **Version** | 2.0.0 |
| **Release Date** | 2026-02-11 |
| **Product** | The Clawd Family |
| **Jira Releases** | https://itunified.atlassian.net/projects/JCF/versions |

## Versioning Strategy

| Bump | When |
|------|------|
| **MAJOR** | Breaking changes to governance rules or product architecture |
| **MINOR** | New governance sections, policies, features, or epics (backward compatible) |
| **PATCH** | Clarifications, typo fixes, minor updates |

## Roadmap

| Version | Target Date | Epic(s) | Status |
|---------|-------------|---------|--------|
| v2.0.0 | 2026-02-11 | JCF-1 Product Launch | Released |
| v2.1.0 | 2026-02-28 | Governance RAG | Planned |
| v2.2.0 | 2026-03-13 | Registry & Tooling | Planned |
| v2.3.0 | 2026-03-27 | Documentation | Planned |
| v2.4.0 | 2026-05-11 | JCF-60 Persona Enhancements | Planned |
| v2.5.0 | 2026-05-25 | JCF-61 API Security, JCF-62 Analytics | Planned |
| v2.6.0 | 2026-06-08 | JCF-63 Real-Time, JCF-64 Alerts | Planned |
| v2.7.0 | 2026-06-08 | JCF-65 Memory RAG | Planned |
| v2.8.0 | 2026-06-22 | JCF-66 Dashboard Features, JCF-67 Integrations | Planned |
| v2.9.0 | 2026-06-22 | JCF-59 Governance Operations | Planned |

## Release History

### v2.0.0 — Product Launch (2026-02-11)

**Jira:** JCF-1 | **Stories:** JCF-2 through JCF-14 (all Done)

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
