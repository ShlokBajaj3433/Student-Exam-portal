# Attempt History

List of past exam attempts for the authenticated student.

---

## Endpoint

| Method | Path | Controller | Protection |
|--------|------|------------|------------|
| GET | `/api/student/attempts` | `StudentExamController.getAttemptHistory()` | `@PreAuthorize("hasRole('STUDENT')")` + `SecurityConfig` |

---

## Retrieval Semantics

1. Extract `studentEmail` from `authentication.getName()`
2. Call `ExamAttemptService.getAttemptHistory(studentEmail)`
3. Service:
   - Resolves `Student` via `studentRepository.findByUser_Email(studentEmail)`
   - Retrieves attempts: `findByStudent(student, PageRequest.of(0, Integer.MAX_VALUE))`
   - Maps each `ExamAttempt` via `AttemptSummaryResponse::from`
   - Returns materialized `List<AttemptSummaryResponse>`

> **Key Points:**
> - Uses page 0 with `Integer.MAX_VALUE` (fetch all)
> - No explicit sort order
> - Returns **List**, not Page envelope
> - Consumers must not infer pagination or chronological ordering

---

## Response: `List<AttemptSummaryResponse>`

### AttemptSummaryResponse Fields

| Field | Type | Description |
|-------|------|-------------|
| `attemptId` | Long | Unique attempt identifier |
| `examTitle` | String | Title from associated exam |
| `attemptDate` | LocalDateTime | Attempt start time (mapped from `startTime`) |
| `score` | Integer | Attempt score; **null while status = IN_PROGRESS** |
| `status` | AttemptStatus | `IN_PROGRESS`, `SUBMITTED`, or `TIMED_OUT` |

### AttemptStatus Enum

| Value | Description |
|-------|-------------|
| `IN_PROGRESS` | Attempt started, not yet submitted |
| `SUBMITTED` | Student manually submitted |
| `TIMED_OUT` | Auto-submitted after exam window expiry |

---

## Access & Failure Boundaries

| Scenario | HTTP Status | Handler |
|----------|-------------|---------|
| Missing/invalid JWT | 401 | `HttpStatusEntryPoint` |
| Caller lacks STUDENT role | 403 | `AccessDeniedHandlerImpl` |
| Principal does not resolve to Student | 404 | `GlobalExceptionHandler.handleResourceNotFound` → `ErrorResponse` { status, message, timestamp } |

> The 404 for "principal not a Student" is a **declared error path**, not an observed runtime response.

---

## Client Compatibility (Frontend: AttemptHistory)

| Server Field | Client Reads | Compatibility |
|--------------|--------------|---------------|
| `attemptDate` | `submittedAt || startTime` | ⚠️ Mismatch — server sends `attemptDate`, client falls back |
| `score` | `score` | ✅ Match |
| `status` | `status` | ✅ Match |
| — | `totalMarks` | ❌ Not in server response |
| — | `grade` | ❌ Not in server response |

> `totalMarks` and `grade` are **client/server compatibility boundary** — not guaranteed by this response contract.

### Client Navigation Logic

```javascript
// Frontend permits result navigation only when:
if (status === 'SUBMITTED' || status === 'TIMED_OUT') {
  // Enable "View Result" action
}
```

---

## Error Response Example (404)

```json
{
  "status": 404,
  "message": "Student not found for email: user@example.com",
  "timestamp": "2026-09-09T12:34:56.789Z"
}
```

---

## Implementation References

- Controller: `StudentExamController.getAttemptHistory()`
- Service: `ExamAttemptService.getAttemptHistory(String studentEmail)`
- Repository: `ExamAttemptRepository.findByStudent(Student, Pageable)`
- DTO: `AttemptSummaryResponse.from(ExamAttempt)`
- Entity: `ExamAttempt` with `AttemptStatus` enum
- Exception: `ResourceNotFoundException` → `GlobalExceptionHandler`

---

## Open Questions

- Default sort order? (Creation time? Start time?)
- Filter by exam, date range, status?
- Pagination for students with many attempts?
- Include exam metadata (duration, totalMarks) in summary?