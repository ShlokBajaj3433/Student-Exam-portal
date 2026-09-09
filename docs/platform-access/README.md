# Platform Access

Platform access documentation covering runtime configuration, access boundaries, and error response contracts.

## Contents

- [Runtime Configuration](runtime-configuration.md) — Application defaults, Docker Compose deployment, and environment variables
- [Access Boundaries](access-boundaries.md) — Server access control, authentication, authorization, and CORS policies
  - [Server Access Control](server-access-control.md) — Detailed JWT filter chain, route policies, token authority, and deployment security
- [Error Response Contract](error-response-contract.md) — Standardized error response format (placeholder)

## Quick Reference

| Area | Key Details |
|------|-------------|
| Default Port | 8081 (`PORT` env override) |
| Database | PostgreSQL 16 Alpine via Docker Compose |
| JWT Expiration | 86,400,000 ms (24 hours) |
| JWT Secret | `APP_JWT_SECRET` env var (fallback in config) |
| Public Routes | `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**` |
| Admin Routes | `/api/admin/**`, `/api/exams/**`, `/api/questions/**` (ADMIN role) |
| Student Routes | `/api/student/**` (STUDENT role) |
| CORS Origins | `http://localhost:5173`, `http://localhost:3000`, `FRONTEND_ORIGIN` |