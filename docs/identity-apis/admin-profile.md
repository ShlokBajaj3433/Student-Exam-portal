# Admin Profile

> **Status:** Placeholder — content not provided in source material.

## Expected Access

- **Route:** `GET /api/admin/profile`, `PATCH /api/admin/profile`
- **Role Required:** `ADMIN`
- **Identity Resolution:** From authenticated principal

## Expected Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | Long | Admin identifier |
| `email` | String | From principal |
| `name` | String | Admin display name |
| `role` | String | `ADMIN` |
| `createdAt` | LocalDateTime | Account creation |

## Expected Update Fields

| Field | Type | Validation |
|-------|------|------------|
| `name` | String | ≤ 255 chars (likely) |

## To Be Documented

- Admin-specific profile fields
- Permission management (if any)
- Audit logging for admin actions