# Contributing

IncidentTrack backend is currently part of a portfolio project in active development.

Contributions should preserve the backend goals: clear architecture, secure defaults, reproducible setup, readable documentation, and interview-defensible engineering decisions.

## Development Setup

Backend setup instructions and documentation links are in:

- [README.md](README.md)

## Branching

Use short, descriptive branch names:

```text
feat/add-backend-tests
fix/incident-transition-validation
docs/update-api-reference
```

## Commit Messages

Use this format:

```text
type: concise description
```

Examples:

```text
feat: add incident transition tests
fix: prevent viewer incident updates
docs: update backend setup instructions
refactor: simplify audit log writer
```

Use present tense. Do not use emojis, vague messages, or marketing language.

## Pull Request Checklist

Before opening or merging a change, verify:

- The change has a clear purpose.
- Backend build passes with `npm run build`.
- Dependency audit passes with `npm audit`.
- New behavior is documented.
- Security-sensitive behavior has been reviewed.
- No `.env` files or secrets are included.
- API changes are reflected in backend API documentation.
- Database changes include Prisma schema and migration updates.

## Documentation Expectations

Update documentation when changing:

- Requirements.
- Architecture.
- API behavior.
- Database schema.
- Security behavior.
- Environment variables.
- Local setup.
- Deployment assumptions.

If a reviewer cannot understand why a change exists, the documentation is incomplete.

## Code Quality Expectations

Backend code should:

- Keep route handlers thin.
- Put business behavior in service files.
- Validate inputs with Zod.
- Enforce authorization on protected operations.
- Avoid hard-coded secrets.
- Use Prisma migrations for schema changes.
- Prefer explicit errors over generic failures.
