# Operations Guide

## Local Services

The backend uses Docker Compose for local PostgreSQL.

Start the database from the backend folder:

```bash
docker compose up -d
```

Stop the database:

```bash
docker compose down
```

## Environment Variables

Runtime variables:

```text
NODE_ENV
PORT
DATABASE_URL
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
JWT_SECRET
JWT_EXPIRES_IN
SEED_ADMIN_PASSWORD
CORS_ORIGIN
```

`DATABASE_URL` and `JWT_SECRET` are required in every environment. `CORS_ORIGIN` is optional in `development` and `test` and defaults to common local frontend ports. It is required when `NODE_ENV=production`; startup fails without it.

Use `.env.example` as the template.

## Database Commands

Generate Prisma client:

```bash
npm run prisma:generate
```

Apply development migration:

```bash
npm run prisma:migrate
```

Seed local data:

```bash
npm run prisma:seed
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

## API Commands

Start development server:

```bash
npm run dev
```

Build production JavaScript:

```bash
npm run build
```

Start compiled server:

```bash
npm start
```

## Health Checks

```http
GET /health
```

Liveness check. Confirms the API process is running and responding. Does not touch the database, so it stays cheap enough to poll frequently.

```http
GET /health/ready
```

Readiness check. Runs `SELECT 1` through Prisma to confirm the database is reachable. Returns `200` with `"database": "connected"` when healthy, or `503` with `"database": "unreachable"` when the database cannot be reached. Use this endpoint for deployment health gates and orchestrator readiness probes.

## Operational Risks

Current risks:

- Docker Desktop must be running before local database commands work.
- The API does not yet expose structured metrics or request tracing.
- Logs are currently written to stdout and stderr without structured fields or correlation IDs.
- CI and release workflows require a published GitHub repository before they can run.
- Backups are not configured for local or hosted PostgreSQL.

These are acceptable for the initial backend foundation but should be addressed before deployment.
