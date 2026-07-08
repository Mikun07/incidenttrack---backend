# Changelog

All notable backend changes for IncidentTrack will be documented in this file.

This backend follows semantic versioning once releases begin.

## Unreleased

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

### Changed

- Moved backend Docker Compose configuration into the `backend` folder.
- Removed hard-coded seed admin password fallback.
- Replaced the seed script promise chain with top-level `await`.

### Known Gaps

- Automated tests are not implemented yet.
- CI pipeline is not implemented yet.
- Production deployment is not configured yet.
- Rate limiting and refresh tokens are not implemented yet.

