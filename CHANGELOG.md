# Changelog

All notable backend changes for IncidentTrack will be documented in this file.

This backend follows semantic versioning.

## Unreleased

### Added

- Integration test suite covering authentication, role-based authorization, the incident status state machine, and postmortem and action item workflows, run with Vitest and Supertest against a real PostgreSQL test database.
- `GET /health/ready` readiness endpoint that verifies database connectivity separately from the existing liveness check.
- `CORS_ORIGIN` environment variable to restrict cross-origin requests to an explicit allowlist; required in production.
- Postgres service containers in the CI and release GitHub Actions workflows so the test suite has a real database to run against.

### Changed

- CORS no longer reflects the caller's origin (`origin: true`); it now checks against an explicit allowlist.
- Bumped `actions/checkout` and `actions/setup-node` to v5 in both workflows.
- Replaced Docker JavaScript actions in the release workflow with Docker CLI commands to avoid Node runtime deprecation warnings.

## 0.1.0 - 2026-07-08

### Added

- Backend and database foundation.
- Express and TypeScript API structure.
- PostgreSQL database setup with Docker Compose.
- Prisma schema, seed script, and baseline migration.
- JWT authentication and bcrypt password hashing.
- Role-based authorization for admin, responder, and viewer roles.
- Service, incident, postmortem, action item, user, and audit modules.
- Incident lifecycle validation.
- Backend architecture, API, database, security, operations, and testing documentation.
- Backend repository governance files: license, changelog, security policy, and contribution guide.
- Dockerfile and Docker image packaging support.
- GitHub Actions CI workflow for build, test command execution, and dependency audit.
- GitHub Actions release workflow for GitHub releases and GitHub Container Registry publishing.
- Release and package documentation.
- Health check smoke test.

### Changed

- Moved backend Docker Compose configuration into the `backend` folder.
- Removed hard-coded seed admin password fallback.
- Replaced the seed script promise chain with top-level `await`.

### Known Gaps

- Automated test coverage is limited.
- Production deployment is not configured yet.
- Rate limiting and refresh tokens are not implemented yet.
