# The Clawd Family

A fully governed AI coding assistant platform with an AI Agent Family (9 personas).

## What is The Clawd Family?

The Clawd Family is a product that combines:
- **Governance** — Master AGENT.md with 9 AI agent roles, mandatory gates, and autonomous execution rules
- **Monitoring Dashboard** — Next.js 16 dashboard for tracking agent sessions, infrastructure, audit trails, and gap detection
- **Governance RAG** — Master governance policies stored in pgvector for semantic retrieval by sub-repos

## Architecture

```
the-clawd-family/
├── governance/        ← Master governance (AGENT.md, JIRA.md, RELEASE.md, templates)
├── dashboard/         ← Next.js 16 monitoring dashboard + APIs
├── docker-compose.yml ← PostgreSQL 16 + pgvector + Dashboard
```

## The Agent Family (9 Personas)

| Persona | Role | Specialty |
|---------|------|-----------|
| Reqa Clawd | Requirements Analyst | User stories, acceptance criteria |
| Archi Clawd | Solution Architect | System design, tech decisions |
| Planna Clawd | Implementation Planner | Task breakdown, sprint planning |
| Frenna Clawd | Frontend Developer | UI/UX implementation |
| Jean Clawd | Backend Developer | APIs, database, business logic |
| Tessa Clawd | QA Engineer | Testing, quality gates |
| Secu Clawd | Security Analyst | Security review, compliance |
| Docu Clawd | Technical Writer | Documentation, changelogs |
| Opsa Clawd | DevOps Engineer | CI/CD, infrastructure, deployment |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/itunified-io/the-clawd-family.git
cd the-clawd-family

# Start the full stack (PostgreSQL + pgvector + Dashboard)
docker compose up -d

# Dashboard available at http://localhost:3000

# For development
cd dashboard
npm install
npm run dev
```

## Governance RAG

Master governance policies are distributed via RAG (pgvector). Sub-repos query governance semantically:

```
POST /api/governance/search
{ "query": "What are the QA gate requirements?", "role": "QA" }
```

Sub-repo `AGENT.md` files are lightweight — they only contain:
1. RAG API connection details
2. Repo-specific additive rules
3. Component Registry entries

When RAG is unavailable: **STOP — ASK HUMAN**.

## Jira

- **Project:** JCF (The Clawd Family)
- **Board:** [JCF Board](https://itunified.atlassian.net/jira/software/c/projects/JCF/boards/705)
- **Confluence:** [TCF Space](https://itunified.atlassian.net/wiki/spaces/TCF/overview)

## License

Proprietary — ITUnified.io
