# Available Exams

Discover published exams available for student participation.

---

## Endpoint

| Method | Path | Controller | Protection |
|--------|------|------------|------------|
| GET | `/api/student/exams` | `StudentExamController` | `@PreAuthorize("hasRole('STUDENT')")` + `SecurityConfig` |

---

## Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 0 | Zero-based page index |
| `size` | int | 20 | Page size (default 20) |
| `sort` | string | — | Sort field,direction (e.g., `startTime,asc`) |

> Accepts standard Spring `Pageable` via query parameters.

---

## Selection Logic

`ExamServiceImpl.getPublishedExams(now, pageable)` → `ExamRepository.findPublishedWithinWindowPaged(now, pageable)`

### Repository Query Conditions

| Condition | Implementation |
|-----------|----------------|
| Publication status | `status = PUBLISHED` |
| Active window | `startTime <= now <= endTime` (BETWEEN, inclusive) |
| Student identity | **Not resolved** — exams are global to route, not student-specific |

---

## Response: `Page<ExamResponse>`

### ExamResponse Fields

| Field | Type | Description |
|-------|------|-------------|
| `examId` | Long | Unique exam identifier |
| `title` | String | Exam title |
| `description` | String | Optional exam description |
| `durationMinutes` | Integer | Exam duration in minutes |
| `totalMarks` | Integer | Total marks available |
| `startTime` | LocalDateTime | Exam window start (inclusive) |
| `endTime` | LocalDateTime | Exam window end (inclusive) |
| `status` | ExamStatus | Current lifecycle status (`PUBLISHED`) |
| `createdById` | Long | Admin creator ID (null if none) |
| `createdByName` | String | Admin creator name (null if none) |
| `createdAt` | LocalDateTime | Exam creation timestamp |
| `questionCount` | int | Number of assigned questions (0 if null) |

### Pagination Metadata

Standard Spring Page envelope:
```json
{
  "content": [ExamResponse...],
  "pageable": { "pageNumber": 0, "pageSize": 20, "sort": {...} },
  "totalElements": 42,
  "totalPages": 3,
  "last": false,
  "first": true,
  "size": 20,
  "number": 0,
  "numberOfElements": 20,
  "empty": false
}
```

---

## Frontend Handoff (Compatibility Notes)

| Aspect | Backend | Frontend (AvailableExams) | Gap |
|--------|---------|---------------------------|-----|
| Response wrapper | `Page<ExamResponse>` | Uses `res.data ?? []` directly | Frontend doesn't extract `content` array |
| Identifier field | `examId` | Reads `exam.id` for React key | No field mapping shown |
| Start action param | — | Passes `selectedExam.id` | Identifier mismatch |
| Empty state message | — | "There are no published exams in the active window right now." | — |

> **Action Required:** Backend returns `Page` wrapper; frontend expects array. Either:
> 1. Frontend extracts `res.data.content`
> 2. Backend returns `List<ExamResponse>` (separate endpoint)
> 3. Adapter layer in frontend

---

## Error Responses

| Scenario | HTTP Status | Notes |
|----------|-------------|-------|
| Missing/invalid JWT | 401 | Unauthorized |
| Caller lacks STUDENT role | 403 | Forbidden |

---

## Implementation References

- Controller: `StudentExamController.getAvailableExams(Pageable)`
- Service: `ExamService.getPublishedExams(LocalDateTime, Pageable)`
- Repository: `ExamRepository.findPublishedWithinWindowPaged(LocalDateTime, Pageable)`
- DTO: `ExamResponse` (maps from `Exam` entity)
- Entity: `Exam` with `ExamStatus` enum