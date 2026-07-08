# Project Build Order

## Build Order Principle

IncidentTrack should be built in this order:

```text
Problem -> Requirements -> Risk -> Security -> Architecture -> Database -> Backend -> Frontend -> Testing -> Deployment -> Documentation -> GitHub Publishing -> Portfolio Preparation
```

The project already has backend and database implementation work, so the current task is to backfill and maintain planning artifacts while continuing forward in a disciplined order.

## Current Stage Review

| Stage | Output | Status |
| --- | --- | --- |
| 1. Project Idea and Problem Discovery | Project overview | Implemented |
| 2. Requirements Engineering | Requirements document | Implemented draft |
| 3. Risk Assessment | Risk register | Implemented draft |
| 4. Security Engineering | Security model | Implemented draft |
| 5. SEO Engineering | SEO report | Not applicable yet |
| 6. Software Architecture Design | Architecture docs and ADR | Implemented for backend |
| 7. Database Engineering and Design | Database docs, schema, migration | Implemented |
| 8. Backend Engineering and Design | Backend docs and API contracts | Implemented draft |
| 9. Frontend Engineering and Design | UI flow and component plan | Not started |
| 10. Implementation Planning | Task breakdown | Partial |
| 11. Project Setup | Backend setup | Implemented |
| 12. Backend Implementation | Working backend | Implemented foundation |
| 13. Database Implementation | Prisma schema and migration | Implemented |
| 14. Frontend Implementation | Working frontend | Not started |
| 15. Integration Testing | End-to-end validation | Not started |
| 16. Quality Validation | Test results and quality gates | Partial |
| 17. Security Review | Vulnerability and secret review | Partial |
| 18. DevOps and Deployment Planning | Deployment plan | Partial |
| 19. Deployment | Live app | Not started |
| 20. Documentation Finalization | Final docs package | In progress |
| 21. GitHub Publishing | Publication readiness | Draft |
| 22. Portfolio Preparation | Talking points and case study | Not started |

## Recommended Next Build Steps

1. Add backend automated tests.
2. Add GitHub Actions for build, test, and audit.
3. Test the database migration with Docker.
4. Create frontend engineering documentation.
5. Scaffold the frontend.
6. Integrate frontend authentication and incident workflows.
7. Add end-to-end tests for the main user journeys.
8. Finalize deployment strategy.
9. Prepare GitHub publication checklist.
10. Create a portfolio case study.

## Stop Rules

Stop and revise previous work if:

- A protected route lacks authorization.
- A sensitive value is committed.
- API behavior is undocumented.
- A core workflow cannot be tested.
- Docker setup cannot reproduce the database.
- The frontend begins relying on undocumented backend behavior.
- Repository docs do not explain how to run the project.

## Learning Concept

The main process concept for this project is documentation-driven development.

Documentation-driven development means the project explains intent, constraints, design decisions, and expected behavior as it is built. This improves maintainability because future decisions can be compared against the documented plan rather than guessed from code alone.

Trade-off: documentation takes time and must be kept current. The benefit is stronger interview defensibility and easier collaboration.

