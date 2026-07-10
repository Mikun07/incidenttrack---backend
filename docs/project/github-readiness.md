# GitHub Readiness

## Publication Intent

IncidentTrack is intended for portfolio presentation, job applications, and technical interview discussion.

The repository should demonstrate:

- Backend engineering skill.
- Database design skill.
- Security awareness.
- Documentation discipline.
- Operational thinking.
- Ability to explain trade-offs.

## Repository Name

Current project name:

```text
IncidentTrack
```

Recommended GitHub repository name while using a monorepo:

```text
incidenttrack
```

If split later:

```text
incidenttrack-backend
incidenttrack-frontend
```

## Suggested GitHub Description

```text
A full-stack incident management platform for tracking service incidents, postmortems, action items, and audit history.
```

## Suggested GitHub Topics

- typescript
- nodejs
- express
- postgresql
- prisma
- backend
- incident-management
- reliability-engineering
- portfolio-project

Add frontend topics after the frontend exists.

## Publication Checklist

| Item | Status | Notes |
| --- | --- | --- |
| Clear project description | Done | Backend README and overview exist |
| Backend README | Done | `backend/README.md` |
| Backend API docs | Done | `backend/docs/api-reference.md` |
| Architecture docs | Done | Backend and project planning docs exist |
| Database docs | Done | `backend/docs/database-design.md` |
| Security docs | Done | Backend security model and project security engineering docs exist |
| `.env.example` | Done | Backend example exists |
| `.gitignore` | Done | Secrets and generated files ignored |
| License | Done | `backend/LICENSE` added |
| Changelog | Done | `backend/CHANGELOG.md` added |
| Security policy | Done | `backend/SECURITY.md` added |
| Contribution guide | Done | `backend/CONTRIBUTING.md` added |
| Tests | Partial | Integration coverage exists for health, auth, RBAC, services, incidents, postmortems, and action items |
| CI | Done | GitHub Actions workflow runs build, tests, and audit |
| Deployment docs | Partial | Backend operations doc exists |
| Live demo link | Not applicable yet | Add after deployment |
| Screenshots | Not applicable yet | Add after frontend |
| Secret scan | Needed | Run before publishing |
| Dependency audit | Done locally | `npm audit` passed previously |
| Build check | Done locally | `npm run build` passed previously |

## Required Before Public Publishing

Before sharing publicly:

1. Run a secret scan.
2. Confirm no `.env` files are committed.
3. Confirm the README setup path works from a fresh clone.
4. Add frontend docs or clearly state that the frontend is not implemented yet.

## Known Limitations to Disclose

Current limitations:

- Frontend is not implemented yet.
- Docker Desktop must be running for local PostgreSQL.
- No production deployment exists yet.
- Automated test coverage is integration-heavy but still missing load and security-focused tests.
- Rate limiting and refresh tokens are not implemented yet.

## GitHub Readiness Assessment

The backend repository is public portfolio ready as an API foundation, with clear disclosure that the frontend and production deployment are not implemented yet.

The next readiness milestone is production deployment planning plus frontend implementation.
