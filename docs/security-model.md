# Security Model

## Authentication

The backend uses JWT bearer tokens.

Login returns an access token signed with `JWT_SECRET`. Protected routes require:

```http
Authorization: Bearer <token>
```

`JWT_SECRET` must be provided through the environment and must not be committed.

## Password Handling

Passwords are hashed with bcrypt before storage.

Plain text passwords are never stored. The seed script also requires `SEED_ADMIN_PASSWORD` from the environment and rejects missing or short values.

## Authorization

The backend uses role-based access control.

Roles:

- `ADMIN`: can manage users, view audit logs, and modify operational records.
- `RESPONDER`: can manage services, incidents, postmortems, and action items.
- `VIEWER`: can read protected operational data.

Authorization is enforced on the backend. Frontend checks should only improve user experience.

## Input Validation

Zod schemas validate request bodies, route parameters, and query parameters before business logic runs.

Validation protects:

- Required fields.
- Data types.
- UUID format.
- Enum values.
- String length limits.
- Service slug format.

## Error Safety

Application errors return explicit error codes and safe messages.

Unexpected errors return a generic server error so internal details are not exposed to clients.

## Audit Logging

Audit logs are created for sensitive operations:

- User role changes.
- Service creation and status updates.
- Incident creation.
- Incident assignment.
- Incident status transitions.
- Postmortem save and publish.
- Action item creation and status updates.

Audit logs support accountability and incident investigation.

## Current Security Gaps

The current backend foundation does not yet include:

- Refresh token rotation.
- Rate limiting.
- Account lockout.
- Email verification.
- Multi-factor authentication.
- CSRF protections for cookie-based auth.
- Dependency scanning in CI.

These should be added before a production release.

