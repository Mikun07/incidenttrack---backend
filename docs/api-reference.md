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

## Health

```http
GET /health
```

Returns API status and timestamp.

## Authentication

```http
POST /api/auth/register
```

Creates a responder account.

Required body:

```json
{
  "email": "person@example.com",
  "name": "Person Name",
  "password": "at-least-8-characters"
}
```

```http
POST /api/auth/login
```

Returns the user and access token.

```http
GET /api/auth/me
```

Requires bearer token.

## Users

Admin only.

```http
GET /api/users
```

Lists users.

```http
PATCH /api/users/:id/role
```

Updates a user role.

Required body:

```json
{
  "role": "RESPONDER"
}
```

Allowed roles are `ADMIN`, `RESPONDER`, and `VIEWER`.

## Services

Requires authentication.

```http
GET /api/services
GET /api/services/:id
```

Admins and responders can create services:

```http
POST /api/services
```

Required body:

```json
{
  "name": "Public API",
  "slug": "public-api",
  "description": "Primary API consumed by frontend clients."
}
```

Admins and responders can update service status:

```http
PATCH /api/services/:id/status
```

Allowed statuses are `OPERATIONAL`, `DEGRADED`, `OUTAGE`, and `MAINTENANCE`.

## Incidents

Requires authentication.

```http
GET /api/incidents
GET /api/incidents/:id
```

Supported query filters:

- `status`
- `severity`
- `serviceId`
- `ownerId`
- `page`
- `pageSize`

Admins and responders can create incidents:

```http
POST /api/incidents
```

Required body:

```json
{
  "title": "Elevated API errors",
  "summary": "The public API is returning elevated 500 responses.",
  "severity": "SEV2",
  "serviceId": "service-uuid",
  "ownerId": "user-uuid"
}
```

Admins and responders can update lifecycle status:

```http
PATCH /api/incidents/:id/status
```

Required body:

```json
{
  "status": "MITIGATED",
  "message": "Error rate returned to normal after rollback."
}
```

Admins and responders can add timeline notes:

```http
POST /api/incidents/:id/timeline
```

Admins and responders can assign incidents:

```http
POST /api/incidents/:id/assign
```

## Postmortems and Action Items

Requires authentication.

```http
GET /api/incidents/:incidentId/postmortem
```

Admins and responders can create or update a postmortem:

```http
PUT /api/incidents/:incidentId/postmortem
```

Admins and responders can create action items:

```http
POST /api/incidents/:incidentId/action-items
```

Admins and responders can update action item status:

```http
PATCH /api/action-items/:id/status
```

Allowed statuses are `OPEN`, `IN_PROGRESS`, `DONE`, and `CANCELLED`.

## Audit Logs

Admin only.

```http
GET /api/audit/logs
```

Supported filters:

- `entityType`
- `entityId`
- `page`
- `pageSize`

