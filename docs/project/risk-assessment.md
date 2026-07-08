# Risk Assessment

## Risk Summary

IncidentTrack handles authentication, authorization, incident records, postmortems, and audit logs. The main risks are security mistakes, incomplete testing, unclear frontend integration, and weak deployment readiness.

## Risk Register

| ID | Risk | Category | Probability | Impact | Severity | Mitigation | Residual Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | JWT secret is weak or committed accidentally. | Security | Medium | High | High | Keep `.env` ignored, document required secrets, scan before publishing. | Medium |
| R-002 | Role checks are missed on a protected endpoint. | Security | Medium | High | High | Use route-level middleware and add authorization tests. | Medium |
| R-003 | Incident status transitions contain a logic bug. | Technical | Medium | Medium | Medium | Add unit tests for valid and invalid transitions. | Low |
| R-004 | Database migration fails in a new environment. | Operational | Medium | High | High | Keep migrations versioned and test local migration from clean database. | Medium |
| R-005 | Docker Desktop is not running during local setup. | Operational | High | Medium | Medium | Document Docker requirement and fallback troubleshooting. | Low |
| R-006 | Frontend assumes undocumented backend behavior. | Integration | Medium | Medium | Medium | Maintain API docs and validate API contracts. | Low |
| R-007 | Audit logs become incomplete for sensitive changes. | Data | Medium | Medium | Medium | Centralize audit writes for sensitive service operations and test them. | Medium |
| R-008 | Password seed setup creates insecure default credentials. | Security | Low | High | Medium | Require `SEED_ADMIN_PASSWORD` and reject short values. | Low |
| R-009 | The monorepo becomes confusing as the frontend grows. | Maintainability | Medium | Medium | Medium | Document monorepo decision and keep frontend/backend boundaries strict. | Medium |
| R-010 | Project is published before docs and tests are complete. | Portfolio | Medium | Medium | Medium | Use GitHub readiness checklist before sharing. | Low |

## Highest Priority Risks

The highest priority risks are:

1. Missing authorization checks.
2. Weak or leaked secrets.
3. Incomplete automated tests.
4. Untested database migration path.
5. Repository publication before readiness checks are complete.

## Mitigation Plan

Short-term mitigations:

- Add backend unit tests for incident transitions and role behavior.
- Add API tests for authentication and authorization.
- Run `npm audit` before commits and releases.
- Keep `.env` ignored and `.env.example` secret-free.
- Test Prisma migrations once Docker is running.

Medium-term mitigations:

- Add GitHub Actions for build, tests, and audit.
- Add rate limiting for authentication routes.
- Add structured logging and request correlation ids.
- Add deployment documentation after hosting is selected.

## Risk Acceptance

Some risks are acceptable during the backend foundation stage:

- No production monitoring exists yet because the project is not deployed.
- No frontend integration exists yet because backend contracts are still being stabilized.
- No CI exists yet because the repository setup is still in progress.

These risks must be revisited before public GitHub publication.

