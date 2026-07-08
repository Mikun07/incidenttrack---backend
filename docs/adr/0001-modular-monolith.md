# ADR 0001: Use a Modular Monolith for the Backend

## Status

Accepted

## Context

IncidentTrack needs a backend that supports authentication, incident workflows, postmortems, action items, service health, and audit logging.

The project is early-stage and will likely be developed by one person. The domain needs clear boundaries, but it does not yet need independent service deployment.

## Options Considered

### Single Unstructured Express App

This would be quick to start but would make business rules harder to find as the system grows.

### Modular Monolith

This keeps one deployable backend while separating business capabilities into modules.

### Microservices

This would create separate services for auth, incidents, audit, and notifications. It would increase deployment, testing, networking, and observability complexity before the domain requires it.

## Decision

Use a modular monolith.

Each module owns its routes, validation schemas, and service logic. Shared infrastructure lives under `config`, `lib`, and `middleware`.

## Consequences

Benefits:

- Simple local development.
- One deployment unit.
- Clear module boundaries.
- Lower operational overhead.
- Easier end-to-end testing.

Trade-offs:

- Module boundaries are enforced by code organization instead of network isolation.
- A large future codebase may need stricter dependency rules.
- Independent scaling is not available per module.

## Future Considerations

If specific capabilities become large or asynchronous, they may be extracted later. Likely candidates are notifications, reporting, and audit event processing.

