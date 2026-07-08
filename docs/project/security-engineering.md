# Security Engineering

## Security Objective

The security objective is to protect user accounts, incident data, service records, postmortems, and audit history while keeping the backend understandable and testable.

## Assets

| Asset | Sensitivity | Protection Needed |
| --- | --- | --- |
| User accounts | High | Password hashing, role checks, token validation |
| Password hashes | High | Bcrypt hashing, database protection |
| JWT secret | High | Environment variable, never committed |
| Incident records | Medium | Authenticated access, role-based modification |
| Postmortems | Medium | Authenticated access, role-based modification |
| Audit logs | High | Admin-only read access, restricted writes |
| Database credentials | High | Environment variables, ignored `.env` |

## Threat Model Summary

| STRIDE Category | Example Threat | Current Control | Future Control |
| --- | --- | --- | --- |
| Spoofing | Attacker uses invalid token | JWT verification | Refresh token rotation |
| Tampering | User changes incident state illegally | Backend transition rules | More service tests |
| Repudiation | User denies changing a record | Audit logs | Immutable audit export |
| Information Disclosure | Error exposes internal details | Safe error handler | Structured redaction |
| Denial of Service | Repeated login attempts | None yet | Rate limiting |
| Elevation of Privilege | Viewer modifies incidents | Role middleware | Authorization tests |

## Authentication Strategy

Users authenticate with email and password. Passwords are hashed with bcrypt. Successful login returns a signed JWT access token.

Required environment variable:

```text
JWT_SECRET
```

The secret must be long, random, and different per environment.

## Authorization Strategy

The backend uses role-based access control.

Roles:

- `ADMIN`: user management, audit logs, and operational changes.
- `RESPONDER`: service, incident, postmortem, and action item workflows.
- `VIEWER`: read-only operational access.

Authorization is enforced in backend middleware. The frontend must not be treated as a security boundary.

## Secure Coding Requirements

Current requirements:

- Validate request bodies, params, and query values with Zod.
- Store password hashes, never plain text passwords.
- Keep secrets in environment variables.
- Return safe error messages.
- Use backend authorization on every protected route.
- Use Prisma parameterized queries through the client.
- Write audit logs for sensitive state changes.

## Current Security Gaps

The following items are not implemented yet:

- Rate limiting.
- Refresh token rotation.
- Account lockout.
- Email verification.
- Password reset flow.
- Multi-factor authentication.
- CI secret scanning.
- Production CORS allowlist.
- Security headers review beyond default Helmet use.

## Security Readiness Assessment

The backend has a reasonable security foundation for local development and portfolio construction. It is not production-ready until rate limiting, CI security checks, deployment hardening, and broader automated tests are added.

