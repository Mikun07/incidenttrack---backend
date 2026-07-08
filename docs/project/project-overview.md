# Project Overview

## Project Description

IncidentTrack is a full-stack incident management platform designed to help small engineering teams track production incidents, assign responders, manage postmortems, and follow corrective action items from discovery to completion.

## Problem Statement

Small teams often manage incidents through chat threads, notes, spreadsheets, and memory. This makes it difficult to understand what happened, who owns follow-up work, whether recurring issues are being fixed, and how reliable the system is becoming over time.

IncidentTrack centralizes incident records, timelines, ownership, postmortems, and audit history so operational work becomes traceable and reviewable.

## Target Users

Primary users:

- Software engineers responding to incidents.
- Engineering leads reviewing reliability trends.
- Support or operations staff who need incident visibility.

Secondary users:

- Recruiters or interviewers reviewing the project as software engineering evidence.
- Developers learning backend, database, security, and reliability practices.

## Value Proposition

IncidentTrack helps teams answer:

- What incidents are currently active?
- Which service is affected?
- Who owns the response?
- What actions were taken?
- What was the root cause?
- What follow-up work remains?
- Which sensitive operations happened and who performed them?

## Current Scope

The current implementation focuses on the backend and database foundation:

- Authentication.
- Role-based authorization.
- Service health records.
- Incident lifecycle management.
- Incident timeline entries.
- Postmortems.
- Corrective action items.
- Audit logs.
- PostgreSQL schema and migrations.

The frontend will be added after backend behavior and API contracts are stable.

## Out of Scope for the First Version

- Real-time notifications.
- Slack or email integration.
- Multi-tenant organizations.
- Advanced analytics.
- Mobile application.
- Production-grade incident alerting.
- External monitoring system ingestion.

## Success Criteria

The project is successful when:

- A developer can run the backend locally from the README.
- Incidents can be created, assigned, updated, resolved, and reviewed.
- Postmortems and action items can be attached to resolved incidents.
- Protected operations enforce backend authorization.
- Sensitive changes create audit records.
- Database changes are versioned and reproducible.
- Tests cover the most important business rules.
- Documentation explains requirements, architecture, security, deployment, and limitations.

## Portfolio Value

IncidentTrack demonstrates more than basic CRUD work. It includes domain rules, state transitions, database integrity, authentication, authorization, auditability, backend documentation, and operational thinking.

The project creates strong interview discussion topics around:

- Modular monolith architecture.
- PostgreSQL data modeling.
- Incident lifecycle design.
- Role-based access control.
- Transactional audit logging.
- Test strategy.
- Repository readiness.

