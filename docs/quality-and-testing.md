# Quality and Testing Strategy

## Current Quality Gates

```bash
npm run build
npm run test:ci
npm audit
```

`npm run build` verifies TypeScript compilation.

`npm run test:ci` runs the automated test suite against a real PostgreSQL database.

`npm audit` checks installed dependencies for known vulnerabilities.

## Test Strategy

Tests are integration-style API tests. They exercise the full request path, including validation, authentication, authorization, service logic, and Prisma, against a real PostgreSQL database rather than mocks. This matches how the backend actually behaves in production and catches issues that unit tests against mocked Prisma calls would miss, such as constraint violations and transaction ordering.

Unit-level coverage of pure logic (slug generation, state transition tables) is folded into the same integration tests rather than duplicated separately, since the domain logic here is small and tightly coupled to the database rules it enforces.

## Test Environment

Tests run against a dedicated `incidenttrack_test` database, separate from the local development database, using `.env.test`. Copy `.env.test.example` to `.env.test` for local runs. A Vitest global setup (`tests/global-setup.ts`) refuses to run unless `DATABASE_URL` points at `incidenttrack_test`, then applies the Prisma schema to the test database with `prisma db push` before the suite runs. Each test file resets all tables in `beforeEach`/`afterEach` (`tests/helpers/db.ts`) so tests do not leak state into each other. Test files run sequentially (`fileParallelism: false`) because they share one database.

## Test Coverage

### Authentication (`tests/auth.test.ts`)

- Registration creates a `RESPONDER` user, hashes the password, and returns an access token.
- Email lookups are case-insensitive.
- Duplicate email registration is rejected.
- Password and email format validation is enforced.
- Login succeeds with correct credentials.
- Login failure does not distinguish between a wrong password and an unknown email.
- `/api/auth/me` returns the authenticated user and rejects missing, malformed, or non-Bearer tokens.

### Authorization (`tests/rbac.test.ts`)

- Only admins can list users or view audit logs.
- Demoting the last remaining admin is rejected; demoting one of several admins succeeds.
- Viewers can read services but not create them; responders can create them.
- Unauthenticated requests are rejected before reaching route logic.
- Audit logs are actually written and readable after a tracked action occurs.

### Incident Lifecycle (`tests/incidents.test.ts`)

- Creating an incident opens it with an initial timeline entry.
- SEV1 incidents force the affected service to `OUTAGE`; SEV2 to `DEGRADED`; SEV3 leaves it unchanged.
- Creating an incident against a nonexistent service fails with `404`.
- Viewers cannot create incidents.
- Documented forward transitions succeed and set the corresponding timestamp fields.
- Skipping a transition (`OPEN` to `RESOLVED`), repeating the current status, and transitioning out of the terminal `REVIEWED` state are all rejected with `409`.
- Every status transition writes a timeline entry.
- Assignment succeeds for a valid user and fails for a nonexistent one.
- Listing incidents supports status filtering and pagination.

### Postmortems and Action Items (`tests/postmortems.test.ts`)

- A postmortem cannot be created before an incident is `RESOLVED` or `REVIEWED`.
- A postmortem draft can be saved once resolved, and publishing sets `publishedAt`.
- Re-submitting a postmortem updates the existing record instead of creating a duplicate.
- Field length validation is enforced.
- Fetching a postmortem that does not exist yet returns `404`.
- Action items can be created before or after a postmortem exists, linking to the postmortem only when one is present.
- Action items assigned to a nonexistent user are rejected.
- Action item status updates succeed.

## Quality Metrics

Useful metrics for this backend:

- Build success rate.
- Test pass rate.
- Test coverage for service logic.
- Dependency vulnerability count.
- Number of unhandled runtime errors.
- Number of failed database migrations.

## Not Yet Covered

- Contract tests against a frontend consumer (no frontend exists yet).
- Load and performance testing.
- Security-focused testing (fuzzing, dependency exploitation scenarios) beyond `npm audit`.
