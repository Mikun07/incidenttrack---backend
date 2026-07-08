# Quality and Testing Strategy

## Current Quality Gates

The current backend has two working checks:

```bash
npm run build
npm audit
```

`npm run build` verifies TypeScript compilation.

`npm audit` checks installed dependencies for known vulnerabilities.

## Planned Test Layers

The backend should add tests in this order:

1. Unit tests for domain rules.
2. Integration tests for service functions and Prisma behavior.
3. API tests for route contracts.
4. End-to-end tests for critical workflows.

## High-Value Unit Tests

The first unit tests should cover:

- Valid incident status transitions.
- Invalid incident status transitions.
- Last-admin role protection.
- Service slug generation.
- Seed password validation.

## High-Value Integration Tests

Integration tests should cover:

- Creating an incident creates a timeline entry.
- Creating a SEV1 incident updates service status to `OUTAGE`.
- Assigning an incident writes audit history.
- Saving a postmortem requires a resolved or reviewed incident.
- Creating an action item links it to the incident.

## API Contract Tests

API tests should verify:

- Unauthenticated protected requests fail with `401`.
- Unauthorized role access fails with `403`.
- Invalid request bodies fail with `400`.
- Duplicate unique fields fail predictably.
- Successful responses match documented shapes.

## Quality Metrics

Useful metrics for this backend:

- Build success rate.
- Test pass rate.
- Test coverage for service logic.
- Dependency vulnerability count.
- Number of unhandled runtime errors.
- Number of failed database migrations.

