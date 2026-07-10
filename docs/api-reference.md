# API Reference

## Base URL

Local development:

```text
http://localhost:4000
```

API routes are mounted under:

```text
/api
```

## Authentication

Protected routes require a bearer token:

```http
Authorization: Bearer <accessToken>
```

Obtain a token from `POST /api/auth/register` or `POST /api/auth/login`.

## Error Response Shape

All error responses share one envelope:

```json
{
  "error": {
    "code": "string_error_code",
    "message": "Human-readable, safe-to-display message.",
    "details": {}
  }
}
```

`details` is optional and only present for validation failures (`400`) or, in `development` only, database constraint failures (`409`).

Common status codes across the API:

| Status | Meaning |
| --- | --- |
| `400` | Request body, params, or query failed Zod validation. `error.code` is `validation_failed`. |
| `401` | Missing, malformed, or expired bearer token. `error.code` is `authentication_required` or `invalid_token`. |
| `403` | Authenticated, but the user's role does not permit this action. `error.code` is `permission_denied`. |
| `404` | The requested resource, or a referenced resource (service, user, incident), does not exist. |
| `409` | The request conflicts with the current state (invalid status transition, duplicate email, database constraint). |
| `500` | Unexpected server error. `error.code` is `internal_server_error`; no internal detail is exposed. |

## Health

```http
GET /health
```

Liveness check. Does not touch the database.

Response `200`:

```json
{
  "status": "ok",
  "service": "incidenttrack-backend",
  "timestamp": "2026-07-08T12:00:00.000Z"
}
```

```http
GET /health/ready
```

Readiness check. Runs `SELECT 1` through Prisma.

Response `200` (database reachable):

```json
{
  "status": "ok",
  "service": "incidenttrack-backend",
  "database": "connected",
  "timestamp": "2026-07-08T12:00:00.000Z"
}
```

Response `503` (database unreachable):

```json
{
  "status": "unavailable",
  "service": "incidenttrack-backend",
  "database": "unreachable",
  "timestamp": "2026-07-08T12:00:00.000Z"
}
```

## Authentication Routes

### Register

```http
POST /api/auth/register
```

No authentication required.

Request body:

```json
{
  "email": "person@example.com",
  "name": "Person Name",
  "password": "at-least-8-characters"
}
```

| Field | Type | Rules |
| --- | --- | --- |
| `email` | string | Valid email format. Stored lowercased. |
| `name` | string | 2 to 120 characters. |
| `password` | string | 8 to 128 characters. |

Response `201`:

```json
{
  "user": {
    "id": "uuid",
    "email": "person@example.com",
    "name": "Person Name",
    "role": "RESPONDER",
    "createdAt": "2026-07-08T12:00:00.000Z"
  },
  "accessToken": "jwt-string"
}
```

New accounts are always created with the `RESPONDER` role. An admin must promote a user afterward.

Errors: `400` invalid body, `409 email_already_registered`.

### Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "person@example.com",
  "password": "at-least-8-characters"
}
```

Response `200`: same shape as register (`user`, `accessToken`).

Errors: `400` invalid body, `401 invalid_credentials` (returned identically for a wrong password and an unknown email, to avoid confirming which emails are registered).

### Current User

```http
GET /api/auth/me
```

Requires bearer token.

Response `200`:

```json
{
  "user": {
    "id": "uuid",
    "email": "person@example.com",
    "name": "Person Name",
    "role": "RESPONDER",
    "createdAt": "2026-07-08T12:00:00.000Z"
  }
}
```

Errors: `401 authentication_required` (no header), `401 invalid_token` (malformed or expired), `404 user_not_found` (token valid but user was deleted).

## Users

All routes require an authenticated `ADMIN`.

```http
GET /api/users
```

Response `200`:

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "person@example.com",
      "name": "Person Name",
      "role": "RESPONDER",
      "createdAt": "2026-07-08T12:00:00.000Z",
      "updatedAt": "2026-07-08T12:00:00.000Z"
    }
  ]
}
```

```http
PATCH /api/users/:id/role
```

Request body:

```json
{
  "role": "RESPONDER"
}
```

Allowed roles: `ADMIN`, `RESPONDER`, `VIEWER`.

Response `200`: `{ "user": { ...same shape as above } }`.

Errors: `403` (caller is not an admin), `404 user_not_found`, `409 last_admin_required` (rejected because it would leave zero admins).

## Services

All routes require authentication. Read access is open to `ADMIN`, `RESPONDER`, and `VIEWER`; writes require `ADMIN` or `RESPONDER`.

```http
GET /api/services
```

Response `200`:

```json
{
  "services": [
    {
      "id": "uuid",
      "slug": "public-api",
      "name": "Public API",
      "description": "Primary API consumed by frontend clients.",
      "status": "OPERATIONAL",
      "createdAt": "2026-07-08T12:00:00.000Z",
      "updatedAt": "2026-07-08T12:00:00.000Z",
      "_count": { "incidents": 3 }
    }
  ]
}
```

```http
GET /api/services/:id
```

Response `200`: a single service object including its 10 most recent incidents.

Errors: `404 service_not_found`.

```http
POST /api/services
```

Requires `ADMIN` or `RESPONDER`.

Request body:

```json
{
  "name": "Public API",
  "slug": "public-api",
  "description": "Primary API consumed by frontend clients."
}
```

`slug` is optional; when omitted it is derived from `name`. `description` is optional.

Response `201`: `{ "service": { ...same shape, without _count } }`.

Errors: `400 invalid_service_slug` (name could not produce a usable slug), `409` (slug already in use).

```http
PATCH /api/services/:id/status
```

Requires `ADMIN` or `RESPONDER`.

Request body:

```json
{
  "status": "DEGRADED"
}
```

Allowed statuses: `OPERATIONAL`, `DEGRADED`, `OUTAGE`, `MAINTENANCE`.

Response `200`: `{ "service": {...} }`. Errors: `404 service_not_found`.

## Incidents

All routes require authentication. Read access is open to `ADMIN`, `RESPONDER`, and `VIEWER`; writes require `ADMIN` or `RESPONDER`.

```http
GET /api/incidents
```

Query filters (all optional): `status`, `severity`, `serviceId`, `ownerId`, `page` (default `1`), `pageSize` (default `20`, max `100`).

Response `200`:

```json
{
  "incidents": [
    {
      "id": "uuid",
      "title": "API returning 500s",
      "summary": "Elevated error rates on the public API.",
      "severity": "SEV2",
      "status": "OPEN",
      "serviceId": "uuid",
      "ownerId": "uuid",
      "openedAt": "2026-07-08T12:00:00.000Z",
      "mitigatedAt": null,
      "resolvedAt": null,
      "reviewedAt": null,
      "service": { "id": "uuid", "name": "Public API", "slug": "public-api" },
      "owner": { "id": "uuid", "email": "person@example.com", "name": "Person Name", "role": "RESPONDER" },
      "_count": { "timeline": 1, "actionItems": 0 }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

```http
GET /api/incidents/:id
```

Response `200`: a single incident including full `timeline`, `postmortem` (or `null`), and `actionItems`.

Errors: `404 incident_not_found`.

```http
POST /api/incidents
```

Requires `ADMIN` or `RESPONDER`.

Request body:

```json
{
  "title": "Elevated API errors",
  "summary": "The public API is returning elevated 500 responses.",
  "severity": "SEV2",
  "serviceId": "service-uuid",
  "ownerId": "user-uuid"
}
```

`ownerId` is optional. Creating an incident opens it with status `OPEN`, writes an initial timeline entry, and updates the affected service's status: `SEV1` forces `OUTAGE`, `SEV2` forces `DEGRADED`, `SEV3`/`SEV4` leave the service status unchanged.

Response `201`: `{ "incident": {...} }` (same shape as `GET /api/incidents/:id`).

Errors: `404 service_not_found`, `404 owner_not_found`.

```http
PATCH /api/incidents/:id/status
```

Requires `ADMIN` or `RESPONDER`.

Request body:

```json
{
  "status": "MITIGATED",
  "message": "Error rate returned to normal after rollback."
}
```

`message` is optional; a default message is generated if omitted. Allowed transitions:

```text
OPEN -> INVESTIGATING
OPEN -> MITIGATED
INVESTIGATING -> MITIGATED
INVESTIGATING -> RESOLVED
MITIGATED -> RESOLVED
RESOLVED -> REVIEWED
```

`REVIEWED` is terminal. Each transition writes a timeline entry and sets the corresponding timestamp (`mitigatedAt`, `resolvedAt`, `reviewedAt`).

Response `200`: `{ "incident": {...} }`.

Errors: `404 incident_not_found`, `409 status_unchanged` (same status requested), `409 invalid_status_transition` (not in the allowed list above).

```http
POST /api/incidents/:id/timeline
```

Requires `ADMIN` or `RESPONDER`. Adds a free-text note to the incident timeline without changing status.

Request body:

```json
{
  "message": "Paged the on-call engineer."
}
```

Response `201`:

```json
{
  "timelineEntry": {
    "id": "uuid",
    "incidentId": "uuid",
    "type": "NOTE",
    "message": "Paged the on-call engineer.",
    "fromStatus": null,
    "toStatus": null,
    "createdById": "uuid",
    "createdAt": "2026-07-08T12:00:00.000Z",
    "createdBy": { "id": "uuid", "email": "person@example.com", "name": "Person Name" }
  }
}
```

Errors: `404 incident_not_found`.

```http
POST /api/incidents/:id/assign
```

Requires `ADMIN` or `RESPONDER`.

Request body:

```json
{
  "ownerId": "user-uuid"
}
```

Response `200`: `{ "incident": {...} }`. Errors: `404 incident_not_found`, `404 owner_not_found`.

## Postmortems and Action Items

All routes require authentication. Read access is open to `ADMIN`, `RESPONDER`, and `VIEWER`; writes require `ADMIN` or `RESPONDER`.

```http
GET /api/incidents/:incidentId/postmortem
```

Response `200`:

```json
{
  "postmortem": {
    "id": "uuid",
    "incidentId": "uuid",
    "authorId": "uuid",
    "rootCause": "A misconfigured connection pool exhausted database connections.",
    "impactSummary": "12% of API requests failed for 45 minutes.",
    "detectionSummary": "Triggered by the error rate alert.",
    "resolutionSummary": "Connection pool size was increased.",
    "lessonsLearned": "Add alerting on pool saturation.",
    "publishedAt": null,
    "author": { "id": "uuid", "email": "person@example.com", "name": "Person Name" },
    "actionItems": []
  }
}
```

Errors: `404 postmortem_not_found`.

```http
PUT /api/incidents/:incidentId/postmortem
```

Requires `ADMIN` or `RESPONDER`. Creates the postmortem on first call, updates it on subsequent calls (upsert). Only allowed once the incident's status is `RESOLVED` or `REVIEWED`.

Request body:

```json
{
  "rootCause": "A misconfigured connection pool exhausted database connections.",
  "impactSummary": "12% of API requests failed for 45 minutes.",
  "detectionSummary": "Triggered by the error rate alert.",
  "resolutionSummary": "Connection pool size was increased.",
  "lessonsLearned": "Add alerting on pool saturation.",
  "publish": false
}
```

All five text fields are required, 10 to 4000 characters each. `publish` defaults to `false`; when `true`, `publishedAt` is set.

Response `200`: `{ "postmortem": {...} }` (without `author`/`actionItems` populated on write).

Errors: `404 incident_not_found`, `409 incident_not_ready_for_postmortem`.

```http
POST /api/incidents/:incidentId/action-items
```

Requires `ADMIN` or `RESPONDER`. Can be called before or after a postmortem exists; the action item links to the postmortem automatically if one is already present.

Request body:

```json
{
  "title": "Add connection pool saturation alert",
  "description": "Alert when pool usage exceeds 80%.",
  "assigneeId": "user-uuid",
  "dueDate": "2026-08-01"
}
```

`description`, `assigneeId`, and `dueDate` are optional.

Response `201`:

```json
{
  "actionItem": {
    "id": "uuid",
    "incidentId": "uuid",
    "postmortemId": null,
    "title": "Add connection pool saturation alert",
    "description": "Alert when pool usage exceeds 80%.",
    "status": "OPEN",
    "dueDate": "2026-08-01T00:00:00.000Z",
    "assigneeId": "user-uuid",
    "createdAt": "2026-07-08T12:00:00.000Z",
    "updatedAt": "2026-07-08T12:00:00.000Z"
  }
}
```

Errors: `404 incident_not_found`, `404 assignee_not_found`.

```http
PATCH /api/action-items/:id/status
```

Requires `ADMIN` or `RESPONDER`.

Request body:

```json
{
  "status": "DONE"
}
```

Allowed statuses: `OPEN`, `IN_PROGRESS`, `DONE`, `CANCELLED`.

Response `200`: `{ "actionItem": {...} }`. Errors: `404 action_item_not_found`.

## Audit Logs

Requires an authenticated `ADMIN`.

```http
GET /api/audit/logs
```

Query filters (all optional): `entityType`, `entityId`, `page` (default `1`), `pageSize` (default `50`, max `100`).

Response `200`:

```json
{
  "logs": [
    {
      "id": "uuid",
      "actorId": "uuid",
      "action": "incident.status_updated",
      "entityType": "Incident",
      "entityId": "uuid",
      "metadata": { "fromStatus": "OPEN", "toStatus": "INVESTIGATING" },
      "createdAt": "2026-07-08T12:00:00.000Z",
      "actor": { "id": "uuid", "email": "person@example.com", "name": "Person Name", "role": "RESPONDER" }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

Errors: `403` (caller is not an admin).

Audit actions currently written by the API: `user.role_updated`, `service.created`, `service.status_updated`, `incident.created`, `incident.status_updated`, `incident.timeline_note_added`, `incident.assigned`, `postmortem.saved`, `postmortem.published`, `action_item.created`, `action_item.status_updated`.
