# Registration and Sign-In

> **Status:** Placeholder — content not provided in source material.

## Expected Endpoints

| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/api/auth/register/student` | POST | Public | Student registration |
| `/api/auth/register/admin` | POST | Public | Admin registration |
| `/api/auth/login` | POST | Public | Email/password login → JWT |
| `/api/auth/refresh` | POST | Public | Refresh token → new JWT |

## Registration Flow (Expected)

1. Client submits email, password, name, role-specific fields
2. Server validates uniqueness, password strength
3. Creates `User` + `Student` or `Admin` record
4. Returns success (no auto-login) or JWT tokens

## Login Flow (Expected)

1. Client submits email + password
2. `UserDetailsServiceImpl` loads user by email
3. Password verified (BCrypt)
4. `JwtUtil.generateToken()` creates JWT with `roles` claim
5. Returns access token (+ refresh token if implemented)

## Token Response (Expected)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "refreshToken": "..."  // if implemented
}
```

## Postman Collection

The `ExamPortal.postman_collection.json` contains:
- Register Admin / Login Admin → populates `adminToken`
- Register Student / Login Student → populates `studentToken`
- Example credentials (must be rotated before real use)

## To Be Documented

- Password requirements
- Email verification / confirmation flow
- Account locking / failed attempt handling
- Token refresh mechanism and expiry
- Logout / token revocation (if any)
- OAuth2 / social login (if any)