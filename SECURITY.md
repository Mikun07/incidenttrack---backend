# Security Policy

## Supported Versions

IncidentTrack backend has not reached a stable public release yet.

Current security review applies to the active development version.

## Reporting a Vulnerability

Do not create a public issue for a vulnerability that exposes secrets, credentials, authentication weaknesses, or private data.

For now, report vulnerabilities directly to the repository maintainer through the same private channel used to coordinate project work.

When the backend repository is published publicly, this file should be updated with a dedicated security contact.

## Security Scope

Security-sensitive areas include:

- Authentication.
- Authorization.
- Password hashing.
- JWT signing and validation.
- Environment variable handling.
- Database credentials.
- Incident and postmortem records.
- Audit logs.
- Dependency vulnerabilities.

## Current Security Controls

- Passwords are hashed with bcrypt.
- JWT secrets are loaded from environment variables.
- `.env` files are ignored by Git.
- Request input is validated with Zod.
- Protected routes require authentication.
- Privileged routes require role checks.
- Sensitive operations write audit logs.
- Dependency audit has been run locally.

## Known Security Gaps

The following controls are not implemented yet:

- Rate limiting.
- Refresh token rotation.
- Account lockout.
- Password reset flow.
- Email verification.
- Multi-factor authentication.
- CI secret scanning.
- Production CORS allowlist.
- Production deployment hardening.

Do not treat the current backend as production-ready until these gaps are reviewed.

## Secret Handling Rules

Never commit:

- `.env` files.
- API keys.
- Access tokens.
- JWT secrets.
- Database passwords.
- Private certificates.
- Real user data.

If a secret is committed, rotate the secret and remove it from repository history before publishing.

