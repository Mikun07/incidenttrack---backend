# Monorepo Decision

## Decision

IncidentTrack will remain a monorepo during early development.

The repository will use strict top-level folders:

```text
IncidentTrack/
  backend/
```

When the frontend is added, it should live in:

```text
IncidentTrack/
  backend/
  frontend/
```

## Context

The GitHub publishing framework recommends separate frontend and backend repositories by default for full-stack projects.

IncidentTrack is currently in the foundation stage. The backend and database are being developed first, and the frontend has not been created yet.

## Why a Monorepo Is Acceptable Now

A monorepo is acceptable at this stage because:

- The project is still small.
- Frontend and backend contracts will evolve together.
- One repository makes planning documentation easier to keep connected.
- Backend and future frontend setup can be reviewed in one place.
- The project is intended first as a portfolio learning project.

Project planning documentation currently lives under `backend/docs/project` because the backend is the only implemented application. A root-level `docs` folder can be recreated later when the frontend exists and the repository becomes a true full-stack monorepo.

## Trade-Offs

Benefits:

- Easier project-wide documentation.
- Easier local discovery for reviewers.
- One place for requirements, risk, architecture, and publication readiness.
- Simpler early-stage development.

Costs:

- The backend README must clearly explain the current backend-only scope.
- CI must avoid running unnecessary jobs for unrelated changes.
- Deployment instructions must separate frontend and backend steps.
- If the project grows, repository size and responsibility boundaries may become harder to manage.

## Future Split Criteria

Split into separate repositories if:

- The frontend and backend need independent release cycles.
- Deployment becomes easier with separate repositories.
- The frontend is reviewed or hosted independently.
- The backend becomes a standalone public API product.
- The repository becomes difficult for reviewers to navigate.

Possible future repository names:

```text
incidenttrack-frontend
incidenttrack-backend
```

## Interview Defensibility

The monorepo decision can be explained as a stage-appropriate choice. The project is early, tightly coupled, and documentation-heavy. A split can be justified later if deployment or ownership needs change.
