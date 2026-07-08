# IncidentTrack Backend

IncidentTrack is a full-stack incident management platform for tracking service incidents, ownership, postmortems, corrective actions, and audit history.

This folder currently contains the backend API, database schema, migrations, seed script, repository governance files, and all project documentation.

## Project Status

Current status: backend and database foundation implemented.

Not implemented yet:

- Frontend application
- End-to-end integration tests
- CI pipeline
- Production deployment

## Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma
- Zod validation
- JWT authentication
- Role-based authorization

## Core Domain

The first backend version supports:

- User registration and login
- Role-based access control
- Service health records
- Incident lifecycle management
- Timeline entries for incident history
- Postmortems and corrective action items
- Audit logs for sensitive operations

## Folder Structure

```text
backend/
  .gitattributes
  .gitignore
  CHANGELOG.md
  CONTRIBUTING.md
  docker-compose.yml
  LICENSE
  README.md
  SECURITY.md
  prisma/
    schema.prisma
    seed.ts
    migrations/
  src/
    app.ts
    server.ts
    config/
    lib/
    middleware/
    modules/
      auth/
      users/
      services/
      incidents/
      postmortems/
      audit/
  docs/
    project/
    adr/
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy the environment example:

```bash
cp .env.example .env
```

3. Set `SEED_ADMIN_PASSWORD` in `.env` to a local admin password with at least 12 characters.

4. Start PostgreSQL:

```bash
docker compose up -d
```

5. Apply migrations:

```bash
npm run prisma:migrate
```

6. Seed local data:

```bash
npm run prisma:seed
```

7. Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:4000` by default.

## Default Seed User

The seed script creates an admin user using:

- Email: `admin@incidenttrack.local`
- Password: value of `SEED_ADMIN_PASSWORD`

Set `SEED_ADMIN_PASSWORD` in `.env` before running the seed script. Use at least 12 characters.

## API and Operations

- Health check: `GET /health`
- API base path: `/api`
- Authentication: JWT bearer token
- Database: PostgreSQL through Prisma
- Local database: `docker-compose.yml`

## Project Planning Documentation

- [Project Overview](docs/project/project-overview.md)
- [Requirements](docs/project/requirements.md)
- [Risk Assessment](docs/project/risk-assessment.md)
- [Security Engineering](docs/project/security-engineering.md)
- [Project Build Order](docs/project/build-order.md)
- [Monorepo Decision](docs/project/monorepo-decision.md)
- [GitHub Readiness](docs/project/github-readiness.md)

## Backend Technical Documentation

- [Architecture](docs/architecture.md)
- [Database Design](docs/database-design.md)
- [API Reference](docs/api-reference.md)
- [Security Model](docs/security-model.md)
- [Quality and Testing Strategy](docs/quality-and-testing.md)
- [Operations Guide](docs/operations.md)
- [Architecture Decision Record: Modular Monolith](docs/adr/0001-modular-monolith.md)

## Repository Governance

- [License](LICENSE)
- [Changelog](CHANGELOG.md)
- [Security Policy](SECURITY.md)
- [Contributing Guide](CONTRIBUTING.md)

## Repository Strategy

The current project keeps backend implementation, backend documentation, and project planning documentation inside the `backend` folder because the backend is the only implemented application.

A root-level project README or docs folder can be recreated later if a frontend is added and the repository becomes a true full-stack monorepo.

## Known Limitations

- Frontend is not implemented yet.
- Docker Desktop must be running for local PostgreSQL.
- Automated tests are not implemented yet.
- CI pipeline is not implemented yet.
- Production deployment is not configured yet.
- Rate limiting and refresh tokens are not implemented yet.

## License

The backend is licensed under the MIT License.
