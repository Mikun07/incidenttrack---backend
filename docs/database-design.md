# Database Design

## Database Technology

IncidentTrack uses PostgreSQL with Prisma.

PostgreSQL was selected because the domain has relational data, strong integrity requirements, and important transactional workflows. Prisma provides typed data access, schema versioning, and migration support.

## Core Entities

The main entities are:

- `User`: authenticated system user.
- `Service`: monitored product or technical service.
- `Incident`: operational issue affecting a service.
- `IncidentTimelineEntry`: chronological event or note attached to an incident.
- `Postmortem`: structured review created after incident resolution.
- `ActionItem`: follow-up work after an incident.
- `AuditLog`: immutable record of sensitive operations.

## Relationship Summary

```text
User 1 -> many Incident as owner
User 1 -> many IncidentTimelineEntry as author
User 1 -> many Postmortem as author
User 1 -> many ActionItem as assignee
User 1 -> many AuditLog as actor

Service 1 -> many Incident
Incident 1 -> many IncidentTimelineEntry
Incident 1 -> 0..1 Postmortem
Incident 1 -> many ActionItem
Postmortem 1 -> many ActionItem
```

## Integrity Rules

Important database rules include:

- User email is unique.
- Service slug is unique.
- Each incident belongs to one service.
- Each postmortem belongs to exactly one incident.
- Each incident can have at most one postmortem.
- Incident timeline entries are deleted when the parent incident is deleted.
- Audit logs preserve actor references with restricted delete behavior.

## Index Strategy

Indexes support expected access patterns:

- User role filtering.
- Service status filtering.
- Incident filtering by service, owner, severity, status, and opened date.
- Timeline lookup by incident and creation date.
- Action item filtering by incident, postmortem, assignee, and status.
- Audit log lookup by actor, entity, and creation date.

## Transaction Strategy

Transactions are used when a single business operation changes multiple records. Examples include:

- Creating an incident and its initial timeline entry.
- Updating an incident status and writing an audit log.
- Creating an action item and writing timeline history.
- Updating a user role and writing audit history.

This prevents partial updates from leaving the system in a misleading state.

## Migration Strategy

Prisma migrations live in `prisma/migrations`.

The baseline migration is:

```text
prisma/migrations/20260708120000_init/migration.sql
```

Schema changes should be made in `schema.prisma`, then captured with Prisma migrations.

