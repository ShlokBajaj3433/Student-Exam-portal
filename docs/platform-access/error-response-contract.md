# Error Response Contract

> **Status:** Placeholder — content not provided in source material.

## Expected Structure

Based on references in other documents, the error response likely follows this pattern:

```json
{
  "status": 404,
  "message": "Student not found for email: user@example.com",
  "timestamp": "2026-09-09T12:34:56.789Z"
}
```

## Referenced Error Paths

| Scenario | HTTP Status | Handler | Response Fields |
|----------|-------------|---------|-----------------|
| Unauthenticated (protected routes) | 401 | `HttpStatusEntryPoint` | TBD |
| Access denied (missing role) | 403 | `AccessDeniedHandlerImpl` | TBD (not defined by security config) |
| Resource not found (principal → no Student) | 404 | `GlobalExceptionHandler.handleResourceNotFound` | `status`, `message`, `timestamp` |
| Profile validation failure | 400 | Controller validation | Field-specific messages |

## Validation Error Messages (Known)

| Field | Constraint | Error Message |
|-------|------------|---------------|
| `name` | ≤ 255 characters | "Name must not exceed 255 characters." |
| `department` | ≤ 255 characters | "Department must not exceed 255 characters." |
| `yearOfStudy` | 1–10 inclusive | "Year of study must be at least 1" / "Year of study must not exceed 10" |

## To Be Documented

- Global exception handler implementation (`GlobalExceptionHandler`)
- Standardized error envelope format
- Error codes / categories
- Internationalization / localization support
- Request ID correlation for tracing