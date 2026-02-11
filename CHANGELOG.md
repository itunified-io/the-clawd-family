# Changelog

All notable changes to The Clawd Family product.

## [v2.0.0] - 2026-02-11

### Added
- Initial product release merging governance (agent repo) + dashboard (jean-clawd repo)
- Monorepo structure: `governance/` + `dashboard/`
- Root docker-compose.yml with PostgreSQL 16 + pgvector + Dashboard
- Governance RAG API (`/api/governance/*`) for semantic governance distribution
- Component Registry with `tcf-*` components
- Sub-repo templates for onboarding new repos
- GitHub Actions workflows (commit lint, Jira sync, release automation)
- 9 AI agent personas (The Clawd Family)

### Changed
- AGENT.md version bumped to v2.0.0 (new product)
- JIRA.md updated for JCF project + TCF Confluence
- Component Registry uses `tcf-*` naming (replaces `agent-*` and `jc-*`)
