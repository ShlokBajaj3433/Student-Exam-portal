# Identity APIs

Identity and authentication APIs for students and administrators.

## Contents

- [Registration and Sign-In](registration-signin.md) — Account creation, login, token issuance (placeholder)
- [Student Profile](student-profile.md) — Profile retrieval and partial update for authenticated students
- [Admin Profile](admin-profile.md) — Administrator profile management (placeholder)

## Access Boundaries

| API Family | Required Role | Identity Resolution |
|------------|---------------|---------------------|
| Student Profile | STUDENT | From authenticated principal (no ID parameter) |
| Admin Profile | ADMIN | From authenticated principal |
| Registration | Public | Email-based |
| Sign-In | Public | Email + password |

## Common Patterns

- **Stateless JWT** — All authenticated endpoints use Bearer token
- **Role-based** — `@PreAuthorize("hasRole('STUDENT')")` or `hasRole('ADMIN')`
- **Principal-derived** — Student/admin resources resolved from `authentication.getName()` (email)
- **No caller-supplied IDs** — Student endpoints never accept a student identifier