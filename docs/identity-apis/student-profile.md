# Student Profile

Retrieval and partial updates for a student's identity and study fields.

---

## Access Boundary

- **Route:** `GET /api/student/profile`, `PATCH /api/student/profile`
- **Role Required:** `STUDENT`
- **Identity Resolution:** From authenticated principal (`authentication.getName()` → email)
- **No caller-supplied student identifier**

---

## Partial Update: `PATCH /api/student/profile`

### Request: `UpdateProfileRequest`

Defined in source. All fields optional; `null` leaves the update branch unapplied.

| Field | Type | Accepted Value | Validation Error | Update Target |
|-------|------|----------------|------------------|---------------|
| `name` | String | `null` or ≤ 255 characters | "Name must not exceed 255 characters." | `User.name` |
| `department` | String | `null` or ≤ 255 characters | "Department must not exceed 255 characters." | `Student.department` |
| `yearOfStudy` | Integer | `null` or 1–10 inclusive | "Year of study must be at least 1" / "Year of study must not exceed 10" | `Student.yearOfStudy` |

### Validation Rules

- All fields optional — send only fields to update
- String fields trimmed? (Not specified in source)
- `yearOfStudy` must be integer; non-integer values likely produce 400

### Example Request

```json
{
  "name": "Jane Doe",
  "department": "Computer Science",
  "yearOfStudy": 3
}
```

---

## Response: Student Profile

> **Note:** Exact response structure not fully specified in source. Expected fields based on update targets:

| Field | Type | Source |
|-------|------|--------|
| `id` | Long | `User.id` / `Student.id` |
| `email` | String | `User.email` (from principal) |
| `name` | String | `User.name` |
| `department` | String | `Student.department` |
| `yearOfStudy` | Integer | `Student.yearOfStudy` |
| `role` | String | `STUDENT` (from authorities) |
| `createdAt` | LocalDateTime | `User.createdAt` |
| `updatedAt` | LocalDateTime | `User.updatedAt` |

---

## Error Responses

| Scenario | HTTP Status | Error Message |
|----------|-------------|---------------|
| Missing/invalid JWT | 401 | Unauthorized |
| Caller lacks STUDENT role | 403 | Forbidden |
| `name` > 255 chars | 400 | "Name must not exceed 255 characters." |
| `department` > 255 chars | 400 | "Department must not exceed 255 characters." |
| `yearOfStudy` < 1 | 400 | "Year of study must be at least 1" |
| `yearOfStudy` > 10 | 400 | "Year of study must not exceed 10" |
| Principal does not resolve to Student | 404 | `ErrorResponse` { status, message, timestamp } |

---

## Implementation Notes

- Controller: `StudentProfileController` (inferred)
- Service: `StudentProfileService` (inferred)
- Repository: `StudentRepository.findByUser_Email(email)`
- Validation: Bean Validation (`@Size`, `@Min`, `@Max`) or manual in service
- Transactional: Update likely `@Transactional`

---

## Client Integration

- Frontend calls `PATCH /api/student/profile` with partial payload
- On success, refreshes local profile state
- Validation errors displayed inline per field