# Server Access Control

Detailed breakdown of the JWT filter chain, route authorization, token authority, CORS, and deployment security.

---

## JWT Authentication Filter Chain

### Filter Registration

`JwtAuthenticationFilter` is registered **before** `UsernamePasswordAuthenticationFilter` in `SecurityConfig`.

### Request Processing

| Step | Behavior |
|------|----------|
| 1. No `Authorization` header or not starting with `Bearer ` | Request continues through chain **without JWT authentication** |
| 2. Bearer token present | Filter loads user **only when** token supplies username and security context has no existing authentication |
| 3. User lookup | `UserDetailsServiceImpl` loads user by email; missing/disabled account → `UsernameNotFoundException` |
| 4. Token validation | `JwtUtil.isTokenValid()` verifies: signature with configured signing key, subject matches loaded username, token not expired |
| 5. Validation exceptions | Malformed, expired, signature failures caught in `isTokenValid` → returns `false`; only escaping exceptions logged as "JWT validation failed" |
| 6. Invalid token | Filter continues chain **without establishing JWT authentication** |

### Session & CSRF

- `SessionCreationPolicy.STATELESS` — no server session
- CSRF protection **disabled**
- Authentication carried entirely by request token

---

## Route Access Policy

| Route Family | Declared Access Condition | Configuration |
|--------------|---------------------------|---------------|
| `/api/auth/**` | Public | `SecurityConfig` |
| `/swagger-ui/**` | Public | `SecurityConfig` |
| `/v3/api-docs/**` | Public | `SecurityConfig` |
| `/api/admin/**` | ADMIN role required | `SecurityConfig` |
| `/api/exams/**` | ADMIN role required | `SecurityConfig` |
| `/api/questions/**` | ADMIN role required | `SecurityConfig` |
| `/api/student/**` | STUDENT role required | `SecurityConfig` + `@PreAuthorize("hasRole('STUDENT')")` on controllers |
| All other requests | Authentication required | `SecurityConfig` |

> **Note:** Student resources are tied to the authenticated principal and require the STUDENT role. Authentication does not by itself establish resource ownership.

---

## Error Handling Boundaries

| Scenario | Handler | HTTP Status | Notes |
|----------|---------|-------------|-------|
| Missing/invalid authentication (protected student/profile/exam) | `HttpStatusEntryPoint` | 401 | UnauthorizedEntryPoint |
| Caller lacks STUDENT role (attempt history) | `AccessDeniedHandlerImpl` | 403 | Body format defined by handler |
| Principal does not resolve to Student | `GlobalExceptionHandler.handleResourceNotFound` | 404 | `ErrorResponse` with status, message, timestamp |
| Profile validation failure | Controller validation | 400 | Names/dept ≤255 chars; yearOfStudy 1–10 |

---

## Token Authority Boundary

### Authority Flow

```
UserDetailsServiceImpl → creates ROLE_-prefixed authority
         ↓
JwtUtil.generateToken() → places authority in JWT 'roles' claim
         ↓
JwtAuthenticationFilter → reads claim, converts to SimpleGrantedAuthority[]
         ↓
SecurityContext → stores Authentication with authorities
```

### Critical Implication

> **Role changes do not propagate to existing tokens.**
>
> - Request authorities come from the **issued token's `roles` claim**
> - Filter separately reloads user for username, enablement, token validation
> - A later role change has **no immediate effect** on already-issued tokens
> - **Action Required:** Obtain a newly issued token after any authority change

---

## CORS Configuration

Registered for `/**` in `SecurityConfig`.

| Setting | Declared Value |
|---------|----------------|
| Allowed Origins | `http://localhost:5173`, `http://localhost:3000`, nonblank `FRONTEND_ORIGIN` |
| Allowed Methods | `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` |
| Allowed Request Headers | `*` |
| Exposed Response Headers | `Authorization` |
| Credentials | Allowed |

---

## Deployment Security Boundary

### JWT Configuration

| Property | Value | Source |
|----------|-------|--------|
| `app.jwt.secret` | `APP_JWT_SECRET` env override + checked-in fallback | `application.yml` |
| `app.jwt.expiration-ms` | 86400000 (24 hours) | `application.yml` |

### Production Requirements

- **Must** replace fallback with controlled Base64-encoded secret ≥ 256 bits (32 bytes)
- **Must not** expose or rely on checked-in default
- Secret should be rotated periodically
- Consider using a secrets manager (HashiCorp Vault, AWS Secrets Manager, etc.)

---

## Public Endpoints (No Authentication)

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/**` | Registration, login, token refresh |
| `/swagger-ui/**` | Swagger UI documentation |
| `/v3/api-docs/**` | OpenAPI JSON specification |

The API declares a global JWT bearer security scheme. The JWT secret configuration must be supplied appropriately for the deployment; the embedded fallback should not be treated as a production security guarantee.