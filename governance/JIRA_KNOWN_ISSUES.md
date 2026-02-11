# Jira API Known Issues & Limitations

**Reference:** OC-24

**Last Updated:** 2026-02-10

**Applicable To:** itunified.atlassian.net Jira Cloud Instance

---

## Overview

This document tracks known API limitations and quirks specific to the itunified Jira Cloud instance. These issues were discovered during CCNTNT project automation and should inform future API integration attempts.

**Key Learning:** Always test both v2 and v3 API endpoints - this instance may not support v3 fully.

---

## Known Issues

### 1. REST API v3 Endpoints Return 404

**Issue:** Standard Jira Cloud REST API v3 endpoints return HTTP 404 (Not Found)

**Affected Endpoints:**
- `GET /rest/api/3/issues/{key}`
- `PATCH /rest/api/3/issues/{key}`
- `POST /rest/api/3/issueLink`
- `POST /rest/api/3/projects/{projectKey}/versions`

**Error Response:**
```html
HTTP 404
<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>Oops, you've found a dead link.</h1></center>
</body>
</html>
```

**Workaround:** Use REST API v2 endpoints instead (see Issue #2)

**Root Cause:** Unknown - possibly custom Jira Cloud configuration or missing API v3 license feature

---

### 2. REST API v2 Endpoints Work Correctly (Preferred)

**Working Endpoints:**
- `PUT /rest/api/2/issue/{key}` ✅ (update issue fields)
- `POST /rest/api/2/issue` ✅ (create issues/subtasks)
- `GET /rest/api/2/issue/{key}` ✅ (retrieve issue details)
- `GET /rest/api/2/search?jql=...` ✅ (search with JQL)
- `POST /rest/api/2/project/{projectKey}/version` ✅ (create versions)

**Status Code:** HTTP 201 (Created) or HTTP 204 (No Content)

**Recommendation:** Always use v2 API endpoints for production automation scripts

---

### 3. Agile API Sprint Creation — Use Global Endpoint

**Issue:** POST to board-scoped endpoint returns HTTP 405 (Method Not Allowed)

**Endpoint that FAILS (board-scoped):**
- `POST /rest/agile/1.0/board/{boardId}/sprint` → HTTP 405

**Error Response:**
```json
{
  "type": "about:blank",
  "title": "Method Not Allowed",
  "status": 405,
  "detail": "Method 'POST' is not supported.",
  "instance": "/rest/agile/1.0/board/1/sprint"
}
```

**SOLUTION — Use the global endpoint instead:**
- `POST /rest/agile/1.0/sprint` ✅ (with `originBoardId` in request body)

**Working Request:**
```json
POST /rest/agile/1.0/sprint
{
  "name": "Sprint 1",
  "originBoardId": 705,
  "startDate": "2026-02-17T00:00:00.000+01:00",
  "endDate": "2026-02-28T23:59:59.000+01:00",
  "goal": "Sprint goal text"
}
```

**Key Insight:** The board-scoped URL (`/board/{id}/sprint`) only supports GET (listing).
Sprint creation uses the **global** `/rest/agile/1.0/sprint` endpoint with the board specified
in the request body via `originBoardId`.

**Moving issues to sprints also works:**
- `POST /rest/agile/1.0/sprint/{sprintId}/issue` ✅
- Body: `{"issues": ["JCF-2", "JCF-3"]}`

**Testing:**
- ✅ Sprints 420-423 created on JCF board (board ID 705) via global endpoint
- ✅ 14 stories assigned to 4 sprints via sprint issue endpoint

---

### 4. Epic Link Field Must Use Parent Field, Not customfield_10006

**Issue:** Attempt to set Epic Link via custom field returns HTTP 400

**Problem Code:**
```json
{
  "fields": {
    "customfield_10006": "CCNTNT-2"
  }
}
```

**Result:** HTTP 400 Bad Request - invalid field reference

**Correct Approach:** Use parent field to link stories to epics

**Working Code:**
```json
{
  "fields": {
    "parent": {
      "key": "CCNTNT-2"
    }
  }
}
```

**Testing:**
- ✅ CCNTNT-20 successfully linked to CCNTNT-2 parent
- ✅ Epic burndown charts now display correctly

---

### 5. Search Endpoint May Have Permission Restrictions

**Issue:** `/rest/api/2/search` returns 0 results even for known issues

**Example Query:**
```
GET /rest/api/2/search?jql=project=CCNTNT+AND+type=Story&maxResults=100
```

**Result:** `{"issues": [], "total": 0}`

**Observation:** Direct issue retrieval via `/rest/api/2/issue/{key}` works fine, suggesting permission issue with search scope

**Impact:** Cannot use JQL search for bulk operations; must iterate issues by key

**Workaround:**
- Maintain local list of issue keys
- Use direct GET endpoints instead of search
- Fall back to Jira Web UI filtering

---

## Authentication Notes

**Method:** HTTP Basic Authentication (email:token)

**Encoding:**
```bash
credentials = base64(email:api_token)
Authorization: Basic {credentials}
```

**Important:** Token belongs to specific account - ensure correct account has project permissions

**Testing:** Always verify token with `/rest/api/2/myself` endpoint before bulk operations

---

## Recommendations for Future API Work

### 1. API Endpoint Preference Order
1. Try REST API v2 first (most reliable on this instance)
2. Avoid REST API v3 (not available)
3. Use Agile API only for read operations (GET)

### 2. Testing Strategy
- Before writing bulk scripts, test single endpoint manually
- Verify HTTP status codes match expectations
- Check error responses in detail (not just HTTP code)
- Test with correct account (check `/rest/api/2/myself`)

### 3. Alternative Approaches for Unsupported Operations

| Operation | Correct Endpoint |
|---|---|
| Create sprints | `POST /rest/agile/1.0/sprint` (global, with `originBoardId` in body) |
| Create versions | `POST /rest/api/2/version` (global, with `projectId` in body) |
| Move issues to sprint | `POST /rest/agile/1.0/sprint/{sprintId}/issue` |
| Bulk search/update | Iterate with local issue keys (search may return 0 results) |

**Pattern:** Creation endpoints are **global** (not resource-scoped). The resource
(board/project) is specified in the **request body**, not the URL path.
URL-scoped variants (`/board/{id}/sprint`, `/project/{id}/version`) only support GET.

### 4. Rate Limiting Observations

- HTTP 429 (Rate Limit) observed for rapid requests
- Recommended delay: 100-200ms between API calls
- Safe rate: 5-10 requests/second (well below 30 req/sec Jira limit)

---

## Successful Automation Results (CCNTNT Project)

Using REST API v2, successfully completed:

✅ **Phase 1: Epic Links** - 64 stories linked to parent epics (6 failed - issues didn't exist)

✅ **Phase 2: Subtasks** - 320 subtasks created (30 failed - corresponding to missing stories)

✅ **Phase 3: Labels** - 70 stories labeled (100% success rate)

**Total time:** ~7 minutes for 350+ API operations

---

## Files Related to This Issue

- `/tmp/jira_completion_v2_api.py` - Working script using REST API v2
- `/tmp/jira_v2_run.log` - Execution log with detailed error messages
- `CCNTNT` Project - Test case for this documentation

---

### 6. Version Creation — Use Global Endpoint

**Issue:** POST to project-scoped endpoint returns HTTP 405 (Method Not Allowed)

**Endpoint that FAILS (project-scoped):**
- `POST /rest/api/2/project/{projectId}/version` → HTTP 405

**Error Response:**
```json
{
  "type": "about:blank",
  "title": "Method Not Allowed",
  "status": 405,
  "detail": "Method 'POST' is not supported.",
  "instance": "/rest/api/2/project/10631/version"
}
```

**SOLUTION — Use the global endpoint instead:**
- `POST /rest/api/2/version` ✅ (with `projectId` in request body)

**Working Request:**
```json
POST /rest/api/2/version
{
  "name": "v2.0.0",
  "description": "Product Launch",
  "projectId": 10730,
  "releaseDate": "2026-02-28",
  "released": false,
  "archived": false
}
```

**Key Insight:** The project-scoped URL (`/project/{id}/version`) only supports GET (listing).
Version creation uses the **global** `/rest/api/2/version` endpoint with the project specified
in the request body via `projectId`.

**Assigning Fix Versions to issues also works:**
- `PUT /rest/api/2/issue/{key}` with `{"fields":{"fixVersions":[{"id":"10206"}]}}` ✅

**Testing:**
- ✅ Versions v2.0.0-v2.3.0 created on JCF project (project ID 10730)
- ✅ 14 stories assigned to fix versions via issue update endpoint

---

## Future Improvements

- [x] Test version creation via API - ✅ WORKS via global endpoint `POST /rest/api/2/version`
- [x] Test sprint creation via API - ✅ WORKS via global endpoint `POST /rest/agile/1.0/sprint`
- [ ] Investigate permission model for search endpoint
- [ ] Document Agile API capabilities (what works vs what doesn't)
- [ ] Create wrapper scripts that automate workarounds
- [ ] Consider n8n workflow for Web UI automation (if supported)

---

**Status:** ACTIVE - Monitor for changes when upgrading Jira Cloud

**Reviewed By:** Benjamin Büchele

**Next Review:** 2026-04-10 (or after Jira upgrade)
