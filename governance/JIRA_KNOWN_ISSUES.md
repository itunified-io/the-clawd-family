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

### 3. Agile API Sprint Creation Not Supported

**Issue:** POST to create sprints returns HTTP 405 (Method Not Allowed)

**Affected Endpoint:**
- `POST /rest/agile/1.0/board/{boardId}/sprint`

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

**Impact:** Sprints must be created via Jira Web UI, cannot be automated via API

**Workaround:** Manual Web UI creation or via Confluence page setup

**Note:** Other Agile API endpoints (GET sprint details, move issues to sprint) work correctly

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

| Unsupported Operation | Alternative |
|---|---|
| Create sprints via API | Web UI or Confluence-based automation |
| Bulk search/update | Iterate with local issue keys |
| Agile API sprint creation | Manual Web UI setup |

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

### 6. Version Creation via API Not Supported (HTTP 405)

**Issue:** POST to create versions returns HTTP 405 (Method Not Allowed)

**Affected Endpoint:**
- `POST /rest/api/2/project/{projectId}/version`

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

**Tested With:** Project ID 10631 (CCNTNT), both hardcoded IDs and dynamic lookup

**Impact:** Versions must be created via Jira Web UI, cannot be automated via API

**Workaround:** Manual Web UI creation via Project Settings → Releases/Versions

**Note:** GET endpoint for versions works correctly; only POST is unsupported

---

## Future Improvements

- [x] Test version creation via API - CONFIRMED NOT SUPPORTED
- [x] Test sprint creation via API - CONFIRMED NOT SUPPORTED
- [ ] Investigate permission model for search endpoint
- [ ] Document Agile API capabilities (what works vs what doesn't)
- [ ] Create wrapper scripts that automate workarounds
- [ ] Consider n8n workflow for Web UI automation (if supported)

---

**Status:** ACTIVE - Monitor for changes when upgrading Jira Cloud

**Reviewed By:** Benjamin Büchele

**Next Review:** 2026-04-10 (or after Jira upgrade)
