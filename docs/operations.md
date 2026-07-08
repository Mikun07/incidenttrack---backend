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

Required variables:

```text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
SEED_ADMIN_PASSWORD
```

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

## Health Check

```http
GET /health
```

The health endpoint currently verifies that the API process is running. A future production readiness endpoint should also verify database connectivity.

## Operational Risks

Current risks:

- Docker Desktop must be running before local database commands work.
- The API does not yet expose structured metrics.
- Logs are currently written to stdout and stderr.
- There is no CI pipeline yet.
- Backups are not configured for local or hosted PostgreSQL.

These are acceptable for the initial backend foundation but should be addressed before deployment.

