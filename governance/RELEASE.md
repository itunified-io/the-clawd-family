# Release Management

## Current Version
- **Version:** 2.0.0
- **Release Date:** 2026-02-11
- **Product:** The Clawd Family
- **Jira Release:** https://itunified.atlassian.net/projects/JCF/versions

## Versioning Strategy
- **MAJOR:** Breaking changes to governance rules or product architecture
- **MINOR:** New governance sections, policies, or features (backward compatible)
- **PATCH:** Clarifications, typo fixes, minor updates

## Release History

| Version | Date | Jira Issues | Notes |
|---------|------|-------------|-------|
| 2.0.0 | 2026-02-11 | JCF-1 | Product launch — merged governance (agent repo) + dashboard (jean-clawd repo); Governance RAG via pgvector; tcf-* Component Registry; JCF replaces OC + JC |

### Legacy Releases (agent repo, v1.x — historical)

| Version | Date | Jira Issues | Notes |
|---------|------|-------------|-------|
| 1.28.0 | 2026-02-11 | OC-46 | Agent Identity (persona names, Co-Authored-By) |
| 1.27.0 | 2026-02-11 | OC-45 | Component Registry |
| 1.26.x | 2026-02-11 | OC-43, OC-44 | Central Memory System + enhancements |
| 1.25.x | 2026-02-11 | OC-39, OC-42 | Story branching, autonomous ops, release mode |
| 1.24.x | 2026-02-11 | OC-39 | Infrastructure protocol, Jean-Clawd dashboard |
| 1.0.0 | 2026-02-05 | OC-1 | Initial governance |

## Release Process

1. Create Jira issue for release preparation
2. Create release branch: `release/JCF-<ID>-v<VERSION>`
3. Update this file with new version and changelog
4. Update `governance/AGENT.md` version header
5. Create PR, review, merge to main
6. Tag release in Git: `git tag v<VERSION>`
7. Push tag: `git push origin v<VERSION>`
8. Close related Jira issues with Fix Version
9. Create Confluence release notes page in TCF space
