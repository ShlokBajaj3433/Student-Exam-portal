# Administration APIs

Administrative operations for exam and question management.

## Contents

- [Assessment Design](assessment-design.md) — Exam and question CRUD, publishing, assignment (placeholder)
- [Administrative Review](administrative-review.md) — Exam review, closure, deletion workflows (placeholder)

## Access Boundary

| Route Family | Required Role | Authentication |
|--------------|---------------|----------------|
| `/api/exams/**` | ADMIN | Bearer token |
| `/api/questions/**` | ADMIN | Bearer token |
| `/api/admin/**` | ADMIN | Bearer token |

## Common Patterns

- All endpoints require valid JWT with `ADMIN` role
- Resource identifiers in path: `/api/exams/{examId}`, `/api/questions/{questionId}`
- Standard REST conventions: POST (create), GET (list/get), PUT/PATCH (update), DELETE
- Additional actions: publish, close, assign questions

## Referenced Operations

### Exams
- `POST /api/exams` — Create exam
- `GET /api/exams` — List exams (paginated)
- `GET /api/exams/{examId}` — Get exam details
- `PUT/PATCH /api/exams/{examId}` — Update exam
- `POST /api/exams/{examId}/publish` — Publish exam
- `POST /api/exams/{examId}/close` — Close exam
- `POST /api/exams/{examId}/questions` — Assign questions
- `DELETE /api/exams/{examId}` — Delete exam

### Questions
- `POST /api/questions` — Create question
- `GET /api/questions` — List questions (paginated)
- `GET /api/questions/{questionId}` — Get question
- `PUT/PATCH /api/questions/{questionId}` — Update question
- `DELETE /api/questions/{questionId}` — Delete question

## To Be Documented

- Request/response schemas for each operation
- Exam status lifecycle (DRAFT → PUBLISHED → CLOSED)
- Question types and scoring
- Bulk operations
- Filtering and search capabilities
- Audit trails