# Backend Architecture

## Purpose

The backend supports incident management workflows for engineering teams. It handles authentication, authorization, service health records, incident lifecycle rules, postmortems, action items, and audit logging.

## Architecture Style

IncidentTrack currently uses a modular monolith.

This means the backend is deployed as one API service, but the code is separated by business capability. The project does not start with microservices because the domain is still small, the team is small, and distributed system overhead would not yet provide enough value.

## Architectural Drivers

The main architectural drivers are:

- Maintainability: modules must be easy to understand and extend.
- Correctness: incident state transitions must be enforced by backend logic.
- Security: protected operations require authentication and role checks.
- Data integrity: PostgreSQL constraints and Prisma relations protect core records.
- Traceability: sensitive changes produce audit logs.
- Testability: route handlers delegate behavior to service functions.

## Runtime Components

```text
Client
  -> Express API
    -> Middleware
      -> Module Routes
        -> Module Services
          -> Prisma Client
            -> PostgreSQL
```

## Source Layout

```text
src/
  app.ts
  server.ts
  config/
    env.ts
  lib/
    async-handler.ts
    jwt.ts
    password.ts
    prisma.ts
  middleware/
    auth.ts
    error-handler.ts
    validate.ts
  modules/
    auth/
    users/
    services/
    incidents/
    postmortems/
    audit/
```

## Module Pattern

Each module follows this shape:

- `*.routes.ts`: HTTP routes and middleware composition.
- `*.schemas.ts`: request validation contracts using Zod.
- `*.service.ts`: business logic and database operations.

This keeps controllers thin and prevents business rules from being hidden inside route handlers.

## Cross-Cutting Concerns

Authentication is handled by `requireAuth`, which validates bearer tokens and attaches the authenticated user to the request.

Authorization is handled by role middleware. Admins can manage users and view audit logs. Admins and responders can modify incidents. Viewers can read protected data.

Validation is handled by Zod before service logic runs. Invalid requests fail with a consistent validation error response.

Errors are normalized by the global error handler. Application errors use explicit status codes and error codes. Unexpected errors return a safe generic message.

Audit logging is written for sensitive actions such as user role changes, service status changes, incident creation, incident assignment, status transitions, postmortem updates, and action item changes.

## Incident Lifecycle

Allowed transitions are:

```text
OPEN -> INVESTIGATING
OPEN -> MITIGATED
INVESTIGATING -> MITIGATED
INVESTIGATING -> RESOLVED
MITIGATED -> RESOLVED
RESOLVED -> REVIEWED
```

`REVIEWED` is terminal.

These rules are enforced in the backend so clients cannot create invalid incident states.

## Trade-Offs

The modular monolith keeps deployment and local development straightforward. The trade-off is that module boundaries rely on code discipline instead of network boundaries. This is acceptable at this stage because the project benefits more from clear code organization than from service distribution.

If the domain grows, the strongest extraction candidates would be notifications, audit logging, and reporting because they have clearer asynchronous behavior.

