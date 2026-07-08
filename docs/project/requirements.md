# Requirements

## Stakeholders

| Stakeholder | Goals | Concerns |
| --- | --- | --- |
| Responder | Record and update incident progress | Fast workflow, clear ownership, low friction |
| Admin | Manage users, services, and permissions | Access control, auditability, data integrity |
| Viewer | Understand incident status and history | Readable status, safe read-only access |
| Engineering Lead | Review patterns and follow-up work | Postmortems, action item completion, reliability trends |
| Developer Maintainer | Extend and maintain the system | Clear architecture, tests, documentation |

## Functional Requirements

| ID | Requirement | Priority | Status |
| --- | --- | --- | --- |
| FR-001 | The system shall allow users to register and log in. | Must | Implemented |
| FR-002 | The system shall issue JWT access tokens after successful login. | Must | Implemented |
| FR-003 | The system shall support user roles: admin, responder, and viewer. | Must | Implemented |
| FR-004 | The system shall allow admins to update user roles. | Must | Implemented |
| FR-005 | The system shall prevent removal of the last admin role. | Must | Implemented |
| FR-006 | The system shall allow authenticated users to view services. | Must | Implemented |
| FR-007 | The system shall allow admins and responders to create services. | Must | Implemented |
| FR-008 | The system shall allow service health status updates. | Must | Implemented |
| FR-009 | The system shall allow admins and responders to create incidents. | Must | Implemented |
| FR-010 | The system shall allow incidents to be filtered by status, severity, service, and owner. | Must | Implemented |
| FR-011 | The system shall enforce valid incident status transitions. | Must | Implemented |
| FR-012 | The system shall allow responders to assign incident owners. | Must | Implemented |
| FR-013 | The system shall allow timeline notes to be added to incidents. | Must | Implemented |
| FR-014 | The system shall allow postmortems after incident resolution. | Must | Implemented |
| FR-015 | The system shall allow action items to be created for incidents. | Must | Implemented |
| FR-016 | The system shall allow action item status updates. | Must | Implemented |
| FR-017 | The system shall write audit logs for sensitive operations. | Must | Implemented |
| FR-018 | The system shall expose API documentation for backend consumers. | Should | Implemented |
| FR-019 | The system shall include a frontend dashboard for services and incidents. | Must | Planned |
| FR-020 | The system shall include frontend forms for incident and postmortem workflows. | Must | Planned |

## Non-Functional Requirements

| ID | Requirement | Priority | Status |
| --- | --- | --- | --- |
| NFR-001 | The backend shall validate request input before business logic executes. | Must | Implemented |
| NFR-002 | The backend shall avoid storing plain text passwords. | Must | Implemented |
| NFR-003 | The backend shall protect privileged operations with authorization checks. | Must | Implemented |
| NFR-004 | Database schema changes shall be versioned with migrations. | Must | Implemented |
| NFR-005 | Sensitive runtime configuration shall be provided through environment variables. | Must | Implemented |
| NFR-006 | The project shall include setup instructions for local development. | Must | Implemented |
| NFR-007 | The backend shall compile successfully with TypeScript strict mode. | Must | Implemented |
| NFR-008 | The dependency tree shall have no known vulnerabilities before publication. | Must | Implemented |
| NFR-009 | Critical backend behavior shall be covered by automated tests. | Must | Planned |
| NFR-010 | CI shall run build, audit, and tests before merging. | Should | Planned |
| NFR-011 | Deployment instructions shall identify environment variables and health checks. | Should | Partial |
| NFR-012 | The frontend shall meet WCAG 2.2 AA for core workflows. | Should | Planned |

## Acceptance Criteria Examples

### FR-011: Incident Status Transitions

Given an incident with status `OPEN`
When a responder changes the status to `INVESTIGATING`
Then the system shall update the incident status and add a timeline entry.

Given an incident with status `REVIEWED`
When a responder attempts to change the status to `OPEN`
Then the system shall reject the request with a conflict error.

### FR-017: Audit Logging

Given an authenticated admin updates a user role
When the update succeeds
Then the system shall create an audit log containing the actor, action, entity type, entity id, and metadata.

## Traceability Summary

| Problem Need | Requirement | Implementation |
| --- | --- | --- |
| Teams need incident accountability | FR-012, FR-017 | Incident assignment and audit logs |
| Teams need incident history | FR-013 | Timeline entries |
| Teams need post-incident learning | FR-014, FR-015 | Postmortem and action item modules |
| Teams need safe access control | FR-003, FR-004, NFR-003 | Role middleware |
| Teams need reliable data | NFR-004 | Prisma schema and migrations |

## Readiness Assessment

The backend requirements are sufficient for the current foundation. The frontend requirements still need a dedicated frontend design document before implementation begins.

