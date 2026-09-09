# Access Boundaries

Access boundaries define how requests are authenticated, authorized, and routed through the application.

## Contents

- [Server Access Control](server-access-control.md) — Detailed JWT filter chain, route access policies, token authority boundary, CORS policy, and deployment security boundary
- [Error Response Contract](error-response-contract.md) — Standardized error response format

## Overview

The server uses a stateless JWT filter chain. A bearer token can establish request authentication, but access follows the configured public, role-protected, or authentication-only condition. Route authorization does not by itself establish resource ownership.

## Route Access Summary

| Route Family | Access Condition |
|--------------|------------------|
| `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**` | Public; no authentication required |
| `/api/admin/**`, `/api/exams/**`, `/api/questions/**` | ADMIN role required |
| `/api/student/**` | STUDENT role required |
| All other requests | Authentication required |

## Authentication Flow

1. `JwtAuthenticationFilter` registered before `UsernamePasswordAuthenticationFilter` in `SecurityConfig`
2. Requests without `Authorization: Bearer <token>` header continue without JWT authentication
3. For bearer requests, filter loads user when token supplies username and security context has no existing authentication
4. `UserDetailsServiceImpl` looks up user by email; missing/disabled account raises `UsernameNotFoundException`
5. Token validated by `JwtUtil`: signature verification, subject matches loaded username, not expired
6. Malformed/expired/signature exceptions caught in `isTokenValid` returning `false`; only escaping exceptions logged as "JWT validation failed"
7. Filter chain continues without establishing JWT authentication for invalid tokens
8. CSRF disabled, `SessionCreationPolicy.STATELESS` — authentication carried by request token

## Unauthenticated / Access Denied Handling

| Scenario | Handler | Response |
|----------|---------|----------|
| Unauthenticated | `HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)` | 401 |
| Access Denied | `AccessDeniedHandlerImpl` | Delegated; body format not defined by security config (see Error Response Contract) |

## Token Authority Boundary

- `UserDetailsServiceImpl` creates `ROLE_`-prefixed authorities
- `JwtUtil` places authority in JWT `roles` claim during token generation
- `JwtAuthenticationFilter` reads claim, converts to `SimpleGrantedAuthority`, stores in security context
- **Critical:** Role changes do not affect already-issued tokens. Obtain a newly issued token after authority change.

## CORS Policy

| Setting | Value |
|---------|-------|
| Allowed Origins | `http://localhost:5173`, `http://localhost:3000`, nonblank `FRONTEND_ORIGIN` |
| Allowed Methods | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` |
| Allowed Headers | `*` |
| Exposed Headers | `Authorization` |
| Credentials | Allowed |

## Deployment Security Boundary

- `app.jwt.secret` reads `APP_JWT_SECRET` environment override with checked-in fallback
- `app.jwt.expiration-ms` = 86400000
- **Production Requirement:** Replace fallback with controlled Base64-encoded secret of at least 256 bits. Do not expose or rely on checked-in default.