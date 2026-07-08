# Release and Packages

IncidentTrack Backend is released as a versioned GitHub release and packaged as a Docker image.

The backend remains marked as a private npm package to prevent accidental npm registry publishing. npm is used for dependency management and local scripts only.

## Package Type

Primary package:

```text
Docker image
```

Target registry:

```text
ghcr.io/mikun07/incidenttrack-backend
```

Example tags:

```text
ghcr.io/mikun07/incidenttrack-backend:v0.1.0
ghcr.io/mikun07/incidenttrack-backend:latest
```

## Local Package Build

Build the Docker image locally:

```bash
npm run docker:build
```

Run the local image:

```bash
npm run docker:run
```

The local container reads environment variables from `.env`. The database must be reachable through `DATABASE_URL`.

## Release Check

Run the release check before creating a tag:

```bash
npm run release:check
```

The release check:

- Generates the Prisma client.
- Builds the TypeScript project.
- Runs the test command in CI mode.
- Runs a high-severity dependency audit.

## Versioning

Releases use semantic versioning:

```text
MAJOR.MINOR.PATCH
```

The first backend release is:

```text
0.1.0
```

Git tags should use a `v` prefix:

```text
v0.1.0
```

## Release Steps

1. Confirm the changelog has an entry for the release version.
2. Confirm `package.json` has the same version without the `v` prefix.
3. Run the release check.
4. Commit the release changes.
5. Create a Git tag.
6. Push the commit and tag to GitHub.

Example:

```bash
npm run release:check
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

The `Release` GitHub Actions workflow runs when the tag is pushed. It builds and publishes the Docker image to GitHub Container Registry, then creates a GitHub release.

## CI

The `CI` workflow runs on pushes and pull requests to `main`.

It verifies:

- Dependency installation.
- Prisma client generation.
- TypeScript build.
- Test command execution.
- High-severity dependency audit.

## Current Release Notes

Version `0.1.0` is the backend foundation release. It includes the API structure, database schema, Prisma migration, local seed flow, security baseline, documentation, and Docker package support.
